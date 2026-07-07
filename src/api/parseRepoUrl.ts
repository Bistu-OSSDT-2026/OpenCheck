/**
 * URL 解析模块（R1 拥有 — 张恩）
 *
 * 将用户输入的 GitHub 仓库地址解析为 { owner, repo }。
 * 支持三种输入格式：
 *   1. 完整 HTTPS 地址：https://github.com/owner/repo
 *   2. 省略协议：github.com/owner/repo
 *   3. 简短格式：owner/repo
 *
 * 读取方：R4（首页输入框实时校验）
 * 契约冻结日期：Day 1
 */

export interface ParseSuccess {
  owner: string
  repo: string
}

export interface ParseError {
  error: string
}

export type ParseResult = ParseSuccess | ParseError

/**
 * 解析用户输入的仓库地址
 *
 * @example
 *   parseRepoUrl("https://github.com/facebook/react")
 *   // → { owner: "facebook", repo: "react" }
 *
 *   parseRepoUrl("owner/repo")
 *   // → { owner: "owner", repo: "repo" }
 *
 *   parseRepoUrl("")
 *   // → { error: "请输入 GitHub 仓库地址" }
 */
export function parseRepoUrl(raw: string): ParseResult {
  const trimmed = raw.trim()

  // 非空校验
  if (!trimmed) {
    return { error: '请输入 GitHub 仓库地址' }
  }

  // 格式 1 / 2：完整 HTTPS / 省略协议
  //   https://github.com/owner/repo  →  owner, repo
  //   github.com/owner/repo          →  owner, repo
  //   允许末尾带斜杠或 .git 后缀
  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?\/?\s*$/,
  )
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
    }
  }

  // 格式 3：owner/repo
  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)\s*$/)
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
    }
  }

  // 格式不匹配
  return {
    error: '地址格式不正确，请输入有效的 GitHub 仓库地址（如 owner/repo 或 https://github.com/owner/repo）',
  }
}

/**
 * 判断解析结果是否为错误（类型守卫，方便 R4 做分支处理）
 */
export function isParseError(result: ParseResult): result is ParseError {
  return 'error' in result
}

/**
 * 从解析成功的对象获取仓库全名（仅用于展示，非契约必需）
 */
export function getFullName(parsed: ParseSuccess): string {
  return `${parsed.owner}/${parsed.repo}`
}
