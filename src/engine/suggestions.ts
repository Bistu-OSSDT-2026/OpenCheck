// ============================================================
// R2 分析引擎层 — 改进建议生成
// ============================================================

import type { CheckItem, Suggestion } from '@/types';

/**
 * 建议模板映射
 * key 为检测项名称，value 为建议内容
 */
const SUGGESTION_TEMPLATES: Record<string, string> = {
  'README.md':
    '建议添加 README.md，说明项目用途、安装方式、运行方式和使用示例。README 是开源项目的"门面"，能让潜在用户和贡献者快速了解项目。',

  LICENSE:
    '建议添加开源许可证（如 MIT、Apache-2.0 或 GPL-3.0），明确他人使用、修改和分发代码的权限。GitHub 创建新仓库时可一键添加。',

  '运行说明':
    '建议在 README 中补充"快速开始"章节，包括：安装依赖的命令、启动项目的命令、以及访问地址（如有 Web 界面）。提供可复制的命令示例能大幅降低新用户的入门门槛。',

  '技术栈说明':
    '建议在 README 中列出项目使用的语言、框架、核心依赖和工具链。例如：使用 React + TypeScript + Vite 构建，后端使用 Express + PostgreSQL。这有助于贡献者快速判断自己是否具备参与能力。',

  '项目结构说明':
    '建议在 README 中补充目录结构说明，帮助贡献者快速理解代码组织。可用目录树（如 `src/`、`components/`、`utils/`、`api/`）加简短注释的方式呈现。',

  '.gitignore':
    '建议添加 .gitignore 文件，避免将编译产物、依赖目录（如 node_modules/）、IDE 配置文件、环境变量文件等提交到仓库。GitHub 提供了常用语言/框架的 .gitignore 模板可供参考。',

  'CONTRIBUTING.md':
    '建议添加贡献指南（CONTRIBUTING.md），说明如何提交 Issue、如何发起 Pull Request、代码风格要求、以及测试规范。清晰的贡献指南能有效降低外部贡献者的参与门槛。',

  '部署说明':
    '建议在 README 中补充部署流程，例如 Docker 部署步骤、Vercel/Netlify 一键部署、或传统服务器部署说明。包括环境变量配置、构建命令和启动命令。',

  'CHANGELOG.md':
    '建议添加更新日志（CHANGELOG.md），按版本记录新增功能、修复的 Bug 和 Breaking Changes。推荐遵循 Keep a Changelog 格式（keepachangelog.com），方便用户了解项目演进。',

  '依赖声明文件':
    '建议添加依赖声明文件（如 package.json、requirements.txt、go.mod、Cargo.toml 等），明确列出项目的依赖项和版本要求，方便他人快速搭建开发环境。',

  '.github/workflows/':
    '建议配置 CI/CD 工作流（.github/workflows/*.yml），自动化测试、构建、部署流程。GitHub Actions 提供了丰富的模板，可快速上手。',

  '截图/演示':
    '建议在 README 中添加项目截图或演示 GIF，让潜在用户在阅读文字前先直观了解项目的样子。可使用 `![描述](图片链接)` 语法嵌入图片。',

  '使用说明':
    '建议在 README 中补充更详细的使用说明，包括 API 文档、配置说明、示例代码等。丰富的使用文档能降低新用户的上手难度。',
};

/**
 * 根据检测结果列表生成改进建议
 *
 * 规则：
 * - 只要检测项的 status 不是 'pass'，就生成一条建议
 * - 如果所有项都 pass，返回空数组
 *
 * @param checks 检测结果列表
 * @returns 建议列表（仅包含未通过或部分通过的项）
 */
export function generateSuggestions(checks: CheckItem[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const check of checks) {
    if (check.status !== 'pass') {
      const template = SUGGESTION_TEMPLATES[check.name];
      suggestions.push({
        checkName: check.name,
        content: template ?? `建议完善「${check.name}」相关内容。`,
      });
    }
  }

  return suggestions;
}
