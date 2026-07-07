/**
 * 历史记录存储 —— R5（苏和）所有
 *
 * R5 是 history localStorage 槽位（key: 'opencheck_history'）的唯一所有者。
 * R4 调用 saveHistory(repoUrl, result)，由 R5 内部从 AnalysisResult 提取字段组装 HistoryRecord。
 * R4 永远不自己构造 historyItem。
 */

import type { AnalysisResult, HistoryRecord, CheckSummaryItem } from '@/types'

const HISTORY_KEY = 'opencheck_history'

export function saveHistory(repoUrl: string, result: AnalysisResult): void {
  const records = loadAll()
  const summary: CheckSummaryItem[] = result.checks.map((c) => ({
    name: c.name,
    status: c.status,
  }))

  const record: HistoryRecord = {
    repoUrl,
    repoName: result.repoInfo.fullName,
    score: result.score.total,
    level: result.score.level,
    timestamp: result.timestamp,
    checkSummary: summary,
  }

  // 以 repoUrl 去重，同仓库覆盖旧记录
  const idx = records.findIndex((r) => r.repoUrl === repoUrl)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }

  // 按时间倒序
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  persist(records)
}

export function loadHistory(): HistoryRecord[] {
  return loadAll()
}

export function deleteHistory(repoUrl: string): void {
  const records = loadAll().filter((r) => r.repoUrl !== repoUrl)
  persist(records)
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // 静默
  }
}

// ---- 内部工具 ----

function loadAll(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: HistoryRecord[] = JSON.parse(raw)
    // 按时间倒序
    parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return parsed
  } catch {
    return []
  }
}

function persist(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
  } catch {
    console.warn('历史记录保存失败：localStorage 不可用')
  }
}
