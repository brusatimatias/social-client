import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import { useFeedQuery } from '@/features/feed/useFeedQuery'
import { createTestQueryClient, withQueryClient } from '../../support/testProviders'

vi.mock('@/api/posts')
const mockedPostsApi = vi.mocked(postsApi, true)

beforeEach(() => vi.clearAllMocks())

describe('useFeedQuery', () => {
  it('fetches the given page and per-page size', async () => {
    mockedPostsApi.getFeed.mockResolvedValue({
      posts: [{ id: 1, content: 'hi', visibility: 'public', status: 'published' }],
      meta: { current_page: 2, per_page: 10, total_pages: 3, total_count: 30 },
    })

    const { result } = renderHook(() => useFeedQuery(2, 10), { wrapper: withQueryClient(createTestQueryClient()) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedPostsApi.getFeed).toHaveBeenCalledWith({ page: 2, per_page: 10 })
    expect(result.current.data?.posts).toHaveLength(1)
  })
})
