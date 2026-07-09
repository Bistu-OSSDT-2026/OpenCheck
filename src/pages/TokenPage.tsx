import { useEffect, useState } from 'react'
import { ExternalLink, Eye, EyeOff, Gauge, Info, KeyRound, Save, Sparkles, Trash2 } from 'lucide-react'
import { PageLayout } from '@/components'
import { clearAiConfig, DEFAULT_AI_CONFIG, fetchRateLimit, getAiConfig, saveAiConfig } from '@/api'
import { clearToken, getToken, saveToken } from '@/api/tokenStorage'
import type { ApiError, RateLimitInfo } from '@/types'

export default function TokenPage() {
  const [token, setToken] = useState('')
  const [tokenSaved, setTokenSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)
  const [rateError, setRateError] = useState('')
  const [showToken, setShowToken] = useState(false)

  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiBaseUrl, setAiBaseUrl] = useState(DEFAULT_AI_CONFIG.baseUrl)
  const [aiModel, setAiModel] = useState(DEFAULT_AI_CONFIG.model)
  const [aiApiKey, setAiApiKey] = useState('')
  const [aiSaved, setAiSaved] = useState(false)
  const [showAiKey, setShowAiKey] = useState(false)

  useEffect(() => {
    const existing = getToken()
    if (existing) setToken(existing)

    const aiConfig = getAiConfig()
    setAiEnabled(aiConfig.enabled)
    setAiBaseUrl(aiConfig.baseUrl)
    setAiModel(aiConfig.model)
    setAiApiKey(aiConfig.apiKey)
  }, [])

  const flashTokenSaved = () => {
    setTokenSaved(true)
    setTimeout(() => setTokenSaved(false), 2000)
  }

  const flashAiSaved = () => {
    setAiSaved(true)
    setTimeout(() => setAiSaved(false), 2000)
  }

  const handleSave = () => {
    saveToken(token)
    flashTokenSaved()
  }

  const handleClear = () => {
    clearToken()
    setToken('')
    setRateLimit(null)
    setRateError('')
    flashTokenSaved()
  }

  const handleSaveAi = () => {
    saveAiConfig({
      enabled: aiEnabled,
      baseUrl: aiBaseUrl.trim() || DEFAULT_AI_CONFIG.baseUrl,
      model: aiModel.trim() || DEFAULT_AI_CONFIG.model,
      apiKey: aiApiKey.trim(),
    })
    flashAiSaved()
  }

  const handleClearAi = () => {
    clearAiConfig()
    setAiEnabled(false)
    setAiBaseUrl(DEFAULT_AI_CONFIG.baseUrl)
    setAiModel(DEFAULT_AI_CONFIG.model)
    setAiApiKey('')
    flashAiSaved()
  }

  const handleCheckRateLimit = async () => {
    setChecking(true)
    setRateError('')
    setRateLimit(null)
    const result = await fetchRateLimit(token.trim() || undefined)
    setChecking(false)
    if (isApiError(result)) {
      setRateError(result.message)
      return
    }
    setRateLimit(result)
  }

  return (
    <PageLayout title="Token 配置">
      <div className="token-page">
        <div className="token-info">
          <h3>
            <Info aria-hidden="true" size={21} />
            什么是 GitHub Token？
          </h3>
          <p>GitHub Personal Access Token 用于身份验证，配置后可提升 API 请求限额：</p>
          <ul>
            <li>不配置 Token：每小时最多 60 次请求</li>
            <li>配置 Token：每小时最多 5,000 次请求</li>
          </ul>
          <p>
            在{' '}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
              GitHub Token 设置页
              <ExternalLink aria-hidden="true" size={16} />
            </a>{' '}
            生成 Token 时，无需勾选任何权限，本工具仅访问公开仓库信息。
          </p>
        </div>

        <div className="token-form">
          <div className="token-status">
            <span>当前状态</span>
            <strong>{token.trim() ? '已配置 Token' : '未配置 Token'}</strong>
          </div>
          <label className="token-label" htmlFor="token-input">
            Personal Access Token
          </label>
          <div className="token-input-wrap">
            <KeyRound aria-hidden="true" size={18} />
            <input
              id="token-input"
              className="token-input"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <button
              aria-label={showToken ? '隐藏 Token' : '显示 Token'}
              className="token-visibility-btn"
              type="button"
              onClick={() => setShowToken((value) => !value)}
            >
              {showToken ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
            </button>
          </div>
          <div className="token-buttons">
            <button className="token-save-btn" type="button" onClick={handleSave}>
              <Save aria-hidden="true" size={18} />
              {tokenSaved ? '已保存' : '保存'}
            </button>
            {token && (
              <button className="token-clear-btn" type="button" onClick={handleClear}>
                <Trash2 aria-hidden="true" size={17} />
                清除 Token
              </button>
            )}
            <button
              className="token-clear-btn token-rate-btn"
              type="button"
              onClick={() => void handleCheckRateLimit()}
              disabled={checking}
            >
              <Gauge aria-hidden="true" size={17} />
              {checking ? '检查中...' : '检查 API 额度'}
            </button>
          </div>
          {rateLimit && (
            <div className="token-rate-result">
              <span>
                剩余 {rateLimit.remaining} / {rateLimit.limit}
              </span>
              <span>重置时间：{rateLimit.resetAt ? new Date(rateLimit.resetAt).toLocaleString('zh-CN') : '未知'}</span>
            </div>
          )}
          {rateError && <p className="token-rate-error">{rateError}</p>}
        </div>

        <div className="token-info ai-preview-panel">
          <h3>
            <Sparkles aria-hidden="true" size={21} />
            AI 辅助检查
          </h3>
          <p>
            AI 辅助检查是可选增强：不配置时仍使用默认规则评分；配置后仅补充建议，不改变现有评分结果。
            API Key 由用户自行填写并保存在当前浏览器本地，项目不会内置任何密钥。
          </p>
          <ul>
            <li>支持 OpenAI-compatible 接口，例如 DeepSeek、豆包 / 火山方舟等。</li>
            <li>模型请求失败时只显示回退提示，默认检测结果继续可用。</li>
            <li>前端不会把 API Key 写入仓库或报告，也不会在页面上明文展示。</li>
          </ul>
        </div>

        <div className="token-form ai-preview-form">
          <div className="token-status">
            <span>AI 辅助状态</span>
            <strong>{aiEnabled ? '已开启' : '默认关闭'}</strong>
          </div>

          <label className="ai-toggle-row" htmlFor="ai-enabled">
            <input
              id="ai-enabled"
              type="checkbox"
              checked={aiEnabled}
              onChange={(event) => setAiEnabled(event.target.checked)}
            />
            <span>
              开启 AI 辅助建议
              <small>仅作为补充建议，不影响默认评分系统</small>
            </span>
          </label>

          <label className="token-label" htmlFor="ai-base-url">
            Base URL
          </label>
          <input
            id="ai-base-url"
            className="token-input ai-input"
            value={aiBaseUrl}
            onChange={(event) => setAiBaseUrl(event.target.value)}
            placeholder="https://api.deepseek.com"
          />

          <label className="token-label" htmlFor="ai-model">
            Model
          </label>
          <input
            id="ai-model"
            className="token-input ai-input"
            value={aiModel}
            onChange={(event) => setAiModel(event.target.value)}
            placeholder="deepseek-chat 或火山方舟接入点名称"
          />

          <label className="token-label" htmlFor="ai-api-key">
            API Key
          </label>
          <div className="token-input-wrap">
            <KeyRound aria-hidden="true" size={18} />
            <input
              id="ai-api-key"
              className="token-input"
              type={showAiKey ? 'text' : 'password'}
              value={aiApiKey}
              onChange={(event) => setAiApiKey(event.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            />
            <button
              aria-label={showAiKey ? '隐藏 AI API Key' : '显示 AI API Key'}
              className="token-visibility-btn"
              type="button"
              onClick={() => setShowAiKey((value) => !value)}
            >
              {showAiKey ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
            </button>
          </div>

          <div className="ai-provider-examples">
            <span>DeepSeek：Base URL 可填 https://api.deepseek.com，Model 填 deepseek-chat</span>
            <span>豆包 / 火山方舟：Base URL 填 https://ark.cn-beijing.volces.com/api/v3，Model 填接入点名称</span>
          </div>

          <div className="token-buttons">
            <button className="token-save-btn" type="button" onClick={handleSaveAi}>
              <Save aria-hidden="true" size={18} />
              {aiSaved ? '已保存' : '保存 AI 配置'}
            </button>
            <button className="token-clear-btn" type="button" onClick={handleClearAi}>
              <Trash2 aria-hidden="true" size={17} />
              清空 AI 配置
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

function isApiError(result: RateLimitInfo | ApiError): result is ApiError {
  return 'kind' in result
}
