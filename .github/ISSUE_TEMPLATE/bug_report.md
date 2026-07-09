---
name: 问题反馈
description: 报告 bug 或异常行为
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: 问题描述
      description: 发生了什么问题？预期行为是什么？
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      description: 如何触发这个问题？
      value: |
        1. 
        2. 
        3. 
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: 环境信息
      description: 浏览器版本、操作系统等
      value: |
        - 浏览器：
        - 操作系统：
    validations:
      required: false
  - type: textarea
    id: screenshot
    attributes:
      label: 截图或日志
      description: 如有截图或控制台错误信息，请贴在这里
    validations:
      required: false
