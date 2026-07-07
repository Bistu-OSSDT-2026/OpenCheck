/**
 * Token 存储模块（R1 拥有 — 张恩）
 *
 * R1 是 token localStorage 槽位（key: 'opencheck_token'）的唯一所有者。
 * R5 的 Token 配置页面只调用 saveToken()，绝不直接碰 localStorage。
 *
 * 读取方：R5（Token 配置页调用 saveToken）、R1 自身（githubApi.ts 读取）
 * 契约冻结日期：Day 1
 */

const TOKEN_KEY = 'opencheck_token'

/**
 * 从 localStorage 读取已保存的 GitHub Personal Access Token
 * @returns 已保存的 token，未配置时返回 null
 */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || token.trim() === '') return null
    return token.trim()
  } catch {
    // localStorage 不可用（如浏览器隐私模式），静默降级
    return null
  }
}

/**
 * 将 GitHub Personal Access Token 保存到 localStorage
 * 传入空字符串等同于清除
 *
 * R5 在 Token 配置页调用此函数，自己不碰 localStorage
 */
export function saveToken(token: string): void {
  try {
    if (!token || token.trim() === '') {
      localStorage.removeItem(TOKEN_KEY)
    } else {
      localStorage.setItem(TOKEN_KEY, token.trim())
    }
  } catch {
    console.warn('无法保存 Token：localStorage 不可用')
  }
}

/**
 * 清除已保存的 token（saveToken('') 的语义别名）
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* 静默 */
  }
}
