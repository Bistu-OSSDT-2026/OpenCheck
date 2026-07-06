# OpenCheck

OpenCheck 是一个面向开源项目维护者的纯前端体检工具。用户输入 GitHub 仓库地址后，系统会读取仓库信息，检查 README、LICENSE、项目结构、运行说明等开源规范项，并生成评分、改进建议和 Markdown 报告。

## 技术栈

- React 18
- TypeScript
- Vite
- React Router

## 当前状态

当前 `main` 已包含 R3 交付的项目地基：

- 项目脚手架与构建配置
- 5 个页面路由和 `ROUTE` 常量
- 7 个共享组件
- 最近一次检测结果缓存
- 跨角色类型骨架
- AI Agent 快速定位说明

R3 已完成并合并：脚手架、路由、共享组件、结果缓存。

## 如何运行

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

看到 `built in ...` 且没有报错，即表示构建通过。

## 文档入口

给各成员 AI Agent 的快速定位文档在：

```text
docs/AI_AGENT_GUIDE.md
```

该文档用于说明代码归属、接口边界、优先阅读文件，以及各角色使用共享组件、路由和缓存的方式。

## 大模型接口归属

如果项目接入大模型辅助开源检查，大模型调用、Prompt 组织和 AI 结果解析归 R2 分析引擎层负责。R3 不在组件、路由或缓存中直接调用大模型服务，也不要在前端代码中硬编码任何大模型 API Key。
