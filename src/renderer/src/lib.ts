import type { AIResult } from '../../shared/types'

export type ThemeMode = 'auto' | 'light' | 'dark'

export const DEFAULT_ACCENT = '#4a63c8'

/** 应用主题：明暗模式 + 主题色（写入根元素） */
export function applyTheme(theme: ThemeMode, accent: string): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--accent-base', accent || DEFAULT_ACCENT)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const dark = theme === 'dark' || (theme === 'auto' && mq.matches)
  root.dataset.dark = dark ? 'true' : 'false'
}

/** 生成历史列表里的精简摘要：
 *  - 单词：中文释义（最多两条）+ 词性 + 性别
 *  - 句子：译文
 *  - 其他：回答片段
 */
export function summarize(result: AIResult | null | undefined): string {
  if (!result) return ''
  if (result.type === 'dictionary') {
    const meaning = (result.definitions || [])
      .map((d) => d.meaning)
      .filter(Boolean)
      .slice(0, 2)
      .join('；')
    const parts: string[] = []
    if (meaning) parts.push(meaning)
    if (result.partOfSpeech) parts.push(result.partOfSpeech)
    if (result.gender) parts.push(result.gender)
    return parts.join(' · ')
  }
  if (result.type === 'translation') {
    return result.target || (result.explanation || '').replace(/\s+/g, ' ').slice(0, 80)
  }
  if (result.type === 'article') {
    return `${result.level} · ${result.paragraphs.length} 段 · ${result.title}`
  }
  return (result.answer || '').replace(/\s+/g, ' ').slice(0, 80)
}
