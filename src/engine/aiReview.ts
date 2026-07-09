import type { AiConfig, AiReviewResult, AiReviewSuggestion, AnalysisResult } from '@/types'
import { hasUsableAiConfig } from '@/api/aiConfigStorage'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

interface ParsedAiResponse {
  summary?: string
  suggestions?: AiReviewSuggestion[]
}

const AI_TIMEOUT_MS = 15000

export async function generateAiReview(result: AnalysisResult, config: AiConfig): Promise<AiReviewResult> {
  if (!hasUsableAiConfig(config)) {
    return {
      status: 'disabled',
      message: '未启用 AI 辅助检查，当前结果完全由默认规则评分系统生成。',
    }
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch(buildChatCompletionsUrl(config.baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: buildMessages(result),
        temperature: 0.2,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        status: 'fallback',
        provider: config.baseUrl,
        model: config.model,
        message: `AI 请求失败（HTTP ${response.status}），已回退到默认规则评分结果。`,
      }
    }

    const data = (await response.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content ?? ''
    const parsed = parseAiResponse(content)

    if (!parsed.suggestions.length) {
      return {
        status: 'fallback',
        provider: config.baseUrl,
        model: config.model,
        message: 'AI 返回内容无法解析，已回退到默认规则评分结果。',
      }
    }

    return {
      status: 'success',
      provider: config.baseUrl,
      model: config.model,
      message: parsed.summary || 'AI 已基于默认检测结果生成补充建议。',
      suggestions: parsed.suggestions.slice(0, 3),
    }
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? 'AI 请求超时，已回退到默认规则评分结果。'
      : 'AI 请求异常，已回退到默认规则评分结果。'
    return {
      status: 'fallback',
      provider: config.baseUrl,
      model: config.model,
      message,
    }
  } finally {
    window.clearTimeout(timeout)
  }
}

function buildChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/chat/completions')) return trimmed
  return `${trimmed}/v1/chat/completions`
}

function buildMessages(result: AnalysisResult) {
  const failedChecks = result.checks
    .filter((check) => check.status !== 'pass')
    .map((check) => ({
      name: check.name,
      status: check.status,
      score: `${check.score}/${check.maxScore}`,
      reason: check.reason,
      evidence: check.evidence?.slice(0, 3) ?? [],
    }))

  return [
    {
      role: 'system',
      content:
        '你是 OpenCheck 的开源项目体检辅助检查器。你只根据用户提供的默认规则检测结果生成补充建议，不改变分数，不编造仓库内容。请只输出 JSON。',
    },
    {
      role: 'user',
      content: JSON.stringify({
        outputSchema: {
          summary: '一句话说明 AI 发现的重点',
          suggestions: [
            {
              title: '建议标题',
              content: '可执行的中文建议，控制在 80 字以内',
            },
          ],
        },
        rules: [
          '最多返回 3 条 suggestions',
          '不要输出 Markdown 代码块',
          '不要要求用户提供 API Key、Token 或私密信息',
          '必须说明建议来自 AI 辅助，不改变默认规则评分',
        ],
        repo: result.repoInfo,
        score: result.score,
        failedChecks,
        defaultSuggestions: result.suggestions.map((suggestion) => ({
          checkName: suggestion.checkName,
          content: suggestion.content,
        })),
      }),
    },
  ]
}

function parseAiResponse(content: string): Required<ParsedAiResponse> {
  const jsonText = extractJson(content)
  if (!jsonText) return { summary: '', suggestions: [] }

  try {
    const parsed = JSON.parse(jsonText) as ParsedAiResponse
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((item) => item && typeof item.title === 'string' && typeof item.content === 'string')
          .map((item) => ({
            title: item.title.trim(),
            content: item.content.trim(),
          }))
          .filter((item) => item.title && item.content)
      : []
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
      suggestions,
    }
  } catch {
    return { summary: '', suggestions: [] }
  }
}

function extractJson(content: string): string {
  const trimmed = content.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed
  const match = trimmed.match(/\{[\s\S]*\}/)
  return match?.[0] ?? ''
}
