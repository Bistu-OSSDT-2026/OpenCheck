/**
 * StatusIcon —— R3（倪子宸）所有
 *
 * 用途：渲染检测项的通过/部分/失败图标 + 颜色。
 */

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export interface StatusIconProps {
  /** 检测状态：pass=通过 / partial=部分通过 / fail=未通过 */
  status: 'pass' | 'partial' | 'fail'
}

const STATUS_LABEL = {
  pass: '通过',
  partial: '部分通过',
  fail: '未通过',
} as const

export function StatusIcon({ status }: StatusIconProps) {
  const Icon = status === 'pass' ? CheckCircle2 : status === 'partial' ? AlertTriangle : XCircle
  return (
    <span className={`status-icon status-icon--${status}`} aria-label={STATUS_LABEL[status]}>
      <Icon aria-hidden="true" size={20} strokeWidth={2.6} />
    </span>
  )
}
