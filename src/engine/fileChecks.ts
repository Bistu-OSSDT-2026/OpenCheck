// ============================================================
// R2 分析引擎层 — 文件存在性检测
// ============================================================

import type { CheckItem, FileItem } from '@/types';

/**
 * 在文件列表中查找匹配的文件名（大小写不敏感）
 * 只检查根目录下的文件，返回找到的文件名，未找到返回 null
 */
function findFile(
  fileList: FileItem[],
  patterns: string[]
): string | null {
  const lowerNames = new Map<string, string>();
  for (const f of fileList) {
    // 只检查根目录下的文件（path === name 且 type === 'file' 表示在根目录）
    if (f.type !== 'file' || f.path !== f.name) continue;
    const key = f.name.toLowerCase();
    if (!lowerNames.has(key)) {
      lowerNames.set(key, f.name);
    }
  }
  for (const pattern of patterns) {
    const found = lowerNames.get(pattern.toLowerCase());
    if (found !== undefined) {
      return found;
    }
  }
  return null;
}

/** 检测 README.md 是否存在（大小写不敏感） */
export function checkReadme(fileList: FileItem[]): CheckItem {
  const patterns = ['readme.md', 'readme', 'readme.txt', 'readme.rst', 'readme.markdown'];
  const found = findFile(fileList, patterns);
  return {
    name: 'README.md',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 20 : 0,
    maxScore: 20,
    reason: found
      ? `根目录存在 ${found}，满足开源项目基础说明文档要求。`
      : '根目录未发现 README 文件，访问者无法快速了解项目用途和使用方式。',
    evidence: found ? [`命中文件：${found}`] : ['期望文件：README.md / README / README.txt'],
  };
}

/** 检测 LICENSE 是否存在（支持 LICENSE、LICENSE.md、LICENSE.txt 等） */
export function checkLicense(fileList: FileItem[]): CheckItem {
  const patterns = [
    'license',
    'license.md',
    'license.txt',
    'license.rst',
    'license.mit',
    'license.apache',
    'license.gpl',
    'copying',
    'copying.txt',
    'unlicense',
  ];
  const found = findFile(fileList, patterns);
  return {
    name: 'LICENSE',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 15 : 0,
    maxScore: 15,
    reason: found
      ? `根目录存在 ${found}，项目使用权限边界更清楚。`
      : '根目录未发现 LICENSE 或 COPYING 文件，使用者难以判断代码授权范围。',
    evidence: found ? [`命中文件：${found}`] : ['期望文件：LICENSE / LICENSE.md / COPYING'],
  };
}

/** 检测 .gitignore 是否存在 */
export function checkGitignore(fileList: FileItem[]): CheckItem {
  const patterns = ['.gitignore'];
  const found = findFile(fileList, patterns);
  return {
    name: '.gitignore',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 10 : 0,
    maxScore: 10,
    reason: found
      ? '根目录存在 .gitignore，可以减少依赖目录、构建产物和本地配置被误提交的风险。'
      : '根目录未发现 .gitignore，依赖目录、构建产物或 IDE 配置可能被误提交。',
    evidence: found ? [`命中文件：${found}`] : ['期望文件：.gitignore'],
  };
}

/** 检测 CONTRIBUTING.md 是否存在（支持 CONTRIBUTING、CONTRIBUTING.md） */
export function checkContributing(fileList: FileItem[]): CheckItem {
  const patterns = [
    'contributing.md',
    'contributing',
    'contributing.txt',
    'contributing.rst',
    'contributing.markdown',
  ];
  const found = findFile(fileList, patterns);
  return {
    name: 'CONTRIBUTING.md',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 10 : 0,
    maxScore: 10,
    reason: found
      ? `根目录存在 ${found}，外部贡献者可以找到参与方式。`
      : '根目录未发现贡献指南，新贡献者不知道如何提交 Issue、PR 或遵守项目规范。',
    evidence: found ? [`命中文件：${found}`] : ['期望文件：CONTRIBUTING.md'],
  };
}

/** 检测 CHANGELOG.md 是否存在（支持 CHANGELOG、CHANGELOG.md、CHANGELOG.txt） */
export function checkChangelog(fileList: FileItem[]): CheckItem {
  const patterns = [
    'changelog.md',
    'changelog',
    'changelog.txt',
    'changelog.rst',
    'changes.md',
    'history.md',
    'releases.md',
  ];
  const found = findFile(fileList, patterns);
  return {
    name: 'CHANGELOG.md',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 5 : 0,
    maxScore: 5,
    reason: found
      ? `根目录存在 ${found}，用户可以追踪版本变化。`
      : '根目录未发现更新日志，用户难以了解版本演进和重要变更。',
    evidence: found ? [`命中文件：${found}`] : ['期望文件：CHANGELOG.md / CHANGES.md / RELEASES.md'],
  };
}

/** 检测依赖声明文件是否存在 */
export function checkDependencyFile(fileList: FileItem[]): CheckItem {
  const patterns = [
    'package.json',
    'requirements.txt',
    'go.mod',
    'Cargo.toml',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'settings.gradle',
    'Gemfile',
    'mix.exs',
    'rebar.config',
    'CMakeLists.txt',
    'Makefile',
  ];
  const found = findFile(fileList, patterns);
  return {
    name: '依赖声明文件',
    category: 'file',
    status: found ? 'pass' : 'fail',
    score: found ? 0 : 0,   // PRD 评分表未给此项独立分值，暂为信息性检测
    maxScore: 0,
    reason: found
      ? `根目录存在 ${found}，新用户可以据此安装依赖或识别技术栈。`
      : '根目录未发现常见依赖声明文件，项目环境搭建方式不够明确。',
    evidence: found
      ? [`命中文件：${found}`]
      : ['检查范围：package.json / requirements.txt / go.mod / Cargo.toml / pom.xml 等'],
  };
}

/**
 * 检测 .github/workflows/ 目录是否存在且非空
 *
 * 注意：R1 的 GithubData.fileList 仅包含根目录内容，
 * 此处仅能判断 .github 目录是否存在。无法验证 workflows 子目录是否非空。
 * 实际非空校验需 R1 扩展 fileList 范围或提供额外 API。
 */
export function checkWorkflowsDir(fileList: FileItem[]): CheckItem {
  // 查找 .github 目录（根目录下）
  const hasGithubDir = fileList.some(
    (f) => f.type === 'dir' && f.name.toLowerCase() === '.github',
  );
  return {
    name: '.github/workflows/',
    category: 'file',
    status: hasGithubDir ? 'pass' : 'fail',
    score: hasGithubDir ? 0 : 0,  // PRD 评分表未给此项独立分值，暂为信息性检测
    maxScore: 0,
    reason: hasGithubDir
      ? '根目录存在 .github 目录，项目可能已经配置 Issue 模板或 GitHub Actions。'
      : '根目录未发现 .github 目录，暂未看到 GitHub 协作或自动化配置入口。',
    evidence: hasGithubDir
      ? ['命中目录：.github']
      : ['期望目录：.github/workflows/（当前 API 仅读取根目录，无法深入确认非空）'],
  };
}

/**
 * 执行所有文件存在性检测
 * 返回 7 个 CheckItem
 */
export function runFileChecks(fileList: FileItem[]): CheckItem[] {
  return [
    checkReadme(fileList),
    checkLicense(fileList),
    checkGitignore(fileList),
    checkContributing(fileList),
    checkChangelog(fileList),
    checkDependencyFile(fileList),
    checkWorkflowsDir(fileList),
  ];
}
