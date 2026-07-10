# OpenCheck v0.1.0 MVP Release Notes

**发布日期：** 2026-07-10  
**版本标签：** `v0.1.0`  
**关联 Issue：** [#17 release: 准备并发布 v0.1.0 MVP 版本](https://github.com/Bistu-OSSDT-2026/OpenCheck/issues/17)

OpenCheck v0.1.0 是课程展示用的纯前端 MVP 版本。它面向开源项目维护者和开源新手，输入 GitHub 仓库地址后，可以快速检查 README、LICENSE、运行说明、项目结构、协作文件和自动化配置，并生成评分、改进建议和 Markdown 检测报告。

---

## 已完成功能

- 支持三种 GitHub 仓库地址格式：
  - `https://github.com/owner/repo`
  - `github.com/owner/repo`
  - `owner/repo`
- 直接在浏览器中调用 GitHub REST API 获取公开仓库信息；
- 检查 README、LICENSE、`.gitignore`、CONTRIBUTING、CHANGELOG、依赖文件和 GitHub Actions；
- 分析 README 中的运行说明、技术栈、项目结构、部署说明、截图/演示和使用说明；
- 输出 0-100 分评分、等级、检测原因、证据和改进建议；
- 为部分建议提供可复制 Markdown 模板；
- 生成可复制、可下载的 Markdown 检测报告，并支持 GFM 表格渲染；
- 保存浏览器本地历史记录，重复检测同一仓库时显示分数变化；
- 支持从历史页重新检测；
- 支持演示模式，高分/中等/待完善三个样例不依赖 GitHub API；
- 支持 GitHub Token 配置和 API 额度检查；
- 支持可选 OpenAI-compatible AI 辅助建议，失败时回退默认规则；
- 提供 Windows 一键启动脚本 `start-opencheck.bat`；
- 使用统一浅色 SaaS 风格 UI，保留玻璃拟态、高斯模糊和响应式适配。

---

## 运行方式

前置要求：

- Node.js 18 或更高版本；
- npm 9 或更高版本；
- Chrome、Edge、Firefox 等现代浏览器。

本地运行：

```bash
npm ci
npm run dev
```

启动后访问终端显示的地址，通常是：

```text
http://127.0.0.1:5173/
```

Windows 用户也可以双击：

```text
start-opencheck.bat
```

构建静态产物：

```bash
npm run build
```

---

## 验证情况

本版本发布前完成以下验证：

| 验证项 | 命令 / 证据 | 结果 |
|---|---|---|
| 单元测试 | `npm test` | 通过 |
| 构建检查 | `npm run build` | 通过 |
| CI 工作流 | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | push / PR 到 `main` 时运行测试和构建 |
| 手动验收 | [ACCEPTANCE_REPORT.md](../ACCEPTANCE_REPORT.md) | MVP 主要功能通过 |
| 协作证据 | [docs/COLLABORATION_EVIDENCE.md](COLLABORATION_EVIDENCE.md) | 已整理 |

---

## 已知限制

- 仅支持 GitHub 公开仓库；
- 不包含后端数据库、账号系统或云端同步；
- 暂不支持 GitLab、Gitee、私有仓库完整检测；
- 暂不支持批量检测多个仓库；
- 检测结果基于启发式规则，不能替代人工 Review；
- GitHub Token、AI 配置和历史记录只保存在当前浏览器本地；
- AI 辅助建议依赖用户自行配置第三方兼容接口，且不改变默认评分。

---

## 相关链接

- [README](../README.md)
- [验收报告](../ACCEPTANCE_REPORT.md)
- [协作证据清单](COLLABORATION_EVIDENCE.md)
- [贡献指南](../CONTRIBUTING.md)
