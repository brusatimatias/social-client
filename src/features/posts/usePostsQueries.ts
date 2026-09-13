import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPost, deletePost, getPost, listMyPosts, updatePost, type PostInput } from '@/api/posts'
import { rememberPostParticipants } from '@/lib/userDirectory'
import type { EntityId } from '@/types/api'
import type { PostStatus } from '@/types/post'

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

function useInvalidatePostLists() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }
}

export function useCreatePost() {
  const invalidate = useInvalidatePostLists()
  return useMutation({
    mutationFn: (input: PostInput) => createPost(input),
    onSuccess: invalidate,
  })
}

export function useUpdatePost(id: EntityId) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidatePostLists()
  return useMutation({
    mutationFn: (input: PostInput) => updatePost(id, input),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['post', id] })
    },
  })
}

export function useDeletePost() {
  const invalidate = useInvalidatePostLists()
  return useMutation({
    mutationFn: (id: EntityId) => deletePost(id),
    onSuccess: invalidate,
  })
}
