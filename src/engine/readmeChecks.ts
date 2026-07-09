// ============================================================
// R2 分析引擎层 — README 内容启发式分析（6 维）
// 严格对齐 PRD_OpenCheck.md §5.3.2 + §5.4.1
//
// 设计原则：
//   - 每个维度有一组「章节标题特征词」+ 一组「内容关键词」
//   - 关键词覆盖主流语言生态（JS/TS / Python / Go / Rust / Java / Ruby / PHP / C++ 等）
//   - 辅助信号（外链、列表、版本号）用于区分"认真写的文档"和"随手写了两句"
//   - 阈值不追求精确，但方向正确、可解释
// ============================================================

import type { CheckItem, CheckStatus } from '@/types';

// ============================================================
// 运行说明 — 关键词 & 章节标题
// ============================================================

const RUN_KEYWORDS = [
  // 通用命令动词
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'run', 'start', 'build', 'test',
  'clone', 'git clone', 'prerequisites', 'requirements',
  'dependencies', 'dependency',
  // Node.js / 前端
  'npm install', 'npm run', 'npm start', 'npm test', 'npm ci',
  'npx', 'yarn add', 'yarn install', 'yarn run',
  'pnpm install', 'pnpm add', 'pnpm run',
  'bun install', 'bun run',
  // Python
  'pip install', 'pip3 install', 'python setup.py',
  'poetry install', 'poetry run', 'pipenv install',
  'conda install', 'conda create',
  // Go
  'go install', 'go get', 'go run', 'go build', 'go mod',
  // Rust
  'cargo install', 'cargo run', 'cargo build', 'cargo test',
  // Java / JVM
  'maven', 'mvn install', 'mvn clean', 'gradle', 'gradlew',
  // C / C++
  'cmake', 'make', 'make install', 'configure', 'meson', 'ninja',
  // Docker
  'docker run', 'docker build', 'docker-compose', 'docker compose',
  // 版本信息（表示具体的环境要求）
  'node.js', 'node >=', 'python 3', 'go 1.',
  // 中文
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '配置', '环境配置', '前置条件',
  '依赖安装', '环境搭建', '开发环境', '本地开发',
];

const RUN_SECTION_TITLES = [
  'install', 'installation', 'getting started', 'quick start',
  'quickstart', 'setup', 'running', 'run', 'start',
  'build', 'development', 'developing', 'prerequisites',
  'how to run', 'how to build', 'how to use', 'usage',
  '安装', '运行', '启动', '快速开始', '快速入门',
  '构建', '编译', '环境配置', '开发环境', '前置要求',
  '本地开发', '使用方法', '开发指南',
];

// ============================================================
// 技术栈说明 — 关键词 & 章节标题
// ============================================================

