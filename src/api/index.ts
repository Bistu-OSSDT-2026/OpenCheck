/**
 * 数据获取层 —— R1（张恩）所有
 *
 * 本文件聚合 R1 所有公开的契约函数，供其他角色导入使用。
 *
 * 契约清单（Day 1 冻结，修改前必须群里通知所有相关人）：
 *   - parseRepoUrl(raw) → ParseResult（{ owner, repo } | { error }）
 *   - fetchRepo(owner, repo, token?) → Promise<GithubData | ApiError>
 *   - getToken() → string | null
 *   - saveToken(token) → void
 *   - MOCK_GITHUB_DATA —— Mock 数据（Day 1-2 开发用）
 *
 * 读取方：
 *   - R2（读 GithubData）
 *   - R4（读 parseRepoUrl / fetchRepo / ApiError）
 *   - R5（读 saveToken / getToken，Token 配置页调用）
 */

// URL 解析
export { parseRepoUrl, isParseError, getFullName } from './parseRepoUrl'
export type { ParseSuccess, ParseError, ParseResult } from './parseRepoUrl'

// GitHub API
export { fetchRepoInfo, fetchFileList, fetchFileContent, fetchRepo, fetchRateLimit } from './githubApi'

// Token 存储（R1 是 token 槽位唯一所有者，localStorage key: 'opencheck_token'）
export { getToken, saveToken, clearToken } from './tokenStorage'

// Mock 数据
export { MOCK_GITHUB_DATA, fetchMockRepo } from './mockData'
