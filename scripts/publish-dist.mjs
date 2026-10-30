// 把打包产物同步到发行目录（工作区外，避免沙箱 ACL 导致的 NSIS 自检失败）
// 用法：node scripts/publish-dist.mjs
// 目标目录可用环境变量 DEUU_DIST 覆盖，默认 D:\deuu-dist
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const release = join(root, 'release')
const dest = process.env.DEUU_DIST || 'D:\\deuu-dist'

if (!existsSync(release)) {
  console.error('找不到 release 目录，请先运行 pnpm package:win')
  process.exit(1)
}

mkdirSync(dest, { recursive: true })

const allowed = new Set(['.exe', '.apk', '.zip'])
let copied = 0

for (const name of readdirSync(release)) {
  const src = join(release, name)
  if (!statSync(src).isFile()) continue
  if (!name.startsWith('deuu-')) continue
  const dot = name.lastIndexOf('.')
  if (dot < 0 || !allowed.has(name.slice(dot))) continue
  copyFileSync(src, join(dest, name))
  console.log(`  → ${name}`)
  copied += 1
}

console.log(`\n已同步 ${copied} 个文件到 ${dest}`)
