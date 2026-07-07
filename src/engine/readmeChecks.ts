// ============================================================
// R2 分析引擎层 — README 内容启发式分析
// ============================================================

import type { CheckItem, CheckStatus } from '@/types';

// ============================================================
// 关键词表
// ============================================================

/** 运行说明关键词 */
const RUN_KEYWORDS = [
  // 英文
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'run', 'start', 'build',
  'npm install', 'npm run', 'yarn add', 'yarn install',
  'pnpm install', 'pnpm add', 'pip install', 'pip3 install',
  'cargo install', 'cargo run', 'cargo build',
  'go install', 'go get', 'go run', 'go build',
  'maven', 'mvn install', 'gradle', 'gradlew',
  'docker run', 'docker build', 'docker-compose',
  'clone', 'git clone',
  // 中文
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '配置', '环境配置',
];

/** 运行说明——章节标题特征词（命中即视为有明显章节） */
const RUN_SECTION_TITLES = [
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'running', 'run', 'start',
  'build', 'development', 'developing',
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '环境配置', '开发环境',
];

/** 技术栈说明关键词 */
const TECH_STACK_KEYWORDS = [
  'tech stack', 'technology', 'technologies', 'built with',
  'framework', 'library', 'libraries',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs',
  'nuxt', 'node.js', 'nodejs', 'express', 'koa', 'fastify',
  'typescript', 'javascript', 'ts', 'js',
  'python', 'django', 'flask', 'fastapi',
  'java', 'spring', 'spring boot', 'kotlin',
  'go', 'golang', 'rust', 'c++', 'cpp', 'c#', 'csharp',
  'ruby', 'rails', 'php', 'laravel', 'swift',
  'flutter', 'dart', 'electron', 'tauri',
  'tailwind', 'bootstrap', 'css', 'scss', 'sass',
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel',
  'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure',
  'graphql', 'rest', 'grpc', 'websocket',
  // 中文
  '技术栈', '技术选型', '框架', '依赖', '技术方案',
  '开发语言', '前端', '后端', '数据库',
];

/** 技术栈说明——章节标题特征词 */
const TECH_SECTION_TITLES = [
  'tech stack', 'technology', 'technologies', 'built with',
  'stack', 'dependencies', 'prerequisites',
  '技术栈', '技术选型', '技术方案', '依赖',
  '开发语言', '技术架构',
];

/** 项目结构说明关键词 */
const STRUCTURE_KEYWORDS = [
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'code structure', 'code organization',
  'src/', 'components/', 'utils/', 'api/', 'pages/',
  'modules/', 'lib/', 'core/', 'services/',
  '├', '└', '│', '──',  // 目录树常用符号
  // 中文
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块说明', '目录说明',
];

/** 项目结构说明——章节标题特征词 */
const STRUCTURE_SECTION_TITLES = [
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'structure', 'organization',
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块', '目录',
];

/** 部署说明关键词 */
const DEPLOY_KEYWORDS = [
  'deploy', 'deployment', 'deploying',
  'docker', 'dockerfile', 'docker-compose',
  'vercel', 'netlify', 'heroku', 'railway', 'render',
  'aws', 'gcp', 'google cloud', 'azure',
  'production', 'production build', 'production environment',
  'release', 'releasing', 'publish', 'publishing',
  'ci/cd', 'ci', 'cd', 'continuous integration', 'continuous deployment',
  'github pages', 'gitlab pages', 'cloudflare pages',
  'nginx', 'apache', 'caddy',
  'pm2', 'supervisor', 'systemd',
  'environment variables', 'env', '.env',
  // 中文
  '部署', '发布', '上线', '生产环境', '运维',
  '服务器', '云服务',
];

/** 部署说明——章节标题特征词 */
const DEPLOY_SECTION_TITLES = [
  'deploy', 'deployment', 'deploying', 'production',
  'release', 'publishing',
  '部署', '发布', '上线', '生产环境',
];

// ============================================================
// 工具函数
// ============================================================

/**
 * 统计 content 中所有关键词的命中次数
 * 大小写不敏感
 */
