// ============================================================
// R2 分析引擎层 — 统一导出
// ============================================================

// 主分析函数
export { analyze } from './analyze';

// Mock 数据
export { mockGithubData, mockAnalysisResult } from './mockData';

// 子模块导出（方便单独测试）
export {
  runFileChecks,
  checkReadme,
  checkLicense,
  checkGitignore,
  checkContributing,
  checkChangelog,
  checkDependencyFile,
  checkWorkflowsDir,
} from './fileChecks';
export {
  runReadmeChecks,
  checkRunInstructions,
  checkTechStack,
  checkProjectStructure,
  checkDeployInstructions,
  checkScreenshots,
  checkUsageInstructions,
} from './readmeChecks';
export { calculateScore, calculateLevel } from './scoring';
export { generateSuggestions } from './suggestions';
export { generateReport } from './report';
