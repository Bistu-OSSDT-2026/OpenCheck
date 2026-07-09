/**
 * 检测结果页 —— R4（杨天阳）所有
 *
 * - 串起 parseRepoUrl → fetchRepo → analyze → saveHistory → render
 * - 加载态、错误态、成功态都在本页内处理
 * - 跳转报告页前写入 R3 结果缓存
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Code2,
  FileText,
  GitBranch,
  GitFork,
  RotateCcw,
  Scale,
  Search,
  Star,
} from 'lucide-react'
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
import { RULE_EXPLANATIONS, analyze, generateReport } from '@/engine'
import { ROUTE } from '@/router/routes'
import { setLastResult } from '@/store/resultCache'
import { createHistoryComparison, saveHistory } from '@/store/history'
import type { AnalysisResult, ApiError, ApiErrorKind } from '@/types'

interface ResultLocationState {
  repoUrl?: string
  mode?: 'real' | 'demo'
  result?: AnalysisResult
}

type ResultErrorKind = ApiErrorKind | 'input'

interface ResultError {
  kind: ResultErrorKind
  message: string
}

type ResultState =
  | { status: 'loading'; repoUrl: string }
  | { status: 'success'; repoUrl: string; result: AnalysisResult; mode: 'real' | 'demo' }
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

function statusLabel(status: string): string {
  if (status === 'pass') return '通过'
  if (status === 'partial') return '部分通过'
  if (status === 'fail') return '未通过'
  return status
}

function formatScoreDelta(delta: number): string {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return '无变化'
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
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)

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
    const savedRecord = saveHistory(rawUrl, analysisResult)
    const historyComparison = createHistoryComparison(analysisResult, savedRecord.previous)
    const resultForDisplay: AnalysisResult = historyComparison
      ? { ...analysisResult, historyComparison }
      : analysisResult
    if (historyComparison) {
      resultForDisplay.report = generateReport({
        timestamp: resultForDisplay.timestamp,
        repoInfo: resultForDisplay.repoInfo,
        score: resultForDisplay.score,
        checks: resultForDisplay.checks,
        suggestions: resultForDisplay.suggestions,
        historyComparison: resultForDisplay.historyComparison,
      })
    }
    setResultState({
      status: 'success',
      repoUrl: rawUrl,
      result: resultForDisplay,
      mode: 'real',
    })
  }, [])

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    if (state?.mode === 'demo' && state.result) {
      setResultState({
        status: 'success',
        repoUrl: state.repoUrl ?? state.result.repoInfo.fullName,
        result: state.result,
        mode: 'demo',
      })
      return
    }
    void runAnalysis(repoUrl)
  }, [repoUrl, runAnalysis, state])

  const handleViewReport = (result: AnalysisResult) => {
    setLastResult(result)
    navigate(ROUTE.REPORT)
  }

  const handleRetry = () => {
    if (resultState.repoUrl) {
      void runAnalysis(resultState.repoUrl)
    }
  }

  const handleCopyTemplate = async (checkName: string, template: string) => {
    try {
      await navigator.clipboard.writeText(template)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = template
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopiedTemplate(checkName)
    setTimeout(() => setCopiedTemplate(null), 2000)
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
  const isDemo = resultState.mode === 'demo'
  const repoMeta = [
    { label: '语言', value: repo.language || '未知', Icon: Code2 },
    { label: 'Stars', value: repo.stars.toLocaleString('zh-CN'), Icon: Star },
    { label: 'Forks', value: repo.forks.toLocaleString('zh-CN'), Icon: GitFork },
    { label: '许可证', value: repo.license || '未识别', Icon: Scale },
    { label: '默认分支', value: repo.defaultBranch, Icon: GitBranch },
    { label: '创建', value: formatDate(repo.createdAt), Icon: CalendarDays },
    { label: '更新', value: formatDate(repo.updatedAt), Icon: CalendarDays },
  ]

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
            {isDemo && <p className="repo-card__demo">演示模式：本结果来自本地样例，不会请求 GitHub 或写入历史。</p>}
          </div>
          <LevelTag level={result.score.level} />
        </div>

        <div className="repo-meta">
          {repoMeta.map(({ label, value, Icon }) => (
            <span key={label}>
              <Icon aria-hidden="true" size={16} />
              <strong>{label}：</strong>{value}
            </span>
          ))}
        </div>

        <div className="result-summary">
          <ScoreDisplay
            score={result.score.total}
            maxScore={result.score.maxScore}
            level={result.score.level}
          />
          <div className="result-summary__actions">
            {result.historyComparison && (
              <div className="result-comparison">
                <span className="result-comparison__label">较上次</span>
                <strong className={result.historyComparison.scoreDelta >= 0 ? 'is-positive' : 'is-negative'}>
                  {formatScoreDelta(result.historyComparison.scoreDelta)}
                </strong>
                <span>
                  上次 {result.historyComparison.previousScore} 分 ·{' '}
                  {new Date(result.historyComparison.previousTimestamp).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            <button className="result-btn" type="button" onClick={() => handleViewReport(result)}>
              <FileText aria-hidden="true" size={18} />
              查看报告
            </button>
            <button className="result-btn result-btn--secondary" type="button" onClick={() => navigate(ROUTE.HOME)}>
              <Search aria-hidden="true" size={18} />
              检测其他仓库
            </button>
          </div>
        </div>

        <section className="result-section">
          <div className="result-section__heading">
            <h2 className="result-section__title">检测明细</h2>
            <button
              className="result-btn result-btn--secondary result-rule-btn"
              type="button"
              onClick={() => setShowRules((value) => !value)}
            >
              <BookOpen aria-hidden="true" size={17} />
              {showRules ? '收起评分规则' : '查看评分规则'}
            </button>
          </div>
          {showRules && (
            <div className="rule-panel">
              {RULE_EXPLANATIONS.map((rule) => (
                <article className="rule-item" key={rule.name}>
                  <span>{rule.maxScore} 分</span>
                  <h3>{rule.name}</h3>
                  <p>{rule.condition}</p>
                  <p>{rule.importance}</p>
                </article>
              ))}
            </div>
          )}
          <ul className="check-list">
            {result.checks.map((check) => (
              <li className="check-item" key={check.name}>
                <div className="check-item__main">
                  <div className="check-item__headline">
                    <StatusIcon status={check.status} />
                    <span className="check-item__name">{check.name}</span>
                  </div>
                  <p className="check-item__reason">
                    <span>判定原因</span>
                    {check.reason}
                  </p>
                  {check.evidence && check.evidence.length > 0 && (
                    <div className="check-item__evidence-wrap">
                      <span>证据</span>
                      <ul className="check-item__evidence">
                        {check.evidence.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                  {suggestion.template && (
                    <button
                      className="suggestion-template-btn"
                      type="button"
                      onClick={() => void handleCopyTemplate(suggestion.checkName, suggestion.template ?? '')}
                    >
                      <FileText aria-hidden="true" size={16} />
                      {copiedTemplate === suggestion.checkName ? '已复制模板' : '复制模板'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {result.historyComparison && (
          <section className="result-section">
            <h2 className="result-section__title">与上次检测对比</h2>
            {result.historyComparison.changedChecks.length === 0 ? (
              <p className="suggestion-empty">检测项状态没有变化，当前分数变化为 {formatScoreDelta(result.historyComparison.scoreDelta)}。</p>
            ) : (
              <ul className="change-list">
                {result.historyComparison.changedChecks.map((change) => (
                  <li className="change-item" key={change.name}>
                    <strong>{change.name}</strong>
                    <span>
                      <RotateCcw aria-hidden="true" size={15} />
                      {statusLabel(change.previousStatus)} -&gt; {statusLabel(change.currentStatus)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </section>
    </PageLayout>
  )
}
