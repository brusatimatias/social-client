import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as likesApi from '@/api/likes'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedClient = vi.mocked(apiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('likes api', () => {
  it('creates a like scoped to the post', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: { id: 1 } } })
    const like = await likesApi.createLike(9)
    expect(mockedClient.post).toHaveBeenCalledWith('/posts/9/likes')
    expect(like).toEqual({ id: 1 })
  })

  it('deletes a like scoped to the post', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await likesApi.deleteLike(9, 1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/posts/9/likes/1')
  })
})
