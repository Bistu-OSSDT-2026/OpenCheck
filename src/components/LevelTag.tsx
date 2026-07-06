/**
 * LevelTag —— R3（倪子宸）所有
 *
 * 用途：带背景色的等级标签
 * 读取方：R4（结果页仓库卡片）、R5（历史页列表项）
 */

export interface LevelTagProps {
  /** 等级文字 */
  level: '优秀' | '较完整' | '基本可用' | '需要完善'
}

/** R3 正式交付版本 */
export function LevelTag({ level }: LevelTagProps) {
  return <span className={`level-tag level-tag--${level}`}>{level}</span>
}
