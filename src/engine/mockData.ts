// ============================================================
// R2 分析引擎层 — Mock 数据（用于开发和测试）
// ============================================================

import type { GithubData, AnalysisResult } from '@/types';
import { analyze } from './analyze';

/**
 * Mock GitHub 仓库数据
 *
 * 以 facebook/react 为参考构造的示例数据，不需要真实调用 GitHub API。
 * 文件列表包含了一个"较完整"的开源项目应有的典型文件，
 * README 内容覆盖了运行说明、技术栈说明、项目结构说明。
 */
export const mockGithubData: GithubData = {
  repoInfo: {
    owner: 'facebook',
    repo: 'react',
    fullName: 'facebook/react',
    description:
      'The library for web and native user interfaces. A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    language: 'JavaScript',
    stars: 232000,
    forks: 47600,
    createdAt: '2013-05-24T00:00:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
    defaultBranch: 'main',
    license: 'MIT',
  },

  fileList: [
    { name: '.editorconfig', path: '.editorconfig', type: 'file' },
    { name: '.github', path: '.github', type: 'dir' },
    { name: '.gitignore', path: '.gitignore', type: 'file' },
    { name: 'CHANGELOG.md', path: 'CHANGELOG.md', type: 'file' },
    { name: 'CODE_OF_CONDUCT.md', path: 'CODE_OF_CONDUCT.md', type: 'file' },
    { name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', type: 'file' },
    { name: 'LICENSE', path: 'LICENSE', type: 'file' },
    { name: 'README.md', path: 'README.md', type: 'file' },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'compiler', path: 'compiler', type: 'dir' },
    { name: 'fixtures', path: 'fixtures', type: 'dir' },
    { name: 'packages', path: 'packages', type: 'dir' },
    { name: 'scripts', path: 'scripts', type: 'dir' },
    { name: 'src', path: 'src', type: 'dir' },
  ],

  readmeContent: `# React

React is a JavaScript library for building user interfaces.

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/facebook/react.git
cd react

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start the development server
npm start
\`\`\`

## Tech Stack / Built With

- **JavaScript** — Core language
- **TypeScript** — Type definitions and Flow
- **React** — The library itself :)
- **Rollup** — Module bundler
- **Jest** — Testing framework
- **ESLint** — Code linting
- **Prettier** — Code formatting

## Project Structure

\`\`\`
react/
├── compiler/       # React Compiler (React Forget)
├── fixtures/       # Test fixtures
├── packages/       # React packages (react, react-dom, etc.)
│   ├── react/
│   ├── react-dom/
│   ├── react-reconciler/
│   └── ...
├── scripts/        # Build and CI scripts
│   ├── jest/
│   ├── rollup/
│   └── ...
└── src/            # Source code
\`\`\`

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct
and the process for submitting pull requests.

## Deployment / Release

React releases are published to npm. See the [release workflow](./scripts/release/README.md)
for details.

## Screenshots

![React DevTools](https://react.dev/images/home/dom_manipulation.png)

## License

React is [MIT licensed](./LICENSE).
`,
};

/**
 * Mock 分析结果
 *
 * 由 analyze(mockGithubData) 实时计算生成。
 * 提供给 R4/R5 在 R1/R2 真实联调前使用。
 *
 * 注意：每次导入时会重新计算，确保与 analyze() 逻辑保持同步。
 */
export const mockAnalysisResult: AnalysisResult = analyze(mockGithubData);
