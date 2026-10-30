import type { AIResult, Settings } from '../shared/types'

export const SYSTEM_PROMPT = `你是 deuu，一名专业的德语学习助手，服务于中文母语者。用户会输入一段文本，可能是：
1. 单个德语单词或短语 —— 需要查词典
2. 一句完整的德语句子或较长的德语短语 —— 需要翻译成中文并讲解句型
3. 中文单词或句子 —— 需要翻译成德语，并对德语部分简要说明

请先判断属于哪种情况，然后只返回一个 JSON 对象（不要输出任何 JSON 以外的文字，不要用 Markdown 代码块包裹）。

【查词典】当输入是德语单词/短语时，返回：
{
  "type": "dictionary",
  "word": "原词",
  "phonetic": "国际音标，如无则省略该字段",
  "partOfSpeech": "词性（如 名词、动词、形容词、副词等）",
  "gender": "名词的性：der/die/das；非名词填 null",
  "plural": "名词复数形式；非名词填 null",
  "definitions": [{"pos": "词性", "meaning": "中文释义"}],
  "examples": [{"de": "德语例句", "zh": "中文翻译"}],
  "conjugation": "动词变位/形容词比较级/名词变格等补充信息；没有则填空字符串"
}

【翻译】当输入是完整的德语句子/短语，或中文需要译成德语时，返回：
{
  "type": "translation",
  "source": "原文",
  "target": "翻译结果（德→中输出中文；中→德输出德语）",
  "explanation": "逐词或逐句讲解，帮助理解词汇与句型结构"
}

要求：
- 释义、翻译与讲解一律使用简体中文。
- 词典释义要准确、分义项；例句要地道并附中文翻译。
- 讲解要通俗，指出关键语法点（如动词位置、格、从句结构等）。
- 只返回 JSON，不要任何多余内容。`

export interface AiChatMessage {
  role: 'system' | 'user'
  content: string
}

/** 拼接 OpenAI 兼容接口的完整地址 */
export function chatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.trim().replace(/\/+$/, '')}/chat/completions`
}

/** 构造 /chat/completions 请求体 */
export function buildAiPayload(input: string, settings: Settings): Record<string, unknown> {
  return {
    model: settings.model.trim(),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input }
    ] satisfies AiChatMessage[],
    temperature: 0.3,
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

/** 把模型返回的 JSON 规范化为 AIResult；结构不符时降级为 chat */
export function normalizeAiResult(raw: unknown): AIResult {
  const obj = raw as Record<string, unknown> | null
  if (obj && obj.type === 'dictionary') {
    return {
      type: 'dictionary',
      word: String(obj.word ?? ''),
      phonetic: typeof obj.phonetic === 'string' ? obj.phonetic : undefined,
      partOfSpeech: String(obj.partOfSpeech ?? ''),
      gender: typeof obj.gender === 'string' ? obj.gender : null,
      plural: typeof obj.plural === 'string' ? obj.plural : null,
      definitions: Array.isArray(obj.definitions) ? obj.definitions : [],
      examples: Array.isArray(obj.examples) ? obj.examples : [],
      conjugation: typeof obj.conjugation === 'string' ? obj.conjugation : ''
    }
  }
  if (obj && obj.type === 'translation') {
    return {
      type: 'translation',
      source: String(obj.source ?? ''),
      target: String(obj.target ?? ''),
      explanation: String(obj.explanation ?? '')
    }
  }
  return {
    type: 'chat',
    answer: typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)
  }
}

/** 解析 chat/completions 的 content（解析失败时降级为纯文本） */
export function parseAiContent(content: string): AIResult {
  try {
    return normalizeAiResult(extractJson(content))
  } catch {
    return { type: 'chat', answer: content }
  }
}

/** 从 chat/completions 的响应体里取出首个 message.content */
export function pickContent(data: unknown): string {
  const d = data as { choices?: Array<{ message?: { content?: string } }> } | null
  return d?.choices?.[0]?.message?.content ?? ''
}
