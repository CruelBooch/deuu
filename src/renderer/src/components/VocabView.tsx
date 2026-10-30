import { useEffect, useRef, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import type { VocabEntry } from '../../../shared/types'

export const NONE_GROUP = '__none__'

interface Props {
  groups: string[]
  activeGroup: string
  onActiveGroupChange: (group: string) => void
  items: VocabEntry[]
  total: number
  onCreateGroup: (name: string) => void
  onDeleteGroup: (name: string) => void
  onSelect: (entry: VocabEntry) => void
  onRemove: (id: string) => void
  onDeleteMany: (ids: string[]) => void
  onMove: (id: string, group: string) => void
  onReorder: (draggedId: string, targetId: string) => void
  onClear: () => void
}

export default function VocabView({
  groups,
  activeGroup,
  onActiveGroupChange,
  items,
  total,
  onCreateGroup,
  onDeleteGroup,
  onSelect,
  onRemove,
  onDeleteMany,
  onMove,
  onReorder,
  onClear
}: Props): JSX.Element {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const cancelRef = useRef(false)

  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [pending, setPending] = useState<
    | { kind: 'one'; id: string; label: string }
    | { kind: 'batch'; ids: string[] }
    | { kind: 'clear' }
    | { kind: 'group'; name: string }
    | null
  >(null)

  // 切换分组 / 列表变化时清空选择
  useEffect(() => {
    setSelected(new Set())
  }, [activeGroup, items.length])

  function toggleSelect(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll(): void {
    if (selected.size === items.length) setSelected(new Set())
    else setSelected(new Set(items.map((v) => v.id)))
  }

  function deleteSelected(): void {
    if (selected.size === 0) return
    setPending({ kind: 'batch', ids: Array.from(selected) })
  }

  function confirmPending(): void {
    if (!pending) return
    if (pending.kind === 'one') {
      onRemove(pending.id)
    } else if (pending.kind === 'batch') {
      onDeleteMany(pending.ids)
      setSelected(new Set())
    } else if (pending.kind === 'clear') {
      onClear()
    } else if (pending.kind === 'group') {
      onDeleteGroup(pending.name)
    }
    setPending(null)
  }

  const dialog =
    pending?.kind === 'one'
      ? { title: '移出生词本？', message: `「${pending.label}」将从生词本移除，之后还可以重新收藏。` }
      : pending?.kind === 'batch'
        ? { title: `删除选中的 ${pending.ids.length} 个单词？`, message: '删除后无法恢复。' }
        : pending?.kind === 'clear'
          ? { title: '清空整个生词本？', message: `将删除全部 ${total} 个单词，删除后无法恢复。分组会保留。` }
          : pending?.kind === 'group'
            ? {
                title: `删除分组「${pending.name}」？`,
                message: '组内的单词会保留，回到「未分组」。'
              }
            : null

  function commit(): void {
    const value = name.trim()
    setCreating(false)
    setName('')
    if (value) onCreateGroup(value)
  }

  return (
    <div className="vocab">
      <div className="vocab-head">
        <h2 className="vocab-title">生词本</h2>
        <span className="vocab-count">{total}</span>
        <span className="vocab-grow" />
        {total > 0 && (
          <button
            className={`vocab-batch${selectMode ? ' on' : ''}`}
            type="button"
            onClick={() => {
              setSelectMode((v) => !v)
              setSelected(new Set())
            }}
          >
            {selectMode ? '退出批量' : '批量'}
          </button>
        )}
        {total > 0 && !selectMode && (
          <button className="vocab-clear" type="button" onClick={() => setPending({ kind: 'clear' })}>
            清空
          </button>
        )}
      </div>

      <div className="vocab-groups">
        <button
          className={`vocab-group-tab${activeGroup === '' ? ' active' : ''}`}
          type="button"
          onClick={() => onActiveGroupChange('')}
        >
          全部
        </button>
        <button
          className={`vocab-group-tab${activeGroup === NONE_GROUP ? ' active' : ''}`}
          type="button"
          onClick={() => onActiveGroupChange(NONE_GROUP)}
        >
          未分组
        </button>
        {groups.map((g) => (
          <span key={g} className={`vocab-group-tab${activeGroup === g ? ' active' : ''}`}>
            <button className="vocab-group-name" type="button" onClick={() => onActiveGroupChange(g)}>
              {g}
            </button>
            <button
              className="vocab-group-x"
              type="button"
              onClick={() => setPending({ kind: 'group', name: g })}
              title="删除分组"
              aria-label="删除分组"
            >
              ×
            </button>
          </span>
        ))}

        {creating ? (
          <input
            className="vocab-group-input"
            autoFocus
            value={name}
            placeholder="分组名，回车创建"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                cancelRef.current = false
                commit()
              }
              if (e.key === 'Escape') {
                cancelRef.current = true
                e.currentTarget.blur()
              }
            }}
            onBlur={() => {
              if (cancelRef.current) {
                cancelRef.current = false
                setCreating(false)
                setName('')
                return
              }
              commit()
            }}
          />
        ) : (
          <button className="vocab-group-add" type="button" onClick={() => setCreating(true)}>
            + 新建组
          </button>
        )}
      </div>

      {selectMode && (
        <div className="vocab-batch-bar">
          <span className="vocab-batch-count">已选 {selected.size} / {items.length}</span>
          <button className="vocab-batch-btn" type="button" onClick={selectAll}>
            {selected.size === items.length && items.length > 0 ? '取消全选' : '全选'}
          </button>
          <button
            className="vocab-batch-btn danger"
            type="button"
            onClick={deleteSelected}
            disabled={selected.size === 0}
          >
            删除选中
          </button>
          <span className="vocab-batch-hint">点条目可勾选，拖拽左侧 ⠿ 可排序</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="vocab-empty">
          <div className="placeholder-mark" aria-hidden="true">
            生
          </div>
          {total === 0 ? (
            <>
              <p>还没有收藏的单词</p>
              <small>查词后点卡片上的「收藏」即可加入生词本</small>
            </>
          ) : (
            <>
              <p>这个分组还没有单词</p>
              <small>在单词右侧的下拉框里把它移进来</small>
            </>
          )}
        </div>
      ) : (
        <div className="vocab-list">
          {items.map((v) => {
            const checked = selected.has(v.id)
            return (
              <div
                key={v.id}
                className={[
                  'vocab-item',
                  checked ? 'checked' : '',
                  dragId === v.id ? 'dragging' : '',
                  dragOverId === v.id ? 'drag-over' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={(e) => {
                  if (!dragId || selectMode) return
                  e.preventDefault()
                  if (dragOverId !== v.id) setDragOverId(v.id)
                }}
                onDragLeave={() => {
                  if (dragOverId === v.id) setDragOverId(null)
                }}
                onDrop={(e) => {
                  if (!dragId || selectMode) return
                  e.preventDefault()
                  if (dragId !== v.id) onReorder(dragId, v.id)
                  setDragId(null)
                  setDragOverId(null)
                }}
              >
                {selectMode ? (
                  <button
                    className={`vocab-check${checked ? ' on' : ''}`}
                    type="button"
                    onClick={() => toggleSelect(v.id)}
                    aria-label={checked ? '取消选择' : '选择'}
                  >
                    {checked ? '✓' : ''}
                  </button>
                ) : (
                  <span
                    className="vocab-drag"
                    draggable
                    onDragStart={(e) => {
                      setDragId(v.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', v.id)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setDragOverId(null)
                    }}
                    title="拖拽排序"
                    aria-hidden="true"
                  >
                    ⠿
                  </span>
                )}

                <button
                  className="vocab-main"
                  type="button"
                  onClick={() => {
                    if (selectMode) toggleSelect(v.id)
                    else onSelect(v)
                  }}
                  title={v.word}
                >
                  <span className="vocab-word">{v.word}</span>
                  <span className="vocab-tags">
                    {v.pos}
                    {v.gender ? ` · ${v.gender}` : ''}
                    {v.plural ? ` · 复数 ${v.plural}` : ''}
                  </span>
                  <span className="vocab-meaning">{v.meanings.slice(0, 2).join('；')}</span>
                </button>

                {!selectMode && groups.length > 0 && (
                  <select
                    className="vocab-group-select"
                    value={v.group || ''}
                    onChange={(e) => onMove(v.id, e.target.value)}
                    title="移动到分组"
                  >
                    <option value="">未分组</option>
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  className="vocab-del"
                  type="button"
                  onClick={() => setPending({ kind: 'one', id: v.id, label: v.word })}
                  title="移出生词本"
                  aria-label="移出生词本"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        confirmText="删除"
        danger
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
