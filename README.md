<div align="center">

<img src="public/favicon.svg" alt="OpenCheck" width="120" />

# OpenCheck

### 开源项目体检助手（纯前端 MVP）

[![License](https://img.shields.io/badge/license-GPL--3.0-green?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Bistu-OSSDT-2026/OpenCheck?style=flat-square&color=blue)](https://github.com/Bistu-OSSDT-2026/OpenCheck/releases)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=111)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

[**本地运行**](#本地运行) · [**Issues**](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues) · [**Pull Requests**](https://github.com/Bistu-OSSDT-2026/OpenCheck/pulls)

</div>

## 项目说明

OpenCheck 是一个面向开源课程实践的小型真实项目。它不追求代码规模、功能数量或技术栈复杂度，而是通过一个可运行的纯前端 MVP，让团队完整体验开源协作流程：确定目标、拆分 Issue、分支开发、提交 Pull Request、由其他成员 Review、测试并合并。

输入 GitHub 公开仓库地址后，OpenCheck 会检查项目文档和开源规范完整度，生成 0-100 分评分、等级说明、改进建议和可复制的 Markdown 体检报告。

## MVP 功能

| 功能 | 说明 |
|---|---|
| GitHub 仓库分析 | 读取公开仓库基础信息、根目录文件和 README 内容 |
| 开源规范检查 | 检查 README、LICENSE、`.gitignore`、CONTRIBUTING、CHANGELOG、依赖文件、GitHub Actions 等关键项 |
| README 内容分析 | 检查运行说明、技术栈、项目结构、部署说明、截图/演示和使用说明 |
| 自动评分 | 输出总分、等级标签、每项规则命中情况和扣分原因 |
| 改进建议 | 针对缺失或不完整内容给出可操作建议 |
| Markdown 报告 | 生成可复制的体检报告，便于团队复盘或课程提交 |
| 历史对比 | 使用浏览器本地存储保存检测历史，展示同一仓库前后变化 |
| GitHub Token | 用户可选填写 Token，提高 GitHub API 限流额度 |
| AI 辅助检查 | 用户可选填写 OpenAI 兼容接口配置，获取补充建议；未配置时使用默认规则系统 |
| 演示模式 | 内置示例数据，断网或 API 限流时也能展示完整流程 |

## 本地运行

### 前置要求

- Node.js 18 或更高版本
- npm 9 或更高版本
- Chrome、Edge、Firefox 等现代浏览器

### 安装与启动

```bash
npm ci
npm run dev
```

启动后访问终端显示的地址，通常是：

```text
http://127.0.0.1:5173/
```

Windows 用户也可以直接双击：

```text
start-opencheck.bat
```

该脚本会在缺少 `node_modules` 时自动执行 `npm ci`，并尽量固定使用 `http://127.0.0.1:5173/`，避免更换端口导致浏览器本地保存的 Token、AI 配置或历史记录读取不到。

### 构建检查

```bash
npm run build
```

看到构建完成且没有报错，即表示当前纯前端版本可以正常打包。

## 配置 GitHub Token / AI

GitHub Token 和 AI 辅助检查都是可选配置，不影响默认规则评分系统。

| 配置 | 用途 | 安全说明 |
|---|---|---|
| GitHub Token | 提高 GitHub API 限流额度 | 只保存在当前浏览器本地，不提交到仓库 |
| AI Base URL | 指向 OpenAI 兼容接口地址 | 用户自行填写，项目不提供默认代理 |
| AI Model | 指定 DeepSeek、豆包等兼容模型名称 | 仅用于补充建议 |
| AI API Key | 调用用户自己的模型服务 | 项目不内置、不托管、不上传任何 Key |

AI 辅助检查只补充建议，不改变默认评分。未填写 AI 配置、接口不可用或请求失败时，OpenCheck 会自动回退到默认规则检查结果。

## 团队协作流程

| 阶段 | 做法 |
|---|---|
| Issue | 在 GitHub Issues 中拆分任务，写清目标、范围和验收标准 |
| 分支 | 每个 Issue 使用独立分支开发，例如 `docs/issue-16-readme` |
| 修改 | 围绕 Issue 修改代码或文档，并在本地运行必要检查 |
| Pull Request | 提交 PR，并在描述中写 `Closes #Issue编号` |
| Review | 由其他成员 Review、测试并提出修改意见 |
| 合并 | Review 通过后合并 PR，对应 Issue 自动关闭 |
| 留痕 | 保留 Issue、PR、Review、提交记录和 Release 作为协作证据 |

> Issue 不要求每个人只能提交自己的。可以由负责人统一创建，再分配给成员；也可以由成员自己创建。关键是每项任务都有清晰的 Issue、分支、PR 和 Review 记录。

## 团队分工

| 角色 | 负责范围 |
|---|---|
| R1 产品与规则 | 项目目标、PRD、检查规则、评分口径 |
| R2 GitHub 数据 | 仓库地址解析、GitHub API、Token 配置 |
| R3 前端界面 | 页面路由、结果展示、历史记录、响应式体验 |
| R4 报告与文档 | Markdown 报告、README、贡献流程、协作材料 |
| R5 测试与发布 | 构建验证、最小单元测试、CI、Release 准备 |

实际开发中角色可以交叉协作，但建议每个 Issue 明确负责人和 Review 人。

## 项目结构

```text
OpenCheck/
├─ public/                 # favicon 等静态资源
├─ src/
│  ├─ api/                 # GitHub API、仓库地址解析、Token / AI 配置存储
│  ├─ components/          # 通用 UI 组件
│  ├─ engine/              # 检查规则、评分、建议、报告生成和 AI 辅助分析
│  ├─ pages/               # 首页、结果页、报告页、历史页、配置页
│  ├─ router/              # 路由常量
│  ├─ store/               # 检测结果缓存与历史记录
│  ├─ styles/              # 全局样式
│  ├─ types/               # 跨模块共享类型
│  └─ utils/               # 通用工具
├─ docs/                   # PRD、分工、接口契约和协作说明
├─ start-opencheck.bat     # Windows 本地启动脚本
└─ package.json            # 项目脚本和依赖
```

## 当前版本范围

`v0.1.0 MVP` 是源码和静态前端版本，不是桌面软件安装包。

- 仅支持 GitHub 公开仓库。
- 不包含后端数据库、账号系统或云端同步。
- 暂不支持 GitLab、Gitee、私有仓库完整检测。
- 暂不支持批量检测多个仓库。
- 检查结果基于启发式规则，不能替代人工 Review。
- AI 辅助建议依赖用户自行配置第三方模型接口。

## 相关文档

- [产品需求文档](docs/PRD_OpenCheck.md)
- [团队分工与开发计划](docs/WORK_DIVISION.md)
- [接口契约](docs/CONTRACTS.md)
- [AI Agent 协作指南](docs/AI_AGENT_GUIDE.md)
- [贡献指南](CONTRIBUTING.md)
- [验收报告](ACCEPTANCE_REPORT.md)

## License

[GNU General Public License v3.0](LICENSE)
