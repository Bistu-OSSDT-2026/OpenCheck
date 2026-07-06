/**
 * 通用组件统一导出 —— R3（倪子宸）所有
 *
 * 其他成员（R4/R5）统一从这里导入：
 *   import { ScoreDisplay, StatusIcon, PageLayout } from '@/components'
 */

export { ScoreDisplay } from './ScoreDisplay'
export type { ScoreDisplayProps } from './ScoreDisplay'

export { StatusIcon } from './StatusIcon'
export type { StatusIconProps } from './StatusIcon'

export { LevelTag } from './LevelTag'
export type { LevelTagProps } from './LevelTag'

export { PageLayout } from './PageLayout'
export type { PageLayoutProps } from './PageLayout'

export { LoadingState } from './LoadingState'
export type { LoadingStateProps } from './LoadingState'

export { ErrorState } from './ErrorState'
export type { ErrorStateProps } from './ErrorState'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
