/**
 * 检测结果页 —— R4（杨天阳）所有
 *
 * R3 占位。R4 接手后实现：
 *   - 仓库信息卡片
 *   - 总评分区域（用 R3 的 ScoreDisplay）
 *   - 检测项列表（9 项，用 R3 的 StatusIcon）
 *   - 改进建议列表
 *   - 加载态（LoadingState）+ 4 种错误态（ErrorState，按 R1 的 error.kind 映射）
 *   - 「查看报告」按钮：跳转前调 R3 的 setLastResult
 *   - 检测成功后调 R5 的 saveHistory(repoUrl, result)
 *
 * R4 需复用的 R3 资源：PageLayout、ScoreDisplay、StatusIcon、LevelTag、LoadingState、ErrorState、ROUTE、setLastResult
 */

import { PageLayout } from '@/components'

export default function ResultPage() {
  return (
    <PageLayout title="检测结果">
      <p style={{ color: '#888' }}>
        【R4 占位】此处由 R4（杨天阳）实现：仓库卡片 + 评分区 + 检测项列表 + 建议 + 加载/错误态。
      </p>
    </PageLayout>
  )
}
