// ============================================================
// 评分规则说明 —— 只用于 UI 展示，不参与实际评分计算
// ============================================================

export interface RuleExplanation {
  name: string;
  maxScore: number;
  condition: string;
  importance: string;
}

export const RULE_EXPLANATIONS: RuleExplanation[] = [
  {
    name: 'README.md',
    maxScore: 20,
    condition: '根目录存在 README.md、README、README.txt 等说明文件。',
    importance: 'README 是项目入口，决定用户能否快速理解项目用途和使用方式。',
  },
  {
    name: 'LICENSE',
    maxScore: 15,
    condition: '根目录存在 LICENSE、LICENSE.md、COPYING 等许可证文件。',
    importance: '许可证明确他人能否使用、修改和分发代码。',
  },
  {
    name: '运行说明',
    maxScore: 15,
    condition: 'README 中包含安装、启动、构建等关键词、章节或命令示例。',
    importance: '运行说明让新用户和贡献者能把项目真正跑起来。',
  },
  {
    name: '技术栈说明',
    maxScore: 10,
    condition: 'README 中说明语言、框架、工具链或依赖。',
    importance: '技术栈帮助贡献者判断上手成本。',
  },
  {
    name: '项目结构说明',
    maxScore: 10,
    condition: 'README 中包含目录结构、模块说明或目录树。',
    importance: '结构说明能降低阅读代码和参与维护的门槛。',
  },
  {
    name: '.gitignore',
    maxScore: 10,
    condition: '根目录存在 .gitignore。',
    importance: '忽略规则可以避免依赖、构建产物和本地配置误提交。',
  },
  {
    name: 'CONTRIBUTING.md',
    maxScore: 10,
    condition: '根目录存在 CONTRIBUTING.md 或同类贡献指南。',
    importance: '贡献指南能说明 Issue、PR、测试和代码规范。',
  },
  {
    name: '部署说明',
    maxScore: 5,
    condition: 'README 中包含部署、发布、生产环境或云平台相关说明。',
    importance: '部署说明让项目从本地运行延伸到真实交付。',
  },
  {
    name: 'CHANGELOG.md',
    maxScore: 5,
    condition: '根目录存在 CHANGELOG.md、CHANGES.md、RELEASES.md 等更新日志。',
    importance: '更新日志帮助用户理解版本变化和兼容风险。',
  },
  {
    name: '信息性检查',
    maxScore: 0,
    condition: '依赖声明文件、GitHub workflows、截图/演示、使用说明等项目成熟度信号。',
    importance: '这些项目暂不计入 100 分，但会影响建议和报告完整度。',
  },
];
