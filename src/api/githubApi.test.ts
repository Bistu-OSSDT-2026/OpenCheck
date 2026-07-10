import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchFileList } from './githubApi'

describe('fetchFileList', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns nested workflow files from the recursive Git tree', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        tree: [
          { path: 'README.md', type: 'blob' },
          { path: '.github/workflows/ci.yml', type: 'blob' },
          { path: 'src', type: 'tree' },
        ],
      }),
    } as Response)

    const fileList = await fetchFileList('Bistu-OSSDT-2026', 'OpenCheck', undefined, 'main')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/Bistu-OSSDT-2026/OpenCheck/git/trees/main?recursive=1',
      expect.any(Object),
    )
    expect(fileList).toContainEqual({
      name: 'ci.yml',
      path: '.github/workflows/ci.yml',
      type: 'file',
    })
  })
})
