import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import {
  useCreatePost,
  useDeletePost,
  useMyPosts,
  usePost,
  useUpdatePost,
} from '@/features/posts/usePostsQueries'
import { withQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'

vi.mock('@/api/posts')
const mockedPostsApi = vi.mocked(postsApi, true)

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 1, content: 'hi', visibility: 'public', status: 'published', ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
})

describe('useMyPosts', () => {
  it('fetches posts for the given status', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([makePost()])
    const { result } = renderHook(() => useMyPosts('draft'), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedPostsApi.listMyPosts).toHaveBeenCalledWith('draft')
    expect(result.current.data).toEqual([makePost()])
  })
})

describe('usePost', () => {
  it('is disabled when no id is given', () => {
    const { result } = renderHook(() => usePost(''), { wrapper: withQueryClient(queryClient) })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedPostsApi.getPost).not.toHaveBeenCalled()
  })

  it('fetches the post by numeric id', async () => {
    mockedPostsApi.getPost.mockResolvedValue(makePost({ id: 16 }))
    const { result } = renderHook(() => usePost(16), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedPostsApi.getPost).toHaveBeenCalledWith(16)
  })
})

describe('useCreatePost', () => {
  it('invalidates posts and feed queries on success', async () => {
    mockedPostsApi.createPost.mockResolvedValue(makePost())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreatePost(), { wrapper: withQueryClient(queryClient) })

    result.current.mutate({ content: 'hi', visibility: 'public', status: 'published' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['feed'] })
  })
})

describe('useUpdatePost', () => {
  it('merges the response onto the cached post instead of replacing it', async () => {
    queryClient.setQueryData(['post', 16], makePost({ id: 16, comments: [{ id: 1, content: 'x' }] }))
    mockedPostsApi.updatePost.mockResolvedValue(makePost({ id: 16, content: 'edited' }))

    const { result } = renderHook(() => useUpdatePost(16), { wrapper: withQueryClient(queryClient) })
    result.current.mutate({ content: 'edited', visibility: 'public', status: 'published' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const cached = queryClient.getQueryData<Post>(['post', 16])
    expect(cached?.content).toBe('edited')
    // The PATCH response doesn't include comments, so the merge must keep what was already cached.
    expect(cached?.comments).toEqual([{ id: 1, content: 'x' }])
  })

  it('invalidates both status tabs when the status changes', async () => {
    queryClient.setQueryData(['post', 16], makePost({ id: 16, status: 'draft' }))
    mockedPostsApi.updatePost.mockResolvedValue(makePost({ id: 16, status: 'published' }))
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdatePost(16), { wrapper: withQueryClient(queryClient) })
    result.current.mutate({ content: 'hi', visibility: 'public', status: 'published' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts', 'draft'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts', 'published'] })
  })

  it('does not invalidate any list when the status stays the same', async () => {
    queryClient.setQueryData(['post', 16], makePost({ id: 16, status: 'published' }))
    mockedPostsApi.updatePost.mockResolvedValue(makePost({ id: 16, status: 'published', content: 'edited' }))
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdatePost(16), { wrapper: withQueryClient(queryClient) })
    result.current.mutate({ content: 'edited', visibility: 'public', status: 'published' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})

describe('useDeletePost', () => {
  it('removes the post from every cache on success', async () => {
    queryClient.setQueryData(['post', 16], makePost({ id: 16 }))
    queryClient.setQueryData(['posts', 'published'], [makePost({ id: 16 })])
    mockedPostsApi.deletePost.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePost(), { wrapper: withQueryClient(queryClient) })
    result.current.mutate(16)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryState(['post', 16])).toBeUndefined()
    expect(queryClient.getQueryData(['posts', 'published'])).toEqual([])
  })
})
