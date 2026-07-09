// ============================================================
// R2 分析引擎层 — README 内容启发式分析（6 维）
// 严格对齐 PRD_OpenCheck.md §5.3.2 + §5.4.1
// ============================================================

import type { CheckItem, CheckStatus } from '@/types';

// ============================================================
// 关键词表（PRD §5.3.2：对代码块数量、章节标题、关键词做加权判断）
// ============================================================

const RUN_KEYWORDS = [
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'run', 'start', 'build',
  'npm install', 'npm run', 'yarn add', 'yarn install',
  'pnpm install', 'pnpm add', 'pip install', 'pip3 install',
  'cargo install', 'cargo run', 'cargo build',
  'go install', 'go get', 'go run', 'go build',
  'maven', 'mvn install', 'gradle', 'gradlew',
  'docker run', 'docker build', 'docker-compose',
  'clone', 'git clone', 'prerequisites', 'requirements',
  'cmake', 'make', 'make install', 'configure',
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '配置', '环境配置', '前置条件',
  '依赖安装', '环境搭建',
];

const RUN_SECTION_TITLES = [
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'running', 'run', 'start',
  'build', 'development', 'developing', 'prerequisites',
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '环境配置', '开发环境', '前置要求',
];

const TECH_STACK_KEYWORDS = [
  'tech stack', 'technology', 'technologies', 'built with',
  'framework', 'library', 'libraries', 'powered by',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs',
  'nuxt', 'node.js', 'nodejs', 'express', 'koa', 'fastify',
  'typescript', 'javascript', 'ts', 'js',
  'python', 'django', 'flask', 'fastapi', 'pytorch', 'tensorflow',
  'java', 'spring', 'spring boot', 'kotlin', 'scala',
  'go', 'golang', 'rust', 'c++', 'cpp', 'c#', 'csharp', 'dotnet',
  'ruby', 'rails', 'php', 'laravel', 'swift', 'elixir',
  'flutter', 'dart', 'electron', 'tauri', 'react native',
  'tailwind', 'bootstrap', 'css', 'scss', 'sass',
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel',
  'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure',
  'graphql', 'rest', 'grpc', 'websocket', 'trpc',
  '技术栈', '技术选型', '框架', '依赖', '技术方案',
  '开发语言', '前端', '后端', '数据库', '中间件',
];

const TECH_SECTION_TITLES = [
  'tech stack', 'technology', 'technologies', 'built with',
  'stack', 'dependencies', 'prerequisites', 'powered by',
  '技术栈', '技术选型', '技术方案', '依赖',
  '开发语言', '技术架构', '核心技术',
];

const STRUCTURE_KEYWORDS = [
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'code structure', 'code organization',
  'src/', 'components/', 'utils/', 'api/', 'pages/',
  'modules/', 'lib/', 'core/', 'services/', 'hooks/',
  '├', '└', '│', '──', '├──', '└──',
  'monorepo', 'workspace', 'packages/',
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块说明', '目录说明', '源码结构',
];

const STRUCTURE_SECTION_TITLES = [
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'structure', 'organization', 'packages',
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块', '目录',
];

const DEPLOY_KEYWORDS = [
  'deploy', 'deployment', 'deploying',
  'docker', 'dockerfile', 'docker-compose', 'kubernetes',
  'vercel', 'netlify', 'heroku', 'railway', 'render', 'fly.io',
  'aws', 'gcp', 'google cloud', 'azure',
  'production', 'production build', 'production environment',
  'release', 'releasing', 'publish', 'publishing',
  'ci/cd', 'ci', 'cd', 'continuous integration', 'continuous deployment',
  'github pages', 'gitlab pages', 'cloudflare pages',
  'nginx', 'apache', 'caddy',
  'pm2', 'supervisor', 'systemd',
  'environment variables', 'env', '.env',
  '部署', '发布', '上线', '生产环境', '运维',
  '服务器', '云服务', '容器', '编排',
];

const DEPLOY_SECTION_TITLES = [
  'deploy', 'deployment', 'deploying', 'production',
  'release', 'releasing', 'publishing', 'hosting',
  '部署', '发布', '上线', '生产环境', '托管',
];

// ============================================================
// 工具函数
// ============================================================

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

function hasRelevantSection(content: string, sectionKeywords: string[]): boolean {
  const lower = content.toLowerCase();
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(lower)) !== null) {
    const heading = match[1].trim();
    for (const kw of sectionKeywords) {
      if (heading.includes(kw.toLowerCase())) return true;
    }
  }
  return false;
}

