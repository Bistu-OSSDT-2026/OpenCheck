/**
 * 分析引擎层 —— R2（王靖壹）所有
 *
 * R3 只放占位导出。R2 接手后在此实现：
 *   - analyze(githubData) → AnalysisResult
 *     · 7 项文件检测
 *     · 6 维 README 启发式分析（pass/partial/fail）
 *     · 评分（0-100 + 等级）
 *     · 改进建议匹配（仅未 pass 项）
 *     · report 字段：完整 Markdown 报告字符串（R2 独占写入）
 *
 * Day 1 必须交付一份 Mock AnalysisResult（硬编码）让 R4/R5 能渲染。
 * 契约见 src/types/index.ts，AnalysisResult 类型由 R2 拥有。
 */

import type { AnalysisResult } from '@/types'

export function analyze(_githubData: unknown): AnalysisResult {
  throw new Error('[R2 未实现] analyze —— 待王靖壹实现')
}

/** Mock AnalysisResult —— 待 R2 在 Day 1 提供（R3 此处仅占位） */
export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  timestamp: '2026-07-02T10:00:00Z',
  repoInfo: {
    owner: 'mock-owner',
    repo: 'mock-repo',
    fullName: 'mock-owner/mock-repo',
    description: '【R2 占位 Mock】待王靖壹替换为真实仓库数据',
    language: 'TypeScript',
    stars: 0,
    forks: 0,
    createdAt: '',
    updatedAt: '',
    defaultBranch: 'main',
    license: '',
  },
  score: { total: 0, maxScore: 100, level: '需要完善' },
  checks: [],
  suggestions: [],
  report: '# 【R2 占位】待王靖壹生成真实报告',
}
