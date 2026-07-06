# OpenCheck 团队分工与 5 日开发计划

**项目：** OpenCheck — 开源项目体检助手
**团队规模：** 5 人
**开发周期：** 5 天
**技术路线：** 纯前端项目（无需后端服务器）
**前置文档：** [PRD_OpenCheck.md](./PRD_OpenCheck.md)

---

## 为什么纯前端就够了

OpenCheck 的全部功能都可以在浏览器中完成，没有必须放在服务端的逻辑：

- **GitHub API** 支持浏览器跨域调用（CORS），`fetch()` 直接请求 `api.github.com` 即可
- **Token** 由用户自行填写，存在 localStorage 中，请求时附在 Header 里
- **检测/分析/评分/报告** 全部是字符串匹配和数学运算，浏览器完全能跑
- **历史记录** 直接用浏览器 localStorage

不需要后端意味着：不需要起两个进程、不需要对齐 HTTP API 契约、不需要处理跨域代理。**5 个人在同一套代码里工作，摩擦最小。**

---

## 分工总览

### 5 个角色

| 角色 | 负责层 | 拥有页面 | 上游依赖 |
|------|--------|---------|---------|
| **R1：数据获取层** | URL 解析 + GitHub API + Token 存储 + Mock 数据 | 无（纯函数） | 无（叶子） |
| **R2：分析引擎层** | 9 项检测 + 评分 + 建议 + 报告字符串 | 无（纯逻辑） | R1 |
| **R3：脚手架/路由 + 共享组件** | 项目搭建 + 路由 + 7 个通用组件 | 无（叶子） | 无（叶子） |
| **R4：主流程页面 + 集成点** | 首页 + 检测结果页 + 整条 fetch→analyze→render 流程 | 首页、检测结果页 | R1、R2、R3 |
| **R5：报告/历史/Token 页 + 历史存储** | 报告页 + 历史页 + Token 页 + localStorage 工具 | 报告页、历史记录页、Token 配置 | R2、R3 |

### 依赖图（为什么这样拆）

```
        R1 (数据, 叶子) ──→ R2 (分析)
                                    │
        R3 (组件, 叶子) ─────────────┼──→ R4 (首页+结果页, 集成终端)
                                    │      │
                                    └──→ R5 (报告+历史+Token 页)
                                           ↑
                        R4 把检测结果写入 R3 的结果缓存，R5 读取渲染报告
```

**拓扑关键点（这是方案的核心价值）：**

1. **R1 和 R3 都是叶子节点**——没有任何上游依赖，Day 1 第一小时就能交付 Mock 数据和空壳组件，谁也不等。
2. **R4 是"集成终端"**——它消费 R1/R2/R3，但**没有任何人下游读 R4**。这意味着即使 R4 卡住，也不会阻塞其他任何人。把最重的集成风险放进一个"无人依赖"的角色，是有意的。
3. **最多读者是 R3**（被 R4、R5 读），但读的都是**冻结的 props 签名**（只读、不可变），不是可变状态——所以 R3 拖延不会"级联阻塞"。
4. **没有任何一个角色被 3+ 人读取可变状态**。任何一个角色卡住，最多影响"真实数据通路"，不影响"UI 搭建"。

---

## 各角色详细职责

### R1：数据获取层

**你的职责：给 R2 提供数据，给 R5 的 Token 页提供存储函数。你不写任何 UI。**

#### 具体任务

1. **URL 解析**（纯函数）
   - 支持三种格式：`https://github.com/owner/repo` / `github.com/owner/repo` / `owner/repo`
   - 输出 `{ owner, repo }` 或 `{ error: "地址格式不正确..." }`

2. **GitHub API 封装**（3 个 fetch 函数）
   - `fetchRepoInfo(owner, repo, token?)` — 仓库基本信息
   - `fetchFileList(owner, repo, token?)` — 根目录文件列表
   - `fetchFileContent(owner, repo, path, token?)` — 读取指定文件内容（用于读 README）
   - 有 Token 时自动附 `Authorization` 请求头

3. **错误处理（判别联合类型，不抛异常）**
   - 所有错误统一返回 `{ kind, message }`，`kind` 取值：`'notfound'`（仓库不存在）/ `'private'`（私有仓库）/ `'ratelimit'`（403 限流）/ `'network'`（网络超时）
   - **跨模块边界绝不 throw**——下游（R4）只做 `if (error) switch(error.kind)`，不需要 try/catch

