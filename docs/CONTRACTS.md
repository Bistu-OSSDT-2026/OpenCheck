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
| CSS 方案 | **CSS Modules + CSS 变量** | Vite 原生支持，零额外依赖 |
| 路由 | **React Router v6** | 5 个页面的标准方案 |
| Markdown 渲染 | **react-markdown** | ⚠️ 尚未安装，R5 开始前需执行 `npm install react-markdown` |

### CSS 变量规范

R3 在全局样式文件中定义以下变量，全项目统一引用：

```css
:root {
  --color-excellent: #22c55e;   /* 优秀 - 90-100 */
  --color-good:      #3b82f6;   /* 较完整 - 75-89 */
  --color-adequate:  #f97316;   /* 基本可用 - 60-74 */
  --color-poor:      #ef4444;   /* 需要完善 - <60 */
  --color-bg:        #0f172a;   /* 主背景 */
  --color-surface:   #1e293b;   /* 卡片背景 */
  --color-text:      #f1f5f9;   /* 正文 */
  --color-muted:     #94a3b8;   /* 辅助文字 */
  --font-mono:       'JetBrains Mono', 'Fira Code', monospace;
  --font-sans:       'Inter', system-ui, sans-serif;
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

#### `githubData`

```typescript
// src/types/githubData.ts — 所有者：R1
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

interface GithubData {
  repoInfo: RepoInfo;
  fileList: string[];        // 根目录文件和目录名列表，如 ["README.md", "src/", "package.json"]
  readmeContent: string;     // README.md 全文，不存在则为空字符串
}
```

#### `ApiError` 判别联合

```typescript
// src/types/apiError.ts — 所有者：R1
type ApiError =
  | { kind: 'notfound'; message: string }
  | { kind: 'private'; message: string }
  | { kind: 'ratelimit'; message: string }
  | { kind: 'network'; message: string };
```

**规则：R1 的所有异步函数跨边界不抛异常。** 消费者做 `if (result.kind)` 分支判断，不写 try/catch。

#### URL 解析

```typescript
// src/api/parseRepoUrl.ts — 所有者：R1
function parseRepoUrl(raw: string): { owner: string; repo: string } | { error: string };
```

支持三种输入：`https://github.com/owner/repo` / `github.com/owner/repo` / `owner/repo`

#### GitHub API 获取

```typescript
// src/api/fetchRepo.ts — 所有者：R1
function fetchRepo(owner: string, repo: string): Promise<GithubData | ApiError>;
```

内部调用 3 个 GitHub REST API（repo info、contents、README 内容），自动附带 Token（如已配置）。如果 README.md 不存在，`readmeContent` 为空字符串；文件列表读取失败时 `fileList` 为空数组。

#### Token 存储

```typescript
// src/api/token.ts — 所有者：R1
function getToken(): string | null;
function saveToken(token: string): void;
```

存储 key 为 **`'opencheck_token'`**，值格式为纯字符串（GitHub Personal Access Token）。

> R5 的 Token 配置页调用 R1 的 `saveToken`。R1 是 token 槽位的唯一所有者，其他角色不直接碰 localStorage 的 token key。

---

### R2 导出（所有者：R2 / 消费者：R4、R5）

#### `AnalysisResult`

```typescript
// src/types/analysisResult.ts — 所有者：R2
interface CheckItem {
  name: string;              // 检测项名称，如 "README.md"、"运行说明"
  category: 'file' | 'content';
  status: 'pass' | 'partial' | 'fail';   // 文件类只有 pass/fail
  score: number;
  maxScore: number;
}

interface SuggestionItem {
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
  suggestions: SuggestionItem[];  // 仅包含 status 不为 'pass' 的项
  report: string;            // 完整的 Markdown 检测报告文本
}
```

#### 分析函数

```typescript
// src/engine/analyze.ts — 所有者：R2
function analyze(data: GithubData): AnalysisResult;
```

纯函数。内部执行 9 项检测、评分计算、建议匹配、报告字符串拼接。输入的 `repoInfo` 原样透传到输出的 `repoInfo`。

> **`report` 字段是 AnalysisResult 的一部分**，由 R2 生成，不是单独的函数。R5 的报告页只读 `result.report` 渲染。

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
```

R4 检测完成后写入；R5 报告页读取。共享的是 **R2 的 AnalysisResult 类型**（R3 只拥有存储容器，不拥有数据类型）。

#### 7 个通用组件 props 签名

```typescript
// src/components/ — 所有者：R3
interface ScoreDisplayProps   { score: number; maxScore: number; level: AnalysisResult['score']['level'] }
interface StatusIconProps     { status: 'pass' | 'partial' | 'fail' }
interface LevelTagProps       { level: '优秀' | '较完整' | '基本可用' | '需要完善' }
interface PageLayoutProps     { children: React.ReactNode; title?: string }
interface LoadingStateProps   { text?: string }
interface ErrorStateProps     { error: ApiError; onRetry?: () => void }
interface EmptyStateProps     { text: string; action?: { label: string; onClick: () => void } }
```

---

### R4 导出

R4 是集成终端——它消费 R1/R2/R3 的导出，但**不对外导出任何共享契约**。只有两个页面组件（`HomePage`、`ResultPage`）挂在路由上，被 R3 的 App.tsx 引用。

---

### R5 导出（所有者：R5 / 消费者：R4）

#### `HistoryRecord`

```typescript
// src/types/historyRecord.ts — 所有者：R5
interface HistoryRecord {
  repoUrl: string;
  repoName: string;          // "owner/repo"
  score: number;
  level: string;             // AnalysisResult.score.level
  timestamp: string;         // ISO 时间戳
  checkSummary: Array<{
    name: string;            // CheckItem.name
    status: string;          // CheckItem.status
  }>;
}
```

#### 历史记录存储

```typescript
// src/utils/storage.ts — 所有者：R5
function saveHistory(repoUrl: string, result: AnalysisResult): void;
function loadHistory(): HistoryRecord[];
function deleteHistory(repoUrl: string): void;
function clearHistory(): void;
```

`saveHistory` 由 R5 内部从 `AnalysisResult` 提取字段组装 `HistoryRecord`。**R4 只传 `(repoUrl, result)`，不自己拼接 HistoryRecord。**

---

## 第三部分：目录结构约定

```
src/
├── api/            ← R1：GitHub API 调用、URL 解析、Token 管理
├── engine/         ← R2：检测逻辑、评分、建议、报告生成
├── components/     ← R3：7 个通用 UI 组件
├── pages/          ← R4（HomePage.tsx, ResultPage.tsx）+ R5（ReportPage.tsx, HistoryPage.tsx, TokenPage.tsx）
├── router/         ← R3：ROUTE 常量 + 路由表定义
├── store/          ← R3：结果缓存
├── styles/         ← R3：全局样式 + CSS 变量
├── types/          ← 共享类型定义（每个类型只在一个文件中定义）
├── utils/          ← R5：localStorage 工具
├── App.tsx         ← R3：根组件 + 路由注册
└── main.tsx        ← R3：入口文件
```

---

## 文档结束

> 本文档的所有数据契约在 **Day 1 全员到场后逐字段确认并冻结**。
> 冻结后，任何字段名、类型、函数签名的修改必须在团队群通知所有标注的消费者角色。
