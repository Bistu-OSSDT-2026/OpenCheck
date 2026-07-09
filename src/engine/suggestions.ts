// ============================================================
// R2 分析引擎层 — 改进建议生成
// 严格对齐 PRD_OpenCheck.md §5.5
//
// 每条建议遵循格式：做什么 + 为什么重要 + 怎么做（可操作）
// ============================================================

import type { CheckItem, Suggestion } from '@/types';

const TEMPLATES: Record<string, string> = {
  // ── 文件存在性（PRD §5.3.1）──

  'README.md':
    '建议在仓库根目录添加 README.md。README 是开源项目的第一印象——用户平均只用 60 秒判断项目是否值得深入了解。至少应包含：项目简介（这是什么）、快速开始（怎么用）、技术栈（用了什么）。',

  LICENSE:
    '建议添加开源许可证文件（推荐 LICENSE 或 LICENSE.md）。无许可证意味着代码在法律上"保留所有权利"，他人无权使用、修改或分发。MIT、Apache-2.0、GPL-3.0 是最常见的选择，可用 choosealicense.com 辅助决策。',

  '.gitignore':
    '建议添加 .gitignore 文件，避免将 node_modules/、.env、IDE 配置、编译产物等无关文件提交到仓库。GitHub 提供了 50+ 语言/框架的 .gitignore 模板，创建新仓库时可一键生成。',

  'CONTRIBUTING.md':
    '建议添加 CONTRIBUTING.md，写明：如何搭建开发环境、如何运行测试、PR 提交规范、代码风格要求。一份好的贡献指南能让第一次来的贡献者在 10 分钟内开始写代码，而非花 1 小时摸索环境。',

  'CHANGELOG.md':
    '建议添加 CHANGELOG.md，按版本号记录新增功能、Bug 修复和 Breaking Changes。推荐遵循 Keep a Changelog（keepachangelog.com）格式——它已成社区事实标准，用户和自动化工具都能解析。',

  '依赖声明文件':
    '建议添加依赖声明文件（如 package.json、go.mod、Cargo.toml、requirements.txt、pom.xml 等）。这能让协作者用一条命令安装全部依赖，而非逐个手动安装。',

  '.github/workflows/':
    '建议在 .github/workflows/ 目录下添加 CI/CD 工作流文件。哪怕只配一个"PR 提交时跑测试"的流程，也能大幅减少回归 Bug，提升协作效率。GitHub Actions 对公开仓库完全免费。',

  // ── README 内容（PRD §5.3.2）──

  '运行说明':
    '建议在 README 中补充"快速开始"或"Getting Started"章节。用代码块给出从零到运行的完整命令：git clone → 安装依赖 → 启动。每一步都应该是可直接复制的。如果有跨平台差异（Windows / macOS / Linux），分别注明。',

  '技术栈说明':
    '建议在 README 中单独列出"技术栈"或"Built With"章节。格式建议用表格或列表，包含语言、框架、数据库、关键工具。这能帮助潜在贡献者在 30 秒内判断"我有没有能力参与这个项目"。',

  '项目结构说明':
    '建议在 README 中用一个目录树（用 ├ └ │ ── 绘制）展示顶层目录结构，每个目录加一行注释说明用途。新贡献者最怕的就是"代码在哪我都不知道"——一个清晰的结构图能解决这个问题。',

  '部署说明':
    '建议在 README 中补充部署章节。至少包含：构建产物命令、环境变量列表、部署目标平台（Docker / Vercel / AWS 等）及大致步骤。即使只有一个 `docker build && docker run` 示例，也比什么都没有强得多。',

  '截图/演示':
    '建议在 README 中至少放一张截图或 GIF。文字描述功能，图片证明功能。对于有 UI 的项目，截图是说服用户尝试的最快方式。Markdown 语法：`![描述](图片URL)`。',

  '使用说明':
    '建议丰富 README 的内容深度：补充 API 文档链接、配置参数表格、常见问题（FAQ）、或更多代码示例。一个优秀的 README 应该让用户不读源码就能用起来——目前还差一些。',
};

export function generateSuggestions(checks: CheckItem[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  for (const check of checks) {
    if (check.status !== 'pass') {
      const content = TEMPLATES[check.name] ?? `建议完善「${check.name}」相关内容。`;
      suggestions.push({ checkName: check.name, content });
    }
  }
  return suggestions;
}
