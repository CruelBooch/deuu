import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AIResult,
  AppInfo,
  DictEntry,
  DictionaryResult,
  HistoryEntry,
  Settings,
  VocabEntry
} from '../../shared/types'
import SearchBox from './components/SearchBox'
import ResultView from './components/ResultView'
import SettingsView from './components/SettingsView'
import Sidebar from './components/Sidebar'
import type { Page } from './components/Sidebar'
import HistoryPanel from './components/HistoryPanel'
import VocabView, { NONE_GROUP } from './components/VocabView'
import GrammarView from './components/GrammarView'
import ReadingView from './components/ReadingView'
import TitleBar from './components/TitleBar'
import MobileTabs from './components/MobileTabs'
import { IconAlert, IconHistory } from './components/icons'
import { applyTheme, DEFAULT_ACCENT } from './lib'
import { useMediaQuery } from './hooks/useMediaQuery'
import appIcon from './assets/app-icon.png'

const HISTORY_LIMIT = 100
const VOCAB_LIMIT = 2000

const EXAMPLES: Array<{ text: string; label: string }> = [
  { text: 'der Apfel', label: 'der Apfel' },
  { text: 'sich freuen', label: 'sich freuen' },
  { text: 'Ich gehe morgen ins Kino.', label: 'Ich gehe morgen ins Kino.' },
  { text: '谢谢', label: '谢谢 · 中译德' }
]

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  offlineFirst: true,
  theme: 'auto',
  accent: '#4a63c8'
}

