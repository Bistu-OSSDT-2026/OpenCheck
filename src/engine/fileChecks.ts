// ============================================================
// R2 分析引擎层 — 文件存在性检测（7 项）
// 严格对齐 PRD_OpenCheck.md §5.3.1 + §5.4.1
//
// 设计原则：
//   - 只检测根目录文件（PRD 明确要求"仓库根目录下"）
//   - 大小写不敏感匹配
//   - 前 5 项为评分项（共 60 分），后 2 项为补充检测（PRD §5.3.1 要求但 §5.4.1 未给分值）
// ============================================================

import type { CheckItem, FileItem } from '@/types';

// ============================================================
// 工具函数
// ============================================================

/** 在根目录文件中查找匹配（大小写不敏感） */
function findInRoot(fileList: FileItem[], patterns: string[]): boolean {
  const lowerNames = new Set<string>();
  for (const f of fileList) {
    if (f.type !== 'file' || f.path !== f.name) continue;
    lowerNames.add(f.name.toLowerCase());
  }
  for (const p of patterns) {
    if (lowerNames.has(p.toLowerCase())) return true;
  }
  return false;
}

/** 检查是否存在路径以 prefix 开头的文件（用于验证目录非空） */
function hasFileUnder(fileList: FileItem[], prefix: string): boolean {
  const normalized = prefix.endsWith('/') ? prefix : prefix + '/';
  for (const f of fileList) {
    if (f.type === 'file' && f.path.startsWith(normalized)) return true;
  }
  return false;
}

function makeResult(name: string, passed: boolean, maxScore: number): CheckItem {
  return {
    name,
    category: 'file',
    status: passed ? 'pass' : 'fail',
    score: passed ? maxScore : 0,
    maxScore,
  };
}

// ============================================================
// 评分项（5 项，共 60 分）≡ PRD §5.4.1
// ============================================================

/** README.md — 20 分。支持常见变体（.md / .markdown / .txt / .rst / 无后缀） */
export function checkReadme(fileList: FileItem[]): CheckItem {
  return makeResult('README.md', findInRoot(fileList, [
    'readme.md', 'readme.markdown', 'readme', 'readme.txt', 'readme.rst',
  ]), 20);
}

/** LICENSE — 15 分。覆盖 LICENSE / COPYING / UNLICENSE 及各种后缀 */
export function checkLicense(fileList: FileItem[]): CheckItem {
  return makeResult('LICENSE', findInRoot(fileList, [
    'license', 'license.md', 'license.txt', 'license.rst',
    'license.mit', 'license.apache', 'license.gpl',
    'copying', 'copying.txt', 'unlicense',
  ]), 15);
}

/** .gitignore — 10 分 */
export function checkGitignore(fileList: FileItem[]): CheckItem {
  return makeResult('.gitignore', findInRoot(fileList, ['.gitignore']), 10);
}

/** CONTRIBUTING.md — 10 分 */
export function checkContributing(fileList: FileItem[]): CheckItem {
  return makeResult('CONTRIBUTING.md', findInRoot(fileList, [
    'contributing.md', 'contributing', 'contributing.txt',
    'contributing.rst', 'contributing.markdown',
  ]), 10);
}

/** CHANGELOG.md — 5 分。也接受 CHANGES / HISTORY / RELEASES 等命名 */
export function checkChangelog(fileList: FileItem[]): CheckItem {
  return makeResult('CHANGELOG.md', findInRoot(fileList, [
    'changelog.md', 'changelog', 'changelog.txt', 'changelog.rst',
    'changes.md', 'changes', 'history.md', 'releases.md',
  ]), 5);
}

// ============================================================
// 补充检测项（2 项，不计分）≡ PRD §5.3.1
// ============================================================

/**
 * 依赖声明文件（不计分）
 *
 * 覆盖 7 大语言生态的 18 种主流清单文件格式。
 * 只要命中任一即视为存在。
 */
export function checkDependencyFile(fileList: FileItem[]): CheckItem {
  return makeResult('依赖声明文件', findInRoot(fileList, [
    // —— Node.js / 前端 ——
    'package.json',
    // —— Python ——
    'requirements.txt', 'pyproject.toml', 'setup.py', 'setup.cfg',
    'Pipfile', 'poetry.lock',
    // —— Go ——
    'go.mod', 'go.sum',
    // —— Rust ——
    'Cargo.toml', 'Cargo.lock',
    // —— Java / JVM ——
    'pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle',
    // —— Ruby ——
    'Gemfile', 'gemspec',
    // —— PHP ——
    'composer.json',
    // —— C / C++ / 通用 ——
    'CMakeLists.txt', 'Makefile', 'meson.build',
  ]), 0);
}

/**
 * .github/workflows/ 目录（不计分）
 *
 * PRD："CI/CD 工作流配置目录（非空目录才算存在）"
 * 检测 .github/workflows/ 路径下是否有至少一个文件。
 */
export function checkWorkflowsDir(fileList: FileItem[]): CheckItem {
  return makeResult('.github/workflows/', hasFileUnder(fileList, '.github/workflows'), 0);
}

// ============================================================
// 批量执行
// ============================================================

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
