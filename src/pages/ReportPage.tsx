/**
 * 报告页 —— R5（苏和）所有
 *
 * - 从 R3 的结果缓存读取（getLastResult()）
 * - react-markdown 渲染 R2 生成的 Markdown 报告
 * - 复制到剪贴板 + 下载 .md 文件
 * - 无缓存时展示空状态
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageLayout, EmptyState } from '@/components'
import { getLastResult } from '@/store/resultCache'

export default function ReportPage() {
  const result = getLastResult()
  const [copied, setCopied] = useState(false)

  if (!result) {
    return (
      <PageLayout title="检测报告">
        <EmptyState text="还没有可显示的报告，请先进行一次检测" />
      </PageLayout>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时的降级
      const textarea = document.createElement('textarea')
      textarea.value = result.report
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const date = new Date().toISOString().slice(0, 10)
    const owner = result.repoInfo.owner
    const repo = result.repoInfo.repo
    const filename = `opencheck-${owner}-${repo}-${date}.md`

    const blob = new Blob([result.report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <PageLayout title="检测报告">
      <div className="report-toolbar">
        <button className="report-btn" type="button" onClick={handleCopy}>
          {copied ? '已复制' : '复制报告'}
        </button>
        <button className="report-btn report-btn--secondary" type="button" onClick={handleDownload}>
          下载报告
        </button>
      </div>
      <div className="report-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.report}</ReactMarkdown>
      </div>
    </PageLayout>
  )
}
