/**
 * Token 配置页 —— R5（苏和）所有
 *
 * R3 占位。R5 接手后实现：
 *   - Token 输入框 + 说明（用途、GitHub 获取链接）
 *   - 保存：调用 R1 的 saveToken(token) —— R1 是 token 槽位唯一所有者，R5 不直接碰 localStorage
 *
 * R5 需复用的 R3 资源：PageLayout
 * R5 调用的 R1 资源：getToken / saveToken
 */

import { PageLayout } from '@/components'

export default function TokenPage() {
  return (
    <PageLayout title="Token 配置">
      <p style={{ color: '#888' }}>
        【R5 占位】此处由 R5（苏和）实现：Token 输入框 + 保存（调用 R1 的 saveToken）。
      </p>
    </PageLayout>
  )
}
