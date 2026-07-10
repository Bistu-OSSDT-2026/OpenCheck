/**
 * GitHub API 封装模块（R1 拥有 — 张恩）
 *
 * 提供 3 个独立 fetch 函数 + 1 个聚合函数 fetchRepo。
 * 所有跨模块边界的错误均以 ApiError（判别联合类型）返回，绝不 throw。
 *
 * 错误 kind 取值：
 *   - 'notfound'  → 仓库不存在（HTTP 404）
 *   - 'private'    → 仓库为私有（仅公开仓库支持检测）
 *   - 'ratelimit'  → API 限流（HTTP 403 + X-RateLimit-Remaining: 0）
 *   - 'network'    → 网络超时、连接失败或其它异常
 *
 * 读取方：R4（通过 fetchRepo 获取数据，传给 R2 的 analyze）
 * 契约冻结日期：Day 1
 */

import type { ApiError, ApiErrorKind, FileItem, GithubData, RateLimitInfo, RepoInfo } from '@/types'
import { getToken } from './tokenStorage'

const API_BASE = 'https://api.github.com'

// ---------------------------------------------------------------------------
// 内部工具
// ---------------------------------------------------------------------------

/** 构建请求头（自动附加 Token） */
function buildHeaders(token?: string): Record<string, string> {
  const effectiveToken = token ?? getToken()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'OpenCheck/1.0',
  }
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`
  }
  return headers
}

/** 构造 ApiError 对象 */
function makeError(kind: ApiErrorKind, message: string): ApiError {
  return { kind, message }
}

/** 判别联合类型的守卫：判断 fetch 返回值是否为 ApiError */
function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'kind' in value
}

// ---------------------------------------------------------------------------
// 底层 fetch 包装
// ---------------------------------------------------------------------------

/**
 * 统一 fetch 包装器
 * 返回 parsed JSON（成功时）或 ApiError（任何异常）。
 * 泛型参数仅用于标注期望类型，实际运行时数据来自 API。
 */
async function safeFetch(url: string, options: RequestInit = {}): Promise<unknown | ApiError> {
  let response: Response
  try {
    response = await fetch(url, options)
  } catch {
    return makeError('network', '网络连接失败，请检查网络后重试')
  }

  if (response.ok) {
    try {
      return await response.json()
    } catch {
      return makeError('network', 'API 响应格式异常，请稍后重试')
    }
  }

  // HTTP 403：可能是限流
  if (response.status === 403) {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    if (remaining === '0') {
      return makeError(
        'ratelimit',
        '请求次数已达上限（60 次/小时），建议配置 GitHub Personal Access Token 以提高限额至 5000 次/小时',
      )
    }
    return makeError('ratelimit', 'API 访问被拒绝（403），可能是触发了 GitHub 的滥用检测机制')
  }

  // HTTP 404：仓库不存在或为私有仓库
  if (response.status === 404) {
    return makeError(
      'notfound',
      '未找到该仓库，请检查地址是否正确（注意：私有仓库无法检测）',
    )
  }

  // 其他未预期的状态码
  return makeError('network', `GitHub API 返回了意外的状态码 ${response.status}，请稍后重试`)
}

// ---------------------------------------------------------------------------
// 3 个独立 API 函数
// ---------------------------------------------------------------------------

/**
 * 获取仓库基本信息（GET /repos/{owner}/{repo}）
 */
export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token?: string,
): Promise<RepoInfo | ApiError> {
  const url = `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const raw = await safeFetch(url, { headers: buildHeaders(token) })

  if (isApiError(raw)) return raw

  // safeFetch 成功返回的是 JSON 解析后的对象
  const data = raw as Record<string, unknown>

  // 发现是私有仓库 → 返回 private 错误
  if (data.private === true) {
    return makeError('private', '暂不支持检测私有仓库，请输入公开仓库的地址')
  }

  const ownerObj = data.owner as Record<string, unknown> | undefined
  const licenseObj = data.license as Record<string, unknown> | null | undefined

  return {
    owner: (ownerObj?.login as string) || owner,
    repo: (data.name as string) || repo,
    fullName: (data.full_name as string) || `${owner}/${repo}`,
    description: (data.description as string) || '',
    language: (data.language as string) || '未知',
    stars: (data.stargazers_count as number) ?? 0,
    forks: (data.forks_count as number) ?? 0,
    createdAt: (data.created_at as string) || '',
    updatedAt: (data.updated_at as string) || '',
    defaultBranch: (data.default_branch as string) || 'main',
    license: (licenseObj?.spdx_id as string) || '',
  }
}

