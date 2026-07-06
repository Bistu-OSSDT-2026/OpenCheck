/**
 * 历史记录页 —— R5（苏和）所有
 *
 * R3 占位。R5 接手后实现：
 *   - 调用 R5 自己的 loadHistory() 读取列表
 *   - 列表项：仓库名、评分、等级标签（R3 的 LevelTag）、检测时间
 *   - 删除单条 / 清空全部（确认弹窗）
 *   - 空状态用 R3 的 EmptyState
 *
 * R5 需复用的 R3 资源：PageLayout、EmptyState、LevelTag、ROUTE
 */

import { PageLayout, EmptyState } from '@/components'

export default function HistoryPage() {
  return (
    <PageLayout title="历史记录">
      <EmptyState text="还没有检测记录，输入仓库地址开始第一次检测吧" />
    </PageLayout>
  )
}