4. **Token 存储（你是 token 槽位的唯一所有者）**
   - `getToken()` / `saveToken(token)` — 读写 localStorage 中固定的 key `'opencheck_token'`
   - **R1 是 token 的唯一消费者**（只有 R1 调 GitHub API 时需要它），所以 token 存储端到端归 R1 所有
   - R5 的 Token 页只是 UI，它**调用 R1 的 saveToken**，自己不碰 localStorage

5. **Mock 数据**（Day 1 必须交付）
   - 一份硬编码的 `githubData` 对象（基于一个真实仓库，如 `facebook/react`），让 R2/R4 在 R1 真实 API 调通前就能开发

#### 你导出的契约（Day 1 冻结）

```
parseRepoUrl(raw) → { owner, repo } | { error }
fetchRepo(owner, repo, token?) → Promise<githubData | ApiError>
  // githubData = { repoInfo, fileList, readmeContent }
getToken() / saveToken(token)
Mock githubData 对象
```

---

### R2：分析引擎层

**你的职责：接收 R1 的数据，产出完整的检测结果对象。你不写任何 UI。**

你是整个产品逻辑最重的角色，但全是纯逻辑——没有 UI 调试、没有 API/CORS、没有布局迭代，专注度最高。Day 1 先交付 Mock AnalysisResult，让 R4/R5 不等你。

#### 具体任务

1. **文件存在性检测（7 项）**
   - README.md、LICENSE、.gitignore、CONTRIBUTING.md、CHANGELOG.md、依赖声明文件（package.json / requirements.txt / go.mod / Cargo.toml / pom.xml 任一）、`.github/workflows/`（非空目录才算存在）

2. **README 内容启发式分析（6 维）**
   - 运行说明、技术栈说明、项目结构说明、部署说明、截图/演示、使用说明
   - 每维返回 `pass` / `partial` / `fail`，判定逻辑见 PRD §5.3.2（对代码块数量、章节标题、关键词、段落长度做加权判断）
   - 这是工作量主体，阈值调到自己觉得合理即可，不必精确

3. **评分计算**
   - 按 PRD 附录 A 的分值规则计算总分（0-100）和等级（优秀/较完整/基本可用/需要完善）

4. **改进建议匹配**
   - 根据未通过的检测项，从预设模板中查表返回建议文案（PRD §5.5.2）

5. **Markdown 报告字符串生成**
   - 拼接成一份 Markdown 文本（PRD §5.6.1 定义的章节）
   - **报告字符串是 AnalysisResult 对象的一个字段**（`report`），由你独占写入——这样整个检测结果对象只有一个所有者，下游（R5 报告页）只需读 `result.report` 渲染，极简

#### 你导出的契约（Day 1 冻结）

```
analyze(githubData) → AnalysisResult
```

AnalysisResult 结构（放在共享类型文件里，**你拥有这个类型**，改动必须在群里通知）：

```jsonc
{
  "timestamp": "2026-07-02T10:00:00Z",
  "repoInfo": {
    "owner": "xxx", "repo": "project-name", "fullName": "xxx/project-name",
    "description": "...", "language": "TypeScript",
    "stars": 1200, "forks": 85,
    "createdAt": "2024-01-15", "updatedAt": "2026-06-20",
    "defaultBranch": "main", "license": "MIT"
  },
  "score": { "total": 82, "maxScore": 100, "level": "较完整" },
  "checks": [
    { "name": "README.md", "category": "file", "status": "pass", "score": 20, "maxScore": 20 }
    // ... 共 9 项
  ],
  "suggestions": [
    { "checkName": "LICENSE", "content": "建议添加开源许可证..." }
    // 仅包含 status 不为 "pass" 的项
  ],
  "report": "# OpenCheck 检测报告\n\n..."  // 完整 Markdown 文本
}
```

**Day 1 必须交付一份 Mock AnalysisResult**（硬编码，对应一个真实仓库的检测结果），让 R4/R5 在你的 analyze() 调通前就能渲染页面。

---

### R3：脚手架 / 路由 + 共享组件

**你的职责：让项目从零能跑，并提供所有 UI 人要复用的组件。Day 1 你是全队的"地基"。你不拥有任何业务页面。**

你是叶子节点——没有任何上游依赖，Day 1 第一小时就开始交付。

#### 具体任务

