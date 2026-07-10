# OpenCheck v0.1.0 协作证据清单

**版本：** v0.1.0 MVP  
**整理日期：** 2026-07-10  
**关联 Issue：** [#18 process: 整理最终协作证据清单](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/18)

本文用于最终展示/验收时快速说明 OpenCheck 的 Issue、Pull Request、Review/复核、测试构建、Release 与 AI 辅助验证证据。

---

## 1. MVP 主要 Issue

| Issue | 类型 | 交付说明 |
|---|---|---|
| [#11 docs: 补充 CONTRIBUTING 协作指南](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/11) | docs / process | 补充贡献流程、分支、PR、Review 与提交规范 |
| [#12 test: 为核心纯函数补充最小单元测试](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/12) | test / acceptance | 为 URL 解析、GitHub API 映射、文件检测、评分等核心逻辑补测试 |
| [#13 ci: 添加 GitHub Actions 构建与测试检查](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/13) | ci / test | 增加 `npm test` 与 `npm run build` 的 CI 工作流 |
| [#14 docs: 添加 Issue 与 PR 模板](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/14) | docs / process | 固化 Issue、PR 描述模板，方便团队协作留痕 |
| [#15 acceptance: 按 PRD 复核 MVP 功能完成度](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/15) | acceptance | 形成 [ACCEPTANCE_REPORT.md](../ACCEPTANCE_REPORT.md)，逐项核对 MVP 功能 |
| [#16 docs: 更新 README 的课程实践与协作流程说明](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/16) | docs / process | 更新 README，补充运行方式、截图、协作流程与团队分工 |
| [#17 release: 准备并发布 v0.1.0 MVP 版本](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/17) | release / process | 发布 v0.1.0 Release，整理版本说明和验证结果 |
| [#18 process: 整理最终协作证据清单](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/18) | docs / process | 本文档集中整理最终协作证据 |

---

## 2. 成员代表性 PR

| 成员 | 角色/方向 | 代表性 PR | 作者 | 合并人 | 说明 |
|---|---|---|---|---|---|
| enmeihahaha | R1 数据获取层 | [#5 R1 数据获取层实现](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/5) | enmeihahaha | yyty947 | URL 解析、GitHub API、Token 存储、Mock 数据 |
| stevewang25 | R2 分析引擎层 | [#6 feat(engine): implement R2 analysis engine](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/6) | stevewang25 | yyty947 | 文件检测、README 分析、评分、建议、报告生成 |
| bistutzyy | R3 脚手架/路由/共享组件与文档 | [#1 chore: 合并 R3 脚手架、路由与共享组件](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/1) | bistutzyy | bistutzyy | 项目脚手架、路由、共享组件、结果缓存基础 |
| yyty947 | R4 主流程与增强闭环 | [#10 增强 OpenCheck 检测解释与演示闭环](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/10) | yyty947 | yyty947 | 检测解释、历史对比、演示模式、Token 额度检查 |
| bistusuhe | R5 报告/历史/Token 页 | [#7 feat(r5): 实现报告页、历史记录页、Token配置页与历史存储](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/7) | bistusuhe | yyty947 | 报告页、历史页、Token 页与历史 localStorage |

补充 PR：

- [#19 docs: 补充 CONTRIBUTING 协作指南](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/19)
- [#20 docs: 添加 Issue 与 PR 模板](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/20)
- [#21 feat: 添加可选 AI 辅助检查](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/21)
- [#22 docs: 更新 README 课程实践说明](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/22)
- [#23 test: 补充核心纯函数单元测试](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/23)
- [#24 ci: 添加构建与测试工作流](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/24)

---

## 3. Review / 复核说明

当前仓库没有留下 GitHub 原生 `Approve` Review 记录；因此最终说明不把“正式 GitHub Approve”作为证据来源，避免自审自合的表述不准确。

可审计的复核证据如下：

| 证据 | 说明 |
|---|---|
| PR 作者与合并人不同 | [#5](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/5)、[#6](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/6)、[#7](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/7) 均由成员提交、yyty947 合并，体现至少一轮非作者合并检查 |
| 验收报告 | [#15](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/15) 与 [ACCEPTANCE_REPORT.md](../ACCEPTANCE_REPORT.md) 由 stevewang25 按 PRD 逐项复核 MVP 功能 |
| 自动化检查 | [#13](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/13) / [#24](https://github.com/Bistu-OSSDT-2026/OpenCheck/pull/24) 增加 CI，在 push 与 PR 时运行测试和构建 |
| 文档流程 | [CONTRIBUTING.md](../CONTRIBUTING.md) 与 PR 模板要求后续 PR 写明关联 Issue、验证方式和 Review 关注点 |

后续如果继续迭代，建议在 GitHub 仓库设置中开启分支保护和 Required review，让后续 PR 留下正式 `Approve` 记录。

---

## 4. 测试与构建验证

本版本使用以下验证方式：

| 验证项 | 命令 / 证据 | 说明 |
|---|---|---|
| 单元测试 | `npm test` | Vitest 覆盖核心纯函数：URL 解析、API 错误映射、文件检测、评分等 |
| 构建检查 | `npm run build` | TypeScript `tsc --noEmit` + Vite build |
| CI | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | GitHub Actions 在 push / PR 到 `main` 时运行 `npm ci`、`npm test`、`npm run build` |
| 手动验收 | [ACCEPTANCE_REPORT.md](../ACCEPTANCE_REPORT.md) | 按 PRD 检查首页、结果页、报告页、历史页、Token 页、错误态和 CSS |

---

## 5. v0.1.0 Release

Release 页面：

- [v0.1.0 MVP](https://github.com/Bistu-OSSDT-2026/OpenCheck/releases/tag/v0.1.0)

Release notes 来源：

- [docs/RELEASE_NOTES_v0.1.0.md](RELEASE_NOTES_v0.1.0.md)

---

## 6. AI 工具辅助与人工验证说明

项目开发过程中使用了 AI 工具辅助生成部分代码、文档和 UI 调整。所有 AI 辅助内容均经过以下检查后进入最终版本：

- 由成员在本地运行页面或检查代码后提交；
- 关键纯函数补充了 Vitest 单元测试；
- 最终版本通过 `npm test` 和 `npm run build`；
- 验收报告按 PRD 逐项复核主要页面、数据流、错误态和报告能力；
- AI 辅助建议只作为可选功能展示，不改变默认规则评分。

---

## 7. 最终验收状态

| 项目 | 状态 |
|---|---|
| 主要 Issue 已列出 | 完成 |
| 每位成员至少一个代表性 PR | 完成 |
| Review / 复核方式已说明 | 完成 |
| 测试与构建方式已说明 | 完成 |
| v0.1.0 Release 链接 | 完成 |
| AI 辅助内容运行、检查和验证说明 | 完成 |
