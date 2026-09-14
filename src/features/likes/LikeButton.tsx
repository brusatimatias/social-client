import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLike, deleteLike } from '@/api/likes'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { extractApiErrors } from '@/lib/errors'
import { beginOptimisticPostUpdate, patchPostInCaches, rollbackPostUpdate, type PostCacheSnapshot } from '@/features/posts/postCache'
import type { Post } from '@/types/post'
import type { Like } from '@/types/like'
import { getMyLikeState } from './likeState'

type ToggleResult = { liked: true; like: Like } | { liked: false }

export function LikeButton({ post }: { post: Post }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { liked, likeId } = getMyLikeState(post, user?.uuid)
  const count = post.likes_count ?? post.likes?.length ?? 0

  const toggleMutation = useMutation<ToggleResult, unknown, void, PostCacheSnapshot>({
    mutationFn: async () => {
      if (liked) {
        if (!likeId) throw new Error('Missing like id for an already-liked post')
        await deleteLike(post.id, likeId)
        return { liked: false }
      }
      const like = await createLike(post.id)
      return { liked: true, like }
    },
    onMutate: async () => {
      const snapshot = await beginOptimisticPostUpdate(queryClient, post.id)
      patchPostInCaches(queryClient, post.id, (current) => {
        const currentCount = current.likes_count ?? current.likes?.length ?? 0
        return liked
          ? {
              ...current,
              liked_by_me: false,
              my_like_id: undefined,
              likes_count: Math.max(0, currentCount - 1),
            }
          : { ...current, liked_by_me: true, likes_count: currentCount + 1 }
      })
      return snapshot
    },
    onError: (error, _vars, snapshot) => {
      if (snapshot) rollbackPostUpdate(queryClient, post.id, snapshot)
      showToast(extractApiErrors(error)[0], 'error')
    },
    onSuccess: (result) => {
      if (result.liked) {
        patchPostInCaches(queryClient, post.id, (current) => ({ ...current, my_like_id: result.like.id }))
      }
    },
  })

  return (
    <button
      type="button"
      onClick={() => toggleMutation.mutate()}
      disabled={toggleMutation.isPending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors',
        liked ? 'text-red-600 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100',
      )}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