function countKeywordHits(content: string, keywords: string[]): number {
  const lower = content.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    const lowerKw = kw.toLowerCase();
    let pos = 0;
    while (pos < lower.length) {
      const idx = lower.indexOf(lowerKw, pos);
      if (idx === -1) break;
      hits++;
      pos = idx + lowerKw.length;
    }
  }
  return hits;
}

/**
 * 检查 content 是否包含章节标题特征词
 * 章节标题指以 ## 开头的 markdown 标题行
 */
function hasRelevantSection(content: string, sectionKeywords: string[]): boolean {
  const lower = content.toLowerCase();
  // 匹配 markdown 标题行（## 开头、# 开头）
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(lower)) !== null) {
    const heading = match[1].trim();
    for (const kw of sectionKeywords) {
      if (heading.includes(kw.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 检查 content 中是否包含代码块（``` 围栏或缩进代码块）
 */
function hasCodeBlock(content: string): boolean {
  // 围栏式代码块 ```
  if (/```[\s\S]*?```/m.test(content)) {
    return true;
  }
  // 缩进式代码块（4 空格或 1 tab 开头的连续行）
  if (/(?:^|\n)( {4}|\t)[^\n]+(?:\n(?: {4}|\t)[^\n]+)*/m.test(content)) {
    return true;
  }
  return false;
}

/**
 * 检查 README 是否有较明显的章节内容
 * 判断依据：markdown 标题数量 >= 3
 */
function hasRichSections(content: string): boolean {
  const headings = content.match(/^#{1,6}\s+/gm);
  return headings !== null && headings.length >= 3;
}

// ============================================================
// 启发式判定核心逻辑
// ============================================================

/**
 * 对单个维度进行启发式分析
 *
 * 判定规则：
 * - pass:  命中相关章节标题 OR 关键词命中 >= 3 次 OR (关键词命中 >= 2 次 AND 有代码块)
 * - partial: 关键词命中 >= 1 次，但不满足 pass 条件
 * - fail:   关键词命中 0 次
 */
function analyzeDimension(
  content: string,
  keywords: string[],
  sectionKeywords: string[]
): CheckStatus {
  if (!content || content.trim().length === 0) {
    return 'fail';
  }

  const keywordHits = countKeywordHits(content, keywords);
  const hasSection = hasRelevantSection(content, sectionKeywords);
  const hasCode = hasCodeBlock(content);
  const hasRich = hasRichSections(content);

  // 有相关章节标题 → 直接 pass
  if (hasSection) {
    return 'pass';
  }

  // 关键词命中 >= 3 次 → pass
  if (keywordHits >= 3) {
    return 'pass';
  }

  // 关键词命中 >= 2 次 + 有代码块或丰富章节 → pass
  if (keywordHits >= 2 && (hasCode || hasRich)) {
    return 'pass';
  }

  // 关键词命中 >= 1 次 → partial
  if (keywordHits >= 1) {
    return 'partial';
  }

  return 'fail';
}

// ============================================================
// 各维度检测函数
// ============================================================

/** 检测 README 中的「运行说明」 */
export function checkRunInstructions(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, RUN_KEYWORDS, RUN_SECTION_TITLES);
  let score: number;
  if (status === 'pass') score = 15;
  else if (status === 'partial') score = 7;
  else score = 0;

  return {
    name: '运行说明',
    category: 'readme',
    status,
    score,
    maxScore: 15,
  };
}

/** 检测 README 中的「技术栈说明」 */
export function checkTechStack(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, TECH_STACK_KEYWORDS, TECH_SECTION_TITLES);
  let score: number;
  if (status === 'pass') score = 10;
  else if (status === 'partial') score = 5;
  else score = 0;

  return {
    name: '技术栈说明',
    category: 'readme',
    status,
    score,
    maxScore: 10,
  };
}

/** 检测 README 中的「项目结构说明」 */
export function checkProjectStructure(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, STRUCTURE_KEYWORDS, STRUCTURE_SECTION_TITLES);
  let score: number;
  if (status === 'pass') score = 10;
  else if (status === 'partial') score = 5;
  else score = 0;

  return {
    name: '项目结构说明',
    category: 'readme',
    status,
    score,
    maxScore: 10,
  };
}

/** 检测 README 中的「部署说明」 */
export function checkDeployInstructions(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, DEPLOY_KEYWORDS, DEPLOY_SECTION_TITLES);
  let score: number;
  if (status === 'pass') score = 5;
  else if (status === 'partial') score = 2;
  else score = 0;

  return {
    name: '部署说明',
    category: 'readme',
    status,
    score,
    maxScore: 5,
  };
}

