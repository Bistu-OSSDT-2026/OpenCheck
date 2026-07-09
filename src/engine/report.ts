// ============================================================
// R2 分析引擎层 — Markdown 报告生成
// 严格对齐 PRD_OpenCheck.md §5.6
// ============================================================

import type { AnalysisResult, CheckItem, Suggestion } from '@/types';

function statusLabel(status: string): string {
  switch (status) {
    case 'pass':
      return '通过';
    case 'partial':
      return '部分通过';
    case 'fail':
      return '未通过';
    default:
      return status;
  }
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'file':   return '文件存在性';
    case 'readme': return 'README 内容';
    default:       return category;
  }
}

/**
 * 生成检测明细表
 *
 * 评分项在上，补充检测项在下，中间用分隔行区分。
 * 补充检测项得分列显示 "—"。
 */
function buildChecksTable(checks: CheckItem[]): string {
  const scored = checks.filter(c => c.maxScore > 0);
  const informational = checks.filter(c => c.maxScore === 0);

  const header = '| 检测项 | 类别 | 结果 | 得分 |\n|--------|------|------|------|';

  const scoredRows = scored.map(
    (c) => `| ${c.name} | ${categoryLabel(c.category)} | ${statusLabel(c.status)} | ${c.score} / ${c.maxScore} |`
  );

  const infoRows = informational.length > 0
    ? ['', '| **↓ 补充检测（不计分）** | | | |', '']
        .concat(informational.map(
          (c) => `| ${c.name} | ${categoryLabel(c.category)} | ${statusLabel(c.status)} | — |`
        ))
    : [];

  return [header, ...scoredRows, ...infoRows].join('\n');
}

function buildSuggestionsList(suggestions: Suggestion[]): string {
  if (suggestions.length === 0) {
    return '你的项目在检测范围内没有明显缺失，继续保持！';
  }
  return suggestions
    .map((s, i) => `${i + 1}. **${s.checkName}**：${s.content}`)
    .join('\n');
}

/**
 * 生成完整的 Markdown 检测报告（PRD §5.6.1）
 */
export function generateReport(result: Omit<AnalysisResult, 'report'>): string {
  const { timestamp, repoInfo, score, checks, suggestions } = result;

  const formattedTime = new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const lines: string[] = [
    '# OpenCheck 检测报告',
    '',
    `> 检测时间：${formattedTime}`,
    '',
    '---',
    '',
    '## 仓库基本信息',
    '',
    `| 项目 | 信息 |`,
    `|------|------|`,
    `| 项目名称 | ${escapeMd(repoInfo.fullName)} |`,
    `| 项目简介 | ${escapeMd(repoInfo.description || '（无）')} |`,
    `| 主要语言 | ${escapeMd(repoInfo.language || '（未知）')} |`,
    `| Star 数 | ${repoInfo.stars} |`,
    `| Fork 数 | ${repoInfo.forks} |`,
    `| 许可证 | ${escapeMd(repoInfo.license || '（未指定）')} |`,
    `| 默认分支 | ${escapeMd(repoInfo.defaultBranch)} |`,
    `| 创建时间 | ${escapeMd(repoInfo.createdAt)} |`,
    `| 最近更新 | ${escapeMd(repoInfo.updatedAt)} |`,
    '',
    '---',
    '',
    '## 检测总评分',
    '',
    `**总分：${score.total} / ${score.maxScore} — ${score.level}**`,
    '',
    '---',
    '',
    '## 检测明细',
    '',
    buildChecksTable(checks),
    '',
    '---',
    '',
    '## 改进建议',
    '',
    buildSuggestionsList(suggestions),
    '',
    '---',
    '',
    `*Powered by OpenCheck — 开源项目体检助手*`,
  ];

  return lines.join('\n') + '\n';
}

function escapeMd(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
