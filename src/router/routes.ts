/**
 * ROUTE 常量表 —— R3（倪子宸）所有
 *
 * 所有页面跳转必须用常量，禁止硬编码路径字符串（避免集成时路径漂移）。
 * 读取方：R4（首页/结果页跳转）、R5（报告页/历史页/Token 页跳转）
 */

export const ROUTE = {
  HOME: '/',
  RESULT: '/result',
  REPORT: '/report',
  HISTORY: '/history',
  TOKEN: '/token',
} as const

export type RouteValue = (typeof ROUTE)[keyof typeof ROUTE]
