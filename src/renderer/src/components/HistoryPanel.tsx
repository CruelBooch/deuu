import type { HistoryEntry } from '../../../shared/types'
import { summarize } from '../lib'
import { IconChevronRight, IconHistory, IconTrash } from './icons'

interface Props {
  entries: HistoryEntry[]
  open: boolean
  sheet?: boolean
  onClose: () => void
  onSelect: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
}

const DAY = 24 * 60 * 60 * 1000

const TYPE_LABEL: Record<string, string> = {
  dictionary: '词',
  translation: '译',
  chat: '文'
}

function groupLabel(ts: number, now: number): string {
  const d = new Date(ts)
  const n = new Date(now)
  if (d.toDateString() === n.toDateString()) return '今天'
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return '昨天'
  const diff = now - ts
  if (diff < 7 * DAY) return '本周'
  if (diff < 30 * DAY) return '本月'
  return '更早'
}

type Row =
  | { kind: 'group'; label: string }
  | { kind: 'item'; entry: HistoryEntry; summary: string }

export default function HistoryPanel({
  entries,
  open,
  sheet = false,
  onClose,
  onSelect,
  onRemove,
  onClear
}: Props): JSX.Element {
  const now = Date.now()
  const rows: Row[] = []
  let last = ''
  for (const entry of entries) {
    const g = groupLabel(entry.ts, now)
    if (g !== last) {
      rows.push({ kind: 'group', label: g })
      last = g
    }
    rows.push({ kind: 'item', entry, summary: summarize(entry.result) })
  }

  return (
    <aside
      className={`history-panel${sheet ? ' sheet' : ''}${open ? '' : ' collapsed'}`}
      aria-hidden={!open}
    >
      <div className="history-head">
        <span className="history-head-icon">
          <IconHistory size={15} />
        </span>
        <span className="history-title">历史记录</span>
        <span className="history-count">{entries.length}</span>
        <span className="history-grow" />
        {entries.length > 0 && (
          <button
            className="history-action"
            type="button"
            onClick={onClear}
            title="清空全部"
            aria-label="清空全部"
          >
            <IconTrash />
          </button>
        )}
        <button className="history-action" type="button" onClick={onClose} title="收起" aria-label="收起">
          <IconChevronRight />
        </button>
      </div>

      <div className="history-list">
        {entries.length === 0 ? (
          <div className="history-empty">
            <span>还没有记录</span>
            <small>查询过的词和句子会出现在这里</small>
          </div>
        ) : (
          rows.map((row, i) =>
            row.kind === 'group' ? (
              <div key={`g-${i}-${row.label}`} className="history-group">
                {row.label}
              </div>
            ) : (
              <div key={row.entry.id} className="history-item">
                <button
                  className="history-item-main"
                  type="button"
                  onClick={() => onSelect(row.entry)}
                  title={row.entry.query}
                >
                  <span className="history-item-row">
                    <span className={`history-type ${row.entry.result.type}`}>
                      {TYPE_LABEL[row.entry.result.type] || '文'}
                    </span>
                    <span className="history-item-query">{row.entry.query}</span>
                  </span>
                  {row.summary && <span className="history-item-summary">{row.summary}</span>}
                </button>
                <button
                  className="history-item-del"
                  type="button"
                  onClick={() => onRemove(row.entry.id)}
                  title="删除这条"
                  aria-label="删除这条"
                >
                  ×
                </button>
              </div>
            )
          )
        )}
      </div>
    </aside>
  )
}
