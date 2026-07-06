/**
 * StatusIcon —— R3（倪子宸）所有
 *
 * 用途：渲染检测项的通过/部分/失败图标 + 颜色
 * 读取方：R4（结果页 9 项检测列表）、R5（历史页可复用）
 *
 * props 已冻结。当前版本已提供状态符号和状态颜色映射。
 */

export interface StatusIconProps {
  /** 检测状态：pass=通过 / partial=部分通过 / fail=未通过 */
  status: 'pass' | 'partial' | 'fail'
}

/** R3 正式交付版本 */
export function StatusIcon({ status }: StatusIconProps) {
  // 使用轻量文字符号，便于纯前端演示和后续替换为图标组件
  // pass → ✓（绿）/ partial → △（橙）/ fail → ✗（红）
  const symbol = status === 'pass' ? '✓' : status === 'partial' ? '△' : '✗'
  return <span className={`status-icon status-icon--${status}`} aria-label={status}>{symbol}</span>
}