1. **项目脚手架**（Day 1 最优先）
   - 初始化项目、配置构建工具
   - 建立目录结构：
     ```
     src/
     ├── api/        ← R1 的代码
     ├── engine/     ← R2 的代码
     ├── pages/      ← R4 和 R5 的页面
     ├── components/ ← 你的通用组件
     ├── store/      ← 结果缓存（见下）
     ├── types/      ← 共享类型文件
     └── utils/
     ```
   - 确保 `npm run dev` 能启动

2. **路由 + ROUTE 常量**
   - 配置 5 个页��路由：首页 `/`、检测结果页 `/result`、报告页 `/report`、历史页 `/history`、Token 配置 `/token`
   - **定义 ROUTE 常量表**（如 `ROUTE.HOME`、`ROUTE.RESULT` 等），所有页面 owner 用常量跳转，禁止硬编码路径字符串（避免集成时路径漂移）

3. **结果缓存（路由胶水）**
   - 提供一个轻量的结果缓存（如 `setLastResult(result)` / `getLastResult()`）
   - **用途**：R4 检测完成后把结果写入缓存；R5 的报告页读取缓存来渲染报告，避免重复请求 GitHub
   - 你拥有这个缓存的契约，R4 写、R5 读，都是调用者

4. **7 个通用组件**（Day 1 交付空壳，Day 2-3 填充样式）

| 组件 | props | 用途 |
|------|-------|------|
| `ScoreDisplay` | `{ score, maxScore, level }` | 大数字分数 + 等级。颜色随等级变（优秀=绿/较完整=蓝/基本可用=橙/需要完善=红） |
| `StatusIcon` | `{ status: "pass"\|"partial"\|"fail" }` | ✓ △ ✗ 图标 + 颜色 |
| `LevelTag` | `{ level }` | 带背景色的等级标签 |
| `PageLayout` | `{ children, title }` | 页面外层容器（导航栏 + 返回按钮 + 内容区） |
| `LoadingState` | `{ text? }` | 加载动画 + 文字 |
| `ErrorState` | `{ error, onRetry? }` | 错误信息 + 可选重试/返回按钮 |
| `EmptyState` | `{ text, action? }` | 空数据提示 + 可选引导按钮 |

#### Day 1 硬性闸门（HARD GATE）

**Day 1 结束前必须交付：**
- 7 个组件的 props 签名全部定义好
- 7 个组件的空壳版本（`return` 占位 JSX，比如 ScoreDisplay 先返回一个写着"分数"的 div）
- ROUTE 常量表
- 脚手架能跑

真实样式 Day 2-3 再填充，不阻塞任何人。**这是全队最重要的闸门**——R3 拖一天，3 个 UI 人（R4 + R5）都受影响。

---

### R4：主流程页面 + 集成点

**你的职责：首页 + 检测结果页，以及把 R1→R2→渲染 串起来的整条流程。你是产品的"集成终端"。**

你消费 R1/R2/R3，但**没有任何人下游读你**——这是有意的：把最重的集成风险放在一个"stall 了也不阻塞别人"的角色上。

#### 具体任务

1. **首页**
   - 产品标题、简介
   - 仓库地址输入框 + 实时校验（调用 R1 的 `parseRepoUrl`，不要自己重写校验逻辑）
   - "开始检测"按钮（校验未通过时禁用，点击后进入 loading 态）
   - 校验错误在输入框下方红色提示

2. **检测结果页（成功态）**
   - 仓库信息卡片（owner/repo、简介、Stars、Forks、语言、许可证、时间）
   - 总评分区域（用 R3 的 `ScoreDisplay`）
   - 检测项列表（9 项，每项用 R3 的 `StatusIcon` + 名称 + "得分/满分"）
   - 改进建议列表（卡片式）
   - "查看报告"按钮（跳转报告页，同时把结果写入 R3 的结果缓存）

3. **加载态 + 4 种错误态**
   - 加载中：用 R3 的 `LoadingState`
   - 错误：根据 R1 返回的 `error.kind` 渲染对应提示（用 R3 的 `ErrorState`）
     - `notfound`："未找到该仓库，请检查地址是否正确"
     - `private`："暂不支持检测私有仓库"
     - `ratelimit`："��求次数已达上限，建议配置 GitHub Token" + 跳转 Token 页
     - `network`："网络连接失败，请检查网络后重试" + 重试按钮

