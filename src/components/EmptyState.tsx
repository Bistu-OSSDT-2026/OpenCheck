/**
 * EmptyState —— R3（倪子宸）所有
 *
 * 用途：空数据提示 + 可选引导按钮
 * 读取方：R5（历史页无记录时：「还没有检测记录，输入仓库地址开始第一次检测吧」）
 */

import type { ReactNode } from 'react'

export interface EmptyStateProps {
  /** 空状态提示文字 */
  text: string
  /** 可选引导按钮文案 */
  action?: ReactNode
}

/** R3 正式交付版本 */
export function EmptyState({ text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__text">{text}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
