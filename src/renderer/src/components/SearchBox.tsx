import { useEffect, useMemo, useRef, useState } from 'react'
import { IconArrowRight, IconBook, IconHistory, IconSearch, IconX } from './icons'

interface Props {
  onSubmit: (input: string) => void
  loading: boolean
  suggestions?: string[]
}

interface Item {
  text: string
  source: 'dict' | 'history'
}

const MAX_HEIGHT = 132
const MAX_ITEMS = 8

export default function SearchBox({ onSubmit, loading, suggestions = [] }: Props): JSX.Element {
  const [value, setValue] = useState('')
  const [active, setActive] = useState(-1)
  const [focused, setFocused] = useState(false)
  const [dictItems, setDictItems] = useState<string[]>([])
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  // 词库前缀补全（防抖）
  useEffect(() => {
    const q = value.trim()
    if (!q) {
      setDictItems([])
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      window.api
        .dictSuggest(q)
        .then((list) => {
          if (!cancelled) setDictItems(Array.isArray(list) ? list : [])
        })
        .catch(() => {
          if (!cancelled) setDictItems([])
        })
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [value])

  const items = useMemo<Item[]>(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    const seen = new Set<string>()
    const out: Item[] = []

    // 1) 词库建议优先
    for (const w of dictItems) {
      const text = (w || '').trim()
      if (!text) continue
      const key = text.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ text, source: 'dict' })
      if (out.length >= MAX_ITEMS) return out
    }

    // 2) 历史记录 / 示例
    for (const s of suggestions) {
      const text = (s || '').trim()
      if (!text) continue
      const key = text.toLowerCase()
      if (seen.has(key)) continue
      if (key.includes(q)) {
        seen.add(key)
        out.push({ text, source: 'history' })
        if (out.length >= MAX_ITEMS) break
      }
    }
    return out
  }, [value, suggestions, dictItems])

  const open = focused && items.length > 0 && !loading

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + 'px'
  }, [value])

  function submit(text: string): void {
    const t = text.trim()
    if (!t || loading) return
    onSubmit(t)
    setActive(-1)
  }

  /** 触屏设备上提交后收起软键盘（桌面端保持焦点，方便继续输入） */
  function dismissKeyboard(): void {
    try {
      if (window.matchMedia('(pointer: coarse)').matches) {
        taRef.current?.blur()
      }
    } catch {
      /* ignore */
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault()
      setActive((i) => (i + 1) % items.length)
      return
    }
    if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1))
      return
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setActive(-1)
        setFocused(false)
      }
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (open && active >= 0) {
        const picked = items[active].text
        setValue(picked)
        submit(picked)
      } else {
        submit(value)
      }
      dismissKeyboard()
    }
  }

  return (
    <div className="search-wrap">
      <div className="search-box">
        <span className="search-icon" aria-hidden="true">
          <IconSearch />
        </span>
        <textarea
          ref={taRef}
          className="search-input"
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value)
            setActive(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="输入德语单词或句子，Enter 查询（Shift+Enter 换行）…"
          disabled={loading}
          spellCheck={false}
        />
        {value && !loading && (
          <button
            className="search-clear"
            type="button"
            onClick={() => {
              setValue('')
              setActive(-1)
              taRef.current?.focus()
            }}
            aria-label="清空"
            title="清空"
          >
            <IconX />
          </button>
        )}
        <button
          className="search-submit"
          type="button"
          onClick={() => {
            submit(value)
            dismissKeyboard()
          }}
          disabled={loading || !value.trim()}
          aria-label="查询"
          title="查询 (Enter)"
        >
          {loading ? <span className="spinner-sm" aria-hidden="true" /> : <IconArrowRight />}
        </button>
      </div>

      {open && (
        <div className="suggest-panel" role="listbox" aria-label="候选">
          {items.map((item, i) => (
            <button
              key={`${item.source}-${item.text}`}
              className={`suggest-item${i === active ? ' active' : ''}`}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                setValue(item.text)
                submit(item.text)
                dismissKeyboard()
              }}
            >
              <span className="suggest-icon" aria-hidden="true">
                {item.source === 'dict' ? <IconBook size={13} /> : <IconHistory size={13} />}
              </span>
              <span className="suggest-text">{item.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
