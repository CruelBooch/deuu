import { useMemo, useState } from 'react'
import { KNOWLEDGE } from '../../../core/knowledge'
import type { KnowledgeItem } from '../../../core/knowledge'

interface Props {
  /** 已在生词本里的词（小写） */
  savedWords: Set<string>
  onAddVocab: (item: KnowledgeItem) => void
}

/** 常用背记知识：动词三态、动介搭配，可一键加入生词本 */
export default function FlashcardsPanel({ savedWords, onAddVocab }: Props): JSX.Element {
  const [catId, setCatId] = useState(KNOWLEDGE[0].id)
  const cat = useMemo(() => KNOWLEDGE.find((c) => c.id === catId) ?? KNOWLEDGE[0], [catId])

  return (
    <div className="flashcards">
      <div className="grammar-levels">
        {KNOWLEDGE.map((c) => (
          <button
            key={c.id}
            className={`grammar-level${catId === c.id ? ' active' : ''}`}
            type="button"
            onClick={() => setCatId(c.id)}
          >
            {c.title}
          </button>
        ))}
        <span className="grammar-count">{cat.items.length} 条</span>
      </div>

      <p className="flash-hint">{cat.hint}</p>

      <div className="flash-list">
        {cat.items.map((item) => {
          const saved = savedWords.has(item.de.toLowerCase())
          return (
            <div key={item.id} className="flash-card">
              <div className="flash-main">
                <span className="flash-de">{item.de}</span>
                <span className="flash-zh">{item.zh}</span>
                {item.detail && <span className="flash-detail">{item.detail}</span>}
              </div>
              <button
                className={`flash-add${saved ? ' saved' : ''}`}
                type="button"
                disabled={saved}
                onClick={() => onAddVocab(item)}
              >
                {saved ? '已收藏' : '＋ 生词本'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
