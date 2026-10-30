import { useMemo, useState } from 'react'
import { GRAMMAR_TOPICS } from '../../../core/grammar'
import type { GrammarTopic } from '../../../shared/types'

type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

const GRAMMAR_FILTERS: LevelFilter[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1']

export default function GrammarView(): JSX.Element {
  const [level, setLevel] = useState<LevelFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const list = useMemo(
    () => (level === 'all' ? GRAMMAR_TOPICS : GRAMMAR_TOPICS.filter((t) => t.level === level)),
    [level]
  )
  const open = openId ? GRAMMAR_TOPICS.find((t) => t.id === openId) : null

  return (
    <div className="learning">
      <div className="learning-head">
        <h2 className="learning-title">语法</h2>
        <span className="learning-sub">离线语法手册 · 变位与变格表</span>
      </div>

      {open ? (
        <GrammarDetail topic={open} onBack={() => setOpenId(null)} />
      ) : (
        <>
          <div className="grammar-levels">
            {GRAMMAR_FILTERS.map((lv) => (
              <button
                key={lv}
                className={`grammar-level${level === lv ? ' active' : ''}`}
                type="button"
                onClick={() => setLevel(lv)}
              >
                {lv === 'all' ? '全部' : lv}
              </button>
            ))}
            <span className="grammar-count">{list.length} 个语法点</span>
          </div>

          <div className="grammar-list">
            {list.map((t) => (
              <button
                key={t.id}
                className="grammar-item"
                type="button"
                onClick={() => setOpenId(t.id)}
              >
                <span className={`grammar-badge level-${t.level.toLowerCase()}`}>{t.level}</span>
                <span className="grammar-item-body">
                  <span className="grammar-item-title">{t.title}</span>
                  <span className="grammar-item-summary">{t.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function GrammarDetail({ topic, onBack }: { topic: GrammarTopic; onBack: () => void }): JSX.Element {
  return (
    <div className="grammar-detail">
      <button className="grammar-back" type="button" onClick={onBack}>
        ← 返回列表
      </button>

      <h3 className="grammar-detail-title">
        <span className={`grammar-badge level-${topic.level.toLowerCase()}`}>{topic.level}</span>
        {topic.title}
      </h3>
      <p className="grammar-summary">{topic.summary}</p>

      <section className="grammar-section">
        <h4 className="grammar-section-title">讲解</h4>
        <ul className="grammar-points">
          {topic.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      {topic.tables?.map((t, i) => (
        <section className="grammar-section" key={`table-${i}`}>
          <h4 className="grammar-section-title">{t.caption ?? '表格'}</h4>
          <div className="grammar-table-wrap">
            <table className="grammar-table">
              <thead>
                <tr>
                  {t.headers.map((h, j) => (
                    <th key={j}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t.note && <p className="grammar-table-note">{t.note}</p>}
        </section>
      ))}

      {topic.examples.length > 0 && (
        <section className="grammar-section">
          <h4 className="grammar-section-title">例句</h4>
          <ul className="grammar-examples">
            {topic.examples.map((ex, i) => (
              <li key={i}>
                <div className="grammar-ex-de">{ex.de}</div>
                <div className="grammar-ex-zh">{ex.zh}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topic.pitfalls && topic.pitfalls.length > 0 && (
        <section className="grammar-section">
          <h4 className="grammar-section-title">易错点</h4>
          <ul className="grammar-pitfalls">
            {topic.pitfalls.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
