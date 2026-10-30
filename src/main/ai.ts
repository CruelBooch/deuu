import { buildAiPayload, chatCompletionsUrl, parseAiContent, pickContent } from '../core/ai'
import { buildArticlePayload, parseArticleContent } from '../core/article'
import type { AIResult, ArticleRequest, Settings } from '../shared/types'

/** 统一的 /chat/completions 调用，返回 message.content */
async function postChat(settings: Settings, payload: Record<string, unknown>): Promise<string> {
  const url = chatCompletionsUrl(settings.baseUrl)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)

  let resp: Response
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('请求超时，请检查网络或稍后重试')
    }
    throw new Error(`无法连接接口：${err instanceof Error ? err.message : String(err)}`)
  } finally {
    clearTimeout(timer)
  }

  if (!resp.ok) {
    let detail = ''
    try {
      detail = await resp.text()
    } catch {
      detail = ''
    }
    throw new Error(`请求失败 (HTTP ${resp.status})：${detail.slice(0, 300)}`)
  }

  const content = pickContent(await resp.json())
  if (!content) throw new Error('AI 返回内容为空')
  return content
}

export async function queryAI(input: string, settings: Settings): Promise<AIResult> {
  return parseAiContent(await postChat(settings, buildAiPayload(input, settings)))
}

export async function generateArticle(
  req: ArticleRequest,
  settings: Settings
): Promise<AIResult> {
  const content = await postChat(settings, buildArticlePayload(req, settings))
  return parseArticleContent(content, req.level) ?? { type: 'chat', answer: content }
}
