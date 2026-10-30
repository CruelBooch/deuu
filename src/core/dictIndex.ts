import type { DictEntry, DictLookupResult } from '../shared/types'

export interface DictIndex {
  readonly size: number
  lookup(word: string): DictLookupResult
  suggest(prefix: string, limit?: number): string[]
}

/**
 * 用 JSONL 文本构建词典索引（纯函数，不依赖任何平台 API）。
 * 每行一个 DictEntry：{"w","p","g","pl","ipa","d"}
 */
export function createDictIndex(jsonl: string): DictIndex {
  const map = new Map<string, DictEntry[]>()
  const pluralMap = new Map<string, DictEntry[]>()

  for (const line of jsonl.split('\n')) {
    if (!line.trim()) continue
    let entry: DictEntry
    try {
      entry = JSON.parse(line) as DictEntry
    } catch {
      continue
    }
    if (!entry || !entry.w || !entry.d || entry.d.length === 0) continue

    const key = entry.w.trim().toLowerCase()
    const arr = map.get(key)
    if (arr) arr.push(entry)
    else map.set(key, [entry])

    // 复数形式也建索引，查 Häuser 能命中 Haus
    if (entry.pl) {
      const pk = entry.pl.trim().toLowerCase()
      if (pk && pk !== key) {
        const parr = pluralMap.get(pk)
        if (parr) parr.push(entry)
        else pluralMap.set(pk, [entry])
      }
    }
  }

  // 真实词头优先，复数形式只在没有同名词头时补充
  for (const [k, v] of pluralMap) {
    if (!map.has(k)) map.set(k, v)
  }

  let sortedKeys: string[] | null = null

  function lookup(word: string): DictLookupResult {
    const key = (word || '').trim().toLowerCase()
    if (!key) return { found: false, entries: [] }

    let entries = map.get(key)

    if (!entries) {
      // 去掉句末标点后重试
      const stripped = key.replace(/[.,!?;:]+$/g, '').trim()
      if (stripped && stripped !== key) entries = map.get(stripped)
    }

    if (!entries) {
      // 首字母大写重试（德语名词）
      const cap = key.charAt(0).toUpperCase() + key.slice(1)
      entries = map.get(cap.toLowerCase())
    }

    return { found: !!entries && entries.length > 0, entries: entries ?? [] }
  }

  function suggest(prefix: string, limit = 12): string[] {
    const q = (prefix || '').trim().toLowerCase()
    if (!q) return []

    if (!sortedKeys) sortedKeys = [...map.keys()].sort()

    // 二分查找第一个 >= q 的键
    let lo = 0
    let hi = sortedKeys.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sortedKeys[mid] < q) lo = mid + 1
      else hi = mid
    }

    const out: string[] = []
    const seen = new Set<string>()
    for (let i = lo; i < sortedKeys.length && out.length < limit; i++) {
      const key = sortedKeys[i]
      if (!key.startsWith(q)) break
      const entries = map.get(key)
      if (!entries || entries.length === 0) continue
      const word = entries[0].w || key
      const lower = word.toLowerCase()
      if (seen.has(lower)) continue
      seen.add(lower)
      out.push(word)
    }
    return out
  }

  return { size: map.size, lookup, suggest }
}
