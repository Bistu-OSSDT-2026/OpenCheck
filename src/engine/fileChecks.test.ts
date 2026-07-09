import { describe, expect, it } from 'vitest'

import { checkReadme, checkWorkflowsDir, runFileChecks } from './fileChecks'
import type { FileItem } from '@/types'

const file = (path: string): FileItem => ({
  name: path.split('/').pop() ?? path,
  path,
  type: 'file',
})

const dir = (path: string): FileItem => ({
  name: path.split('/').pop() ?? path,
  path,
  type: 'dir',
})

describe('fileChecks', () => {
  it('detects root README files case-insensitively', () => {
    const result = checkReadme([file('ReadMe.MD')])

    expect(result.status).toBe('pass')
    expect(result.score).toBe(20)
  })

  it('does not count nested README files as root README files', () => {
    const result = checkReadme([file('docs/README.md')])

    expect(result.status).toBe('fail')
    expect(result.score).toBe(0)
  })

  it('detects non-empty GitHub workflow directories', () => {
    const result = checkWorkflowsDir([
      dir('.github'),
      dir('.github/workflows'),
      file('.github/workflows/ci.yml'),
    ])

    expect(result.status).toBe('pass')
  })

  it('runs all file checks in the expected order', () => {
    const results = runFileChecks([
      file('README.md'),
      file('LICENSE'),
      file('.gitignore'),
      file('CONTRIBUTING.md'),
      file('package.json'),
    ])

    expect(results.map((item) => item.name)).toEqual([
      'README.md',
      'LICENSE',
      '.gitignore',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      '依赖声明文件',
      '.github/workflows/',
    ])
  })
})
