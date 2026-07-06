# AI Agent 快速定位说明

本文档给各成员使用的 AI Agent 读取，目的是快速定位代码归属、接口边界和优先阅读文件。

## 启动前先读

1. `README.md`：确认当前分支和项目入口。
2. `docs/AI_AGENT_GUIDE.md`：确认角色边界和文件位置。
3. `docs/notes/R3/README.md`：如果要调用 R3 的路由、组件或缓存，先读这里。
4. `src/types/index.ts`：跨角色类型契约，改动前必须确认影响范围。

## 分支约定

- `main`：主分支，目前只放仓库说明，不直接开发。
- `r3/scaffold-components`：R3 脚手架、路由、共享组件和结果缓存分支。

其他成员应从自己的功能分支开发，不要直接把业务代码推到 `main`。

## 目录归属

| 目录或文件 | 归属 | 说明 |
|------------|------|------|
| `src/api/index.ts` | R1 | URL 解析、GitHub API、Token 读写 |
| `src/engine/index.ts` | R2 | 检测规则、评分、建议、Markdown 报告生成 |
| `src/router/routes.ts` | R3 | `ROUTE` 常量，所有页面跳转复用 |
| `src/components/` | R3 | 共享 UI 组件 |
| `src/store/resultCache.ts` | R3 | 最近一次检测结果缓存，R4 写、R5 读 |
| `src/pages/HomePage.tsx` | R4 | 首页 |
| `src/pages/ResultPage.tsx` | R4 | 检测结果页和主流程集成 |
| `src/pages/ReportPage.tsx` | R5 | Markdown 报告页 |
| `src/pages/HistoryPage.tsx` | R5 | 历史记录页 |
| `src/pages/TokenPage.tsx` | R5 | Token 配置页 |
| `src/store/history.ts` | R5 | 历史记录 localStorage 工具 |
| `src/types/index.ts` | 全员共享 | 类型契约，修改需同步相关成员 |

## Agent 修改规则

- 先确认当前分支，不要直接提交到 `main`。
- 只改自己角色负责的文件；如需改共享类型或 R3 公共接口，先说明影响范围。
- 页面跳转统一使用 `ROUTE`，不要手写路径字符串。
- 组件统一从 `@/components` 导入，避免绕过统一导出。
- R4 跳转报告页前调用 `setLastResult(result)`。
- R5 报告页通过 `getLastResult()` 读取报告数据。
- 不提交 `node_modules/`、`dist/`、`*.tsbuildinfo`、`.env` 等本地文件。

## 常用命令

```bash
npm install
npm run dev
npm run build
```

构建通过不代表业务完整，只说明当前 TypeScript 和 Vite 构建可用。

## 跨角色接口速查

### R3 路由

```ts
import { ROUTE } from '@/router/routes'
```

当前路由：

- `ROUTE.HOME`
- `ROUTE.RESULT`
- `ROUTE.REPORT`
- `ROUTE.HISTORY`
- `ROUTE.TOKEN`

### R3 结果缓存

```ts
import { setLastResult, getLastResult, clearLastResult } from '@/store/resultCache'
```

- R4 检测完成后写入：`setLastResult(result)`
- R5 报告页读取：`getLastResult()`
- 必要时清除：`clearLastResult()`

### R3 共享组件

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
