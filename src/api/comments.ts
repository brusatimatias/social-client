import { apiClient } from './client'
import type { ApiEnvelope, EntityId } from '@/types/api'
import type { Comment } from '@/types/comment'

export async function createComment(postId: EntityId, content: string) {
  const { data } = await apiClient.post<ApiEnvelope<Comment>>(`/posts/${postId}/comments`, {
    comment: { content },
  })
  return data.data
}

export async function updateComment(postId: EntityId, commentId: EntityId, content: string) {
  const { data } = await apiClient.patch<ApiEnvelope<Comment>>(
    `/posts/${postId}/comments/${commentId}`,
    { comment: { content } },
  )
  return data.data
}

export async function deleteComment(postId: EntityId, commentId: EntityId) {
  await apiClient.delete(`/posts/${postId}/comments/${commentId}`)
}
