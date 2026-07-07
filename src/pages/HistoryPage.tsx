/**
 * 历史记录页 —— R5（苏和）所有
 *
 * - 调用 R5 自己的 loadHistory() 读取历史记录列表
 * - 列表项：仓库名、评分、等级标签（R3 的 LevelTag）、检测时间
 * - 删除单条 / 清空全部（确认弹窗）
 * - 空状态用 R3 的 EmptyState
 * - 点击记录跳转首页并预填仓库地址
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout, EmptyState, LevelTag } from '@/components'
import { ROUTE } from '@/router/routes'
import { loadHistory, deleteHistory, clearHistory } from '@/store/history'
import type { HistoryRecord } from '@/types'

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setRecords(loadHistory())
  }, [])

  const handleDelete = (repoUrl: string, repoName: string) => {
    if (!window.confirm(`确认删除 "${repoName}" 的检测记录？`)) return
    deleteHistory(repoUrl)
    setRecords(loadHistory())
  }

  const handleClearAll = () => {
    if (records.length === 0) return
    if (!window.confirm('确认清空全部历史记录？此操作不可撤销。')) return
    clearHistory()
    setRecords([])
  }

  const handleClick = (record: HistoryRecord) => {
    navigate(ROUTE.HOME, { state: { prefillUrl: record.repoUrl } })
  }

  if (records.length === 0) {
    return (
      <PageLayout title="历史记录">
        <EmptyState text="还没有检测记录，输入仓库地址开始第一次检测吧" />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="历史记录">
      <div className="history-actions">
        <span className="history-count">共 {records.length} 条记录</span>
        <button className="history-clear-btn" onClick={handleClearAll}>
          清空全部历史
        </button>
      </div>
      <ul className="history-list">
        {records.map((r) => (
          <li key={r.repoUrl} className="history-item" onClick={() => handleClick(r)}>
            <div className="history-item__main">
              <span className="history-item__name">{r.repoName}</span>
              <LevelTag level={r.level} />
            </div>
            <div className="history-item__meta">
              <span className="history-item__score">得分 {r.score}</span>
              <span className="history-item__time">
                {new Date(r.timestamp).toLocaleString('zh-CN')}
              </span>
              <button
                className="history-item__delete"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(r.repoUrl, r.repoName)
                }}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