4. **集成流程（你的核心职责）**
   - 串起 `parseRepoUrl → fetchRepo → analyze → 渲染`，管理 idle/loading/success/error 状态
   - 检测成功后：调用 R5 的 `saveHistory(repoUrl, analysisResult)` 保存历史（**你只是调用者，不要自己拼 historyItem，让 R5 内部组装**）
   - 跳转报告页前：把结果写入 R3 的结果缓存（`setLastResult`）
   - 建议把这个流程封装成自己模块内的一个 helper（如 `runAnalysis(url)`），仍是 R4 自己拥有，**不要提升成共享契约**（否则又变成阻塞节点）

5. **Day 1 USE_MOCK 路径**
   - 提供一个 `USE_MOCK` 开关，Day 1-2 用 R2 的 Mock AnalysisResult + R3 的空壳组件，让"首页→结果页→报告页→历史页"整条链路 Day 1 就能点通，不依赖 R1/R2 真实实现

---

### R5：报告 / 历史 / Token 页 + 历史存储

**你的职责：检测之后的三个辅助页面，以及历史记录的 localStorage 存储。**

#### 具体任务

1. **报告页**
   - 从 R3 的结果缓存读取 AnalysisResult（`getLastResult()`）
   - 渲染 `result.report`（Markdown 字符串，由 R2 生成）为富文本
   - "复制报告"按钮 → 复制 `result.report` 到剪贴板 + "已复制"提示
   - "下载报告"按钮 → 触发 `.md` 文件下载，文件名 `opencheck-{owner}-{repo}-{日期}.md`

2. **历史记录页**
   - 仓库列表（仓库名、评分、等级标签、检测时间），按时间倒序
   - 点击某条 → 跳转结果页（从历史记录恢复展示）
   - 删除单条（确认弹窗）
   - "清空全部历史"（确认弹窗）
   - 空状态（用 R3 的 `EmptyState`）："还没有检测记录，输入仓库地址开始第一次检测吧"

3. **Token 配置页**
   - Token 输入框 + 简要说明（Token 用途、GitHub 获取链接）
   - 保存：**调用 R1 的 `saveToken(token)`**（R1 是 token 槽位的所有者，你只是 UI 调用者，不直接碰 localStorage）

4. **历史记录存储工具**（你是 history 槽位的唯一所有者）
   - `saveHistory(repoUrl, analysisResult)` — R4 调用；**你在函数内部从 analysisResult 提取字段组装 HistoryRecord**，R4 永远不构造 historyItem
   - `loadHistory()` / `deleteHistory(repoUrl)` / `clearHistory()`

#### 你导出的契约（Day 1 冻结）

```
saveHistory(repoUrl, analysisResult) → void   // R4 调用
loadHistory() → HistoryRecord[]
deleteHistory(repoUrl) / clearHistory()
HistoryRecord 类型（你拥有，放在共享类型文件）
```

HistoryRecord 结构（只存摘要，不存完整报告）：

```jsonc
{
  "repoUrl": "https://github.com/owner/repo",
  "repoName": "owner/repo",
  "score": 82,
  "level": "较完整",
  "timestamp": "2026-07-02T10:00:00Z",
  "checkSummary": [
    { "name": "README.md", "status": "pass" }
    // ... 9 项的状态摘要
  ]
}
```

---

## Day 1 契约冻结清单（最重要）

**以下 5 份契约必须在 Day 1 全员当面逐字段确认并冻结，之后不得单方面修改。要改必须在群里通知所有相关人。** 这是避免联调返工的唯一办法。

| 契约 | 所有者 | 谁读它 |
|------|--------|--------|
| `githubData` 数据结构 + Mock | **R1** | R2 |
| `ApiError` 判别联合类型（`{kind, message}`） | **R1** | R4 |
| token 存储 key `'opencheck_token'` + `getToken/saveToken` 签名 | **R1** | R5（Token 页调用） |
| `AnalysisResult` 类型（含 `report` 字段）+ Mock | **R2** | R4、R5 |
| 7 个组件 props 签名 + `ROUTE` 常量表 | **R3** | R4、R5 |
| 结果缓存 `setLastResult/getLastResult` 签名 | **R3** | R4（写）、R5（读） |
| `HistoryRecord` 类型 + `saveHistory` 签名 | **R5** | R4（调用） |

> 所有共享类型统一放在 `src/types/` 一个文件里，每个类型有一个所有者角色，改动必须通知。

---

## 5 日开发计划

### Day 1：搭建 + 对齐 + 冻结契约

**目标：项目能跑，5 个契约全部冻结，每个人能用 Mock 数据开工。**

