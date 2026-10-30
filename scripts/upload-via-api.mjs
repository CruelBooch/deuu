// 通过 GitHub REST API 上传整个仓库（绕开被阻断的 git-over-HTTPS 通道）
// 用法：node scripts/upload-via-api.mjs
//   token 从环境变量 GITHUB_TOKEN 读取，或从文件 %USERPROFILE%\.deuu-token 读取
//   owner/repo 从 git remote 解析，默认 CruelBooch/deuu
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const GIT = process.env.DEUU_GIT || 'D:\\PortableGit\\cmd\\git.exe'
const API = 'https://api.github.com'

function readToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) return process.env.GITHUB_TOKEN.trim()
  const f = join(homedir(), '.deuu-token')
  if (existsSync(f)) {
    const t = readFileSync(f, 'utf8').trim()
    if (t) return t
  }
  return ''
}

const token = readToken()
if (!token) {
  console.error('缺少 token。')
  console.error(`请把 Personal Access Token 写进 ${join(homedir(), '.deuu-token')}（单独一行），或设置环境变量 GITHUB_TOKEN`)
  process.exit(1)
}

const HEADERS = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'deuu-publisher'
}

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { ...HEADERS, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok && res.status !== 422) {
    throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`)
  }
  return { status: res.status, data, text }
}

async function apiOk(method, path, body) {
  const r = await api(method, path, body)
  if (!r.data) throw new Error(`${method} ${path} 返回空`)
  return r.data
}

function git(args) {
  return execFileSync(GIT, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
}

/** 并发执行，限制并行数 */
async function pool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  let done = 0
  async function run() {
    while (true) {
      const i = next++
      if (i >= items.length) return
      results[i] = await worker(items[i], i)
      done++
      if (done % 20 === 0 || done === items.length) {
        process.stdout.write(`\r  已上传 ${done}/${items.length} 个文件`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  process.stdout.write('\n')
  return results
}

const files = git(['ls-files']).split('\n').filter(Boolean)

let owner = 'CruelBooch'
let repo = 'deuu'
try {
  const url = git(['remote', 'get-url', 'origin'])
  const m = url.match(/github\.com[:/]+([^/]+)\/([^/.]+)/)
  if (m) {
    owner = m[1]
    repo = m[2]
  }
} catch {
  /* 用默认值 */
}

console.log(`目标仓库: ${owner}/${repo}`)
console.log(`待上传: ${files.length} 个文件\n`)

// 1. 确认 token 属于谁
const me = await apiOk('GET', '/user')
console.log(`已登录: ${me.login}`)
if (me.login.toLowerCase() !== owner.toLowerCase()) {
  console.log(`提示: token 属于 ${me.login}，将改用它作为 owner`)
  owner = me.login
}

// 2. 创建仓库（已存在则忽略）
const created = await api('POST', '/user/repos', {
  name: repo,
  description: 'deuu —— 德语词典 / 句型翻译 / 语法手册 / 阅读生成',
  private: false,
  auto_init: false
})
if (created.status === 201) console.log(`仓库已创建: ${owner}/${repo}`)
else console.log(`仓库已存在或无需创建 (HTTP ${created.status})`)

// 3. 逐个上传 blob
const blobs = await pool(files, 6, async (path) => {
  const content = readFileSync(join(root, path)).toString('base64')
  const r = await apiOk('POST', `/repos/${owner}/${repo}/git/blobs`, { content, encoding: 'base64' })
  return { path, sha: r.sha }
})

const executable = new Set(
  git(['ls-files', '-s']).split('\n').map((l) => {
    const [meta, p] = l.split('\t')
    const [mode] = meta.split(' ')
    return mode === '100755' ? p : null
  }).filter(Boolean)
)

// 4. 建 tree
const tree = blobs.map((b) => ({
  path: b.path,
  mode: executable.has(b.path) ? '100755' : '100644',
  type: 'blob',
  sha: b.sha
}))
const treeRes = await apiOk('POST', `/repos/${owner}/${repo}/git/trees`, { tree })

// 5. 建 commit
const commitRes = await apiOk('POST', `/repos/${owner}/${repo}/git/commits`, {
  message: git(['log', '-1', '--format=%B']),
  tree: treeRes.sha,
  parents: []
})

// 6. 建/更新分支 main
const refRes = await api('POST', `/repos/${owner}/${repo}/git/refs`, {
  ref: 'refs/heads/main',
  sha: commitRes.sha
})
if (refRes.status === 201) {
  console.log('分支 main 已创建')
} else {
  await apiOk('PATCH', `/repos/${owner}/${repo}/git/refs/heads/main`, {
    sha: commitRes.sha,
    force: true
  })
  console.log('分支 main 已更新')
}

console.log(`\n完成: https://github.com/${owner}/${repo}`)
console.log(`提交: ${commitRes.sha.slice(0, 7)}  (${blobs.length} 个文件)`)
