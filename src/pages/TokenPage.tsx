/**
 * Token 配置页 —— R5（苏和）所有
 *
 * - Token 输入框 + 说明（用途、GitHub 获取链接）
 * - 读取当前 Token（调用 R1 的 getToken()）显示在输入框中
 * - 保存：调用 R1 的 saveToken(token)
 * - R1 是 token 槽位的唯一所有者，R5 不直接碰 localStorage
 */

import { useState, useEffect } from 'react'
import { ExternalLink, Eye, EyeOff, Gauge, Info, KeyRound, Save, Trash2 } from 'lucide-react'
import { PageLayout } from '@/components'
import { fetchRateLimit } from '@/api'
import { getToken, saveToken, clearToken } from '@/api/tokenStorage'
import type { ApiError, RateLimitInfo } from '@/types'

export default function TokenPage() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)
  const [rateError, setRateError] = useState('')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    const existing = getToken()
    if (existing) setToken(existing)
  }, [])

  const handleSave = () => {
    saveToken(token)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    clearToken()
    setToken('')
    setRateLimit(null)
    setRateError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <h3><Info aria-hidden="true" size={21} />什么是 GitHub Token？</h3>
          <p>
            GitHub Personal Access Token 用于身份验证，配置后可提升 API 请求限额：
          </p>
          <ul>
            <li>不配置 Token：每小时最多 60 次请求</li>
            <li>配置 Token：每小时最多 5,000 次请求</li>
          </ul>
          <p>
            在{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Token 设置页
              <ExternalLink aria-hidden="true" size={16} />
            </a>{' '}
            生成 Token 时，无需勾选任何权限（本工具仅访问公开仓库信息）。
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
              onChange={(e) => setToken(e.target.value)}
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
              {saved ? '已保存' : '保存'}
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
              <span>剩余 {rateLimit.remaining} / {rateLimit.limit}</span>
              <span>
                重置时间：{rateLimit.resetAt ? new Date(rateLimit.resetAt).toLocaleString('zh-CN') : '未知'}
              </span>
            </div>
          )}
          {rateError && <p className="token-rate-error">{rateError}</p>}
        </div>
      </div>
    </PageLayout>
  )
}

function isApiError(result: RateLimitInfo | ApiError): result is ApiError {
  return 'kind' in result
}
