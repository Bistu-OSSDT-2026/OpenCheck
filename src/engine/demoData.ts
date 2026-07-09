// ============================================================
// 本地演示样例 —— 不请求 GitHub API，用于稳定演示完整流程
// ============================================================

import type { GithubData } from '@/types';
import { analyze } from './analyze';

const highScoreData: GithubData = {
  repoInfo: {
    owner: 'opencheck-demo',
    repo: 'well-documented-app',
    fullName: 'opencheck-demo/well-documented-app',
    description: '文档完整、协作规范清楚的高分示例项目。',
    language: 'TypeScript',
    stars: 1280,
    forks: 168,
    createdAt: '2025-02-12T08:00:00Z',
    updatedAt: '2026-07-08T10:30:00Z',
    defaultBranch: 'main',
    license: 'MIT',
  },
  fileList: [
    { name: 'README.md', path: 'README.md', type: 'file' },
    { name: 'LICENSE', path: 'LICENSE', type: 'file' },
    { name: '.gitignore', path: '.gitignore', type: 'file' },
    { name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', type: 'file' },
    { name: 'CHANGELOG.md', path: 'CHANGELOG.md', type: 'file' },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: '.github', path: '.github', type: 'dir' },
    { name: 'src', path: 'src', type: 'dir' },
  ],
  readmeContent: `# Well Documented App

一个用于展示 OpenCheck 高分结果的示例项目。

## Quick Start

\`\`\`bash
npm install
npm run dev
npm run build
\`\`\`

## Tech Stack

- React
- TypeScript
- Vite
- React Router

## Project Structure

\`\`\`text
src/
├── api/
├── components/
├── engine/
├── pages/
└── styles/
\`\`\`

## Usage

输入仓库地址后，系统会读取公开仓库信息、执行检测规则并生成报告。

## Deployment

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Screenshots

![demo](./docs/demo.png)
`,
};

const mediumScoreData: GithubData = {
  repoInfo: {
    owner: 'opencheck-demo',
    repo: 'almost-ready-lib',
    fullName: 'opencheck-demo/almost-ready-lib',
    description: '基础文件齐全，但 README 还需要补充结构和部署说明的中等示例。',
    language: 'JavaScript',
    stars: 240,
    forks: 36,
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2026-07-05T09:10:00Z',
    defaultBranch: 'main',
    license: 'Apache-2.0',
  },
  fileList: [
    { name: 'README.md', path: 'README.md', type: 'file' },
    { name: 'LICENSE', path: 'LICENSE', type: 'file' },
    { name: '.gitignore', path: '.gitignore', type: 'file' },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'src', path: 'src', type: 'dir' },
  ],
  readmeContent: `# Almost Ready Lib

一个轻量 JavaScript 工具库。

## Install

\`\`\`bash
npm install almost-ready-lib
\`\`\`

## Usage

\`\`\`js
import { run } from 'almost-ready-lib'

run()
\`\`\`

Built with JavaScript and Vite.
`,
};

const lowScoreData: GithubData = {
  repoInfo: {
    owner: 'opencheck-demo',
    repo: 'bare-repo',
    fullName: 'opencheck-demo/bare-repo',
    description: '缺少关键开源协作文件的待完善示例。',
    language: 'Python',
    stars: 12,
    forks: 1,
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-07-02T18:00:00Z',
    defaultBranch: 'main',
    license: '',
  },
  fileList: [
    { name: 'main.py', path: 'main.py', type: 'file' },
    { name: 'src', path: 'src', type: 'dir' },
  ],
  readmeContent: '',
};

export const DEMO_RESULTS = [
  {
    id: 'high',
    label: '高分项目',
    description: '文件齐全、README 覆盖运行、结构、部署和截图。',
    repoUrl: 'opencheck-demo/well-documented-app',
    result: analyze(highScoreData),
  },
  {
    id: 'medium',
    label: '中等项目',
    description: '基础说明可用，但协作文件、部署和结构说明不足。',
    repoUrl: 'opencheck-demo/almost-ready-lib',
    result: analyze(mediumScoreData),
  },
  {
    id: 'low',
    label: '待完善项目',
    description: '缺少 README、许可证和多数协作说明，适合展示改进建议。',
    repoUrl: 'opencheck-demo/bare-repo',
    result: analyze(lowScoreData),
  },
] as const;