function hasCodeBlock(content: string): boolean {
  if (/```[\s\S]*?```/m.test(content)) return true;
  if (/(?:^|\n)( {4}|\t)[^\n]+(?:\n(?: {4}|\t)[^\n]+)*/m.test(content)) return true;
  return false;
}

function hasRichSections(content: string): boolean {
  const headings = content.match(/^#{1,6}\s+/gm);
  return headings !== null && headings.length >= 3;
}

// ============================================================
// 启发式判定（3 态，PRD §5.3.2）
//
// pass:    有相关章节标题
//       OR 关键词命中 >= 3
//       OR (关键词命中 >= 2 AND 有代码块或丰富章节)
// partial: 关键词命中 >= 1，但不满足 pass
// fail:    关键词命中 0 次
// ============================================================

function analyzeDimension(
  content: string,
  keywords: string[],
  sectionKeywords: string[],
): CheckStatus {
  if (!content || content.trim().length === 0) return 'fail';

  const keywordHits = countKeywordHits(content, keywords);
  const hasSection = hasRelevantSection(content, sectionKeywords);
  const hasCode = hasCodeBlock(content);
  const hasRich = hasRichSections(content);

  if (hasSection) return 'pass';
  if (keywordHits >= 3) return 'pass';
  if (keywordHits >= 2 && (hasCode || hasRich)) return 'pass';
  if (keywordHits >= 1) return 'partial';
  return 'fail';
}

// ============================================================
// 构建结果（PRD §5.4.1：通过=满分，部分通过=一半/向下取整，未通过=0）
// ============================================================

function contentScore(status: CheckStatus, maxScore: number): number {
  if (status === 'pass') return maxScore;
  if (status === 'partial') return Math.floor(maxScore / 2);
  return 0;
}

function makeResult(
  name: string,
  status: CheckStatus,
  maxScore: number,
): CheckItem {
  return { name, category: 'readme', status, score: contentScore(status, maxScore), maxScore };
}

// ============================================================
// 评分检测项（4 项，共 40 分）—— PRD §5.4.1
// ============================================================

export function checkRunInstructions(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, RUN_KEYWORDS, RUN_SECTION_TITLES);
  return makeResult('运行说明', status, 15);
}

export function checkTechStack(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, TECH_STACK_KEYWORDS, TECH_SECTION_TITLES);
  return makeResult('技术栈说明', status, 10);
}

export function checkProjectStructure(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, STRUCTURE_KEYWORDS, STRUCTURE_SECTION_TITLES);
  return makeResult('项目结构说明', status, 10);
}

export function checkDeployInstructions(readmeContent: string): CheckItem {
  const status = analyzeDimension(readmeContent, DEPLOY_KEYWORDS, DEPLOY_SECTION_TITLES);
  return makeResult('部署说明', status, 5);
}

// ============================================================
// 补充检测项（2 项，不计分）—— PRD §5.3.2
// ============================================================

/**
 * 截图/演示（不计分）
 *
 * PRD §5.3.2："README 中是否包含图片（检测 ![ ... ](...) 图片链接语法或 <img> 标签）。
 * 包含至少一张图片即视为通过。"
 */
export function checkScreenshots(readmeContent: string): CheckItem {
  const content = (readmeContent ?? '').trim();
  const hasImage = content.length > 0 && (
    /!\[.*?\]\(.+?\)/.test(content) || /<img\s/i.test(content)
  );
  return makeResult('截图/演示', hasImage ? 'pass' : 'fail', 0);
}

/**
 * 使用说明（不计分）
 *
 * PRD §5.3.2："README 是否包含 API 文档、配置说明、示例代码等内容，不只是简单介绍。
 * 通过整体内容丰富度（总长度、代码块数量、章节数量）来综合判断。"
 */
export function checkUsageInstructions(readmeContent: string): CheckItem {
  const content = (readmeContent ?? '').trim();
  if (content.length === 0) return makeResult('使用说明', 'fail', 0);

  const totalLength = content.length;
  const codeBlockCount = (content.match(/```[\s\S]*?```/gm) || []).length;
  const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
  const listItemCount = (content.match(/^[\t ]*[-*+]\s+/gm) || []).length;

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

  return makeResult('使用说明', status, 0);
}

// ============================================================
// 批量执行
// ============================================================

export function runReadmeChecks(readmeContent: string | null | undefined): CheckItem[] {
  const content = (readmeContent ?? '').trim();

  if (content.length === 0) {
    return [
      makeResult('运行说明', 'fail', 15),
      makeResult('技术栈说明', 'fail', 10),
      makeResult('项目结构说明', 'fail', 10),
      makeResult('部署说明', 'fail', 5),
      makeResult('截图/演示', 'fail', 0),
      makeResult('使用说明', 'fail', 0),
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
