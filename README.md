# R3 协作说明

本分支是 `r3/scaffold-components`，用于交付 R3 的脚手架、路由、共享组件和结果缓存。

给各成员 AI Agent 的快速定位说明见：`docs/AI_AGENT_GUIDE.md`。该文档放在 `docs/` 下，作用是让其他成员的 AI Agent 快速判断代码归属、接口边界、优先阅读文件和禁止越权修改的内容。

本文档只说明 R3 如何与 R1/R2/R4/R5 配合。R3 不实现其他成员的业务逻辑，也不负责大模型接口。

## 大模型接口归属

如果项目后续需要大模型辅助开源检查，大模型调用、Prompt 组织、AI 分析结果结构化解析应由 R2 分析引擎层负责。

R3 只在必要时配合以下工作：

- 在 `src/types/index.ts` 中补充共享类型骨架。
- 在共享组件中提供展示 AI 分析结果所需的 UI 组件。
- 在文档中说明调用边界和数据流。

不要把大模型请求写进 R3 的组件、路由或 `resultCache` 中。前端直连大模型 API 也不要硬编码任何 API Key。

## R3 提供给全员的公共入口

| 能力 | 文件 | 使用方 |
|------|------|--------|
| 路由常量 | `src/router/routes.ts` | R4、R5 |
| 通用组件统一导出 | `src/components/index.ts` | R4、R5 |
| 最近一次检测结果缓存 | `src/store/resultCache.ts` | R4 写入，R5 读取 |
| 共享类型骨架 | `src/types/index.ts` | R1、R2、R4、R5 |

所有页面跳转优先使用 `ROUTE`，不要在页面里手写 `/result`、`/report`、`/history`、`/token`。

## R4 如何使用 R3

R4 负责首页、结果页和完整检测流程。R3 提供以下能力：

| R3 接口 | R4 用法 |
|---------|---------|
| `PageLayout` | 包裹首页和结果页 |
| `ScoreDisplay` | 展示总分和等级 |
| `StatusIcon` | 展示 9 项检测的 `pass` / `partial` / `fail` 状态 |
| `LevelTag` | 展示评分等级标签 |
| `LoadingState` | 展示检测中的加载态 |
| `ErrorState` | 展示网络、仓库不存在、私有仓库、限流等错误 |
| `ROUTE` | 页面跳转 |
| `setLastResult(result)` | 跳转报告页前写入最近一次检测结果 |

推荐流程：

```ts
import { ROUTE } from '@/router/routes'
import { setLastResult } from '@/store/resultCache'

setLastResult(result)
navigate(ROUTE.REPORT)
```

## R5 如何使用 R3

R5 负责报告页、历史页、Token 页和历史记录存储。R3 提供以下能力：

| R3 接口 | R5 用法 |
|---------|---------|
| `PageLayout` | 包裹报告页、历史页、Token 页 |
| `EmptyState` | 展示无报告、无历史记录等空状态 |
| `LevelTag` | 展示历史记录里的等级 |
| `ROUTE` | 页面跳转 |
| `getLastResult()` | 报告页读取最近一次检测结果 |
| `clearLastResult()` | 必要时清除最近一次检测结果 |

报告页读取方式：

```ts
import { getLastResult } from '@/store/resultCache'

const result = getLastResult()
```

如果 `result` 为 `null`，说明用户直接进入报告页或缓存不可用，页面应展示空状态并引导用户先检测。

## R1 如何与 R3 对齐

R1 负责 `src/api/index.ts`，R3 只保留占位导出和类型骨架。

R1 接手时应保持这些导出名不变：

```ts
parseRepoUrl(raw)
fetchRepo(owner, repo, token?)
getToken()
saveToken(token)
```

R1 如需修改 `GithubData`、`RepoInfo`、`FileItem`、`ApiError` 字段，请同步通知 R2/R4/R5，因为这些类型会被后续模块消费。

## R2 如何与 R3 对齐

R2 负责 `src/engine/index.ts`，R3 只保留 `analyze` 和 `MOCK_ANALYSIS_RESULT` 的占位。

R2 接手时应保持这些导出名不变：

```ts
analyze(githubData)
MOCK_ANALYSIS_RESULT
```

R2 产出的 `AnalysisResult.report` 是完整 Markdown 字符串，R5 报告页只读取并展示该字段，不重新生成报告。

如果接入大模型辅助检查，建议由 R2 在分析引擎层新增独立模块，例如 `src/engine/aiReview.ts`。R2 负责定义输入输出、调用大模型、把 AI 结果并入 `AnalysisResult` 或报告内容。R3 不直接调用大模型服务。

## 共享类型改动规则

`src/types/index.ts` 是跨角色契约文件。修改前先确认影响范围：

| 类型 | 主要所有者 | 主要读取方 |
|------|------------|------------|
| `GithubData` / `RepoInfo` / `FileItem` / `ApiError` | R1 | R2、R4 |
| `AnalysisResult` / `CheckItem` / `ScoreInfo` / `Suggestion` | R2 | R4、R5 |
| `HistoryRecord` / `CheckSummaryItem` | R5 | R5 |

字段名、状态枚举、存储 key、导出函数名都不要单方面修改。确实要改时，先在群里说明影响到哪些角色。

## 存储槽位约定

| 角色 | 用途 | key |
|------|------|-----|
| R1 | GitHub Token | `opencheck_token` |
| R3 | 最近一次检测结果缓存 | `opencheck_last_result` |
| R5 | 历史记录 | `opencheck_history` |

R3 的结果缓存使用 `sessionStorage`，只服务报告页临时读取；历史记录仍由 R5 负责。
