# OpenCheck

OpenCheck 是一个面向开源项目维护者的纯前端体检工具。用户输入 GitHub 仓库地址后，系统会读取仓库信息，检查 README、LICENSE、项目结构、运行说明等开源规范项，并生成评分、建议和 Markdown 报告。

## 当前开发状态

当前 `main` 已包含 R3 交付的项目地基：

- React + TypeScript + Vite 脚手架
- 5 个页面路由和 `ROUTE` 常量
- 7 个共享组件
- 最近一次检测结果缓存
- 跨角色类型骨架
- 给 AI Agent 使用的协作说明

各成员后续应从最新 `main` 拉取代码，再创建自己的功能分支开发。

## 如何运行

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

看到 `built in ...` 且没有报错，即表示构建通过。

## 分支协作流程

所有成员不要直接往 `main` 上传代码。统一流程如下：

```bash
git switch main
git pull origin main
git switch -c r1-api
# 开发并提交
git add <files>
git commit -m "feat: 完成 xxx"
git push -u origin r1-api
```

然后在 GitHub 上创建 Pull Request：

```text
base: main
compare: 自己的功能分支
```

PR 检查通过后，再由组长或负责人合并到 `main`。

## 推荐分支命名

| 角色 | 建议分支 | 负责内容 |
|------|----------|----------|
| R1 | `r1-api` | URL 解析、GitHub API、Token 存储 |
| R2 | `r2-engine` | 检测规则、评分、建议、Markdown 报告、大模型辅助分析接口 |
| R4 | `r4-main-flow` | 首页、检测结果页、主流程集成 |
| R5 | `r5-report-history-token` | 报告页、历史页、Token 页、历史存储 |

R3 已完成并合并：脚手架、路由、共享组件、结果缓存。

## 大模型接口归属

如果项目接入大模型辅助开源检查，大模型调用、Prompt 组织、AI 结果解析归 R2 负责。建议由 R2 在分析引擎层维护，例如：

```text
src/engine/aiReview.ts
```

不要把大模型请求写进 R3 的组件、路由或缓存里，也不要在前端代码中硬编码任何大模型 API Key。

## AI Agent 协作说明

给各成员 AI Agent 的快速定位文档在：

```text
docs/AI_AGENT_GUIDE.md
```

作用：

- 快速判断每个文件属于哪个角色
- 明确哪些接口可以调用、哪些文件不要越权修改
- 说明 R3 的共享组件、路由、结果缓存怎么用
- 说明大模型接口应由 R2 负责

使用 AI 开发前，建议先让 AI 读取 `README.md`、`docs/AI_AGENT_GUIDE.md` 和 `src/types/index.ts`。

## 重要规则

- 不要直接提交到 `main`。
- 不要提交 `node_modules/`、`dist/`、`.env`、`*.tsbuildinfo`。
- 页面跳转统一使用 `ROUTE`，不要手写路径字符串。
- 共享组件统一从 `@/components` 导入。
- 修改 `src/types/index.ts` 前，先确认会影响哪些成员。
