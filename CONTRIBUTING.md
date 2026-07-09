# OpenCheck 贡献指南

感谢你对 OpenCheck 的关注！本文档说明团队如何围绕 Issue、分支、Pull Request、Review 和测试开展协作。开始前请先阅读 [AGENTS.md](AGENTS.md) 了解本项目的整体规范。

## 目录

- [协作流程概览](#协作流程概览)
- [Issue 使用规范](#issue-使用规范)
- [分支管理](#分支管理)
- [Pull Request 规范](#pull-request-规范)
- [Review 要求](#review-要求)
- [本地开发与验证](#本地开发与验证)
- [代码风格约定](#代码风格约定)
- [角色与职责](#角色与职责)

---

## 协作流程概览

本项目采用基于 Issue 和 Pull Request 的标准开源协作流程：

```text
1. 创建或认领 Issue → 2. 基于 Issue 创建功能分支 → 3. 开发与自测
     ↓
4. 发起 Pull Request → 5. Code Review → 6. 合并到 main → 7. 关闭 Issue
```

每一步的具体要求和操作方式，见以下各节。

---

## Issue 使用规范

### 创建 Issue

任何任务、功能、Bug 修复或文档变更，都应先创建 Issue。Issue 是团队沟通和任务分配的最小单位。

创建 Issue 时，请尽量包含以下内容：

- **背景**：为什么要做这件事，解决什么问题
- **任务描述**：具体要做什么
- **验收标准**：做到什么程度算完成（用 `- [ ]` 勾选框列出）
- **建议负责人**：如果有推荐的人选，可以注明

标题建议使用前缀分类，与已有标签对应：

| 前缀 | 适用场景 |
|------|---------|
| `feature:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档补充或更新 |
| `test:` | 测试补充 |
| `ci:` | CI/CD 配置 |
| `acceptance:` | 验收与检查 |
| `process:` | 协作流程相关 |
| `release:` | 版本发布 |

### 认领 Issue

1. 在 Issue 页面的 Assignees 中选择自己，表示"我在做这个"
2. 每个 Issue 在同一时间段应只有一个主要执行者
3. 如果你无法继续推进某个 Issue，请及时在评论区说明并取消 Assign，方便其他人接替

### 关闭 Issue

- Issue 对应的 PR 合并后，在 PR 描述中使用 `Closes #编号` 自动关闭
- 如果 Issue 因其他原因不需要处理了（如需求取消），在评论区说明原因后手动关闭
- 关闭不必再做的 Issue 和完成它一样重要，保持 Issue 列表干净

---

## 分支管理

### 分支命名

请从 `main` 分支创建功能分支，命名格式为：

```text
feature/issue-<编号>-<简短描述>
```

示例：

```text
feature/issue-11-contributing-guide
feature/issue-8-fix-api-error-msg
feature/issue-5-add-test
```

- 编号对应 Issue 号，方便回溯
- 描述用英文小写，单词间用 `-` 连接
- 每个分支聚焦一个 Issue，避免一个大分支包含多个不相关改动

### 禁止操作

- ❌ 直接往 `main` 分支提交代码
- ❌ `git push --force`（强推）
- ❌ `git rebase` 修改已推送到远端的历史
- ❌ `git add .` 无差别暂存（先 `git diff --stat` 确认改动范围）

---

## Pull Request 规范

### PR 标题

标题格式为 `类型: 简短描述`，与 Issue 标题保持一致或更简洁：

```
docs: 补充 CONTRIBUTING 协作指南
feat: 新增仓库地址预测补全
fix: 修复 Token 保存后未立即生效
```

### PR 描述

PR 描述应包含以下内容：

```markdown
## 关联 Issue
Closes #11

## 改动内容
说明做了哪些改动，涉及哪些文件，是否需要更新文档。

## 验证方式
说明如何验证改动有效（如 `npm run build` 通过、手动测试步骤等）。

## 截图 / 说明
如有 UI 改动，附上前后对比截图；如为纯逻辑改动，说明测试方式。
```

### 关联 Issue

在 PR 描述中使用 GitHub 关键词自动关联和关闭 Issue：

- `Closes #11` — PR 合并后自动关闭 Issue
- `Fixes #11` — 同上
- `Resolves #11` — 同上

**一个 PR 尽量只关联一个 Issue**，保持改动聚焦。

### PR 大小

- 每次 PR 的改动量控制在 200 行以内（不含自动生成文件）
- 如果 Issue 的工作量较大，考虑将其拆分为更小的 Issue 和对应 PR
- 一次 PR 一个独立目标，方便 Review 和回滚

---

## Review 要求

### 基本原则

- **不能自己 Review 自己**：每个 PR 必须至少由一名其他成员审查通过后才能合并
- **Review 者可以在 Approve 后顺手合并**：鼓励 Review 通过后直接 Merge，减少延迟
- **紧急修复走简化流程**：如有需要，可以在团队群内沟通后一人 Review 即可合并

### Review 检查清单

审查代码时，请关注以下方面：

- [ ] 改动是否符合 Issue 的验收标准
- [ ] TypeScript 类型是否正确，`npm run build` 是否通过
- [ ] 是否在共享类型（`src/types/`）上的修改影响了其他人（需在 PR 中注明）
- [ ] 页面跳转是否使用 `ROUTE` 常量，未硬编码路径
- [ ] 是否直接操作了不属于自己角色的 localStorage key
- [ ] 错误处理是否正确（判别联合类型，不 throw）
- [ ] loading / error / empty 三种状态是否都有覆盖
- [ ] 是否存在硬编码的绝对路径或 API Key

### Review 流程

1. PR 作者在团队群中通知并指定 Reviewer
2. Reviewer 在 PR 页面提交 Review 意见（Comment / Approve / Request Changes）
3. 如有修改意见，PR 作者修改后推送新 commit，Reviewer 再次检查
4. 所有 Review 意见解决后，Reviewer 点击 Approve 并合并

---

## 本地开发与验证

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 启动项目

```bash
# 安装依赖（优先使用 npm ci，确保与 lock 文件一致）
npm ci

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

Windows 用户也可以直接双击项目根目录下的 `start-opencheck.bat`，脚本会自动处理依赖安装和服务启动。

### 提交前验证

**每次提交 PR 前，请至少执行以下验证：**

```bash
# 1. 构建检查（TypeScript 类型检查 + Vite 构建）
npm run build
```

看到 `built in ...` 且没有报错，即表示构建通过。

> **注意：** 本项目当前阶段尚未接入自动化测试框架。如果有测试命令可用，提交前也应执行：
>
> ```bash
> npm test
> ```

### 手动功能验证

除构建检查外，建议在浏览器中手动验证关键路径：

1. 用几个不同类型的仓库地址测试完整检测流程
2. 检查各页面在 loading / success / error / empty 四种状态下的表现
3. 确认新增或修改的功能在移动端（窄屏）仍可用

---

## 代码风格约定

本项目遵循 [AGENTS.md](AGENTS.md) 中定义的行为规范，这里列出最关键的几点：

| 范围 | 约定 |
|------|------|
| 文档和注释 | 中文 |
| 接口字段名、状态枚举值 | 英文 |
| 变量、函数、类型命名 | 英文 |
| Git Commit Message | 中文（或中英混合，关键是清晰） |
| 组件导入 | 统一从 `@/components` 导入，不绕过统一导出 |
| 页面跳转 | 使用 `ROUTE` 常量，不手写路径字符串 |

### Commit Message 格式

Commit Message 应让读的人一眼知道改了什么、为什么改：

```text
✅ 好的 commit
完成 CONTRIBUTING.md，说明 Issue/分支/PR/Review 流程

❌ 不好的 commit
更新文档
```

一次 commit 聚焦一个独立目标，不要把多个不相关的改动混在一起。

---

## 角色与职责

项目按模块分为 5 个角色（R1–R5），详见 [docs/WORK_DIVISION.md](docs/WORK_DIVISION.md)：

| 角色 | 职责 | 所有文件 |
|------|------|---------|
| **R1** 数据获取层 | GitHub API + URL 解析 + Token 存储 | `src/api/` |
| **R2** 分析引擎层 | 检测规则 + 评分 + 建议 + 报告 | `src/engine/` |
| **R3** 基础设施 | 脚手架 + 路由 + 共享组件 + 结果缓存 | `src/components/`, `src/router/`, `src/store/resultCache.ts` |
| **R4** 主流程 | 首页 + 结果页 + 集成流程 | `src/pages/HomePage.tsx`, `src/pages/ResultPage.tsx` |
| **R5** 辅助页面 | 报告页 + 历史页 + Token 页 + 历史存储 | `src/pages/ReportPage.tsx`, `src/pages/HistoryPage.tsx`, `src/pages/TokenPage.tsx`, `src/store/history.ts` |

修改共享类型（`src/types/index.ts`）前，必须在团队群通知所有相关人——契约一旦冻结，不能单方面修改。

---

## 参考文档

- [AGENTS.md](AGENTS.md) — AI Agent 工作规范
- [README.md](README.md) — 项目介绍与快速开始
- [docs/PRD_OpenCheck.md](docs/PRD_OpenCheck.md) — 产品需求文档
- [docs/WORK_DIVISION.md](docs/WORK_DIVISION.md) — 角色分工与 5 日计划
- [docs/CONTRACTS.md](docs/CONTRACTS.md) — 跨角色技术契约

---

**还有疑问？** 在团队群中提问，或在仓库的 Issues 中发起讨论。协作规则的完善本身也是一个迭代过程，欢迎提出改进建议。
