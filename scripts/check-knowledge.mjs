// 校验 src/core/knowledge.ts 的数据质量：id 规范、id/词条不重复
// 只做文本解析，不 import TypeScript，方便在 Node 18/20 的 CI 里直接跑
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILE = path.join(root, 'src', 'core', 'knowledge.ts')

const ENTRY = /^\s*(v|vp|ap|np|sv|fv)\('([^']*)', '([^']*)', '([^']*)', '([^']*)'\),?\s*$/
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const lines = fs.readFileSync(FILE, 'utf8').split(/\r?\n/)
const problems = []
const ids = new Map()
const entries = new Map()
const perCategory = new Map()

let cat = ''
let count = 0
lines.forEach((line, i) => {
  const at = i + 1
  const cm = /^\s*id: '([^']+)',$/.exec(line)
  if (cm) {
    cat = cm[1]
    perCategory.set(cat, 0)
    return
  }
  if (!/^\s*(v|vp|ap|np|sv|fv)\(/.test(line)) return
  const m = ENTRY.exec(line)
  if (!m) {
    problems.push(`第 ${at} 行：条目格式不符合 "fn('id', 'de', 'zh', 'detail'),"`)
    return
  }
  const [, fn, id, de, zh, detail] = m
  count += 1
  perCategory.set(cat, (perCategory.get(cat) ?? 0) + 1)

  if (!ID.test(id)) problems.push(`第 ${at} 行：id "${id}" 只允许小写字母、数字和连字符`)
  if (ids.has(id)) problems.push(`第 ${at} 行：id "${id}" 重复（第 ${ids.get(id)} 行已用）`)
  else ids.set(id, at)

  if (!de.trim()) problems.push(`第 ${at} 行：de 为空（id ${id}）`)
  if (!zh.trim()) problems.push(`第 ${at} 行：zh 为空（id ${id}）`)
  if (fn !== 'v' && !detail.trim()) problems.push(`第 ${at} 行：detail 为空（id ${id}）`)

  const key = `${cat}|${de.toLowerCase().replace(/\s+/g, ' ').trim()}`
  if (entries.has(key)) {
    problems.push(`第 ${at} 行：「${de}」在同一分类里重复（第 ${entries.get(key)} 行已用）`)
  } else {
    entries.set(key, at)
  }
})

// 同一搭配不允许跨分类重复出现（学生会看到两条一样的卡片）
const byDe = new Map()
lines.forEach((line, i) => {
  const m = ENTRY.exec(line)
  if (!m) return
  const de = m[3].toLowerCase().replace(/\s+/g, ' ').trim()
  if (!byDe.has(de)) byDe.set(de, [])
  byDe.get(de).push({ at: i + 1, id: m[2] })
})
for (const [de, list] of byDe) {
  if (list.length > 1) {
    problems.push(`「${de}」出现 ${list.length} 次：${list.map((x) => `${x.id}@${x.at}`).join(', ')}`)
  }
}

for (const [id, n] of perCategory) {
  if (n === 0) problems.push(`分类 ${id} 没有任何条目`)
}

if (problems.length) {
  console.error(`✗ knowledge 校验失败，共 ${problems.length} 处：`)
  for (const p of problems.slice(0, 50)) console.error('  - ' + p)
  process.exit(1)
}

console.log(`✓ knowledge 校验通过：${count} 条，${perCategory.size} 个分类，id 合法且无重复`)