const TECH_STACK_KEYWORDS = [
  // 通用
  'tech stack', 'technology', 'technologies', 'built with',
  'framework', 'library', 'libraries', 'powered by',
  'stack', 'dependencies',
  // 语言
  'typescript', 'javascript', 'ts', 'js', 'es6', 'es202',
  'python', 'py3', 'java', 'kotlin', 'scala', 'groovy',
  'go', 'golang', 'rust', 'c++', 'cpp', 'c#', 'csharp', 'dotnet',
  'ruby', 'php', 'swift', 'elixir', 'erlang', 'haskell',
  'clojure', 'lua', 'zig', 'nim', 'crystal', 'julia', 'r', 'dart',
  // 前端框架 / 工具
  'react', 'vue', 'angular', 'svelte', 'solid', 'qwik',
  'next.js', 'nextjs', 'nuxt', 'remix', 'astro', 'gatsby',
  'tailwind', 'bootstrap', 'css', 'scss', 'sass', 'less',
  'styled-components', 'emotion', 'chakra', 'mui', 'shadcn',
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel', 'turbopack',
  'babel', 'swc', 'postcss', 'eslint', 'prettier', 'biome',
  // 后端框架
  'node.js', 'nodejs', 'express', 'koa', 'fastify', 'hono', 'nest',
  'django', 'flask', 'fastapi', 'starlette', 'sanic', 'tornado',
  'spring', 'spring boot', 'micronaut', 'quarkus', 'jakarta',
  'laravel', 'symfony', 'slim', 'phoenix',
  'rails', 'sinatra', 'hanami',
  'gin', 'echo', 'fiber', 'chi',
  'actix', 'axum', 'rocket', 'tokio', 'warp',
  // 数据库 / 存储
  'mongodb', 'postgresql', 'mysql', 'mariadb', 'sqlite',
  'redis', 'dynamodb', 'cassandra', 'neo4j', 'elasticsearch',
  'clickhouse', 'timescaledb', 'cockroachdb', 'supabase', 'planetscale',
  'prisma', 'drizzle', 'typeorm', 'sequelize', 'knex',
  'sqlalchemy', 'diesel', 'sqlx', 'gorm',
  // 云 / DevOps
  'docker', 'kubernetes', 'k8s', 'helm', 'terraform',
  'aws', 'gcp', 'google cloud', 'azure', 'cloudflare',
  'digitalocean', 'linode', 'heroku', 'vercel', 'netlify',
  'grafana', 'prometheus', 'datadog', 'sentry',
  // 协议 / API 范式
  'graphql', 'rest', 'grpc', 'websocket', 'trpc', 'openapi',
  'protobuf', 'apollo', 'relay',
  // 中文
  '技术栈', '技术选型', '框架', '依赖', '技术方案',
  '开发语言', '前端', '后端', '数据库', '中间件',
  '开发工具', '技术架构', '核心技术',
];

const TECH_SECTION_TITLES = [
  'tech stack', 'technology', 'technologies', 'built with',
  'stack', 'dependencies', 'prerequisites', 'powered by',
  'tools', 'tooling', 'development stack',
  '技术栈', '技术选型', '技术方案', '依赖',
  '开发语言', '技术架构', '核心技术', '开发工具',
];

// ============================================================
// 项目结构说明 — 关键词 & 章节标题
// ============================================================

const STRUCTURE_KEYWORDS = [
  // 英文章节
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'code structure', 'code organization',
  'monorepo', 'workspace', 'packages/',
  // 通用目录
  'src/', 'lib/', 'dist/', 'build/', 'public/', 'assets/',
  'components/', 'utils/', 'api/', 'pages/', 'modules/',
  'core/', 'services/', 'hooks/', 'store/', 'types/', 'config/',
  'tests/', 'docs/', 'examples/', 'scripts/', 'tools/',
  // 框架特定目录
  'app/', 'routes/', 'middleware/', 'controllers/', 'models/',
  'views/', 'templates/', 'layouts/', 'static/', 'migrations/',
  // 目录树符号
  '├', '└', '│', '──', '├──', '└──', '───',
  // 中文
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块说明', '目录说明', '源码结构',
  '工程结构', '代码目录',
];

const STRUCTURE_SECTION_TITLES = [
  'project structure', 'directory structure', 'folder structure',
  'architecture', 'structure', 'organization', 'packages',
  'codebase', 'repository layout',
  '项目结构', '目录结构', '文件结构', '架构',
  '代码组织', '模块', '目录', '工程结构',
];

// ============================================================
// 部署说明 — 关键词 & 章节标题
// ============================================================

const DEPLOY_KEYWORDS = [
  // 通用
  'deploy', 'deployment', 'deploying', 'production',
  'release', 'releasing', 'publish', 'publishing',
  // 容器 / 编排
  'docker', 'dockerfile', 'docker-compose', 'docker compose',
  'kubernetes', 'k8s', 'helm', 'containerd', 'podman',
  // 平台
  'vercel', 'netlify', 'heroku', 'railway', 'render', 'fly.io',
  'aws', 'gcp', 'google cloud', 'azure', 'cloudflare',
  'digitalocean', 'linode', 'deno deploy', 'cloudflare pages',
  'github pages', 'gitlab pages',
  // Web 服务器
  'nginx', 'apache', 'caddy', 'traefik', 'haproxy',
  // 进程管理
  'pm2', 'supervisor', 'systemd', 'screen', 'tmux',
  // CI/CD
  'ci/cd', 'ci', 'cd', 'continuous integration', 'continuous deployment',
  'github actions', 'gitlab ci', 'circleci', 'travis', 'jenkins',
  // 配置
  'environment variables', 'env', '.env', 'secrets', 'config',
  'ssl', 'tls', 'https', 'domain', 'dns', 'cdn',
  // 中文
  '部署', '发布', '上线', '生产环境', '运维',
  '服务器', '云服务', '容器', '编排', '配置',
];

