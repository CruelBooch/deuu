import { app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { VocabState } from '../shared/types'

export const VOCAB_LIMIT = 2000

function vocabPath(): string {
  return join(app.getPath('userData'), 'vocab.json')
}

export function loadVocab(): VocabState {
  try {
    const parsed = JSON.parse(readFileSync(vocabPath(), 'utf-8'))
    if (!parsed || !Array.isArray(parsed.items)) return { groups: [], items: [] }
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      items: parsed.items.slice(0, VOCAB_LIMIT)
    }
  } catch {
    return { groups: [], items: [] }
  }
}

export function saveVocab(state: VocabState): void {
  const p = vocabPath()
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(
    p,
    JSON.stringify(
      {
        groups: Array.isArray(state.groups) ? state.groups : [],
        items: Array.isArray(state.items) ? state.items.slice(0, VOCAB_LIMIT) : []
      },
      null,
      2
    ),
    'utf-8'
  )
}
