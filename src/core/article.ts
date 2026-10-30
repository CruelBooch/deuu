import type { ArticleRequest, ArticleResult, ArticleWord, Settings } from '../shared/types'

export const ARTICLE_SYSTEM_PROMPT = `你是 deuu 的德语阅读材料生成器，服务对象是中国的德语学习者。

请根据用户给定的难度、主题和词数，生成一篇原创德语短文，并且只返回一个 JSON 对象（不要输出任何 JSON 以外的文字，不要用 Markdown 代码块包裹）。

JSON 结构：
{
  "title": "德语标题",
  "level": "难度，如 B1",
  "paragraphs": [
    { "de": "一个德语段落", "zh": "该段的中文翻译" }
  ],
  "vocabulary": [
    { "de": "德语词或短语", "zh": "中文释义", "pos": "词性，如 名词 / 动词 / 形容词" }
  ],
  "grammar": ["本篇用到的语法点提示，1–3 条"]
}

要求：
- 德语必须地道、语法正确，符合所给 CEFR 难度的词汇与句型（A1/A2 用简单句和常用词；B1/B2 可用从句与抽象话题；C1 可用复杂句式、名词化、分词结构、书面语表达）。
- 分段自然，每段 2–5 句；总词数尽量贴合用户给定的数字（允许 ±15%）。
- 中文翻译要准确、通顺，逐段对应。
- 重点词汇挑 8–12 个，优先选难度接近该等级上限、学生容易卡住的词。
- 内容健康、适合中学生，不涉及政治、暴力、成人内容。
- 如果用户同时提供了「上一篇短文」和「修改要求」，请在保持主题与难度的前提下，按修改要求改写，并返回完整的 JSON（结构不变）。`

function previousToJson(prev: ArticleResult): string {
  return JSON.stringify({
    title: prev.title,
    level: prev.level,
    paragraphs: prev.paragraphs,
    vocabulary: prev.vocabulary,
    grammar: prev.grammar ?? []
  })
}

function buildUserPrompt(req: ArticleRequest): string {
  const topic = (req.topic || '').trim() || '日常生活'
  const lines = [
    `难度：${req.level}`,
    `主题：${topic}`,
    `长度：约 ${Math.max(40, Math.round(req.words))} 个德语单词`
  ]

  const custom = (req.custom || '').trim()
  if (custom) lines.push(`额外要求：${custom}`)

  if (req.previous && req.feedback && req.feedback.trim()) {
    lines.push('')
    lines.push('上一篇短文（JSON）：')
    lines.push(previousToJson(req.previous))
    lines.push('')
    lines.push(`修改要求：${req.feedback.trim()}`)
    lines.push('请按上述要求改写，并按同样的 JSON 结构返回完整短文。')
  } else {
    lines.push('请生成一篇德语阅读短文。')
  }

  return lines.join('\n')
}

/** 构造文章生成 / 改写请求体 */
export function buildArticlePayload(req: ArticleRequest, settings: Settings): Record<string, unknown> {
  return {
    model: settings.model.trim(),
    messages: [
      { role: 'system', content: ARTICLE_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(req) }
    ],
    temperature: 0.6,
    stream: false
  }
}

function extractJson(text: string): unknown {
  let t = text.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) t = fence[1].trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return JSON.parse(t)
}

/** 解析模型返回的文章；结构不合法时返回 null（调用方转为纯文本展示） */
export function parseArticleContent(content: string, fallbackLevel: string): ArticleResult | null {
  let raw: unknown
  try {
    raw = extractJson(content)
  } catch {
    return null
  }

  const obj = raw as Record<string, unknown> | null
  if (!obj || !Array.isArray(obj.paragraphs)) return null

  const paragraphs = obj.paragraphs
    .map((p) => {
      const o = p as Record<string, unknown>
      return { de: String(o?.de ?? '').trim(), zh: String(o?.zh ?? '').trim() }
    })
    .filter((p) => p.de.length > 0)

  if (paragraphs.length === 0) return null

  const vocabulary: ArticleWord[] = Array.isArray(obj.vocabulary)
    ? obj.vocabulary
        .map((v) => {
          const o = v as Record<string, unknown>
          return {
            de: String(o?.de ?? '').trim(),
            zh: String(o?.zh ?? '').trim(),
            pos: typeof o?.pos === 'string' ? o.pos : undefined
          }
        })
        .filter((v) => v.de.length > 0)
    : []

  const grammar = Array.isArray(obj.grammar)
    ? obj.grammar.map((g) => String(g)).filter((g) => g.trim().length > 0)
    : undefined

  return {
    type: 'article',
    title: String(obj.title ?? '德语阅读').trim() || '德语阅读',
    level: String(obj.level ?? fallbackLevel).trim() || fallbackLevel,
    paragraphs,
    vocabulary,
    grammar
  }
}
