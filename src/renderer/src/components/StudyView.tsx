import { useMemo, useState } from 'react'
import FlashcardsPanel from './FlashcardsPanel'
import GrammarPanel from './GrammarView'
import QuizPanel from './QuizPanel'
import ReadingPanel from './ReadingView'
import { IconBookOpen, IconChevronRight, IconPage, IconSparkle } from './icons'
import type { KnowledgeItem } from '../../../core/knowledge'
import type { VocabEntry } from '../../../shared/types'

type ModuleId = 'grammar' | 'reading' | 'flash' | 'quiz'

interface ModuleDef {
  id: ModuleId
  title: string
  desc: string
  icon: JSX.Element
}

const MODULES: ModuleDef[] = [
  {
    id: 'grammar',
    title: '语法手册',
    desc: 'A1–C1 共 28 个语法点，含变位表与变格表',
    icon: <IconBookOpen size={20} />
  },
  {
    id: 'reading',
    title: '阅读生成',
    desc: '按难度、词数、主题生成德语短文',
    icon: <IconPage size={20} />
  },
  {
    id: 'flash',
    title: '常用背记',
    desc: '动词三态、动词与形容词的介词搭配',
    icon: <IconSparkle size={20} />
  },
  {
    id: 'quiz',
    title: '练习自测',
    desc: '生词释义、动介搭配、动词三态',
    icon: <IconBookOpen size={20} />
  }
]

interface Props {
  vocab: VocabEntry[]
  groups: string[]
  onAddVocab: (item: KnowledgeItem) => void
  onRemoveMany: (ids: string[]) => void
}

/** 学堂：先列出四个模块，进入后再显示具体内容 */
export default function StudyView({ vocab, groups, onAddVocab, onRemoveMany }: Props): JSX.Element {
  const [module, setModule] = useState<ModuleId | null>(null)

  const savedWords = useMemo(() => new Set(vocab.map((v) => v.word.toLowerCase())), [vocab])
  const current = MODULES.find((m) => m.id === module)

  if (module === null) {
    return (
      <div className="learning">
        <div className="learning-head">
          <h2 className="learning-title">学堂</h2>
          <span className="learning-sub">语法 · 阅读 · 背记 · 自测</span>
        </div>

        <div className="module-list">
          {MODULES.map((m) => (
            <button key={m.id} className="module-card" type="button" onClick={() => setModule(m.id)}>
              <span className="module-icon">{m.icon}</span>
              <span className="module-body">
                <span className="module-title">{m.title}</span>
                <span className="module-desc">{m.desc}</span>
              </span>
              <span className="module-arrow">
                <IconChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="learning">
      <div className="module-head">
        <button className="module-back" type="button" onClick={() => setModule(null)}>
          ← 学堂
        </button>
        <h2 className="module-head-title">{current?.title}</h2>
      </div>

      {module === 'grammar' && <GrammarPanel />}
      {module === 'reading' && <ReadingPanel />}
      {module === 'flash' && <FlashcardsPanel savedWords={savedWords} onAddVocab={onAddVocab} />}
      {module === 'quiz' && (
        <QuizPanel vocab={vocab} groups={groups} onRemoveMany={onRemoveMany} />
      )}
    </div>
  )
}
