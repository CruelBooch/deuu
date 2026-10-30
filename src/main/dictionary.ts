import { app } from 'electron'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { createDictIndex, type DictIndex } from '../core/dictIndex'
import type { DictLookupResult } from '../shared/types'

let index: DictIndex | null = null

function dictPathCandidates(): string[] {
  const res = process.resourcesPath || ''
  return [
    join(res, 'dict', 'de_dict.jsonl'),
    join(app.getAppPath(), 'dict', 'de_dict.jsonl'),
    join(app.getAppPath(), '..', 'dict', 'de_dict.jsonl')
  ]
}

function resolveDictPath(): string {
  const candidates = dictPathCandidates()
  for (const p of candidates) {
    try {
      if (existsSync(p)) return p
    } catch {
      /* ignore */
    }
  }
  return candidates[0]
}

function loadIndex(): DictIndex {
  if (index) return index
  let text = ''
  try {
    text = readFileSync(resolveDictPath(), 'utf-8')
  } catch {
    /* 词库缺失时返回空索引，调用方会回退到 AI */
  }
  index = createDictIndex(text)
  return index
}

export function dictLookup(word: string): DictLookupResult {
  return loadIndex().lookup(word)
}

export function dictSuggest(prefix: string, limit = 12): string[] {
  return loadIndex().suggest(prefix, limit)
}
