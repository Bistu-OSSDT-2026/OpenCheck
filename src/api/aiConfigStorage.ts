import type { AiConfig } from '@/types'

const AI_CONFIG_KEY = 'opencheck_ai_config'

export const DEFAULT_AI_CONFIG: AiConfig = {
  enabled: false,
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  apiKey: '',
}

export function getAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (!raw) return DEFAULT_AI_CONFIG
    const parsed = JSON.parse(raw) as Partial<AiConfig>
    return {
      enabled: Boolean(parsed.enabled),
      baseUrl: parsed.baseUrl || DEFAULT_AI_CONFIG.baseUrl,
      model: parsed.model || DEFAULT_AI_CONFIG.model,
      apiKey: parsed.apiKey || '',
    }
  } catch {
    return DEFAULT_AI_CONFIG
  }
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
}

export function clearAiConfig(): void {
  localStorage.removeItem(AI_CONFIG_KEY)
}

export function hasUsableAiConfig(config: AiConfig): boolean {
  return Boolean(config.enabled && config.baseUrl.trim() && config.model.trim() && config.apiKey.trim())
}
