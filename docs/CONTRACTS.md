# CONTRACTS.md — 跨角色共享契约

> **本文档定义所有跨角色导出的技术规格和数据契约。**
> 每个契约只有一个所有者角色，改动前必须在团队群通知所有消费者。
> **如本文档与 `src/types/` 中的代码定义冲突，以代码为准。**（代码是可执行的真源）

---

## 第一部分：技术规格

| 决策 | 选择 | 说明 |
|------|------|------|
| 框架 | **React** (≥18) | AI 训练数据最多，5 人团队最常见 |
| 构建工具 | **Vite** | `npm create vite@latest` 一个命令搭建 |
| 语言 | **TypeScript** | 编译器自动检查跨角色契约遵守情况 |
| CSS 方案 | **全局 CSS + CSS 变量** | `src/styles/global.css` 统一管理基础样式和共享组件样式，零额外依赖 |
| 路由 | **React Router v6** | 5 个页面的标准方案 |
| Markdown 渲染 | **react-markdown** | 已安装，R5 报告页使用 |

### CSS 变量规范

R3 在全局样式文件中定义以下变量，全项目统一引用：

```css
:root {
  --level-excellent: #52c41a;   /* 优秀 - 绿 */
  --level-good:      #1677ff;   /* 较完整 - 蓝 */
  --level-basic:     #faad14;   /* 基本可用 - 橙 */
  --level-poor:      #f5222d;   /* 需要完善 - 红 */
}
```

---

## 第二部分：数据契约

### 规则

- 每个类型/函数对应**一个所有者角色**，标注在标题旁
- 所有者可以修改实现细节，但**不能修改字段名、类型或函数签名**——除非在团队群通知所有消费者
- 消费者只能**读取**，不能写入或扩展
- 所有共享类型定义在 `src/types/` 目录，单一文件或按角色拆分均可，但每个类型只定义一次

---

### R1 导出（所有者：R1 / 消费者：R2、R4、R5）

#### `RepoInfo`、`FileItem`、`GithubData`

```typescript
// src/types/index.ts — 所有者：R1（张恩）
interface RepoInfo {
  owner: string;
  repo: string;
  fullName: string;          // "owner/repo"
  description: string;
  language: string;
  stars: number;
  forks: number;
  createdAt: string;         // ISO 日期 "2024-01-15"
  updatedAt: string;
  defaultBranch: string;     // "main" | "master"
  license: string;           // 如 "MIT"，无许可证则为空字符串
}

interface FileItem {
  name: string;              // 文件名，如 "README.md"
  path: string;              // 相对路径，如 "src/index.ts"
  type: 'file' | 'dir';
}

interface GithubData {
  repoInfo: RepoInfo;
  fileList: FileItem[];      // 根目录文件和目录列表
  readmeContent: string;     // README.md 全文，不存在则为空字符串
}
```

#### `ApiError` 判别联合 + `FetchRepoResult`

```typescript
// src/types/index.ts — 所有者：R1（张恩）
type ApiErrorKind = 'notfound' | 'private' | 'ratelimit' | 'network';

interface ApiError {
  kind: ApiErrorKind;
  message: string;
}

/** fetchRepo 返回值：成功返回数据，失败返回错误对象（不 throw） */
type FetchRepoResult = GithubData | ApiError;
```

**规则：R1 的所有异步函数跨边界不抛异常。** 消费者用 `if ('kind' in result)` 分支判断，不写 try/catch。

#### URL 解析

```typescript
// src/api/parseRepoUrl.ts — 所有者：R1
interface ParseSuccess { owner: string; repo: string }
interface ParseError   { error: string }
type ParseResult = ParseSuccess | ParseError

function parseRepoUrl(raw: string): ParseResult;
function isParseError(result: ParseResult): result is ParseError;
function getFullName(result: ParseSuccess): string;   // "owner/repo"
```

支持三种输入：`https://github.com/owner/repo` / `github.com/owner/repo` / `owner/repo`

#### GitHub API 获取

