import type {
  AIResult,
  ArticleResult,
  DictionaryResult,
  Example,
  TranslationResult
} from '../../../shared/types'
import CopyButton from './CopyButton'
import { IconBook, IconCheck, IconSparkle } from './icons'

interface Props {
  result: AIResult | null
  loading: boolean
  query: string
  onAskAI?: (word: string) => void
  saved?: boolean
  onToggleSave?: (result: DictionaryResult) => void
}

function genderClass(gender: string | null): string {
  if (!gender) return ''
  const g = gender.trim().toLowerCase()
  if (g === 'der') return 'tag-der'
  if (g === 'die') return 'tag-die'
  if (g === 'das') return 'tag-das'
  return ''
}

function genderLabel(gender: string | null): string {
  if (!gender) return ''
  const g = gender.trim().toLowerCase()
  if (g === 'der') return 'der · 阳性'
  if (g === 'die') return 'die · 阴性'
  if (g === 'das') return 'das · 中性'
  return gender
}

function dictionaryToText(r: DictionaryResult): string {
  const lines: string[] = []
  lines.push(r.word + (r.phonetic ? `  [${r.phonetic}]` : ''))
  if (r.partOfSpeech) lines.push(`词性：${r.partOfSpeech}`)
  if (r.gender) lines.push(`性：${r.gender}`)
  if (r.plural) lines.push(`复数：${r.plural}`)
  if (r.definitions.length) {
    lines.push('', '释义：')
    r.definitions.forEach((d, i) => {
      lines.push(`${i + 1}. ${d.pos ? `[${d.pos}] ` : ''}${d.meaning}`)
    })
  }
  if (r.examples.length) {
    lines.push('', '例句：')
    r.examples.forEach((ex) => lines.push(`- ${ex.de}`, `  ${ex.zh}`))
  }
  if (r.conjugation) {
    lines.push('', '补充：', r.conjugation)
  }
  return lines.join('\n')
}

export default function ResultView({
  result,
  loading,
  query,
  onAskAI,
  saved,
  onToggleSave
}: Props): JSX.Element {
  if (loading) {
    return (
      <div className="result-skeleton" aria-busy="true" aria-label={`正在查询：${query}`}>
        <div className="skeleton-line tall" />
        <div className="skeleton-line w60" />
        <div className="skeleton-line w90" />
        <div className="skeleton-line w90" />
        <div className="skeleton-line w40" />
      </div>
    )
  }

  if (!result) return <></>

  if (result.type === 'dictionary') {
    return (
      <DictionaryView
        result={result}
        onAskAI={onAskAI}
        saved={!!saved}
        onToggleSave={onToggleSave}
      />
    )
  }
  if (result.type === 'translation') return <TranslationView result={result} />
  if (result.type === 'article') return <ArticleView result={result} />
  return <ChatView answer={result.answer} query={query} />
}

function ArticleView({ result }: { result: ArticleResult }): JSX.Element {
  return (
    <div className="result-panel card article-card">
      <div className="article-head">
        <h3 className="article-title">{result.title}</h3>
        <span className="tag tag-pos">{result.level}</span>
      </div>
      <div className="article-body">
        {result.paragraphs.map((p, i) => (
          <div key={i} className="article-para">
            <p className="article-de">{p.de}</p>
            {p.zh && <p className="article-zh">{p.zh}</p>}
          </div>
        ))}
      </div>
      {result.vocabulary.length > 0 && (
        <section className="dict-section">
          <h4 className="section-title">重点词汇</h4>
          <div className="article-vocab">
            {result.vocabulary.map((v, i) => (
              <div key={i} className="article-word">
                <span className="article-word-de">{v.de}</span>
                <span className="article-word-zh">{v.zh}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function DictionaryView({
  result,
  onAskAI,
  saved,
  onToggleSave
}: {
  result: DictionaryResult
  onAskAI?: (word: string) => void
  saved: boolean
  onToggleSave?: (result: DictionaryResult) => void
}): JSX.Element {
  return (
    <div className="result-panel card">
      <div className="dict-head">
        <h2 className="dict-word">{result.word || '—'}</h2>
        {result.phonetic && <span className="dict-phonetic">[{result.phonetic}]</span>}
      </div>

      <div className="dict-tags">
        {result.partOfSpeech && <span className="tag tag-pos">{result.partOfSpeech}</span>}
        {result.gender && (
          <span className={`tag tag-gender ${genderClass(result.gender)}`}>
            {genderLabel(result.gender)}
          </span>
        )}
        {result.plural && <span className="tag tag-plural">复数 {result.plural}</span>}
        {result.offline && <span className="tag tag-offline">离线词典</span>}
      </div>

      {result.definitions.length > 0 && (
        <section className="dict-section">
          <h3 className="section-title">释义</h3>
          <ol className="dict-defs">
            {result.definitions.map((d, i) => (
              <li key={i} className="dict-def">
                {d.pos && <span className="def-pos">{d.pos}</span>}
                <span>{d.meaning}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {result.examples.length > 0 && (
        <section className="dict-section">
          <h3 className="section-title">例句</h3>
          <ul className="dict-examples">
            {result.examples.map((ex: Example, i: number) => (
              <li key={i} className="dict-example">
                <div className="example-de">{ex.de}</div>
                <div className="example-zh">{ex.zh}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.conjugation && (
        <section className="dict-section">
          <h3 className="section-title">补充</h3>
          <p className="dict-extra">{result.conjugation}</p>
        </section>
      )}

      <div className="result-actions">
        {onToggleSave && (
          <button
            className={`btn-save${saved ? ' saved' : ''}`}
            type="button"
            onClick={() => onToggleSave(result)}
          >
            {saved ? <IconCheck /> : <IconBook />}
            {saved ? '已收藏' : '收藏'}
          </button>
        )}
        {result.offline && onAskAI && (
          <button className="btn-ai" type="button" onClick={() => onAskAI(result.word)}>
            <IconSparkle />
            AI 详细查询
          </button>
        )}
        <CopyButton text={dictionaryToText(result)} />
      </div>
    </div>
  )
}

function TranslationView({ result }: { result: TranslationResult }): JSX.Element {
  return (
    <div className="result-panel card">
      <div className="trans-source">{result.source || '—'}</div>
      <div className="trans-arrow" aria-hidden="true" />
      <div className="trans-target">{result.target || '—'}</div>

      {result.explanation && (
        <section className="trans-explanation">
          <h3 className="section-title">讲解</h3>
          <p>{result.explanation}</p>
        </section>
      )}

      <div className="result-actions">
        <CopyButton text={result.target || ''} />
      </div>
    </div>
  )
}

function ChatView({ answer, query }: { answer: string; query: string }): JSX.Element {
  return (
    <div className="result-panel card">
      <section
        className="trans-explanation"
        style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}
      >
        <h3 className="section-title">{query ? '回答' : '内容'}</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
      </section>
      <div className="result-actions">
        <CopyButton text={answer} />
      </div>
    </div>
  )
}