| 谁 | 做什么 | Day 1 结束交付物 |
|----|--------|----------------|
| **全员** | 一起过 PRD；**逐字段确认上面 5 份契约**，无歧义后冻结 | 契约冻结 |
| **R3** | 搭脚手架（初始化、路由、目录结构）；定义 ROUTE 常量；建共享 `src/types/` 文件骨架；7 个组件交付**空壳版本 + props 签名** | 项目能 `npm run dev`；空壳组件就绪 ⭐硬性闸门 |
| **R1** | 写 URL 解析；写 Mock githubData；定义 `getToken/saveToken` + ApiError 类型 | Mock githubData + token 工具就绪 |
| **R2** | 定义 AnalysisResult 类型放进共享文件；写 Mock AnalysisResult（硬编码一个真实仓库的结果） | Mock AnalysisResult 就绪 |
| **R4** | 写首页骨架（输入框 + 按钮）；接 `USE_MOCK` 开关，用 R2 的 Mock + R3 空壳组件，让"首页→结果页"Day 1 能点通 | 主链路 Mock 可点 |
| **R5** | 写 3 个页面骨架；定义 HistoryRecord 类型 + saveHistory 签名；接 Mock 数据让"报告页→历史页"能渲染 | 辅助页面骨架就绪 |

> Day 1 结束时，整条"首页→结果→报告→历史"链路应该能用 Mock 数据点通。这是验证契约设计正确性的最好方式。

---

### Day 2：核心开发

**目标：R1/R2 真实逻辑基本完成；R3 组件填充样式；R4/R5 页面成型。**

| 谁 | 做什么 |
|----|--------|
| **R1** | 完成全部 3 个真实 API 函数 + Token 自动附头 + 4 类错误映射；用 1-2 个真实仓库验证能拿到数据 |
| **R2** | 完成 7 项文件检测 + 6 维 README 启发式分析 + 评分 + 建议匹配 + 报告字符串生成 |
| **R3** | 7 个组件填充真实样式（颜色、布局、图标）；完善 PageLayout 导航 |
| **R4** | 完成首页（真实校验 + loading）；开始结果页（仓库卡片 + 评分区 + 检测列表 + 建议），仍可用 Mock 数据 |
| **R5** | 完成报告页（Markdown 渲染 + 复制 + 下载）；完成历史页（列表 + 删除 + 清空 + 空状态）；完成 Token 页（调用 R1.saveToken） |

---

### Day 3：真实数据接入

**目标：R4/R5 切换到真实 R1/R2，全流程跑通真实数据。**

| 谁 | 做什么 |
|----|--------|
| **R1** | 自测 API 层：正常仓库 / 不存在仓库 / 私有仓库 / 无 Token 限流，4 种情况错误码都对 |
| **R2** | 自测分析引擎：用 3-5 个不同类型仓库验证评分合理性；调整启发式阈值 |
| **R3** | 完成 7 个组件细节；处理结果缓存的边界（刷新后缓存丢失等） |
| **R4** | **关闭 USE_MOCK，接入真实 R1+R2**；完成结果页全部区域；处理加载态 + 4 种错误态；接 saveHistory + setLastResult |
| **R5** | 报告页接真实结果缓存（getLastResult）；历史页接真实 loadHistory；验证 R4 saveHistory → R5 loadHistory 数据一致 |

---

### Day 4：串联 + 自测

**目标：所有模块串联，各角色自测自己的部分无 bug。**

| 谁 | 做什么 |
|----|--------|
| **R1** | 修 API 层边界（仓库名特殊字符、README 超大、CORS 异常等） |
| **R2** | 修分析引擎边界（README.md 不存在时 6 维分析全跳过、评分边界等） |
| **R3** | 检查所有页面是否正确使用了通用组件；统一视觉一致性 |
| **R4** | 主流程端到端自测（输入→检测→结果→报告跳转→历史保存）；确保所有状态切换流畅 |
| **R5** | 报告页 + 历史页自测（重复检测覆盖、删除、清空、Token 保存后 R1 能读到）；移动端基本可用 |
| **全员** | 走查每个页面的 loading/error/empty 三态是否都覆盖 |

---

### Day 5：联调 + 交付

**目标：全流程无 bug，演示路径顺畅。**

