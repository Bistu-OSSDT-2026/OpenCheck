import { describe, expect, it } from 'vitest'

import { getFullName, isParseError, parseRepoUrl } from './parseRepoUrl'

describe('parseRepoUrl', () => {
  it('parses a full GitHub URL', () => {
    expect(parseRepoUrl('https://github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    })
  })

  it('parses a short owner/repo input with surrounding spaces', () => {
    expect(parseRepoUrl('  Bistu-OSSDT-2026/OpenCheck  ')).toEqual({
      owner: 'Bistu-OSSDT-2026',
      repo: 'OpenCheck',
    })
  })

  it('strips a .git suffix from GitHub URLs', () => {
    expect(parseRepoUrl('github.com/vitejs/vite.git')).toEqual({
      owner: 'vitejs',
      repo: 'vite',
    })
  })

  it('returns a parse error for unsupported input', () => {
    const result = parseRepoUrl('https://example.com/not/github')

    expect(isParseError(result)).toBe(true)
  })

  it('formats a parsed repository full name', () => {
    expect(getFullName({ owner: 'owner', repo: 'repo' })).toBe('owner/repo')
  })
})
