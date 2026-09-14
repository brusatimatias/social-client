import type { QueryClient } from '@tanstack/react-query'
import type { FeedResult } from '@/api/posts'
import type { Post } from '@/types/post'

/**
 * Applies `updater` to a post wherever it's cached: the single-post query,
 * every "my posts" list, and every feed page. Used instead of invalidating
 * those queries so a like/comment/edit reflects instantly without a refetch.
 */
export function patchPostInCaches(
  queryClient: QueryClient,
  postId: number,
  updater: (post: Post) => Post,
): void {
  queryClient.setQueryData<Post>(['post', postId], (post) => (post ? updater(post) : post))
  queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (posts) =>
    posts?.map((post) => (post.id === postId ? updater(post) : post)),
  )
  queryClient.setQueriesData<FeedResult>({ queryKey: ['feed'] }, (result) =>
    result ? { ...result, posts: result.posts.map((post) => (post.id === postId ? updater(post) : post)) } : result,
  )
}

/** Removes a deleted post from every list/feed cache and drops its detail query. */
export function removePostFromCaches(queryClient: QueryClient, postId: number): void {
  queryClient.removeQueries({ queryKey: ['post', postId] })
  queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (posts) =>
    posts?.filter((post) => post.id !== postId),
  )
  queryClient.setQueriesData<FeedResult>({ queryKey: ['feed'] }, (result) =>
    result ? { ...result, posts: result.posts.filter((post) => post.id !== postId) } : result,
  )
}

export interface PostCacheSnapshot {
  post: Post | undefined
  lists: [readonly unknown[], Post[] | undefined][]
  feeds: [readonly unknown[], FeedResult | undefined][]
}

/** Cancels in-flight refetches and snapshots every cache entry touching this post, for optimistic updates. */
export async function beginOptimisticPostUpdate(
  queryClient: QueryClient,
  postId: number,
): Promise<PostCacheSnapshot> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: ['post', postId] }),
    queryClient.cancelQueries({ queryKey: ['posts'] }),
    queryClient.cancelQueries({ queryKey: ['feed'] }),
  ])
  return {
    post: queryClient.getQueryData<Post>(['post', postId]),
    lists: queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] }),
    feeds: queryClient.getQueriesData<FeedResult>({ queryKey: ['feed'] }),
  }
}

/** Restores a snapshot taken by `beginOptimisticPostUpdate`, for rolling back a failed mutation. */
export function rollbackPostUpdate(
  queryClient: QueryClient,
  postId: number,
  snapshot: PostCacheSnapshot,
): void {
  queryClient.setQueryData(['post', postId], snapshot.post)
  snapshot.lists.forEach(([key, data]) => queryClient.setQueryData(key, data))
  snapshot.feeds.forEach(([key, data]) => queryClient.setQueryData(key, data))
}
