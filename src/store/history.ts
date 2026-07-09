/**
 * 历史记录存储 —— R5（苏和）所有
 *
 * R5 是 history localStorage 槽位（key: 'opencheck_history'）的唯一所有者。
 * R4 调用 saveHistory(repoUrl, result)，由 R5 内部从 AnalysisResult 提取字段组装 HistoryRecord。
 * R4 永远不自己构造 historyItem。
 */

import type {
  AnalysisResult,
  CheckSummaryItem,
  HistoryComparison,
  HistoryRecord,
  HistorySnapshot,
} from '@/types'

const HISTORY_KEY = 'opencheck_history'

export function saveHistory(repoUrl: string, result: AnalysisResult): HistoryRecord {
  const records = loadAll()
  const summary: CheckSummaryItem[] = result.checks.map((c) => ({
    name: c.name,
    status: c.status,
  }))
  const normalizedRepoName = normalizeRepoName(result.repoInfo.fullName)
  const idx = records.findIndex((r) => normalizeRepoName(r.repoName) === normalizedRepoName)
  const previous = idx >= 0 ? toSnapshot(records[idx]) : undefined

  const record: HistoryRecord = {
    repoUrl,
    repoName: result.repoInfo.fullName,
    score: result.score.total,
    level: result.score.level,
    timestamp: result.timestamp,
    checkSummary: summary,
    previous,
  }

  // 以 repoName 去重，避免同仓库不同 URL 写成多条历史。
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }

  // 按时间倒序
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  persist(records)
  return record
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

export function createHistoryComparison(
  result: AnalysisResult,
  previous?: HistorySnapshot,
): HistoryComparison | undefined {
  if (!previous) return undefined

  const previousStatusMap = new Map(previous.checkSummary.map((item) => [item.name, item.status]))
  const changedChecks = result.checks
    .map((check) => ({
      name: check.name,
      previousStatus: previousStatusMap.get(check.name),
      currentStatus: check.status,
    }))
    .filter((item): item is HistoryComparison['changedChecks'][number] =>
      item.previousStatus !== undefined && item.previousStatus !== item.currentStatus,
    )

  return {
    previousScore: previous.score,
    previousLevel: previous.level,
    previousTimestamp: previous.timestamp,
    scoreDelta: result.score.total - previous.score,
    changedChecks,
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

function normalizeRepoName(repoName: string): string {
  return repoName.trim().toLowerCase()
}

function toSnapshot(record: HistoryRecord): HistorySnapshot {
  return {
    score: record.score,
    level: record.level,
    timestamp: record.timestamp,
    checkSummary: record.checkSummary,
  }
}

function persist(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
  } catch {
    console.warn('历史记录保存失败：localStorage 不可用')
  }
}