/**
 * 获取仓库文件列表（GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1）
 *
 * 这里使用递归 Git Trees API，而不是 Contents 根目录接口。
 * 根目录接口只能看到 .github 目录本身，看不到 .github/workflows/ci.yml 这类二级文件。
 */
export async function fetchFileList(
  owner: string,
  repo: string,
  token?: string,
  branch = 'HEAD',
): Promise<FileItem[] | ApiError> {
  const url = `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
  const raw = await safeFetch(url, { headers: buildHeaders(token) })

  if (isApiError(raw)) return raw

  const data = raw as Record<string, unknown>
  const list = Array.isArray(data.tree) ? data.tree as Record<string, unknown>[] : []

  return list.map((item) => ({
    name: String(item.path ?? '').split('/').pop() || '',
    path: item.path as string,
    type: item.type === 'tree' ? 'dir' : 'file',
  }))
}

/**
 * 获取指定文件内容（GET /repos/{owner}/{repo}/contents/{path}）
 *
 * GitHub Contents API 返回的 content 字段是 Base64 编码的，
 * 此函数已自动完成解码，返回 UTF-8 文本。文件不存在时返回 ''。
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  filePath: string,
  token?: string,
): Promise<string | ApiError> {
  const url = `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}`
  const raw = await safeFetch(url, { headers: buildHeaders(token) })

  // 文件不存在 → 返回空字符串（R2 按"README 缺失"处理）
  if (isApiError(raw)) {
    if (raw.kind === 'notfound') return ''
    return raw
  }

  const data = raw as Record<string, unknown>

  // Base64 解码
  try {
    if (data.content && data.encoding === 'base64') {
      return atob(String(data.content).replace(/\n/g, ''))
    }
    return String(data.content ?? '')
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// 聚合函数（契约约定的 fetchRepo）
// ---------------------------------------------------------------------------

/**
 * 获取仓库完整数据（聚合调用）
 *
 * 并行调用 fetchRepoInfo / fetchFileList / fetchFileContent，
 * 组装成 GithubData 对象。任一部分失败即返回对应的 ApiError。
 *
 * @returns GithubData | ApiError（判别联合类型，R4 用 isApiError() 或 'kind' in result 判断）
 *
 * R4 使用示例：
 *   const result = await fetchRepo(owner, repo, token)
 *   if ('kind' in result) {
 *     // result 是 ApiError，按 kind 展示对应错误提示
 *   } else {
 *     // result 是 GithubData，传给 R2 的 analyze()
 *   }
 */
export async function fetchRepo(
  owner: string,
  repo: string,
  token?: string,
): Promise<GithubData | ApiError> {
  const infoResult = await fetchRepoInfo(owner, repo, token)

  // repoInfo 是必须的，失败即整体返回错误
  if (isApiError(infoResult)) return infoResult

  const [fileListResult, readmeResult] = await Promise.all([
    fetchFileList(owner, repo, token, infoResult.defaultBranch),
    fetchFileContent(owner, repo, 'README.md', token),
  ])

  // fileList 失败 → 返回错误
  if (isApiError(fileListResult)) return fileListResult

  // README 请求失败（非 404 的网络错误）→ 返回错误
  if (typeof readmeResult !== 'string' && isApiError(readmeResult)) return readmeResult

  return {
    repoInfo: infoResult,
    fileList: fileListResult,
    readmeContent: typeof readmeResult === 'string' ? readmeResult : '',
  }
}

export async function fetchRateLimit(token?: string): Promise<RateLimitInfo | ApiError> {
  const raw = await safeFetch(`${API_BASE}/rate_limit`, { headers: buildHeaders(token) })
  if (isApiError(raw)) return raw

  const data = raw as Record<string, unknown>
  const resources = data.resources as Record<string, unknown> | undefined
  const core = resources?.core as Record<string, unknown> | undefined
  const rate = data.rate as Record<string, unknown> | undefined
  const limit = Number(core?.limit ?? rate?.limit ?? 0)
  const remaining = Number(core?.remaining ?? rate?.remaining ?? 0)
  const reset = Number(core?.reset ?? rate?.reset ?? 0)

  return {
    limit,
    remaining,
    resetAt: reset > 0 ? new Date(reset * 1000).toISOString() : '',
  }
}
