/**
 * StatusIcon —— R3（倪子宸）所有
 *
 * 用途：渲染检测项的通过/部分/失败图标 + 颜色
 * 读取方：R4（结果页 9 项检测列表）、R5（历史页可复用）
 *
 * props 已冻结，Day 2-3 再填充真实样式与颜色。
 */

export interface StatusIconProps {
  /** 检测状态：pass=通过 / partial=部分通过 / fail=未通过 */
  status: 'pass' | 'partial' | 'fail'
}

/** Day 1 空壳版本：返回占位图标，Day 2-3 填真实样式 */
export function StatusIcon({ status }: StatusIconProps) {
  // Day 1 占位：先用文字符号，后续替换为 SVG 图标 + 颜色映射
  // pass → ✓（绿）/ partial → △（橙）/ fail → ✗（红）
  const symbol = status === 'pass' ? '✓' : status === 'partial' ? '△' : '✗'
  return <span className={`status-icon status-icon--${status}`} aria-label={status}>{symbol}</span>
}
