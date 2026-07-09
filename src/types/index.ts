/**
 * OpenCheck 共享类型文件（Day 1 契约冻结清单）
 *
 * R3（倪子宸）维护此文件骨架。每个类型有一个「所有者角色」，改动必须群里通知所有相关人。
 * 各角色在自己的模块里实现真实逻辑，这里只冻结形状（契约），不写实现。
 *
 * 所有者清单：
 *   - githubData / ApiError        → R1（张恩）
 *   - AnalysisResult              → R2（王靖壹）
 *   - HistoryRecord               → R5（苏和）
 *   - 组件 props / ROUTE          → R3（倪子宸，本文件 + components/）
 *
 * 读取方：
 *   - R2 读 githubData
 *   - R4 读 ApiError / AnalysisResult / ROUTE / 组件 props
 *   - R5 读 AnalysisResult / HistoryRecord / ROUTE / 组件 props
 */

/* =========================================================
 * R1 所有：数据获取层契约（githubData / ApiError / Token）
 * 读取方：R2（读 githubData）、R4（读 ApiError）、R5（调 getToken/saveToken）
 * ========================================================= */

/** GitHub 仓库基本信息 —— R1 所有，R2 消费 */
export interface RepoInfo {
  owner: string
  repo: string
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  createdAt: string
  updatedAt: string
  defaultBranch: string
  license: string
}

/** 根目录文件列表项 —— R1 所有 */
export interface FileItem {
  name: string
  path: string
  type: 'file' | 'dir'
}

/** R1 fetchRepo 返回的聚合数据结构（owner：R1，读取方：R2） */
export interface GithubData {
  repoInfo: RepoInfo
  fileList: FileItem[]
  readmeContent: string
}

/** 错误判别联合 —— R1 所有，R4 用 switch(error.kind) 消费，绝不 try/catch */
export type ApiErrorKind = 'notfound' | 'private' | 'ratelimit' | 'network'

export interface ApiError {
  kind: ApiErrorKind
  message: string
}

/** fetchRepo 返回值：成功返回数据，失败返回错误对象（不 throw） */
export type FetchRepoResult = GithubData | ApiError

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetAt: string
}


/* =========================================================
 * R2 所有：分析引擎契约（AnalysisResult）
 * 读取方：R4（结果页渲染）、R5（报告页读 report 字段、历史页摘要）
 * ========================================================= */

export type CheckStatus = 'pass' | 'partial' | 'fail'

export type CheckCategory = 'file' | 'readme'

/** 单项检测结果 —— R2 所有 */
export interface CheckItem {
  name: string
  category: CheckCategory
  status: CheckStatus
  score: number
  maxScore: number
  reason: string
  evidence?: string[]
}

/** 评分与等级 —— R2 所有 */
export interface ScoreInfo {
  total: number
  maxScore: number
  level: '优秀' | '较完整' | '基本可用' | '需要完善'
}

/** 改进建议项（仅含未 pass 的项）—— R2 所有 */
export interface Suggestion {
  checkName: string
  content: string
  template?: string
}

/**
 * 完整检测结果对象 —— R2 独占写入（含 report 字段）
 * 整个对象只有一个所有者，下游（R5 报告页）只需读 result.report 渲染。
 */
export interface AnalysisResult {
  timestamp: string
  repoInfo: RepoInfo
  score: ScoreInfo
  checks: CheckItem[]
  suggestions: Suggestion[]
  historyComparison?: HistoryComparison
  /** 完整 Markdown 报告文本 —— R2 独占生成，R5 报告页只读 */
  report: string
}


/* =========================================================
 * R5 所有：历史记录契约（HistoryRecord）
 * 读取方：R4（调用 saveHistory，但从不构造 historyItem，由 R5 内部组装）
 * ========================================================= */

/** 历史记录状态摘要（不存完整报告）—— R5 所有 */
export interface CheckSummaryItem {
  name: string
  status: CheckStatus
}

export interface HistorySnapshot {
  score: number
  level: '优秀' | '较完整' | '基本可用' | '需要完善'
  timestamp: string
  checkSummary: CheckSummaryItem[]
}

export interface CheckStatusChange {
  name: string
  previousStatus: CheckStatus
  currentStatus: CheckStatus
}

export interface HistoryComparison {
  previousScore: number
  previousLevel: '优秀' | '较完整' | '基本可用' | '需要完善'
  previousTimestamp: string
  scoreDelta: number
  changedChecks: CheckStatusChange[]
}

/**
 * 历史记录条目 —— R5 独占
 * R4 调用 saveHistory(repoUrl, analysisResult)，R5 在函数内部从
 * analysisResult 提取字段组装成本结构，R4 永远不构造 historyItem。
 */
export interface HistoryRecord {
  repoUrl: string
  repoName: string
  score: number
  level: '优秀' | '较完整' | '基本可用' | '需要完善'
  timestamp: string
  checkSummary: CheckSummaryItem[]
  previous?: HistorySnapshot
}
