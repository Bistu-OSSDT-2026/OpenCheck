/**
 * ScoreDisplay —— R3（倪子宸）所有
 *
 * 用途：大数字分数 + 等级展示。颜色随等级变（优秀=绿 / 较完整=蓝 / 基本可用=橙 / 需要完善=红）
 * 读取方：R4（结果页总评分区域）
 *
 * props 已冻结。Day 2-3 填充真实样式（大字号、颜色、动画）。
 */

export interface ScoreDisplayProps {
  /** 实际得分 */
  score: number
  /** 满分（默认 100） */
  maxScore: number
  /** 等级文字：优秀 / 较完整 / 基本可用 / 需要完善 */
  level: '优秀' | '较完整' | '基本可用' | '需要完善'
}

/** Day 1 空壳版本 */
export function ScoreDisplay({ score, maxScore, level }: ScoreDisplayProps) {
  return (
    <div className={`score-display level--${level}`}>
      <div className="score-display__number">
        {score}<span className="score-display__max">/{maxScore}</span>
      </div>
      <div className="score-display__level">{level}</div>
    </div>
  )
}
