import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComment, deleteComment, updateComment } from '@/api/comments'
import { useAuth } from '@/context/AuthContext'
import { patchPostInCaches } from '@/features/posts/postCache'
import type { EntityId } from '@/types/api'

export function useCommentMutations(postId: EntityId) {
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
  const numericPostId = Number(postId)

  const create = useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: (comment) => {
      // The create/update endpoints only return {id, content, user_id, ...} —
      // no embedded `user`, unlike the shape GET /posts/:id nests comments in.
      // A new comment is always authored by the current user, so attach it
      // directly rather than dropping the author and losing Edit/Delete.
      patchPostInCaches(queryClient, numericPostId, (post) => ({
        ...post,
        comments: [...(post.comments ?? []), { ...comment, user: me ?? undefined }],
        comments_count: (post.comments_count ?? post.comments?.length ?? 0) + 1,
      }))
    },
  })

  const update = useMutation({
    mutationFn: ({ commentId, content }: { commentId: EntityId; content: string }) =>
      updateComment(postId, commentId, content),
    onSuccess: (updated) => {
      // Merge onto the existing cached comment instead of replacing it outright,
      // so its already-known `user`/`author` (also absent from this response) survives.
      patchPostInCaches(queryClient, numericPostId, (post) => ({
        ...post,
        comments: post.comments?.map((comment) =>
          comment.id === updated.id ? { ...comment, ...updated } : comment,
        ),
      }))
    },
  })

  const remove = useMutation({
    mutationFn: (commentId: EntityId) => deleteComment(postId, commentId),
    onSuccess: (_data, commentId) => {
      const numericCommentId = Number(commentId)
      patchPostInCaches(queryClient, numericPostId, (post) => ({
        ...post,
        comments: post.comments?.filter((comment) => comment.id !== numericCommentId),
        comments_count: Math.max(0, (post.comments_count ?? post.comments?.length ?? 1) - 1),
      }))
    },
  })

  return { create, update, remove }
}
