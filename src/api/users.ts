import { apiClient } from './client'
import type { ApiEnvelope, ApiMeta } from '@/types/api'
import type { User } from '@/types/user'

export async function listFollowers(userId?: string) {
  const { data } = await apiClient.get<ApiEnvelope<User[]>>('/users/followers', {
    params: userId ? { user_id: userId } : undefined,
  })
  return data.data
}

export async function listFollowing(userId?: string) {
  const { data } = await apiClient.get<ApiEnvelope<User[]>>('/users/following', {
    params: userId ? { user_id: userId } : undefined,
  })
  return data.data
}

export interface SearchUsersParams {
  q?: string
  page?: number
  per_page?: number
}

export async function searchUsers(params: SearchUsersParams = {}) {
  const { data } = await apiClient.get<ApiEnvelope<User[]>>('/users/search', { params })
  return { users: data.data, meta: data.meta as ApiMeta }
}

export async function followUser(userId: string) {
  await apiClient.post(`/users/${userId}/follow`)
}

export async function unfollowUser(userId: string) {
  await apiClient.delete(`/users/${userId}/follow`)
}
