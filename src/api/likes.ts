import { apiClient } from './client'
import type { ApiEnvelope, EntityId } from '@/types/api'
import type { Like } from '@/types/like'

export async function createLike(postId: EntityId) {
  const { data } = await apiClient.post<ApiEnvelope<Like>>(`/posts/${postId}/likes`)
  return data.data
}

export async function deleteLike(postId: EntityId, likeId: EntityId) {
  await apiClient.delete(`/posts/${postId}/likes/${likeId}`)
}
