import { useState } from 'react'
import CopyButton from './CopyButton'
import { IconSparkle } from './icons'
import type { ArticleLevel, ArticleRequest, ArticleResult } from '../../../shared/types'

const LEVELS: ArticleLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

const TOPIC_PRESETS = ['校园生活', '家庭', '旅行', '饮食', '环保', '科技', '德国文化', '运动']

const WORDS_MIN = 40
const WORDS_MAX = 600

/** 把文章整理成可粘贴的纯文本 */
function articleToText(a: ArticleResult): string {
  const lines: string[] = [`${a.title}（${a.level}）`, '']
  for (const p of a.paragraphs) {
    lines.push(p.de)
    if (p.zh) lines.push(p.zh)
    lines.push('')
  }
  if (a.vocabulary.length > 0) {
    lines.push('重点词汇')
    for (const v of a.vocabulary) {
      lines.push(`${v.de}  ${v.zh}${v.pos ? `（${v.pos}）` : ''}`)
    }
    lines.push('')
  }
  if (a.grammar && a.grammar.length > 0) {
    lines.push('语法提示')
    for (const g of a.grammar) lines.push(`· ${g}`)
  }
  return lines.join('\n').trim()
}

export default function ReadingView(): JSX.Element {
  const [level, setLevel] = useState<ArticleLevel>('A2')
  const [topic, setTopic] = useState('校园生活')
  const [words, setWords] = useState(180)
  const [custom, setCustom] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [article, setArticle] = useState<ArticleResult | null>(null)
  const [raw, setRaw] = useState<string | null>(null)
  const [showZh, setShowZh] = useState(true)

  function clampWords(v: number): number {
    if (!Number.isFinite(v)) return 180
    return Math.min(WORDS_MAX, Math.max(WORDS_MIN, Math.round(v)))
  }

  async function run(req: ArticleRequest): Promise<void> {
    if (loading) return
    setLoading(true)
    setError(null)
    if (!req.previous) {
      setArticle(null)
      setRaw(null)
      setShowZh(true)
    }
    try {
      const res = await window.api.generateArticle(req)
      if (!res.ok) {
        setError(res.error.message)
      } else if (res.result.type === 'article') {
        setArticle(res.result)
        setRaw(null)
        setFeedback('')
      } else if (res.result.type === 'chat') {
        setRaw(res.result.answer)
      } else {
        setError('返回格式异常，请重试')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function generate(): void {
    void run({ level, topic, words, custom })
  }

  function revise(): void {
    if (!article || !feedback.trim()) return
    void run({ level, topic, words, custom, previous: article, feedback: feedback.trim() })
  }

  return (
    <div className="learning">
      <div className="learning-head">
        <h2 className="learning-title">阅读</h2>
        <span className="learning-sub">AI 生成德语短文 · 可反复修改</span>
      </div>

      <div className="reading-form">
        <div className="reading-row">
          <span className="reading-label">难度</span>
          <div className="segmented">
            {LEVELS.map((lv) => (
              <button
                key={lv}
                type="button"
                className={`seg-item${level === lv ? ' active' : ''}`}
                onClick={() => setLevel(lv)}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>

        <div className="reading-row">
          <span className="reading-label">词数</span>
          <input
            className="reading-number"
            type="number"
            inputMode="numeric"
            min={WORDS_MIN}
            max={WORDS_MAX}
            step={20}
            value={words}
            onChange={(e) => setWords(Number(e.target.value) || 0)}
            onBlur={() => setWords((w) => clampWords(w))}
          />
          <span className="reading-unit">词（{WORDS_MIN}–{WORDS_MAX}）</span>
        </div>

        <div className="reading-row">
          <span className="reading-label">主题</span>
          <input
            className="reading-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：校园生活 / 家庭 / 环保"
            spellCheck={false}
          />
        </div>

        <div className="reading-presets">
          {TOPIC_PRESETS.map((t) => (
            <button
              key={t}
              type="button"
              className={`reading-chip${topic === t ? ' active' : ''}`}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="reading-row reading-custom-row">
          <span className="reading-label">要求</span>
          <textarea
            className="reading-textarea"
            rows={2}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="可选。例如：用第一人称、包含一段对话、不要出现数字"
            spellCheck={false}
          />
        </div>

        <button className="reading-generate" type="button" onClick={generate} disabled={loading}>
          {loading ? '正在生成…' : '生成一篇德语短文'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && (
        <div className="result-skeleton" aria-busy="true">
          <div className="skeleton-line tall" />
          <div className="skeleton-line w90" />
          <div className="skeleton-line w90" />
          <div className="skeleton-line w60" />
        </div>
      )}

      {raw && !loading && (
        <div className="result-panel card">
          <p style={{ whiteSpace: 'pre-wrap' }}>{raw}</p>
        </div>
      )}

      {article && !loading && (
        <>
          <div className="result-panel card article-card">
            <div className="article-head">
              <h3 className="article-title">{article.title}</h3>
              <span className="tag tag-pos">{article.level}</span>
              <div className="article-actions">
                <CopyButton text={articleToText(article)} label="复制全文" />
                <button
                  className={`article-toggle${showZh ? ' on' : ''}`}
                  type="button"
                  onClick={() => setShowZh((v) => !v)}
                >
                  {showZh ? '隐藏中文' : '显示中文'}
                </button>
              </div>
            </div>

            <div className="article-body">
              {article.paragraphs.map((p, i) => (
                <div key={i} className="article-para">
                  <p className="article-de">{p.de}</p>
                  {showZh && p.zh && <p className="article-zh">{p.zh}</p>}
                </div>
              ))}
            </div>

            {article.vocabulary.length > 0 && (
              <section className="dict-section">
                <h4 className="section-title">重点词汇</h4>
                <div className="article-vocab">
                  {article.vocabulary.map((v, i) => (
                    <div key={i} className="article-word">
                      <span className="article-word-de">{v.de}</span>
                      <span className="article-word-zh">{v.zh}</span>
                      {v.pos && <span className="article-word-pos">{v.pos}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {article.grammar && article.grammar.length > 0 && (
              <section className="dict-section">
                <h4 className="section-title">语法提示</h4>
                <ul className="grammar-points">
                  {article.grammar.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="reading-revise">
            <div className="reading-revise-head">
              <IconSparkle size={13} />
              不满意？说说你想怎么改
            </div>
            <div className="reading-revise-row">
              <input
                className="reading-revise-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') revise()
                }}
                placeholder="例如：把主角换成男生、加一段对话、结尾更积极"
              />
              <button
                className="reading-revise-btn"
                type="button"
                onClick={revise}
                disabled={loading || !feedback.trim()}
              >
                按要求修改
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
