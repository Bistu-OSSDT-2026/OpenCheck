/**
 * ErrorState —— R3（倪子宸）所有
 *
 * 用途：错误信息 + 可选重试/返回按钮
 * 读取方：R4（检测流程的 4 种错误态：notfound/private/ratelimit/network）
 *
 * 注意：本组件只负责「展示」，错误文案由调用方（R4）根据 R1 返回的 error.kind
 * 映射后传入 message。组件本身不耦合 ApiError 类型。
 */

export interface ErrorStateProps {
  /** 错误信息（已由调用方映射好的友好文案） */
  error: string
  /** 可选重试回调，传入则显示「重试」按钮 */
  onRetry?: () => void
  /** 可选自定义按钮（如 ratelimit 时显示「去配置 Token」） */
  actionText?: string
  onAction?: () => void
}

/** Day 1 空壳版本 */
export function ErrorState({ error, onRetry, actionText, onAction }: ErrorStateProps) {
  return (
    <div className="error-state">
      <p className="error-state__message">{error}</p>
      <div className="error-state__actions">
        {onRetry && <button className="error-state__retry" onClick={onRetry}>重试</button>}
        {onAction && actionText && (
          <button className="error-state__action" onClick={onAction}>{actionText}</button>
        )}
      </div>
    </div>
  )
}
