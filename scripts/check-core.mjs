#!/usr/bin/env node
/**
 * 守住 src/core 的"平台无关"底线：
 * core 里不允许出现任何浏览器 / Node / Electron / Capacitor / 鸿蒙 API。
 * 这样同一份业务逻辑才能被 Electron、Capacitor(iOS/Android)、鸿蒙 ArkWeb 共用。
 *
 * 用法: node scripts/check-core.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.argv[2] || 'src/core'

const RULES = [
  [/\bwindow\b/, 'window（应在 UI 层）'],
  [/\bdocument\b/, 'document（应在 UI 层）'],
  [/\bfetch\s*\(/, 'fetch()（应通过注入的 http 能力）'],
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bnavigator\b/, 'navigator'],
  [/\bprocess\b/, 'process（Node 专有）'],
  [/\brequire\s*\(/, 'require()（Node 专有）'],
  [/\bBuffer\b/, 'Buffer（Node 专有）'],
  [/\b__dirname\b/, '__dirname（Node 专有）'],
  [/from\s+['"]electron['"]/, "import electron"],
  [/['"]@capacitor\//, "import @capacitor/*"],
  [/['"]@ohos\./, "import @ohos.*（鸿蒙专有）"]
]

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/([^:])\/\/.*$/gm, '$1')
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

let violations = 0
let files = 0
for (const file of walk(ROOT)) {
  files++
  const text = stripComments(readFileSync(file, 'utf-8'))
  text.split('\n').forEach((line, i) => {
    for (const [re, label] of RULES) {
      if (re.test(line)) {
        console.error(`${relative(process.cwd(), file)}:${i + 1}  命中 ${label}`)
        console.error(`    ${line.trim()}`)
        violations++
      }
    }
  })
}

if (violations > 0) {
  console.error(`\n✗ core 纯净性检查失败：${violations} 处违规（扫描 ${files} 个文件）`)
  process.exit(1)
}
console.log(`✓ core 纯净性检查通过（扫描 ${files} 个文件，无平台 API）`)