```typescript
// src/api/githubApi.ts — 所有者：R1
function fetchRepoInfo(owner: string, repo: string, token?: string): Promise<RepoInfo | ApiError>;
function fetchFileList(owner: string, repo: string, token?: string): Promise<FileItem[] | ApiError>;
function fetchFileContent(owner: string, repo: string, path: string, token?: string): Promise<string | ApiError>;
function fetchRepo(owner: string, repo: string, token?: string): Promise<GithubData | ApiError>;
```

`fetchRepo` 内部并行调用 3 个独立函数并组装 `GithubData`。自动附带 Token（如已配置）。README.md 不存在时 `readmeContent` 为 `''`。任一部分失败则返回对应 `ApiError`。

> **Mock 数据**：R1 提供 `MOCK_GITHUB_DATA`（硬编码 GithubData）和 `fetchMockRepo()`（模拟延迟的 fetchRepo），供 Day 1-2 前端独立开发。

#### Token 存储

```typescript
// src/api/tokenStorage.ts — 所有者：R1
function getToken(): string | null;
function saveToken(token: string): void;
function clearToken(): void;
```

存储 key 为 **`'opencheck_token'`**，值格式为纯字符串（GitHub Personal Access Token）。

> R5 的 Token 配置页调用 R1 的 `saveToken`。R1 是 token 槽位的唯一所有者，其他角色不直接碰 localStorage 的 token key。

---

### R2 导出（所有者：R2 / 消费者：R4、R5）

#### `AnalysisResult`

```typescript
// src/types/index.ts — 所有者：R2（王靖壹）
type CheckCategory = 'file' | 'readme';
type CheckStatus = 'pass' | 'partial' | 'fail';

interface CheckItem {
  name: string;              // 检测项名称，如 "README.md"、"运行说明"
  category: CheckCategory;
  status: CheckStatus;       // 文件类只有 pass/fail
  score: number;
  maxScore: number;
}

interface Suggestion {
  checkName: string;         // 对应 CheckItem.name
  content: string;           // 建议正文
}

interface ScoreInfo {
  total: number;             // 0-100
  maxScore: number;          // 固定 100
  level: '优秀' | '较完整' | '基本可用' | '需要完善';
}

interface AnalysisResult {
  timestamp: string;         // ISO 时间戳
  repoInfo: RepoInfo;        // 来源：R1 的 GithubData.repoInfo
  score: ScoreInfo;
  checks: CheckItem[];       // 固定 9 项，顺序见 PRD 附录 A
  suggestions: Suggestion[];  // 仅包含 status 不为 'pass' 的项
  report: string;            // 完整的 Markdown 检测报告文本，R2 独占生成
}
```

#### 分析函数

```typescript
// src/engine/analyze.ts — 所有者：R2
function analyze(githubData: GithubData): AnalysisResult;
```

纯函数。内部执行 5 项文件检测 + 4 项 README 内容检测（共 9 项）、评分计算、建议匹配、Markdown 报告字符串拼接。输入的 `repoInfo` 原样透传到输出的 `repoInfo`。若 README.md 不存在（`readmeContent` 为空），README 内容检测全部返回 fail。

> **`report` 字段是 AnalysisResult 的一部分**，由 R2 独占生成（调用 `generateReport()`），不是单独的函数。R5 的报告页只读 `result.report` 渲染。

> **Mock 数据**：R2 提供 `mockGithubData`（硬编码 GithubData）和 `mockAnalysisResult`（硬编码 AnalysisResult），供 Day 1-2 前后端独立开发。

---

### R3 导出（所有者：R3 / 消费者：R4、R5）

#### ROUTE 常量

```typescript
// src/router/routes.ts — 所有者：R3
const ROUTE = {
  HOME:    '/',
  RESULT:  '/result',
  REPORT:  '/report',
  HISTORY: '/history',
  TOKEN:   '/token',
} as const;
```

**所有页面跳转必须使用 ROUTE 常量**，禁止硬编码路径字符串（如 `navigate('/history')` → `navigate(ROUTE.HISTORY)`）。

#### 结果缓存

