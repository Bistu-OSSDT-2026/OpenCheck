---
name: 通用任务
description: 功能开发、文档更新、流程改进等通用任务
labels: []
body:
  - type: textarea
    id: background
    attributes:
      label: 背景
      description: 为什么要做这个任务？相关上下文是什么？
    validations:
      required: true
  - type: textarea
    id: task
    attributes:
      label: 任务
      description: 具体要做什么？
    validations:
      required: true
  - type: textarea
    id: acceptance
    attributes:
      label: 验收标准
      description: 完成标准是什么？用 checklist 列出。
      value: |
        - [ ] 
    validations:
      required: true
  - type: input
    id: assignee
    attributes:
      label: 建议负责人
      description: 谁来做这个任务？（GitHub 用户名）
