import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  beginOptimisticPostUpdate,
  patchPostInCaches,
  removePostFromCaches,
  rollbackPostUpdate,
} from '@/features/posts/postCache'
import type { FeedResult } from '@/api/posts'
import type { Post } from '@/types/post'

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 1, content: 'hi', visibility: 'public', status: 'published', ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('patchPostInCaches', () => {
  it('patches the single-post query', () => {
    queryClient.setQueryData(['post', 1], makePost({ likes_count: 0 }))
    patchPostInCaches(queryClient, 1, (post) => ({ ...post, likes_count: 1 }))
    expect(queryClient.getQueryData<Post>(['post', 1])?.likes_count).toBe(1)
  })

  it('leaves a missing single-post query untouched', () => {
    patchPostInCaches(queryClient, 999, (post) => ({ ...post, likes_count: 1 }))
    expect(queryClient.getQueryData(['post', 999])).toBeUndefined()
  })

  it('patches the matching post inside every "posts" list', () => {
    queryClient.setQueryData(['posts', 'published'], [makePost({ id: 1 }), makePost({ id: 2 })])
    queryClient.setQueryData(['posts', 'draft'], [makePost({ id: 1, status: 'draft' })])

    patchPostInCaches(queryClient, 1, (post) => ({ ...post, content: 'edited' }))

    expect(queryClient.getQueryData<Post[]>(['posts', 'published'])?.[0].content).toBe('edited')
    expect(queryClient.getQueryData<Post[]>(['posts', 'published'])?.[1].content).toBe('hi')
    expect(queryClient.getQueryData<Post[]>(['posts', 'draft'])?.[0].content).toBe('edited')
  })

  it('patches the matching post inside every feed page', () => {
    const feed: FeedResult = { posts: [makePost({ id: 1 }), makePost({ id: 2 })], meta: {} }
    queryClient.setQueryData(['feed', 1, 20], feed)

    patchPostInCaches(queryClient, 2, (post) => ({ ...post, content: 'edited' }))

    const cached = queryClient.getQueryData<FeedResult>(['feed', 1, 20])
    expect(cached?.posts.find((p) => p.id === 2)?.content).toBe('edited')
    expect(cached?.posts.find((p) => p.id === 1)?.content).toBe('hi')
  })
})

describe('removePostFromCaches', () => {
  it('drops the single-post query entirely', () => {
    queryClient.setQueryData(['post', 1], makePost())
    removePostFromCaches(queryClient, 1)
    expect(queryClient.getQueryState(['post', 1])).toBeUndefined()
  })

  it('filters the post out of every "posts" list', () => {
    queryClient.setQueryData(['posts', 'published'], [makePost({ id: 1 }), makePost({ id: 2 })])
    removePostFromCaches(queryClient, 1)
    expect(queryClient.getQueryData<Post[]>(['posts', 'published'])).toEqual([makePost({ id: 2 })])
  })

  it('filters the post out of every feed page', () => {
    const feed: FeedResult = { posts: [makePost({ id: 1 }), makePost({ id: 2 })], meta: {} }
    queryClient.setQueryData(['feed', 1, 20], feed)
    removePostFromCaches(queryClient, 1)
    expect(queryClient.getQueryData<FeedResult>(['feed', 1, 20])?.posts).toEqual([makePost({ id: 2 })])
  })
})

describe('beginOptimisticPostUpdate / rollbackPostUpdate', () => {
  it('snapshots every relevant cache entry and restores them on rollback', async () => {
    const originalPost = makePost({ likes_count: 0 })
    const originalFeed: FeedResult = { posts: [makePost({ id: 1, likes_count: 0 })], meta: {} }
    queryClient.setQueryData(['post', 1], originalPost)
    queryClient.setQueryData(['posts', 'published'], [makePost({ id: 1, likes_count: 0 })])
    queryClient.setQueryData(['feed', 1, 20], originalFeed)

    const snapshot = await beginOptimisticPostUpdate(queryClient, 1)

    // Simulate an optimistic patch that we'll need to undo.
    patchPostInCaches(queryClient, 1, (post) => ({ ...post, likes_count: 1 }))
    expect(queryClient.getQueryData<Post>(['post', 1])?.likes_count).toBe(1)

    rollbackPostUpdate(queryClient, 1, snapshot)

    expect(queryClient.getQueryData<Post>(['post', 1])?.likes_count).toBe(0)
    expect(queryClient.getQueryData<Post[]>(['posts', 'published'])?.[0].likes_count).toBe(0)
    expect(queryClient.getQueryData<FeedResult>(['feed', 1, 20])?.posts[0].likes_count).toBe(0)
  })
})
