import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPost, deletePost, getPost, listMyPosts, updatePost, type PostInput } from '@/api/posts'
import { rememberPostParticipants } from '@/lib/userDirectory'
import type { EntityId } from '@/types/api'
import type { Post, PostStatus } from '@/types/post'
import { patchPostInCaches, removePostFromCaches } from './postCache'

export function useMyPosts(status?: PostStatus) {
  const query = useQuery({
    queryKey: ['posts', status ?? 'all'],
    queryFn: () => listMyPosts(status),
  })
  useEffect(() => {
    if (query.data) rememberPostParticipants(query.data)
  }, [query.data])
  return query
}

export function usePost(id: EntityId) {
  const query = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
  })
  useEffect(() => {
    if (query.data) rememberPostParticipants([query.data])
  }, [query.data])
  return query
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PostInput) => createPost(input),
    // A brand new post's position in a sorted/paginated list (or whether it
    // even belongs in the currently-viewed status tab or feed page) can't be
    // determined client-side — invalidating (only currently-mounted lists
    // actually refetch) is the safe choice here, unlike update/delete below.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUpdatePost(id: EntityId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PostInput) => updatePost(id, input),
    onMutate: () => {
      // A status change (e.g. draft -> published) moves the post between
      // status-filtered "my posts" tabs — an in-place patch can't do that,
      // so we track the pre-edit status to invalidate just those two tabs.
      const numericId = Number(id)
      const cachedLists = queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] })
      const previousStatus =
        queryClient.getQueryData<Post>(['post', numericId])?.status ??
        cachedLists.flatMap(([, posts]) => posts ?? []).find((post) => post.id === numericId)?.status
      return { previousStatus }
    },
    onSuccess: (updated, _input, context) => {
      // PATCH /posts/:id doesn't return comments/likes/counts — merge onto the
      // existing cached post instead of replacing it, or those would vanish
      // from the UI until the next hard reload.
      patchPostInCaches(queryClient, updated.id, (post) => ({ ...post, ...updated }))
      if (context?.previousStatus && context.previousStatus !== updated.status) {
        queryClient.invalidateQueries({ queryKey: ['posts', context.previousStatus] })
        queryClient.invalidateQueries({ queryKey: ['posts', updated.status] })
      }
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: EntityId) => deletePost(id),
    onSuccess: (_data, id) => {
      removePostFromCaches(queryClient, Number(id))
    },
  })
}
