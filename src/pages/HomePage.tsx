/**
 * 首页 —— R4（杨天阳）所有
 *
 * - 仓库地址输入框 + 实时校验（调用 R1 的 parseRepoUrl）
 * - 点击开始检测后跳转结果页，由 ResultPage 执行真实检测流程
 * - 支持 R5 历史页跳回时预填 repoUrl
 */

import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components'
import { parseRepoUrl, isParseError } from '@/api'
import { DEMO_RESULTS } from '@/engine'
import { ROUTE } from '@/router/routes'

interface HomeLocationState {
  prefillUrl?: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as HomeLocationState | null
  const [repoUrl, setRepoUrl] = useState(state?.prefillUrl ?? '')
  const [touched, setTouched] = useState(false)

  const parseResult = useMemo(() => parseRepoUrl(repoUrl), [repoUrl])
  const hasInput = repoUrl.trim().length > 0
  const validationError = isParseError(parseResult) ? parseResult.error : ''
  const canSubmit = hasInput && !isParseError(parseResult)
  const showError = touched && validationError

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)

    const currentResult = parseRepoUrl(repoUrl)
    if (isParseError(currentResult)) return

    navigate(ROUTE.RESULT, {
      state: {
        repoUrl: repoUrl.trim(),
      },
    })
  }

  const handleDemo = (demo: (typeof DEMO_RESULTS)[number]) => {
    navigate(ROUTE.RESULT, {
      state: {
        mode: 'demo',
        repoUrl: demo.repoUrl,
        result: demo.result,
      },
    })
  }

  return (
    <PageLayout title="OpenCheck — 开源项目体检助手" showBack={false}>
      <section className="home-hero">
        <p className="home-hero__summary">
          输入 GitHub 仓库地址，快速检查 README、许可证、运行说明、项目结构和改进建议。
        </p>

        <form className="home-form" onSubmit={handleSubmit}>
          <label className="home-form__label" htmlFor="repo-url">
            GitHub 仓库地址
          </label>
          <div className="home-form__row">
            <input
              id="repo-url"
              className={`home-form__input${showError ? ' home-form__input--error' : ''}`}
              value={repoUrl}
              onBlur={() => setTouched(true)}
              onChange={(event) => {
                setRepoUrl(event.target.value)
                setTouched(true)
              }}
              placeholder="例如 facebook/react 或 https://github.com/facebook/react"
            />
            <button className="home-form__submit" type="submit" disabled={!canSubmit}>
              开始检测
            </button>
          </div>
          {showError && <p className="home-form__error">{validationError}</p>}
        </form>

        <div className="home-tips">
          <span>支持完整 HTTPS 地址</span>
          <span>支持 github.com/owner/repo</span>
          <span>支持 owner/repo</span>
        </div>

        <div className="demo-panel">
          <h2>演示样例</h2>
          <p>评审现场网络不稳或 GitHub 限流时，可以直接使用本地样例展示完整报告链路。</p>
          <div className="demo-list">
            {DEMO_RESULTS.map((demo) => (
              <button
                className="demo-card"
                key={demo.id}
                type="button"
                onClick={() => handleDemo(demo)}
              >
                <strong>{demo.label}</strong>
                <span>{demo.description}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
