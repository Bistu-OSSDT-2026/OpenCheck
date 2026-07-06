/**
 * 结果缓存 —— R3（倪子宸）所有
 *
 * 路由胶水：R4 检测完成后写入，R5 报告页读取渲染，避免重复请求 GitHub。
 * 你拥有这个缓存的契约，R4 写、R5 读，都是调用者。
 *
 * 设计说明：
 *   - 用内存变量 + sessionStorage 双层存储。
 *     - 内存：同会话内快速读取
 *     - sessionStorage：刷新后缓存不丢（R3 Day 3 边界处理）
 *   - 不用 localStorage：历史记录归 R5 管（localStorage 槽位独占原则），
 *     R3 的结果缓存只服务「当前最近一次检测」，关掉浏览器即失效，避免与 R5 的 history 槽位混淆。
 */

import type { AnalysisResult } from '@/types'

const CACHE_KEY = 'opencheck_last_result'

let inMemory: AnalysisResult | null = null

/**
 * 写入最近一次检测结果 —— R4 调用
 * 跳转报告页前调用，把 result 写入缓存，R5 报告页再读出来。
 */
export function setLastResult(result: AnalysisResult): void {
  inMemory = result
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
  } catch {
    // sessionStorage 不可用时降级为纯内存（隐私模式等）
  }
}

/**
 * 读取最近一次检测结果 —— R5 报告页调用
 * 返回 null 表示无缓存（用户直接访问 /report），R5 自行处理空状态。
 */
export function getLastResult(): AnalysisResult | null {
  if (inMemory) return inMemory
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (raw) {
      inMemory = JSON.parse(raw) as AnalysisResult
      return inMemory
    }
  } catch {
    // 解析失败视为无缓存
  }
  return null
}

/** 清除缓存（可选，主要给 R5 历史页「清空」时调用，或 R4 重新检测时调用） */
export function clearLastResult(): void {
  inMemory = null
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}