| 时间 | 谁 | 做什么 |
|------|----|--------|
| 上午 | **全员** | 端到端走查 3 遍——用一个接近满分的仓库、一个缺很多东西的仓库、一个不存在的仓库各跑一遍。发现问题当场记、当场分 |
| 上午 | **全员** | 各自修自己范围内的问题 |
| 下午 | **R4** | 第二轮完整走查（R4 是集成终端，最清楚哪里有问题） |
| 下午 | **全员** | 最终检查清单：路由跳转、结果缓存传递、localStorage 持久化、报告复制/下载、Token 生效、错误态友好、移动端基本可用 |
| 下午 | **全员** | 准备演示：选好 2-3 个对比效果好的演示仓库；演示彩排 |

---

## 减少返工的关键约定

### 1. 契约是法律，不可单方面改

Day 1 冻结的 5 份契约，任何人要改字段名/类型，必须在群里通知所有相关人。**绝对禁止 R2 悄悄改了 AnalysisResult 字段然后 R4/R5 突然挂掉。**

### 2. 一个槽位一个所有者

- token localStorage 槽位 → **R1 独占**（getToken/saveToken + key）。R5 的 Token 页只是调用 R1.saveToken，不直接碰 localStorage。
- history localStorage 槽位 → **R5 独占**（saveHistory 等 + HistoryRecord 类型）。R4 调用 saveHistory(repoUrl, result)，**不自己拼 historyItem**，由 R5 内部组装。
- 绝不出现"两个人都直接读写同一个 localStorage key"的情况。

### 3. 错误用判别联合，不抛异常

R1 的所有错误统一返回 `{ kind, message }`，跨模块边界绝不 throw。R4 只做 `if (error) switch(error.kind)`。对新生友好，不会因为没 try/catch 导致页面白屏。

### 4. R3 的 Day 1 空壳组件是硬性闸门

R3 必须在 Day 1 结束前交付 7 个组件的 props 签名 + 空壳版本。真实样式 Day 2-3 再填。R3 拖一天，3 个 UI 人都受影响。

### 5. 用 Mock 开发，不等别人

Day 1-2 所有人用 Mock 数据开发，不依赖 R1/R2 真实实现。函数接口 Day 1 冻结后，后面替换数据源只是一行代码。

### 6. 一个页面只归一个人

5 个页面：首页+结果页归 R4，报告页+历史页+Token 页归 R5。**没有任何一个页面被两个人共同开发**，避免样式/逻辑合并冲突。但鼓励 R4↔R5 互相 code review（相邻页面，同一条演示链路，能互相抓风格漂移）。

### 7. 三种状态必覆盖

每个页面都必须处理：加载中、成功、失败。R3 提供的 LoadingState / ErrorState / EmptyState 组件就是干这个的。

---

## 工作量评估 + 风险与缓解

| 角色 | 工作量 | 风险点 | 缓解 |
|------|--------|--------|------|
| **R1** | 适中 | GitHub API 限流、CORS、错误处理 | Day 1 先交付 Mock；API 调通后自测 4 种错误 |
| **R2** | 偏重（纯逻辑最重） | 9 检查 + 6 维启发式 + 评分 + 报告 | 全是纯逻辑无外部阻塞；Day 1 交付 Mock；若 Day 3 落后，R1 完成后**通过 PR 协助建议模板/报告拼接**（改 R2 的模块，不开并行文件） |
| **R3** | 适中（Day 1 压力大） | 脚手架 + 7 组件 + 路由 | Day 1 空壳闸门；若 Day 2 仍超载，把最简单的 LoadingState/EmptyState 交给 R5（预先商定的应急方案，不改契约） |
| **R4** | 偏重（集成终端） | 2 页面 + 整条流程 + 4 错误态 | 终端叶子，stall 不阻塞别人；Day 1 就用 Mock 把链路点通，及早暴露集成问题 |
| **R5** | 适中 | 3 页面 + 存储工具，模式多样（渲染/列表/表单） | 都围绕 AnalysisResult + localStorage 两个对象，认知连贯；不阻塞他人 |

**拓扑保障**：R1/R3 是叶子，Day 1 即开工；R2 只依赖 R1 的冻结形状；R5 只依赖 R2 的冻结形状 + R3；R4 是无人读取的集成终端。**任何一个角色卡住，最多影响真实数据通路，不影响 UI 搭建。**

---

## 文档结束

分工有异议随时讨论。**Day 1 全员到齐后，第一件事是把 5 份契约逐字段过一遍并冻结**，确认每个人都理解自己导出/消费的数据结构，再各自散开写代码。
