// ============================================================
// R2 分析引擎层 — 文件存在性检测（7 项）
// 严格对齐 PRD_OpenCheck.md §5.3.1 + §5.4.1
// ============================================================

import type { CheckItem, FileItem } from '@/types';

// ============================================================
// 工具函数
// ============================================================

/**
 * 在根目录文件列表中查找匹配的文件名（大小写不敏感）
 * 只查根目录（path === name），PRD §5.3.1 明确要求"仓库根目录下"
 */
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

/**
 * 检查文件列表中是否存在路径以 prefix 开头的文件
 * 用于检测 .github/workflows/ 目录下是否有文件（PRD 要求"非空目录才算存在"）
 */
function hasFileUnder(fileList: FileItem[], prefix: string): boolean {
  const normalized = prefix.endsWith('/') ? prefix : prefix + '/';
  for (const f of fileList) {
    if (f.type === 'file' && f.path.startsWith(normalized)) return true;
  }
  return false;
}

// ============================================================
// 构建结果
// ============================================================

function makeResult(
  name: string,
  passed: boolean,
  maxScore: number,
): CheckItem {
  return {
    name,
    category: 'file',
    status: passed ? 'pass' : 'fail',
    score: passed ? maxScore : 0,
    maxScore,
  };
}

// ============================================================
// 评分检测项（5 项，共 60 分）—— PRD §5.4.1
// ============================================================

/** README.md — 20 分 */
export function checkReadme(fileList: FileItem[]): CheckItem {
  return makeResult('README.md', findInRoot(fileList, [
    'readme.md', 'readme.markdown', 'readme', 'readme.txt', 'readme.rst',
  ]), 20);
}

/** LICENSE — 15 分 */
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

/** CHANGELOG.md — 5 分 */
export function checkChangelog(fileList: FileItem[]): CheckItem {
  return makeResult('CHANGELOG.md', findInRoot(fileList, [
    'changelog.md', 'changelog', 'changelog.txt', 'changelog.rst',
    'changes.md', 'history.md', 'releases.md',
  ]), 5);
}

// ============================================================
// 补充检测项（2 项，不计分）—— PRD §5.3.1 要求检测但 §5.4.1 无分值
// ============================================================

/**
 * 依赖声明文件（不计分）
 *
 * PRD §5.3.1："如 package.json / requirements.txt / go.mod / Cargo.toml /
 * pom.xml 等（根据项目语言判断）"
 */
export function checkDependencyFile(fileList: FileItem[]): CheckItem {
  return makeResult('依赖声明文件', findInRoot(fileList, [
    'package.json',        // Node.js
    'requirements.txt',    // Python (pip)
    'pyproject.toml',      // Python (modern)
    'setup.py',            // Python (legacy)
    'go.mod',              // Go
    'Cargo.toml',          // Rust
    'pom.xml',             // Java (Maven)
    'build.gradle',        // Java (Gradle)
    'build.gradle.kts',    // Java (Gradle Kotlin DSL)
    'Gemfile',             // Ruby
    'composer.json',       // PHP
    'CMakeLists.txt',      // C/C++ (CMake)
    'Makefile',            // 通用
    'meson.build',         // C/C++ (Meson)
  ]), 0);
}

/**
 * .github/workflows/ 目录（不计分）
 *
 * PRD §5.3.1："CI/CD 工作流配置目录（非空目录才算存在）"
 *
 * 检测 .github/workflows/ 路径下是否有至少一个文件。
 */
export function checkWorkflowsDir(fileList: FileItem[]): CheckItem {
  const exists = hasFileUnder(fileList, '.github/workflows');
  return makeResult('.github/workflows/', exists, 0);
}

// ============================================================
// 批量执行
// ============================================================

/**
 * 执行所有文件存在性检测（7 项）
 *
 * 前 5 项计入总分（共 60 分，PRD §5.4.1），
 * 后 2 项为补充检测（不计分，PRD §5.3.1）。
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