/** 检测 README 中的「截图/演示」 */
export function checkScreenshots(readmeContent: string): CheckItem {
  if (!readmeContent || readmeContent.trim().length === 0) {
    return {
      name: '截图/演示',
      category: 'readme',
      status: 'fail',
      score: 0,
      maxScore: 0,  // PRD 评分表未给此项独立分值，暂为信息性检测
    };
  }

  // 检测 Markdown 图片语法 ![alt](url)
  const hasMarkdownImage = /!\[.*?\]\(.+?\)/.test(readmeContent);
  // 检测 HTML <img> 标签
  const hasHtmlImage = /<img\s[^>]*src\s*=\s*["'][^"']+["']/i.test(readmeContent);

  const hasImage = hasMarkdownImage || hasHtmlImage;

  return {
    name: '截图/演示',
    category: 'readme',
    status: hasImage ? 'pass' : 'fail',
    score: 0,
    maxScore: 0,
  };
}

/** 检测 README 中的「使用说明」—— 整体内容丰富度判断 */
export function checkUsageInstructions(readmeContent: string): CheckItem {
  if (!readmeContent || readmeContent.trim().length === 0) {
    return {
      name: '使用说明',
      category: 'readme',
      status: 'fail',
      score: 0,
      maxScore: 0,  // PRD 评分表未给此项独立分值，暂为信息性检测
    };
  }

  const content = readmeContent.trim();
  const totalLength = content.length;

  // 统计代码块数量（```围栏式）
  const codeBlockMatches = content.match(/```[\s\S]*?```/gm);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;

  // 统计标题数量
  const headingMatches = content.match(/^#{1,6}\s+/gm);
  const headingCount = headingMatches ? headingMatches.length : 0;

  // 统计列表项数量（- 或 * 开头的行）
  const listItemMatches = content.match(/^[\t ]*[-*+]\s+/gm);
  const listItemCount = listItemMatches ? listItemMatches.length : 0;

  // 启发式判定：
  // - pass: 总长度 >= 1500 字 OR (代码块 >= 3 且 标题 >= 4)
  // - partial: 总长度 >= 500 字 OR (代码块 >= 1 且 标题 >= 2)
  // - fail: 内容过于简短
  let status: CheckStatus;
  if (
    totalLength >= 1500 ||
    (codeBlockCount >= 3 && headingCount >= 4) ||
    (headingCount >= 3 && listItemCount >= 5)
  ) {
    status = 'pass';
  } else if (totalLength >= 500 || (codeBlockCount >= 1 && headingCount >= 2)) {
    status = 'partial';
  } else {
    status = 'fail';
  }

  return {
    name: '使用说明',
    category: 'readme',
    status,
    score: 0,
    maxScore: 0,
  };
}

/**
 * 执行所有 README 内容检测
 *
 * 边界情况：
 * - README 为空字符串或纯空白 → 所有维度返回 fail（0 分）
 * - 若 readmeContent 为 null/undefined → 视为空，全部 fail
 */
export function runReadmeChecks(readmeContent: string | null | undefined): CheckItem[] {
  const content = (readmeContent ?? '').trim();

  if (content.length === 0) {
    // 空 README → 全部 fail
    return [
      { name: '运行说明', category: 'readme', status: 'fail', score: 0, maxScore: 15 },
      { name: '技术栈说明', category: 'readme', status: 'fail', score: 0, maxScore: 10 },
      { name: '项目结构说明', category: 'readme', status: 'fail', score: 0, maxScore: 10 },
      { name: '部署说明', category: 'readme', status: 'fail', score: 0, maxScore: 5 },
      { name: '截图/演示', category: 'readme', status: 'fail', score: 0, maxScore: 0 },
      { name: '使用说明', category: 'readme', status: 'fail', score: 0, maxScore: 0 },
    ];
  }

  return [
    checkRunInstructions(content),
    checkTechStack(content),
    checkProjectStructure(content),
    checkDeployInstructions(content),
    checkScreenshots(content),
    checkUsageInstructions(content),
  ];
}
