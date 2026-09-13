import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLike, deleteLike } from '@/api/likes'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { extractApiErrors } from '@/lib/errors'
import type { Post } from '@/types/post'
import { getMyLikeState } from './likeState'

export function LikeButton({ post }: { post: Post }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const serverState = getMyLikeState(post, user?.uuid)
  const serverCount = post.likes_count ?? post.likes?.length ?? 0

  const [liked, setLiked] = useState(serverState.liked)
  const [likeId, setLikeId] = useState(serverState.likeId)
  const [count, setCount] = useState(serverCount)

  useEffect(() => {
    setLiked(serverState.liked)
    setLikeId(serverState.likeId)
    setCount(serverCount)
  }, [post.id, serverState.liked, serverState.likeId, serverCount])

  const settle = () => {
    queryClient.invalidateQueries({ queryKey: ['post', post.id] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  const likeMutation = useMutation({
    mutationFn: () => createLike(post.id),
    onSuccess: (like) => setLikeId(like.id),
    onError: (error) => {
      setLiked(false)
      setCount((current) => Math.max(0, current - 1))
      showToast(extractApiErrors(error)[0], 'error')
    },
    onSettled: settle,
  })

  const unlikeMutation = useMutation({
    mutationFn: (id: number) => deleteLike(post.id, id),
    onError: (error) => {
      setLiked(true)
      setCount((current) => current + 1)
      showToast(extractApiErrors(error)[0], 'error')
    },
    onSettled: settle,
  })

  const pending = likeMutation.isPending || unlikeMutation.isPending

  const toggle = () => {
    if (pending) return
    if (liked) {
      setLiked(false)
      setCount((current) => Math.max(0, current - 1))
      if (likeId) {
        unlikeMutation.mutate(likeId)
      } else {
        setLiked(true)
        setCount((current) => current + 1)
      }
    } else {
      setLiked(true)
      setCount((current) => current + 1)
      likeMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
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
