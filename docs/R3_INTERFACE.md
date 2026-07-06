# R3 接口说明

本文档说明 R3 提供给其他成员的路由、共享组件和结果缓存接口。R3 负责项目地基，不实现 R1/R2/R4/R5 的业务逻辑。

## 公共入口

| 能力 | 文件 | 使用方 |
|------|------|--------|
| 路由常量 | `src/router/routes.ts` | R4、R5 |
| 通用组件统一导出 | `src/components/index.ts` | R4、R5 |
| 最近一次检测结果缓存 | `src/store/resultCache.ts` | R4 写入，R5 读取 |
| 共享类型骨架 | `src/types/index.ts` | R1、R2、R4、R5 |

所有页面跳转优先使用 `ROUTE`，不要在页面里手写 `/result`、`/report`、`/history`、`/token`。

## 路由常量

```ts
import { ROUTE } from '@/router/routes'
```

当前路由：

- `ROUTE.HOME`
- `ROUTE.RESULT`
- `ROUTE.REPORT`
- `ROUTE.HISTORY`
- `ROUTE.TOKEN`

## 共享组件

```ts
import {
  PageLayout,
  ScoreDisplay,
  StatusIcon,
  LevelTag,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components'
```

组件 props 以对应组件文件中的 `Props` 类型为准。

| 组件 | 用途 | 主要使用方 |
|------|------|------------|
| `PageLayout` | 页面外层容器 | R4、R5 |
| `ScoreDisplay` | 总分和等级展示 | R4 |
| `StatusIcon` | 检测项状态图标 | R4 |
| `LevelTag` | 等级标签 | R4、R5 |
| `LoadingState` | 加载态 | R4、R5 |
| `ErrorState` | 错误态 | R4 |
| `EmptyState` | 空状态 | R5 |

## 结果缓存

```ts
import { setLastResult, getLastResult, clearLastResult } from '@/store/resultCache'
```

- R4 检测完成后写入：`setLastResult(result)`
- R5 报告页读取：`getLastResult()`
- 必要时清除：`clearLastResult()`

推荐流程：

```ts
setLastResult(result)
navigate(ROUTE.REPORT)
```

如果 `getLastResult()` 返回 `null`，说明用户直接进入报告页或缓存不可用，报告页应展示空状态并引导用户先检测。

## 与 R1 对齐

R1 负责 `src/api/index.ts`。R1 接手时应保持这些导出名不变：

```ts
parseRepoUrl(raw)
fetchRepo(owner, repo, token?)
getToken()
saveToken(token)
```

如果修改 `GithubData`、`RepoInfo`、`FileItem`、`ApiError` 字段，请同步通知 R2/R4/R5。

## 与 R2 对齐

R2 负责 `src/engine/index.ts`。R2 接手时应保持这些导出名不变：

```ts
analyze(githubData)
MOCK_ANALYSIS_RESULT
```

R2 产出的 `AnalysisResult.report` 是完整 Markdown 字符串，R5 报告页只读取并展示该字段，不重新生成报告。

如果接入大模型辅助检查，建议由 R2 在分析引擎层新增独立模块，例如：

```text
src/engine/aiReview.ts
```

R3 不直接调用大模型服务。

## 存储槽位约定

| 角色 | 用途 | key |
|------|------|-----|
| R1 | GitHub Token | `opencheck_token` |
| R3 | 最近一次检测结果缓存 | `opencheck_last_result` |
| R5 | 历史记录 | `opencheck_history` |

R3 的结果缓存使用 `sessionStorage`，只服务报告页临时读取；历史记录仍由 R5 负责。