const DEPLOY_SECTION_TITLES = [
  'deploy', 'deployment', 'deploying', 'production',
  'release', 'releasing', 'publishing', 'hosting',
  'going live', 'go live',
  '部署', '发布', '上线', '生产环境', '托管', '运维',
];

// ============================================================
// 工具函数
// ============================================================

/** 统计所有关键词的命中总次数（大小写不敏感，允许重叠） */
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

function findMatchedKeywords(content: string, keywords: string[]): string[] {
  const lower = content.toLowerCase();
  const matched: string[] = [];
  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
    if (matched.length >= 5) break;
  }
  return matched;
}

/** 检查 markdown 标题行是否命中章节特征词 */
function findMatchedSection(content: string, sectionKeywords: string[]): string | null {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1].trim();
    const lowerHeading = heading.toLowerCase();
    for (const kw of sectionKeywords) {
      if (lowerHeading.includes(kw.toLowerCase())) return heading;
    }
  }
  return null;
}

/** 围栏式（```）或缩进式（4 空格 / 1 tab）代码块 */
function hasCodeBlock(content: string): boolean {
  return /```[\s\S]*?```/m.test(content) ||
    /(?:^|\n)( {4}|\t)[^\n]+(?:\n(?: {4}|\t)[^\n]+)*/m.test(content);
}

