/**
 * 数据获取层 —— R1（张恩）所有
 *
 * R3 只放占位导出，让 TypeScript 路径解析正常、Day 1 编译不报错。
 * R1 接手后在此实现：
 *   - parseRepoUrl(raw) → { owner, repo } | { error }
 *   - fetchRepo(owner, repo, token?) → Promise<GithubData | ApiError>
 *   - getToken() / saveToken(token)   （localStorage key: 'opencheck_token'）
 *   - Mock githubData 对象（Day 1 必须交付）
 *
 * 契约见 src/types/index.ts，所有错误统一返回 { kind, message }，跨边界绝不 throw。
 */

// Day 1 占位：R1 实现前先抛运行时错误，避免 R4/R5 误用未实现函数拿到 undefined。
export function parseRepoUrl(_raw: string) {
  throw new Error('[R1 未实现] parseRepoUrl —— 待张恩实现')
}

export function fetchRepo(_owner: string, _repo: string, _token?: string) {
  throw new Error('[R1 未实现] fetchRepo —— 待张恩实现')
}

export function getToken(): string | null {
  throw new Error('[R1 未实现] getToken —— 待张恩实现')
}

export function saveToken(_token: string): void {
  throw new Error('[R1 未实现] saveToken —— 待张恩实现')
}
