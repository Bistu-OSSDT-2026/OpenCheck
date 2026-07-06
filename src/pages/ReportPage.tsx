/**
 * 报告页 —— R5（苏和）所有
 *
 * R3 占位。R5 接手后实现：
 *   - 从 R3 的结果缓存读取（getLastResult()）
 *   - 渲染 result.report（R2 生成的 Markdown 字符串）为富文本
 *   - 复制报告 / 下载 .md 按钮
 *
 * R5 需复用的 R3 资源：PageLayout、EmptyState（无缓存时）、getLastResult
 */

import { PageLayout, EmptyState } from '@/components'
import { getLastResult } from '@/store/resultCache'

export default function ReportPage() {
  const result = getLastResult()
  return (
    <PageLayout title="检测报告">
      {result ? (
        <pre style={{ color: '#888' }}>
          【R5 占位】此处由 R5（苏和）渲染 Markdown 报告：{result.report.slice(0, 60)}...
        </pre>
      ) : (
        <EmptyState text="还没有可显示的报告，请先进行一次检测" />
      )}
    </PageLayout>
  )
}
