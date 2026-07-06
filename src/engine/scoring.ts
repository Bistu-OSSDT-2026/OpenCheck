// ============================================================
// R2 分析引擎层 — 评分计算
// ============================================================

import type { CheckItem, ScoreInfo } from '@/types';

/**
 * 根据总分计算等级
 *
 * 等级划分：
 * - 90 – 100：优秀
 * - 75 – 89：较完整
 * - 60 – 74：基本可用
 * - 60 以下：需要完善
 */
export function calculateLevel(totalScore: number): ScoreInfo['level'] {
  if (totalScore >= 90) return '优秀';
  if (totalScore >= 75) return '较完整';
  if (totalScore >= 60) return '基本可用';
  return '需要完善';
}

/**
 * 汇总所有检测项得分，计算总分和等级
 */
export function calculateScore(checks: CheckItem[]): ScoreInfo {
  const total = checks.reduce((sum, c) => sum + c.score, 0);
  const maxScore = checks.reduce((sum, c) => sum + c.maxScore, 0);
  return {
    total,
    maxScore,
    level: calculateLevel(total),
  };
}
