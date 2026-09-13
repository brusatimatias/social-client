import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComment, deleteComment, updateComment } from '@/api/comments'
import type { EntityId } from '@/types/api'

export function useCommentMutations(postId: EntityId) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['post', postId] })

  const create = useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ commentId, content }: { commentId: EntityId; content: string }) =>
      updateComment(postId, commentId, content),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (commentId: EntityId) => deleteComment(postId, commentId),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