/** 章节数量 ≥ 3 → README 有基本组织结构 */
function hasRichSections(content: string): boolean {
  const headings = content.match(/^#{1,6}\s+/gm);
  return headings !== null && headings.length >= 3;
}

/** 无序列表（- / * / + 开头行） */
function hasBulletList(content: string): boolean {
  return /^[\t ]*[-*+]\s+/m.test(content);
}

/** 外部链接 [text](https://...) */
function hasExternalLinks(content: string): boolean {
  return /\[.*?\]\(https?:\/\/.+?\)/.test(content);
}

/** 版本号（如 1.2、3.10、18.x）——表示具体而非模糊的信息 */
function hasVersionInfo(content: string): boolean {
  return /\b\d+\.\d+(?:\.\d+)?\b/.test(content);
}

interface DimensionAnalysis {
  status: CheckStatus;
  reason: string;
  evidence: string[];
}

// ============================================================
// 启发式判定（3 态，PRD §5.3.2）
//
// 信号层级（由强到弱）：
//   强信号：命中相关章节标题 —— 作者有意识地组织了该维度内容
//   中信号：代码块 / 外链 / 列表 / 版本号 / 丰富章节结构
//   弱信号：关键词命中数（可能只是碰巧出现）
//
// 判定规则：
//   pass:    章节标题命中
//         OR 关键词 ≥ 5
//         OR 关键词 ≥ 3 AND 中信号 ≥ 1
//         OR 关键词 ≥ 2 AND 中信号 ≥ 2
//   partial: 关键词 ≥ 1，但不满足 pass
//   fail:    关键词 0 次
// ============================================================

function analyzeDimension(
  label: string,
  content: string,
  keywords: string[],
  sectionKeywords: string[],
): DimensionAnalysis {
  if (!content || content.trim().length === 0) {
    return {
      status: 'fail',
      reason: `README 为空，无法判断是否包含${label}。`,
      evidence: ['README 内容为空或未读取到内容'],
    };
  }

  const keywordHits = countKeywordHits(content, keywords);
  const matchedKeywords = findMatchedKeywords(content, keywords);
  const matchedSection = findMatchedSection(content, sectionKeywords);
  const midSignals = [
    hasCodeBlock(content) ? '包含代码块' : '',
    hasExternalLinks(content) ? '包含外部链接' : '',
    hasBulletList(content) ? '包含列表结构' : '',
    hasVersionInfo(content) ? '包含版本号' : '',
    hasRichSections(content) ? 'README 章节数量较丰富' : '',
  ].filter(Boolean);

  const evidence = [
    matchedSection ? `命中章节：${matchedSection}` : '',
    matchedKeywords.length > 0 ? `命中关键词：${matchedKeywords.join('、')}` : '',
    keywordHits > 0 ? `关键词命中次数：${keywordHits}` : '',
    ...midSignals.slice(0, 3),
  ].filter(Boolean);

  if (keywordHits === 0) {
    return {
      status: 'fail',
      reason: `README 未检测到明显的${label}内容。`,
      evidence: [`未命中${label}相关章节或关键词`],
    };
  }

  if (matchedSection) {
    return {
      status: 'pass',
      reason: `README 中存在与${label}相关的章节，信息入口比较清楚。`,
      evidence,
    };
  }

  if (keywordHits >= 5) {
    return {
      status: 'pass',
      reason: `README 多次提到${label}相关内容，覆盖度较高。`,
      evidence,
    };
  }

  if (keywordHits >= 3 && midSignals.length >= 1) {
    return {
      status: 'pass',
      reason: `README 同时包含${label}关键词和辅助信号，说明较充分。`,
      evidence,
    };
  }

  if (keywordHits >= 2 && midSignals.length >= 2) {
    return {
      status: 'pass',
      reason: `README 中的${label}内容有关键词和多项结构化信号支撑。`,
      evidence,
    };
  }

  return {
    status: 'partial',
    reason: `README 提到了${label}，但缺少清晰章节、步骤或足够上下文。`,
    evidence,
  };
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
  reason: string,
  evidence: string[],
): CheckItem {
  return {
    name,
    category: 'readme',
    status,
    score: contentScore(status, maxScore),
    maxScore,
    reason,
    evidence,
  };
}

// ============================================================
// 评分检测项（4 项，共 40 分）—— PRD §5.4.1
// ============================================================

export function checkRunInstructions(readmeContent: string): CheckItem {
  const analysis = analyzeDimension('运行说明', readmeContent, RUN_KEYWORDS, RUN_SECTION_TITLES);
  return makeResult('运行说明', analysis.status, 15, analysis.reason, analysis.evidence);
}

export function checkTechStack(readmeContent: string): CheckItem {
  const analysis = analyzeDimension('技术栈说明', readmeContent, TECH_STACK_KEYWORDS, TECH_SECTION_TITLES);
  return makeResult('技术栈说明', analysis.status, 10, analysis.reason, analysis.evidence);
}

export function checkProjectStructure(readmeContent: string): CheckItem {
  const analysis = analyzeDimension('项目结构说明', readmeContent, STRUCTURE_KEYWORDS, STRUCTURE_SECTION_TITLES);
  return makeResult('项目结构说明', analysis.status, 10, analysis.reason, analysis.evidence);
}

export function checkDeployInstructions(readmeContent: string): CheckItem {
  const analysis = analyzeDimension('部署说明', readmeContent, DEPLOY_KEYWORDS, DEPLOY_SECTION_TITLES);
  return makeResult('部署说明', analysis.status, 5, analysis.reason, analysis.evidence);
}

// ============================================================
// 补充检测项（2 项，不计分）—— PRD §5.3.2
// ============================================================

/** 截图/演示：检测 Markdown 图片语法或 <img> 标签 */
export function checkScreenshots(readmeContent: string): CheckItem {
  const content = (readmeContent ?? '').trim();
  if (content.length === 0) {
    return makeResult(
      '截图/演示',
      'fail',
      0,
      'README 为空，无法检测截图或演示内容。',
      ['README 内容为空或未读取到内容'],
    );
  }

  const hasMarkdownImage = /!\[.*?\]\(.+?\)/.test(content);
  const hasHtmlImage = /<img\s/i.test(content);
  const hasImage = hasMarkdownImage || hasHtmlImage;
  return makeResult(
    '截图/演示',
    hasImage ? 'pass' : 'fail',
    0,
    hasImage
      ? 'README 中包含图片语法或 img 标签，能帮助用户直观看到项目效果。'
      : 'README 未检测到 Markdown 图片或 HTML img 标签，缺少直观演示材料。',
    hasImage
      ? [
          hasMarkdownImage ? '命中 Markdown 图片语法' : '',
          hasHtmlImage ? '命中 HTML img 标签' : '',
        ].filter(Boolean)
      : ['期望格式：![描述](图片链接) 或 <img src="...">'],
  );
}

/**
 * 使用说明：整体内容丰富度（PRD §5.3.2）
 *
 * 综合 5 个量化指标：
 *   - 总长度：内容越多信息量越大
 *   - 代码块数量：代码块多 = 有示例
 *   - 标题数量：标题多 = 组织有序
 *   - 外链数量：链接多 = 引用了外部文档
 *   - 列表项数量：列表多 = 结构化信息
 *
 * pass:    长度 ≥ 1500 OR (代码块 ≥ 3 AND 标题 ≥ 4) OR (标题 ≥ 3 AND 列表 ≥ 5)
 * partial: 长度 ≥ 500  OR (代码块 ≥ 1 AND 标题 ≥ 2)
 * fail:    内容过于简短
 */
export function checkUsageInstructions(readmeContent: string): CheckItem {
  const content = (readmeContent ?? '').trim();
  if (content.length === 0) {
    return makeResult(
      '使用说明',
      'fail',
      0,
      'README 为空，无法判断是否包含完整使用说明。',
      ['README 内容为空或未读取到内容'],
    );
  }

  const totalLength = content.length;
  const codeBlockCount = (content.match(/```[\s\S]*?```/gm) || []).length;
  const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
  const linkCount = (content.match(/\[.*?\]\(https?:\/\/.+?\)/g) || []).length;
  const listItemCount = (content.match(/^[\t ]*[-*+]\s+/gm) || []).length;

  let status: CheckStatus;
  if (
    totalLength >= 1500 ||
    (codeBlockCount >= 3 && headingCount >= 4) ||
    (headingCount >= 3 && listItemCount >= 5) ||
    (headingCount >= 4 && linkCount >= 3)
  ) {
    status = 'pass';
  } else if (totalLength >= 500 || (codeBlockCount >= 1 && headingCount >= 2)) {
    status = 'partial';
  } else {
    status = 'fail';
  }

  return makeResult(
    '使用说明',
    status,
    0,
    status === 'pass'
      ? 'README 内容长度、章节、链接或代码示例较充分，具备较完整的使用说明。'
      : status === 'partial'
        ? 'README 有一定内容基础，但使用示例、配置说明或 API 说明还不够充分。'
        : 'README 内容较少，缺少足够的使用说明、示例或配置细节。',
    [
      `正文长度：${totalLength} 字符`,
      `代码块数量：${codeBlockCount}`,
      `标题数量：${headingCount}`,
      `外部链接数量：${linkCount}`,
      `列表项数量：${listItemCount}`,
    ],
  );
}

// ============================================================
// 批量执行
// ============================================================

export function runReadmeChecks(readmeContent: string | null | undefined): CheckItem[] {
  const content = (readmeContent ?? '').trim();

  if (content.length === 0) {
    return [
      makeResult('运行说明', 'fail', 15, 'README 为空，无法判断是否包含运行说明。', ['README 内容为空或未读取到内容']),
      makeResult('技术栈说明', 'fail', 10, 'README 为空，无法判断是否包含技术栈说明。', ['README 内容为空或未读取到内容']),
      makeResult('项目结构说明', 'fail', 10, 'README 为空，无法判断是否包含项目结构说明。', ['README 内容为空或未读取到内容']),
      makeResult('部署说明', 'fail', 5, 'README 为空，无法判断是否包含部署说明。', ['README 内容为空或未读取到内容']),
      makeResult('截图/演示', 'fail', 0, 'README 为空，无法检测截图或演示内容。', ['README 内容为空或未读取到内容']),
      makeResult('使用说明', 'fail', 0, 'README 为空，无法判断是否包含完整使用说明。', ['README 内容为空或未读取到内容']),
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
