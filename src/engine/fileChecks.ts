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
function findInRoot(fileList: FileItem[], patterns: string[]): string | null {
  const lowerNameMap = new Map<string, string>();
  for (const f of fileList) {
    if (f.type !== 'file' || f.path !== f.name) continue;
    lowerNameMap.set(f.name.toLowerCase(), f.name);
  }
  for (const p of patterns) {
    const found = lowerNameMap.get(p.toLowerCase());
    if (found) return found;
  }
  return null;
}

/**
 * 检查文件列表中是否存在路径以 prefix 开头的文件
 * 用于检测 .github/workflows/ 目录下是否有文件（PRD 要求"非空目录才算存在"）
 */
function findFileUnder(fileList: FileItem[], prefix: string): string | null {
  const normalized = prefix.endsWith('/') ? prefix : prefix + '/';
  const lowerPrefix = normalized.toLowerCase();
  const found = fileList.find((f) => (
    f.type === 'file' && f.path.toLowerCase().startsWith(lowerPrefix)
  ));
  return found?.path ?? null;
}

// ============================================================
// 构建结果
// ============================================================

function makeResult(
  name: string,
  found: string | null,
  maxScore: number,
  passReason: string,
  failReason: string,
  failEvidence: string[],
): CheckItem {
  const passed = Boolean(found);
  return {
    name,
    category: 'file',
    status: passed ? 'pass' : 'fail',
    score: passed ? maxScore : 0,
    maxScore,
    reason: passed ? passReason : failReason,
    evidence: passed ? [`命中文件：${found}`] : failEvidence,
  };
}

// ============================================================
// 评分检测项（5 项，共 60 分）—— PRD §5.4.1
// ============================================================

/** README.md — 20 分 */
export function checkReadme(fileList: FileItem[]): CheckItem {
  const found = findInRoot(fileList, [
    'readme.md', 'readme.markdown', 'readme', 'readme.txt', 'readme.rst',
  ]);
  return makeResult(
    'README.md',
    found,
    20,
    `根目录存在 ${found}，满足开源项目基础说明文档要求。`,
    '根目录未发现 README 文件，访问者无法快速了解项目用途和使用方式。',
    ['期望文件：README.md / README / README.txt'],
  );
}

/** LICENSE — 15 分 */
export function checkLicense(fileList: FileItem[]): CheckItem {
  const found = findInRoot(fileList, [
    'license', 'license.md', 'license.txt', 'license.rst',
    'license.mit', 'license.apache', 'license.gpl',
    'copying', 'copying.txt', 'unlicense',
  ]);
  return makeResult(
    'LICENSE',
    found,
    15,
    `根目录存在 ${found}，项目使用权限边界更清楚。`,
    '根目录未发现 LICENSE 或 COPYING 文件，使用者难以判断代码授权范围。',
    ['期望文件：LICENSE / LICENSE.md / COPYING'],
  );
}

/** .gitignore — 10 分 */
export function checkGitignore(fileList: FileItem[]): CheckItem {
  const found = findInRoot(fileList, ['.gitignore']);
  return makeResult(
    '.gitignore',
    found,
    10,
    '根目录存在 .gitignore，可以减少依赖目录、构建产物和本地配置被误提交的风险。',
    '根目录未发现 .gitignore，依赖目录、构建产物或 IDE 配置可能被误提交。',
    ['期望文件：.gitignore'],
  );
}

/** CONTRIBUTING.md — 10 分 */
export function checkContributing(fileList: FileItem[]): CheckItem {
  const found = findInRoot(fileList, [
    'contributing.md', 'contributing', 'contributing.txt',
    'contributing.rst', 'contributing.markdown',
  ]);
  return makeResult(
    'CONTRIBUTING.md',
    found,
    10,
    `根目录存在 ${found}，外部贡献者可以找到参与方式。`,
    '根目录未发现贡献指南，新贡献者不知道如何提交 Issue、PR 或遵守项目规范。',
    ['期望文件：CONTRIBUTING.md'],
  );
}

/** CHANGELOG.md — 5 分 */
export function checkChangelog(fileList: FileItem[]): CheckItem {
  const found = findInRoot(fileList, [
    'changelog.md', 'changelog', 'changelog.txt', 'changelog.rst',
    'changes.md', 'history.md', 'releases.md',
  ]);
  return makeResult(
    'CHANGELOG.md',
    found,
    5,
    `根目录存在 ${found}，用户可以追踪版本变化。`,
    '根目录未发现更新日志，用户难以了解版本演进和重要变更。',
    ['期望文件：CHANGELOG.md / CHANGES.md / RELEASES.md'],
  );
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
  const found = findInRoot(fileList, [
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
  ]);
  return makeResult(
    '依赖声明文件',
    found,
    0,
    `根目录存在 ${found}，新用户可以据此安装依赖或识别技术栈。`,
    '根目录未发现常见依赖声明文件，项目环境搭建方式不够明确。',
    ['检查范围：package.json / requirements.txt / pyproject.toml / go.mod / Cargo.toml / pom.xml 等'],
  );
}

/**
 * .github/workflows/ 目录（不计分）
 *
 * PRD §5.3.1："CI/CD 工作流配置目录（非空目录才算存在）"
 *
 * 检测 .github/workflows/ 路径下是否有至少一个文件。
 */
export function checkWorkflowsDir(fileList: FileItem[]): CheckItem {
  const found = findFileUnder(fileList, '.github/workflows');
  return makeResult(
    '.github/workflows/',
    found,
    0,
    '检测到 .github/workflows 下的工作流文件，项目具备自动化流程入口。',
    '未检测到 .github/workflows 下的工作流文件，暂未看到 CI/CD 自动化配置。',
    ['期望路径：.github/workflows/*.yml 或 .github/workflows/*.yaml'],
  );
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
