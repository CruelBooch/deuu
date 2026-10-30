import { buildAiPayload, chatCompletionsUrl, parseAiContent, pickContent } from '../../../core/ai'
import { buildArticlePayload, parseArticleContent } from '../../../core/article'
import { createDictIndex, type DictIndex } from '../../../core/dictIndex'
import type {
  AIError,
  Api,
  AppInfo,
  ArticleRequest,
  AskAIResponse,
  HistoryEntry,
  Settings,
  VocabState
} from '../../../shared/types'
import type { PlatformDeps } from './types'

const K_SETTINGS = 'deuu.settings'
const K_HISTORY = 'deuu.history'
const K_VOCAB = 'deuu.vocab'

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  offlineFirst: true,
  theme: 'auto',
  accent: '#4a63c8'
}

/**
 * 用「平台能力」拼出一个完整的 window.api 实现。
 * iOS / Android（Capacitor）、鸿蒙 ArkWeb、乃至普通浏览器都可以复用本函数。
 */
export function createWebviewApi(deps: PlatformDeps): Api {
  let dictIndex: DictIndex | null = null
  let dictLoading: Promise<DictIndex> | null = null

  async function readJson<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await deps.storage.get(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  async function writeJson(key: string, value: unknown): Promise<void> {
    try {
      await deps.storage.set(key, JSON.stringify(value))
    } catch {
      /* 存储失败不影响使用 */
    }
  }

  function loadDict(): Promise<DictIndex> {
    if (dictIndex) return Promise.resolve(dictIndex)
    if (!dictLoading) {
      dictLoading = (async () => {
        try {
          dictIndex = createDictIndex(await deps.dict.load())
        } catch {
          dictIndex = createDictIndex('')
        }
        return dictIndex
      })()
    }
    return dictLoading
  }

  async function getSettings(): Promise<Settings> {
    const stored = await readJson<Partial<Settings>>(K_SETTINGS, {})
    const theme = stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : ('auto' as const)
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      offlineFirst: stored.offlineFirst !== false,
      theme,
      accent:
        typeof stored.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(stored.accent)
          ? stored.accent
          : DEFAULT_SETTINGS.accent
    }
  }

  async function requireSettings(): Promise<
    { ok: true; settings: Settings } | { ok: false; error: AIError }
  > {
    const settings = await getSettings()
    if (!settings.apiKey.trim()) {
      return { ok: false, error: { code: 'NO_API_KEY', message: '请先在设置中填写 API Key' } }
    }
    if (!settings.baseUrl.trim() || !settings.model.trim()) {
      return { ok: false, error: { code: 'UNKNOWN', message: '请在设置中补全接口地址与模型名称' } }
    }
    return { ok: true, settings }
  }

  async function callChat(
    settings: Settings,
    payload: Record<string, unknown>,
    readTimeout = 60_000
  ): Promise<{ ok: true; content: string } | { ok: false; error: AIError }> {
    try {
      const res = await deps.http.post({
        url: chatCompletionsUrl(settings.baseUrl),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey.trim()}`
        },
        data: payload,
        connectTimeout: 20_000,
        readTimeout
      })

      if (res.status < 200 || res.status >= 300) {
        const detail = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        return {
          ok: false,
          error: { code: 'AI_ERROR', message: `请求失败 (HTTP ${res.status})：${detail.slice(0, 300)}` }
        }
      }

      const content = pickContent(res.data)
      if (!content) return { ok: false, error: { code: 'AI_ERROR', message: 'AI 返回内容为空' } }
      return { ok: true, content }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'AI_ERROR', message: err instanceof Error ? err.message : String(err) }
      }
    }
  }

  async function askAI(input: string): Promise<AskAIResponse> {
    const text = (input || '').trim()
    if (!text) return { ok: false, error: { code: 'UNKNOWN', message: '输入不能为空' } }

    const s = await requireSettings()
    if (!s.ok) return s

    const r = await callChat(s.settings, buildAiPayload(text, s.settings))
    if (!r.ok) return r
    return { ok: true, result: parseAiContent(r.content) }
  }

  async function generateArticle(req: ArticleRequest): Promise<AskAIResponse> {
    const s = await requireSettings()
    if (!s.ok) return s

    const r = await callChat(s.settings, buildArticlePayload(req, s.settings), 90_000)
    if (!r.ok) return r
    return {
      ok: true,
      result: parseArticleContent(r.content, req.level) ?? { type: 'chat', answer: r.content }
    }
  }

  async function getAppInfo(): Promise<AppInfo> {
    try {
      const info = await deps.info()
      return { name: info.name || 'deuu', version: info.version || '0.1.0' }
    } catch {
      return { name: 'deuu', version: '0.1.0' }
    }
  }

  return {
    getSettings,
    saveSettings: async (settings: Settings) => {
      await writeJson(K_SETTINGS, settings)
    },
    askAI,
    generateArticle,
    getHistory: async () => readJson<HistoryEntry[]>(K_HISTORY, []),
    saveHistory: async (entries: HistoryEntry[]) => {
      await writeJson(K_HISTORY, entries)
    },
    getVocab: async () => readJson<VocabState>(K_VOCAB, { groups: [], items: [] }),
    saveVocab: async (state: VocabState) => {
      await writeJson(K_VOCAB, state)
    },
    dictLookup: async (word: string) => (await loadDict()).lookup(word),
    dictSuggest: async (prefix: string) => (await loadDict()).suggest(prefix),
    getAppInfo,
    // WebView 壳没有桌面窗口控制
    windowMinimize: async () => undefined,
    windowToggleMaximize: async () => false,
    windowClose: async () => undefined,
    windowIsMaximized: async () => false
  }
}
