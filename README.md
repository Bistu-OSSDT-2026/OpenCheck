# OpenCheck

OpenCheck 是一个面向开源项目维护者的纯前端体检助手。输入 GitHub 仓库地址后，它会检查项目的开源规范性，包括关键文件是否齐全、README 内容是否充分、项目结构是否清晰，并生成评分、改进建议和可复制的 Markdown 报告。

> 给开源项目做一次“体检”，告诉维护者哪里还不够好，以及下一步怎么改。

## Features

- **GitHub 仓库分析**：读取仓库基础信息、根目录文件和 README 内容。
- **开源规范检查**：检测 README、LICENSE、`.gitignore`、CONTRIBUTING、CHANGELOG 等关键项。
- **README 启发式分析**：检查运行说明、技术栈、项目结构、部署说明、截图/演示和使用说明。
- **自动评分与等级**：输出 0-100 总分，并给出“优秀 / 较完整 / 基本可用 / 需要完善”等级。
- **检测解释**：每个检测项展示判定原因和命中证据，方便理解为什么得分。
- **改进建议**：针对缺失或不完整项给出可操作的补充建议，并提供可复制模板。
- **Markdown 报告**：生成可复制、可下载的检测报告，方便留存或分享。
- **历史对比与 Token**：通过浏览器本地存储保存检测历史，重复检测同一仓库时展示分数和状态变化，并支持可选 GitHub Token。

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- React Markdown

## Quick Start

Windows 一键启动：

```text
双击 start-opencheck.bat
```

脚本会在缺少 `node_modules` 时自动执行 `npm ci`，然后固定使用 `http://127.0.0.1:5173/` 启动本地开发环境并打开浏览器。

如果该地址已经有 OpenCheck 开发服务在运行，脚本会直接打开已有页面，避免因为端口变化导致浏览器 localStorage 中的 Token 或历史记录读不到。

安装依赖：

```bash
npm ci
```

启动本地开发环境：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

看到 `built in ...` 且没有报错，即表示构建通过。

## Project Structure

```text
src/
├── api/          # GitHub 数据获取与 Token 相关逻辑
├── engine/       # 检测规则、评分、建议和报告生成
├── pages/        # 首页、结果页、报告页、历史页、Token 页
├── components/   # 共享 UI 组件
├── router/       # 路由常量
├── store/        # 结果缓存与历史存储
├── styles/       # 全局样式
├── types/        # 跨模块共享类型
└── utils/        # 通用工具目录
```

## Documentation

项目协作文档集中放在 `docs/`：

```text
docs/AI_AGENT_GUIDE.md
docs/PRD_OpenCheck.md
docs/WORK_DIVISION.md
docs/CONTRACTS.md
docs/notes/R3/R3_INTERFACE.md
```

- `docs/AI_AGENT_GUIDE.md`：给各成员 AI Agent 使用的快速定位说明。
- `docs/PRD_OpenCheck.md`：产品需求和 MVP 范围。
- `docs/WORK_DIVISION.md`：5 人分工与 5 日开发计划。
- `docs/CONTRACTS.md`：跨角色共享契约和当前技术规格。
- `docs/notes/R3/R3_INTERFACE.md`：R3 的路由、共享组件和结果缓存个人接口备注。

## Scope

当前版本聚焦 GitHub 公开仓库的开源规范自查。MVP 阶段不包含用户账号、服务端数据库、云端同步、多仓库批量检测或自动修复。

如果后续接入大模型辅助开源检查，大模型调用、Prompt 组织和 AI 结果解析归分析引擎层负责；不要在前端代码中硬编码任何大模型 API Key。
