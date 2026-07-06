/**
 * 首页 —— R4（杨天阳）所有
 *
 * R3 只放最小占位，让路由 Day 1 能点通。R4 接手后实现：
 *   - 仓库地址输入框 + 实时校验（调用 R1 的 parseRepoUrl）
 *   - 开始检测按钮（loading 态）
 *   - USE_MOCK 开关接入 Mock AnalysisResult
 *
 * R4 需复用的 R3 资源：PageLayout、ROUTE
 */

import { PageLayout } from '@/components'

export default function HomePage() {
  return (
    <PageLayout title="OpenCheck — 开源项目体检助手" showBack={false}>
      <p style={{ color: '#888' }}>
        【R4 占位】此处由 R4（杨天阳）实现：仓库地址输入框 + 实时校验 + 开始检测按钮。
      </p>
    </PageLayout>
  )
}
