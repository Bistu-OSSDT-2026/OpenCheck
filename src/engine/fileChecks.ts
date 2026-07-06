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
  };
}

/**
 * 执行所有文件存在性检测
 * 返回 5 个 CheckItem（README、LICENSE、.gitignore、CONTRIBUTING、CHANGELOG）
 */
export function runFileChecks(fileList: FileItem[]): CheckItem[] {
  return [
    checkReadme(fileList),
    checkLicense(fileList),
    checkGitignore(fileList),
    checkContributing(fileList),
    checkChangelog(fileList),
  ];
}
