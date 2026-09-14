import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as commentsApi from '@/api/comments'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedClient = vi.mocked(apiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('comments api', () => {
  it('creates a comment scoped to the post', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: { id: 1, content: 'hi' } } })
    const comment = await commentsApi.createComment(9, 'hi')
    expect(mockedClient.post).toHaveBeenCalledWith('/posts/9/comments', { comment: { content: 'hi' } })
    expect(comment).toEqual({ id: 1, content: 'hi' })
  })

  it('updates a comment scoped to the post', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: { id: 1, content: 'edited' } } })
    await commentsApi.updateComment(9, 1, 'edited')
    expect(mockedClient.patch).toHaveBeenCalledWith('/posts/9/comments/1', { comment: { content: 'edited' } })
  })

  it('deletes a comment scoped to the post', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await commentsApi.deleteComment(9, 1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/posts/9/comments/1')
  })
})
