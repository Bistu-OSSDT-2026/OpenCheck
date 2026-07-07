/**
 * 检测结果页 —— R4（杨天阳）所有
 *
 * - 串起 parseRepoUrl → fetchRepo → analyze → saveHistory → render
 * - 加载态、错误态、成功态都在本页内处理
 * - 跳转报告页前写入 R3 结果缓存
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ErrorState,
  LevelTag,
  LoadingState,
  PageLayout,
  ScoreDisplay,
  StatusIcon,
} from '@/components'
import { fetchRepo, isParseError, parseRepoUrl } from '@/api'
import { analyze } from '@/engine'
import { ROUTE } from '@/router/routes'
import { setLastResult } from '@/store/resultCache'
import { saveHistory } from '@/store/history'
import type { AnalysisResult, ApiError, ApiErrorKind } from '@/types'

interface ResultLocationState {
  repoUrl?: string
}

type ResultErrorKind = ApiErrorKind | 'input'

interface ResultError {
  kind: ResultErrorKind
  message: string
}

type ResultState =
  | { status: 'loading'; repoUrl: string }
  | { status: 'success'; repoUrl: string; result: AnalysisResult }
  | { status: 'error'; repoUrl?: string; error: ResultError }

function isApiError(result: Awaited<ReturnType<typeof fetchRepo>>): result is ApiError {
  return 'kind' in result
}

function getErrorMessage(error: ResultError): string {
  if (error.kind === 'notfound') return '未找到该仓库，请检查地址是否正确'
  if (error.kind === 'private') return '暂不支持检测私有仓库'
  if (error.kind === 'ratelimit') return '请求次数已达上限，建议配置 GitHub Token'
  if (error.kind === 'network') return '网络连接失败，请检查网络后重试'
  return error.message
}

function formatDate(value: string): string {
  if (!value) return '未知'
  return new Date(value).toLocaleDateString('zh-CN')
}

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResultLocationState | null
  const repoUrl = state?.repoUrl ?? ''
  const hasStarted = useRef(false)
  const [resultState, setResultState] = useState<ResultState>({
    status: 'loading',
    repoUrl,
  })

  const runAnalysis = useCallback(async (rawUrl: string) => {
    const parsed = parseRepoUrl(rawUrl)
    if (isParseError(parsed)) {
      setResultState({
        status: 'error',
        repoUrl: rawUrl,
        error: { kind: 'input', message: parsed.error },
      })
      return
    }

    setResultState({ status: 'loading', repoUrl: rawUrl })
    const githubData = await fetchRepo(parsed.owner, parsed.repo)

    if (isApiError(githubData)) {
      setResultState({
        status: 'error',
        repoUrl: rawUrl,
        error: githubData,
      })
      return
    }

    const analysisResult = analyze(githubData)
    saveHistory(rawUrl, analysisResult)
    setResultState({
      status: 'success',
      repoUrl: rawUrl,
      result: analysisResult,
    })
  }, [])

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    void runAnalysis(repoUrl)
  }, [repoUrl, runAnalysis])

  const handleViewReport = (result: AnalysisResult) => {
    setLastResult(result)
    navigate(ROUTE.REPORT)
  }

  const handleRetry = () => {
    if (resultState.repoUrl) {
      void runAnalysis(resultState.repoUrl)
    }
  }

  if (resultState.status === 'loading') {
    return (
      <PageLayout title="检测结果">
        <LoadingState text="正在读取仓库信息并生成检测结果..." />
      </PageLayout>
    )
  }

  if (resultState.status === 'error') {
    const canRetry = resultState.error.kind === 'network'
    const isRateLimit = resultState.error.kind === 'ratelimit'

    return (
      <PageLayout title="检测结果">
        <ErrorState
          error={getErrorMessage(resultState.error)}
          onRetry={canRetry ? handleRetry : undefined}
          actionText={isRateLimit ? '去配置 Token' : '返回首页'}
          onAction={() => navigate(isRateLimit ? ROUTE.TOKEN : ROUTE.HOME)}
        />
      </PageLayout>
    )
  }

  const { result } = resultState
  const repo = result.repoInfo

  return (
    <PageLayout title="检测结果">
      <section className="result-page">
        <div className="repo-card">
          <div>
            <p className="repo-card__label">当前仓库</p>
            <h2 className="repo-card__name">{repo.fullName}</h2>
            <p className="repo-card__description">
              {repo.description || '该仓库暂无简介'}
            </p>
          </div>
          <LevelTag level={result.score.level} />
        </div>

        <div className="repo-meta">
          <span>语言：{repo.language || '未知'}</span>
          <span>Stars：{repo.stars.toLocaleString('zh-CN')}</span>
          <span>Forks：{repo.forks.toLocaleString('zh-CN')}</span>
          <span>许可证：{repo.license || '未识别'}</span>
          <span>默认分支：{repo.defaultBranch}</span>
          <span>创建：{formatDate(repo.createdAt)}</span>
          <span>更新：{formatDate(repo.updatedAt)}</span>
        </div>

        <div className="result-summary">
          <ScoreDisplay
            score={result.score.total}
            maxScore={result.score.maxScore}
            level={result.score.level}
          />
          <div className="result-summary__actions">
            <button className="result-btn" type="button" onClick={() => handleViewReport(result)}>
              查看报告
            </button>
            <button className="result-btn result-btn--secondary" type="button" onClick={() => navigate(ROUTE.HOME)}>
              检测其他仓库
            </button>
          </div>
        </div>

        <section className="result-section">
          <h2 className="result-section__title">检测明细</h2>
          <ul className="check-list">
            {result.checks.map((check) => (
              <li className="check-item" key={check.name}>
                <div className="check-item__main">
                  <StatusIcon status={check.status} />
                  <span className="check-item__name">{check.name}</span>
                </div>
                <span className="check-item__score">
                  {check.score} / {check.maxScore}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="result-section">
          <h2 className="result-section__title">改进建议</h2>
          {result.suggestions.length === 0 ? (
            <p className="suggestion-empty">你的项目在检测范围内没有明显缺失，继续保持！</p>
          ) : (
            <ul className="suggestion-list">
              {result.suggestions.map((suggestion) => (
                <li className="suggestion-item" key={suggestion.checkName}>
                  <h3>{suggestion.checkName}</h3>
                  <p>{suggestion.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </PageLayout>
  )
}
