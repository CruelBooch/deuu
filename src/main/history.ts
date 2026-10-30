import { app } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { HistoryEntry } from '../shared/types'

export const HISTORY_LIMIT = 100

function historyPath(): string {
  return join(app.getPath('userData'), 'history.json')
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = readFileSync(historyPath(), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  const p = historyPath()
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(entries.slice(0, HISTORY_LIMIT), null, 2), 'utf-8')
}
