# AI Agent 快速定位说明

本文档给各成员使用的 AI Agent 读取，目的是快速定位代码归属、接口边界和优先阅读文件。

## 启动前先读

1. `README.md`：确认项目定位、运行方式和文档入口。
2. `docs/AI_AGENT_GUIDE.md`：确认角色边界和文件位置。
3. `docs/notes/R3/R3_INTERFACE.md`：如果要调用 R3 的路由、组件或缓存，先读这里。
4. `src/types/index.ts`：跨角色类型契约，改动前必须确认影响范围。

## 目录归属

| 目录或文件 | 归属 | 说明 |
|------------|------|------|
| `src/api/index.ts` | R1 | URL 解析、GitHub API、Token 读写 |
| `src/engine/index.ts` | R2 | 检测规则、评分、建议、Markdown 报告生成 |
| `src/engine/aiReview.ts` | R2 | 如需接入大模型，建议由 R2 新增并维护 |
| `src/router/routes.ts` | R3 | `ROUTE` 常量，详见 `docs/notes/R3/R3_INTERFACE.md` |
| `src/components/` | R3 | 共享 UI 组件，详见 `docs/notes/R3/R3_INTERFACE.md` |
| `src/store/resultCache.ts` | R3 | 最近一次检测结果缓存，详见 `docs/notes/R3/R3_INTERFACE.md` |
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
- 如需大模型辅助开源检查，由 R2 负责接口调用、Prompt 组织和 AI 结果解析；R3 不在组件、路由或缓存中直接调用大模型。
- 不要在前端代码中硬编码任何大模型 API Key。
- 不提交 `node_modules/`、`dist/`、`*.tsbuildinfo`、`.env` 等本地文件。

## 常用命令

```bash
npm install
npm run dev
npm run build
```

构建通过不代表业务完整，只说明当前 TypeScript 和 Vite 构建可用。

## 跨角色接口速查

R3 路由、共享组件和结果缓存接口已单独整理到：

```text
docs/notes/R3/R3_INTERFACE.md
```

其他成员调用 R3 能力前，优先读取该文档。

## 大模型接口边界

如果团队决定接入大模型辅助检查，推荐边界如下：

```ts
// 建议归 R2 维护，例如 src/engine/aiReview.ts
reviewWithLLM(input) => Promise<AiReviewResult>
```

R2 负责大模型请求、Prompt、结果解析和并入 `AnalysisResult`。R1 只负责 GitHub 数据获取，R3 只负责共享类型和展示组件，R4/R5 只消费最终分析结果。