```typescript
// src/store/resultCache.ts — 所有者：R3
function setLastResult(result: AnalysisResult): void;
function getLastResult(): AnalysisResult | null;
function clearLastResult(): void;
```

实现细节：使用内存变量 + `sessionStorage` 双层存储（关闭浏览器即失效，与 R5 的 localStorage 历史槽位隔离）。R4 检测完成后写入；R5 报告页读取；必要时调用 `clearLastResult` 清除。共享的是 **R2 的 AnalysisResult 类型**（R3 只拥有存储容器，不拥有数据类型）。

#### 7 个通用组件 props 签名

```typescript
// src/components/ — 所有者：R3
interface ScoreDisplayProps   { score: number; maxScore: number; level: AnalysisResult['score']['level'] }
interface StatusIconProps     { status: 'pass' | 'partial' | 'fail' }
interface LevelTagProps       { level: AnalysisResult['score']['level'] }
interface PageLayoutProps     { title: string; children: React.ReactNode; showBack?: boolean }
interface LoadingStateProps   { text?: string }
interface ErrorStateProps     { error: string; onRetry?: () => void; actionText?: string; onAction?: () => void }
interface EmptyStateProps     { text: string; action?: React.ReactNode }
```

---

### R4 导出

R4 是集成终端——它消费 R1/R2/R3 的导出，但**不对外导出任何共享契约**。只有两个页面组件（`HomePage`、`ResultPage`）挂在路由上，被 R3 的 App.tsx 引用。

---

### R5 导出（所有者：R5 / 消费者：R4）

#### `HistoryRecord`

```typescript
// src/types/index.ts — 所有者：R5（苏和）
interface CheckSummaryItem {
  name: string;              // CheckItem.name
  status: CheckStatus;       // 'pass' | 'partial' | 'fail'
}

interface HistoryRecord {
  repoUrl: string;
  repoName: string;          // "owner/repo"
  score: number;
  level: '优秀' | '较完整' | '基本可用' | '需要完善';
  timestamp: string;         // ISO 时间戳
  checkSummary: CheckSummaryItem[];
}
```

#### 历史记录存储

```typescript
// src/store/history.ts — 所有者：R5
function saveHistory(repoUrl: string, result: AnalysisResult): void;
function loadHistory(): HistoryRecord[];
function deleteHistory(repoUrl: string): void;
function clearHistory(): void;
```

当前已由 R5 实现真实 localStorage 存储逻辑，key 使用 `'opencheck_history'`。同一 `repoUrl` 重复保存会覆盖旧记录，读取时按检测时间倒序返回。

`saveHistory` 由 R5 内部从 `AnalysisResult` 提取字段组装 `HistoryRecord`。**R4 只传 `(repoUrl, result)`，不自己拼接 HistoryRecord。**

---

## 第三部分：目录结构约定

```
src/
├── api/            ← R1：GitHub API 调用（githubApi.ts）、URL 解析（parseRepoUrl.ts）、Token（tokenStorage.ts）、Mock 数据
├── engine/         ← R2：analyze.ts + 文件检测 + README 检测 + 评分 + 建议 + 报告生成
├── components/     ← R3：7 个通用 UI 组件 + index.ts 统一导出
├── pages/          ← R4（HomePage.tsx, ResultPage.tsx）+ R5（ReportPage.tsx, HistoryPage.tsx, TokenPage.tsx）
├── router/         ← R3：ROUTE 常量（routes.ts）
├── store/          ← R3（resultCache.ts）+ R5（history.ts）
├── styles/         ← R3：global.css（CSS 变量 + 全局样式）
├── types/          ← R3 维护骨架，各角色类型定义（index.ts）
├── utils/          ← 预留（当前仅有 .gitkeep）
├── App.tsx         ← R3：根组件 + 路由注册
└── main.tsx        ← R3：入口文件
```

---

## 文档结束

> 本文档的所有数据契约在 **Day 1 全员到场后逐字段确认并冻结**。
> 冻结后，任何字段名、类型、函数签名的修改必须在团队群通知所有标注的消费者角色。
