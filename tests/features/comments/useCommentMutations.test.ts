import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as commentsApi from '@/api/comments'
import { useCommentMutations } from '@/features/comments/useCommentMutations'
import { withQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/comments')
const mockedCommentsApi = vi.mocked(commentsApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: me }),
}))

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 9, content: 'hi', visibility: 'public', status: 'published', comments: [], ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
})

describe('create', () => {
  it('attaches the current user as the comment author, since the API response omits it', async () => {
    queryClient.setQueryData(['post', 9], makePost())
    mockedCommentsApi.createComment.mockResolvedValue({ id: 1, content: 'nice', user_id: 1 } as never)

    const { result } = renderHook(() => useCommentMutations(9), { wrapper: withQueryClient(queryClient) })
    result.current.create.mutate('nice')

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    const post = queryClient.getQueryData<Post>(['post', 9])
    expect(post?.comments).toEqual([{ id: 1, content: 'nice', user_id: 1, user: me }])
    expect(post?.comments_count).toBe(1)
  })
})

describe('update', () => {
  it('merges the response onto the existing cached comment instead of replacing it', async () => {
    queryClient.setQueryData(
      ['post', 9],
      makePost({ comments: [{ id: 1, content: 'old', user: me }] }),
    )
    mockedCommentsApi.updateComment.mockResolvedValue({ id: 1, content: 'new' } as never)

    const { result } = renderHook(() => useCommentMutations(9), { wrapper: withQueryClient(queryClient) })
    result.current.update.mutate({ commentId: 1, content: 'new' })

    await waitFor(() => expect(result.current.update.isSuccess).toBe(true))
    const post = queryClient.getQueryData<Post>(['post', 9])
    // The PATCH response has no `user`, so the previously-known author must survive the merge.
    expect(post?.comments).toEqual([{ id: 1, content: 'new', user: me }])
  })
})

describe('remove', () => {
  it('drops the comment and decrements the count', async () => {
    queryClient.setQueryData(
      ['post', 9],
      makePost({ comments: [{ id: 1, content: 'x', user: me }], comments_count: 1 }),
    )
    mockedCommentsApi.deleteComment.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommentMutations(9), { wrapper: withQueryClient(queryClient) })
    result.current.remove.mutate(1)

    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true))
    const post = queryClient.getQueryData<Post>(['post', 9])
    expect(post?.comments).toEqual([])
    expect(post?.comments_count).toBe(0)
  })

  it('never lets the count go negative', async () => {
    queryClient.setQueryData(['post', 9], makePost({ comments: [], comments_count: 0 }))
    mockedCommentsApi.deleteComment.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommentMutations(9), { wrapper: withQueryClient(queryClient) })
    result.current.remove.mutate(1)

    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true))
    expect(queryClient.getQueryData<Post>(['post', 9])?.comments_count).toBe(0)
  })
})
