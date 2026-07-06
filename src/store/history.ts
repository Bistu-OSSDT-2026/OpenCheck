/**
 * 历史记录存储 —— R5（苏和）所有
 *
 * R3 占位。R5 接手后在此实现（你是 history 槽位唯一所有者）：
 *   - saveHistory(repoUrl, analysisResult) → void
 *       · 你在函数内部从 analysisResult 提取字段组装 HistoryRecord
 *       · R4 调用时只传 (repoUrl, result)，绝不自己拼 historyItem
 *   - loadHistory() → HistoryRecord[]
 *   - deleteHistory(repoUrl) / clearHistory()
 *
 * localStorage key 建议用 'opencheck_history'，与 R3 的 resultCache（sessionStorage）、
 * R1 的 token（localStorage 'opencheck_token'）三个槽位互不冲突，遵守「一槽一所有者」原则。
 */

import type { AnalysisResult, HistoryRecord } from '@/types'

export function saveHistory(_repoUrl: string, _result: AnalysisResult): void {
  throw new Error('[R5 未实现] saveHistory —— 待苏和实现')
}

export function loadHistory(): HistoryRecord[] {
  throw new Error('[R5 未实现] loadHistory —— 待苏和实现')
}

export function deleteHistory(_repoUrl: string): void {
  throw new Error('[R5 未实现] deleteHistory —— 待苏和实现')
}

export function clearHistory(): void {
  throw new Error('[R5 未实现] clearHistory —— 待苏和实现')
}
