/**
 * LoadingState —— R3（倪子宸）所有
 *
 * 用途：加载动画 + 文字
 * 读取方：R4（检测流程 loading 态）、R5（报告页读取缓存时）
 */

export interface LoadingStateProps {
  /** 加载提示文字，默认「加载中...」 */
  text?: string
}

/** Day 1 空壳版本 */
export function LoadingState({ text = '加载中...' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <p className="loading-state__text">{text}</p>
    </div>
  )
}
