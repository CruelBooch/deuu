// 主进程与渲染进程共享的类型定义

export interface Settings {
  apiKey: string
  baseUrl: string
  model: string
  offlineFirst?: boolean
  theme?: 'auto' | 'light' | 'dark'
  accent?: string
}

export interface DictionaryDefinition {
  pos: string
  meaning: string
}

export interface DictEntry {
  w: string
  p: string
  g?: string
  pl?: string
  ipa?: string
  d: string[]
}

export interface DictLookupResult {
  found: boolean
  entries: DictEntry[]
}

export interface Example {
  de: string
  zh: string
}

export interface DictionaryResult {
  type: 'dictionary'
  word: string
  phonetic?: string
  partOfSpeech: string
  gender: string | null
  plural: string | null
  definitions: DictionaryDefinition[]
  examples: Example[]
  conjugation?: string
  offline?: boolean
}

export interface TranslationResult {
  type: 'translation'
  source: string
  target: string
  explanation: string
}

export interface ChatResult {
  type: 'chat'
  answer: string
}

export interface ArticleParagraph {
  de: string
  zh: string
}

export interface ArticleWord {
  de: string
  zh: string
  pos?: string
}

/** 阅读文章（AI 生成） */
export interface ArticleResult {
  type: 'article'
  title: string
  level: string
  paragraphs: ArticleParagraph[]
  vocabulary: ArticleWord[]
  grammar?: string[]
}

export type AIResult = DictionaryResult | TranslationResult | ChatResult | ArticleResult

/** 文章难度 */
export type ArticleLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

/** 文章生成请求 */
export interface ArticleRequest {
  level: ArticleLevel
  topic: string
  /** 目标词数 */
  words: number
  /** 一开始就填的自定义要求 */
  custom?: string
  /** 需要修改时，带上上一篇的结果 */
  previous?: ArticleResult
  /** 用户的修改要求 */
  feedback?: string
}

/** 语法条目（内置离线数据） */
export interface GrammarExample {
  de: string
  zh: string
}

/** 语法点里的表格（变位表、变格表、对照表） */
export interface GrammarTable {
  caption?: string
  headers: string[]
  rows: string[][]
  note?: string
}

export interface GrammarTopic {
  id: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  title: string
  summary: string
  points: string[]
  tables?: GrammarTable[]
  examples: GrammarExample[]
  pitfalls?: string[]
}

export interface AIError {
  code: 'NO_API_KEY' | 'AI_ERROR' | 'UNKNOWN'
  message: string
}

export type AskAIResponse =
  | { ok: true; result: AIResult }
  | { ok: false; error: AIError }

export interface HistoryEntry {
  id: string
  query: string
  ts: number
  result: AIResult
}

export interface VocabEntry {
  id: string
  word: string
  pos: string
  gender?: string | null
  plural?: string | null
  phonetic?: string
  meanings: string[]
  group?: string
  ts: number
}

export interface VocabState {
  groups: string[]
  items: VocabEntry[]
}

export interface AppInfo {
  name: string
  version: string
}

export interface Api {
  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  askAI(input: string): Promise<AskAIResponse>
  generateArticle(req: ArticleRequest): Promise<AskAIResponse>
  windowMinimize(): Promise<void>
  windowToggleMaximize(): Promise<boolean>
  windowClose(): Promise<void>
  windowIsMaximized(): Promise<boolean>
  getHistory(): Promise<HistoryEntry[]>
  saveHistory(entries: HistoryEntry[]): Promise<void>
  getVocab(): Promise<VocabState>
  saveVocab(state: VocabState): Promise<void>
  getAppInfo(): Promise<AppInfo>
  dictLookup(word: string): Promise<DictLookupResult>
  dictSuggest(prefix: string): Promise<string[]>
}