function offlineToResult(word: string, entries: DictEntry[]): DictionaryResult {
  const first = entries[0]
  const defs: Array<{ pos: string; meaning: string }> = []
  for (const e of entries) {
    for (const m of e.d) defs.push({ pos: e.p, meaning: m })
    if (defs.length >= 16) break
  }
  return {
    type: 'dictionary',
    word: first.w || word,
    phonetic: first.ipa,
    partOfSpeech: first.p,
    gender: first.g ?? null,
    plural: first.pl ?? null,
    definitions: defs.slice(0, 16),
    examples: [],
    conjugation: '',
    offline: true
  }
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('search')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [result, setResult] = useState<AIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyOpen, setHistoryOpen] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const [vocab, setVocab] = useState<VocabEntry[]>([])
  const [vocabGroups, setVocabGroups] = useState<string[]>([])
  const [activeGroup, setActiveGroup] = useState('')

  const historyRef = useRef<HistoryEntry[]>([])
  const vocabRef = useRef<VocabEntry[]>([])
  const groupsRef = useRef<string[]>([])

  useEffect(() => {
    window.api
      .getSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
    window.api
      .getAppInfo()
      .then(setAppInfo)
      .catch(() => {
        /* 忽略 */
      })
    window.api
      .getHistory()
      .then((entries) => {
        historyRef.current = entries
        setHistory(entries)
      })
      .catch(() => {
        /* 忽略 */
      })
    window.api
      .getVocab()
      .then((state) => {
        const items = Array.isArray(state?.items) ? state.items : []
        const groups = Array.isArray(state?.groups) ? state.groups : []
        vocabRef.current = items
        groupsRef.current = groups
        setVocab(items)
        setVocabGroups(groups)
      })
      .catch(() => {
        /* 忽略 */
      })
  }, [])

  // 主题：明暗模式 + 自定义主题色
  useEffect(() => {
    const theme = settings?.theme ?? 'auto'
    const accent = settings?.accent || DEFAULT_ACCENT
    applyTheme(theme, accent)
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = (): void => applyTheme('auto', accent)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    return undefined
  }, [settings?.theme, settings?.accent])

  const saveVocabState = useCallback((items: VocabEntry[], groups: string[]) => {
    vocabRef.current = items
    groupsRef.current = groups
    setVocab(items)
    setVocabGroups(groups)
    window.api.saveVocab({ groups, items }).catch(() => {
      /* 忽略 */
    })
  }, [])

  const saveHistoryState = useCallback((next: HistoryEntry[]) => {
    historyRef.current = next
    setHistory(next)
    window.api.saveHistory(next).catch(() => {
      /* 忽略 */
    })
  }, [])

  const pushHistory = useCallback((query: string, res: AIResult) => {
    const entry: HistoryEntry = { id: newId(), query, ts: Date.now(), result: res }
    saveHistoryState([entry, ...historyRef.current].slice(0, HISTORY_LIMIT))
  }, [saveHistoryState])

  const handleSubmit = useCallback(
    async (input: string, opts?: { skipOffline?: boolean }) => {
      const text = input.trim()
      if (!text || loading) return

      setLoading(true)
      setError(null)
      setResult(null)
      setLastQuery(text)
      setPage('search')

      try {
        const isSingleWord = /^[^\s]{1,48}$/.test(text)
        const offlineFirst = settings?.offlineFirst !== false

        if (!opts?.skipOffline && isSingleWord && offlineFirst) {
          try {
            const dict = await window.api.dictLookup(text)
            if (dict.found && dict.entries.length > 0) {
              const res = offlineToResult(text, dict.entries)
              setResult(res)
              pushHistory(text, res)
              return
            }
          } catch {
            /* 词库缺失时回退到 AI */
          }
        }

        const res = await window.api.askAI(text)
        if (res.ok) {
          setResult(res.result)
          pushHistory(text, res.result)
        } else {
          setError(res.error.message)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    },
    [loading, settings, pushHistory]
  )

  const handleAskAI = useCallback(
    (word: string) => {
      handleSubmit(word, { skipOffline: true })
    },
    [handleSubmit]
  )

  const handleSaveSettings = useCallback(async (next: Settings) => {
    await window.api.saveSettings(next)
    setSettings(next)
    setPage('search')
  }, [])

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setPage('search')
    setError(null)
    setResult(entry.result)
    setLastQuery(entry.query)
  }, [])

  const handleRemoveHistory = useCallback(
    (id: string) => {
      saveHistoryState(historyRef.current.filter((h) => h.id !== id))
    },
    [saveHistoryState]
  )

  const handleClearHistory = useCallback(() => {
    saveHistoryState([])
  }, [saveHistoryState])

  const savedWords = useMemo(() => {
    const s = new Set<string>()
    for (const v of vocab) s.add(v.word.toLowerCase())
    return s
  }, [vocab])

  const handleToggleSave = useCallback(
    (res: DictionaryResult) => {
      const key = res.word.toLowerCase()
      const existing = vocabRef.current.find((v) => v.word.toLowerCase() === key)
      if (existing) {
        saveVocabState(
          vocabRef.current.filter((v) => v.id !== existing.id),
          groupsRef.current
        )
        return
      }
      const group = activeGroup && activeGroup !== NONE_GROUP ? activeGroup : undefined
      const entry: VocabEntry = {
        id: newId(),
        word: res.word,
        pos: res.partOfSpeech,
        gender: res.gender,
        plural: res.plural,
        phonetic: res.phonetic,
        meanings: res.definitions.map((d) => d.meaning).filter(Boolean).slice(0, 6),
        group,
        ts: Date.now()
      }
      saveVocabState([entry, ...vocabRef.current].slice(0, VOCAB_LIMIT), groupsRef.current)
    },
    [activeGroup, saveVocabState]
  )

  const handleRemoveVocab = useCallback(
    (id: string) => {
      saveVocabState(
        vocabRef.current.filter((v) => v.id !== id),
        groupsRef.current
      )
    },
    [saveVocabState]
  )

  const handleClearVocab = useCallback(() => {
    saveVocabState([], groupsRef.current)
  }, [saveVocabState])

  const handleDeleteMany = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const set = new Set(ids)
      saveVocabState(
        vocabRef.current.filter((v) => !set.has(v.id)),
        groupsRef.current
      )
    },
    [saveVocabState]
  )

  const handleReorder = useCallback(
    (draggedId: string, targetId: string) => {
      const items = [...vocabRef.current]
      const from = items.findIndex((v) => v.id === draggedId)
      const to = items.findIndex((v) => v.id === targetId)
      if (from < 0 || to < 0 || from === to) return
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      saveVocabState(items, groupsRef.current)
    },
    [saveVocabState]
  )

  const handleMoveVocab = useCallback(
    (id: string, group: string) => {
      saveVocabState(
        vocabRef.current.map((v) => (v.id === id ? { ...v, group: group || undefined } : v)),
        groupsRef.current
      )
    },
    [saveVocabState]
  )

  const handleCreateGroup = useCallback(
    (name: string) => {
      const value = name.trim()
      if (!value) return
      if (groupsRef.current.includes(value)) {
        setActiveGroup(value)
        return
      }
      saveVocabState(vocabRef.current, [...groupsRef.current, value])
      setActiveGroup(value)
    },
    [saveVocabState]
  )

  const handleDeleteGroup = useCallback(
    (name: string) => {
      saveVocabState(
        vocabRef.current.map((v) => (v.group === name ? { ...v, group: undefined } : v)),
        groupsRef.current.filter((g) => g !== name)
      )
      if (activeGroup === name) setActiveGroup('')
    },
    [activeGroup, saveVocabState]
  )

  const handleSelectVocab = useCallback((entry: VocabEntry) => {
    setPage('search')
    setError(null)
    setLastQuery(entry.word)
    setResult({
      type: 'dictionary',
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: entry.pos,
      gender: entry.gender ?? null,
      plural: entry.plural ?? null,
      definitions: entry.meanings.map((m) => ({ pos: entry.pos, meaning: m })),
      examples: [],
      conjugation: '',
      offline: true
    })
  }, [])

  const visibleVocab = useMemo(() => {
    if (activeGroup === '') return vocab
    if (activeGroup === NONE_GROUP) return vocab.filter((v) => !v.group)
    return vocab.filter((v) => v.group === activeGroup)
  }, [vocab, activeGroup])

  const suggestions = useMemo(() => {
    const out: string[] = []
    const seen = new Set<string>()
    for (const h of history) {
      const q = (h.query || '').trim()
      if (q && !seen.has(q)) {
        seen.add(q)
        out.push(q)
      }
    }
    for (const ex of EXAMPLES) {
      if (!seen.has(ex.text)) {
        seen.add(ex.text)
        out.push(ex.text)
      }
    }
    return out
  }, [history])

  const resultSaved =
    result && result.type === 'dictionary' ? savedWords.has(result.word.toLowerCase()) : false

  return (
    <div className={`app${isMobile ? ' mobile' : ''}`}>
      {!isMobile && (
        <TitleBar
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen((v) => !v)}
          onHome={() => setPage('search')}
        />
      )}

      {isMobile && (
        <button
          className="mobile-history-fab"
          type="button"
          onClick={() => setSheetOpen(true)}
          title="历史记录"
          aria-label="历史记录"
        >
          <IconHistory size={18} />
          {history.length > 0 && <span className="mobile-history-count">{history.length}</span>}
        </button>
      )}

      <div className="workspace">
        {!isMobile && (
          <Sidebar
            page={page}
            onNavigate={setPage}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />
        )}

        <main className="main">
          {page === 'search' && (
            <div className="home">
              <div className="hero">
                <div className="hero-flag" aria-hidden="true" />
                <h1 className="hero-title">德语词典 · 句型翻译</h1>
                <p className="hero-sub">查单词：释义、词性、复数与例句；译句子：翻译并讲解语法</p>
              </div>

              {settings !== null && !settings.apiKey.trim() && (
                <div className="notice-banner">
                  <span className="notice-icon">
                    <IconAlert />
                  </span>
                  <span className="notice-text">
                    还没有配置 API Key：离线词典可以直接查词，AI 翻译和讲解需要先配置。
                  </span>
                  <button className="notice-btn" type="button" onClick={() => setPage('settings')}>
                    去设置
                  </button>
                </div>
              )}

              <SearchBox onSubmit={handleSubmit} loading={loading} suggestions={suggestions} />

              {error && (
                <div className="error-banner">
                  <span className="error-icon">
                    <IconAlert />
                  </span>
                  <span>{error}</span>
                </div>
              )}

              {!result && !loading && !error && (
                <div className="examples">
                  <span className="examples-label">试试</span>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.text}
                      className="example-chip"
                      type="button"
                      onClick={() => handleSubmit(ex.text)}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              )}

              <ResultView
                result={result}
                loading={loading}
                query={lastQuery}
                onAskAI={handleAskAI}
                saved={resultSaved}
                onToggleSave={handleToggleSave}
              />
            </div>
          )}

          {page === 'vocab' && (
            <VocabView
              groups={vocabGroups}
              activeGroup={activeGroup}
              onActiveGroupChange={setActiveGroup}
              items={visibleVocab}
              total={vocab.length}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onSelect={handleSelectVocab}
              onRemove={handleRemoveVocab}
              onDeleteMany={handleDeleteMany}
              onMove={handleMoveVocab}
              onReorder={handleReorder}
              onClear={handleClearVocab}
            />
          )}

          {page === 'grammar' && <GrammarView />}

          {page === 'reading' && <ReadingView />}

          {page === 'settings' && (
            <SettingsView
              settings={settings ?? DEFAULT_SETTINGS}
              appInfo={appInfo}
              onSave={handleSaveSettings}
              onBack={() => setPage('search')}
            />
          )}
        </main>

        {!isMobile && (
          <HistoryPanel
            entries={history}
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            onSelect={handleSelectHistory}
            onRemove={handleRemoveHistory}
            onClear={handleClearHistory}
          />
        )}
      </div>

      {isMobile && <MobileTabs page={page} onNavigate={setPage} />}

      {isMobile && sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet-body" onClick={(e) => e.stopPropagation()}>
            <HistoryPanel
              sheet
              entries={history}
              open
              onClose={() => setSheetOpen(false)}
              onSelect={(entry) => {
                handleSelectHistory(entry)
                setSheetOpen(false)
              }}
              onRemove={handleRemoveHistory}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      )}
    </div>
  )
}
