// ============================================================
// R2 分析引擎层 — 主分析函数
// ============================================================

import type { GithubData, AnalysisResult } from '@/types';
import { runFileChecks } from './fileChecks';
import { runReadmeChecks } from './readmeChecks';
import { calculateScore } from './scoring';
import { generateSuggestions } from './suggestions';
import { generateReport } from './report';

/**
 * 对 GitHub 仓库数据执行完整的开源规范性分析
 *
 * 流程：
 * 1. 执行文件存在性检测（5 项）
 * 2. 执行 README 内容检测（4 项）
 * 3. 组合 9 个 CheckItem
 * 4. 计算总分和等级
 * 5. 生成改进建议
 * 6. 生成 Markdown 报告
 * 7. 返回完整 AnalysisResult
 *
 * @param githubData R1 传入的 GitHub 仓库数据
 * @returns 完整的分析结果
 *
 * @example
 * ```ts
 * import { analyze, mockGithubData } from '@/engine';
 * const result = analyze(mockGithubData);
 * console.log(`Score: ${result.score.total} / ${result.score.maxScore}`);
 * console.log(`Level: ${result.score.level}`);
 * ```
 */
export function analyze(githubData: GithubData): AnalysisResult {
  const { repoInfo, fileList, readmeContent } = githubData;

  // 1. 文件存在性检测（5 项）
  const fileChecks = runFileChecks(fileList);

  // 2. README 内容检测（4 项）
  //    边界：若 README.md 不存在，readmeContent 可能为空，
  //          readmeChecks 内部会将空内容全部判定为 fail
  const readmeChecks = runReadmeChecks(readmeContent);

  // 3. 组合 9 个 CheckItem
  const checks = [...fileChecks, ...readmeChecks];

  // 4. 计算总分和等级
  const score = calculateScore(checks);

  // 5. 生成改进建议
  const suggestions = generateSuggestions(checks);

  // 6. 生成 Markdown 报告
  const timestamp = new Date().toISOString();
  const report = generateReport({
    timestamp,
    repoInfo,
    score,
    checks,
    suggestions,
  });

  // 7. 返回完整结果
  return {
    timestamp,
    repoInfo,
    score,
    checks,
    suggestions,
    report,
  };
}
