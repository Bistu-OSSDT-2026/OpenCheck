/**
 * Mock 数据模块（R1 拥有 — 张恩）
 *
 * 提供一份硬编码的 GithubData，模拟 facebook/react 仓库的数据。
 * Day 1 必须交付，让 R2/R4 在 R1 真实 API 调通前就能用 Mock 开发。
 *
 * 读取方：R2、R4（通过 USE_MOCK 开关或直接导入使用）
 * 契约冻结日期：Day 1
 */

import type { GithubData } from '@/types'

/**
 * Mock GithubData — 基于 facebook/react 仓库的典型数据
 * R2 和 R4 在 Day 1-2 用这份 Mock 开发，Day 3 切换到真实 API
 */
export const MOCK_GITHUB_DATA: GithubData = {
  repoInfo: {
    owner: 'facebook',
    repo: 'react',
    fullName: 'facebook/react',
    description: 'The library for web and native user interfaces.',
    language: 'JavaScript',
    stars: 234000,
    forks: 48000,
    createdAt: '2013-05-24T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    defaultBranch: 'main',
    license: 'MIT',
  },

  fileList: [
    { name: '.eslintrc.js', path: '.eslintrc.js', type: 'file' },
    { name: '.gitattributes', path: '.gitattributes', type: 'file' },
    { name: '.github', path: '.github', type: 'dir' },
    { name: '.gitignore', path: '.gitignore', type: 'file' },
    { name: 'CHANGELOG.md', path: 'CHANGELOG.md', type: 'file' },
    { name: 'CODE_OF_CONDUCT.md', path: 'CODE_OF_CONDUCT.md', type: 'file' },
    { name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', type: 'file' },
    { name: 'LICENSE', path: 'LICENSE', type: 'file' },
    { name: 'README.md', path: 'README.md', type: 'file' },
    { name: 'SECURITY.md', path: 'SECURITY.md', type: 'file' },
    { name: 'babel.config.js', path: 'babel.config.js', type: 'file' },
    { name: 'compiler', path: 'compiler', type: 'dir' },
    { name: 'fixtures', path: 'fixtures', type: 'dir' },
    { name: 'packages', path: 'packages', type: 'dir' },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'scripts', path: 'scripts', type: 'dir' },
    { name: 'yarn.lock', path: 'yarn.lock', type: 'file' },
  ],

  readmeContent: `# React

[![CircleCI Status](https://circleci.com/gh/facebook/react.svg?style=shield)](https://circleci.com/gh/facebook/react)
[![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/react)

React is a JavaScript library for building user interfaces.

* **Declarative:** React makes it painless to create interactive UIs.
* **Component-Based:** Build encapsulated components that manage their own state.
* **Learn Once, Write Anywhere:** Develop new features without rewriting existing code.

## 📚 Documentation

See https://react.dev/

## 🚀 Quick Start

### Install

\`\`\`bash
npm install react react-dom
\`\`\`

### Run

\`\`\`bash
npm start
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

## 🛠 Tech Stack

- **JavaScript / TypeScript**
- **React** (obviously)
- **Flow** for type checking
- **Jest** for testing
- **Rollup** for bundling

## 📁 Project Structure

\`\`\`
react/
├── packages/          # Core packages
│   ├── react/         # React core
│   ├── react-dom/     # DOM renderer
│   └── react-reconciler/
├── compiler/          # React Compiler
├── scripts/           # Build and CI scripts
├── fixtures/          # Test fixtures
└── babel.config.js    # Babel configuration
\`\`\`

## 🚢 Deployment

React can be deployed to any static hosting:

\`\`\`bash
npm run build
# upload the build/ folder to your CDN or static server
\`\`\`

For production deployments, see our [deployment docs](https://react.dev/docs).

## 📸 Screenshots

![React DevTools](https://react.dev/images/home/dom_manipulation.png)

## 📄 License

React is [MIT licensed](./LICENSE).
`,
}

/**
 * 模拟网络延迟后返回 Mock 数据（用于测试加载态 UI）
 * @param delayMs 延迟毫秒数，默认 500ms
 */
export function fetchMockRepo(delayMs = 500): Promise<GithubData> {
  console.log(`[Mock] 模拟 API 请求，延迟 ${delayMs}ms…`)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Mock] 返回模拟数据')
      resolve(MOCK_GITHUB_DATA)
    }, delayMs)
  })
}
