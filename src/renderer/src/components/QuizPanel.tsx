import { useMemo, useState } from 'react'
import { KNOWLEDGE } from '../../../core/knowledge'
import ConfirmDialog from './ConfirmDialog'
import { NONE_GROUP } from './VocabView'
import type { VocabEntry } from '../../../shared/types'

interface Props {
  vocab: VocabEntry[]
  groups: string[]
  onRemoveMany: (ids: string[]) => void
}

type Mode = 'vocab' | 'verbPrep' | 'verbs'

interface Question {
  prompt: string
  hint: string
  answer: string
  /** 有选项＝选择题；无选项＝手动输入 */
  options?: string[]
  aliases?: string[]
  /** 生词题对应的条目标识，答对后可批量移除 */
  vocabId?: string
}

const MODES: Array<{ id: Mode; label: string; desc: string }> = [
  { id: 'vocab', label: '生词释义', desc: '看德语选中文，检验生词本掌握情况' },
  { id: 'verbPrep', label: '动介搭配', desc: '动词后面该接哪个介词' },
  { id: 'verbs', label: '动词三态', desc: '手写过去分词，拼写也要对' }
]

const PREPOSITION_POOL = ['auf', 'an', 'für', 'mit', 'von', 'über', 'zu', 'um', 'unter', 'nach', 'gegen', 'bei']
const ROUND = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickN<T>(pool: T[], n: number, exclude: (x: T) => boolean): T[] {
  return shuffle(pool.filter((x) => !exclude(x))).slice(0, n)
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** 输入题判定：允许带助动词（ist / hat）与大小写差异 */
function checkInput(input: string, q: Question): boolean {
  const raw = normalize(input)
  if (!raw) return false
  const stripped = raw.replace(/^(ist|hat)\s+/, '')
  const answers = [normalize(q.answer), ...(q.aliases ?? []).map(normalize)]
  return answers.includes(raw) || answers.includes(stripped)
}

function buildVocabQuestions(pool: VocabEntry[], all: VocabEntry[]): Question[] {
  const usable = pool.filter((v) => v.meanings.length > 0)
  if (usable.length < 4) return []
  const distractorPool = all.filter((v) => v.meanings.length > 0)
  return shuffle(usable)
    .slice(0, Math.min(ROUND, usable.length))
    .map((entry) => {
      const answer = entry.meanings[0]
      const distractors = pickN(
        distractorPool.map((v) => v.meanings[0]),
        3,
        (m) => m === answer
      )
      return {
        prompt: entry.word,
        hint: entry.pos ? `${entry.pos}${entry.gender ? ` · ${entry.gender}` : ''}` : '',
        options: shuffle([answer, ...distractors]),
        answer,
        vocabId: entry.id
      }
    })
}

function buildVerbPrepQuestions(): Question[] {
  const cat = KNOWLEDGE.find((c) => c.id === 'verbPrep')
  if (!cat) return []
  return shuffle(cat.items)
    .slice(0, ROUND)
    .map((item) => {
      const parts = item.de.split(' ')
      const prep = parts[parts.length - 1]
      const verb = parts.slice(0, -1).join(' ')
      return {
        prompt: `${verb} ___`,
        hint: item.zh,
        options: shuffle([prep, ...pickN(PREPOSITION_POOL, 3, (p) => p === prep)]),
        answer: prep
      }
    })
}

function buildVerbQuestions(): Question[] {
  const cat = KNOWLEDGE.find((c) => c.id === 'verbs')
  if (!cat) return []
  const items = cat.items.map((item) => {
    const detail = item.detail ?? ''
    const withAux = detail.split('·').pop()?.trim() ?? '' // 形如 "ist gegangen"
    const participle = withAux.split(' ').pop() ?? ''
    return { de: item.de, zh: item.zh, participle, withAux }
  })
  return shuffle(items)
    .slice(0, ROUND)
    .map((it) => ({
      prompt: it.de,
      hint: it.zh,
      answer: it.participle,
      aliases: [it.withAux]
    }))
}

/** 练习自测：生词释义、动介搭配、动词三态（手写） */
export default function QuizPanel({ vocab, groups, onRemoveMany }: Props): JSX.Element {
  const [mode, setMode] = useState<Mode | null>(null)
  const [group, setGroup] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [verdict, setVerdict] = useState<'ok' | 'bad' | null>(null)
  const [score, setScore] = useState(0)
  const [correctIds, setCorrectIds] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [askRemove, setAskRemove] = useState(false)

  const pool = useMemo(() => {
    const usable = vocab.filter((v) => v.meanings.length > 0)
    if (!group) return usable
    if (group === NONE_GROUP) return usable.filter((v) => !v.group)
    return usable.filter((v) => v.group === group)
  }, [vocab, group])

  const canStartVocab = pool.length >= 4
  const current = questions[index]
  const isInput = !!current && !current.options

  function start(m: Mode): void {
    const qs =
      m === 'vocab'
        ? buildVocabQuestions(pool, vocab)
        : m === 'verbPrep'
          ? buildVerbPrepQuestions()
          : buildVerbQuestions()
    if (qs.length === 0) return
    setMode(m)
    setQuestions(qs)
    setIndex(0)
    setPicked(null)
    setTyped('')
    setVerdict(null)
    setScore(0)
    setCorrectIds([])
    setDone(false)
  }

  function recordAnswer(ok: boolean): void {
    setVerdict(ok ? 'ok' : 'bad')
    if (ok) {
      setScore((s) => s + 1)
      if (current?.vocabId) setCorrectIds((ids) => [...ids, current.vocabId as string])
    }
  }

  function choose(option: string): void {
    if (verdict) return
    setPicked(option)
    recordAnswer(option === current.answer)
  }

  function submitInput(): void {
    if (verdict || !typed.trim()) return
    recordAnswer(checkInput(typed, current))
  }

  function next(): void {
    if (index + 1 >= questions.length) {
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
    setTyped('')
    setVerdict(null)
  }

  return (
    <div className="quiz">
      {mode === null && (
        <>
          <div className="quiz-range">
            <span className="quiz-range-label">生词范围</span>
            <select
              className="quiz-range-select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">全部（{vocab.filter((v) => v.meanings.length > 0).length}）</option>
              <option value={NONE_GROUP}>
                未分组（{vocab.filter((v) => v.meanings.length > 0 && !v.group).length}）
              </option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}（{vocab.filter((v) => v.meanings.length > 0 && v.group === g).length}）
                </option>
              ))}
            </select>
          </div>

          <p className="flash-hint">选一种题型开始，每组 {ROUND} 题。</p>

          <div className="quiz-modes">
            {MODES.map((m) => {
              const disabled = m.id === 'vocab' && !canStartVocab
              return (
                <button
                  key={m.id}
                  className="quiz-mode"
                  type="button"
                  disabled={disabled}
                  onClick={() => start(m.id)}
                >
                  <span className="quiz-mode-title">{m.label}</span>
                  <span className="quiz-mode-desc">
                    {disabled ? `当前范围只有 ${pool.length} 个词，至少需要 4 个` : m.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {mode !== null && !done && current && (
        <>
          <div className="quiz-progress">
            <span>
              第 {index + 1} / {questions.length} 题
            </span>
            <span className="quiz-score">答对 {score}</span>
          </div>

          <div className="quiz-card">
            <div className="quiz-prompt">{current.prompt}</div>
            {current.hint && <div className="quiz-hint">{current.hint}</div>}

            {isInput ? (
              <div className="quiz-input-row">
                <input
                  className="quiz-input"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitInput()
                  }}
                  placeholder="写出过去分词"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={!!verdict}
                />
                <button
                  className="quiz-submit"
                  type="button"
                  onClick={submitInput}
                  disabled={!!verdict || !typed.trim()}
                >
                  确认
                </button>
              </div>
            ) : (
              <div className="quiz-options">
                {(current.options ?? []).map((opt) => {
                  const isAnswer = opt === current.answer
                  const isPicked = picked === opt
                  const cls = !verdict
                    ? 'quiz-option'
                    : isAnswer
                      ? 'quiz-option correct'
                      : isPicked
                        ? 'quiz-option wrong'
                        : 'quiz-option muted'
                  return (
                    <button key={opt} className={cls} type="button" onClick={() => choose(opt)}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {verdict && (
              <>
                <div className={`quiz-verdict ${verdict}`}>
                  {verdict === 'ok' ? '答对了' : `正确答案：${current.answer}`}
                </div>
                <button className="quiz-next" type="button" onClick={next}>
                  {index + 1 >= questions.length ? '看结果' : '下一题'}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {done && (
        <div className="quiz-card quiz-result">
          <div className="quiz-result-score">
            {score} / {questions.length}
          </div>
          <p className="quiz-result-text">
            {score === questions.length
              ? '全对，稳。'
              : score >= questions.length * 0.7
                ? '不错，再练一组巩固一下。'
                : '错的几个建议加进生词本。'}
          </p>

          {mode === 'vocab' && correctIds.length > 0 && (
            <button className="quiz-remove" type="button" onClick={() => setAskRemove(true)}>
              把答对的 {correctIds.length} 个词移出生词本
            </button>
          )}

          <div className="quiz-actions">
            <button className="quiz-next" type="button" onClick={() => mode && start(mode)}>
              再来一组
            </button>
            <button className="quiz-back" type="button" onClick={() => setMode(null)}>
              换题型
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={askRemove}
        title={`移除 ${correctIds.length} 个单词？`}
        message="这些词你已经答对了，移出生词本后不会再出现在练习里。"
        confirmText="移除"
        danger
        onConfirm={() => {
          onRemoveMany(correctIds)
          setCorrectIds([])
          setAskRemove(false)
        }}
        onCancel={() => setAskRemove(false)}
      />
    </div>
  )
}
