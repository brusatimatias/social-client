import { apiClient } from './client'
import type { ApiEnvelope, ApiMeta, EntityId } from '@/types/api'
import type { Post, PostStatus, PostVisibility } from '@/types/post'

export interface PostInput {
  content: string
  visibility: PostVisibility
  status: PostStatus
  media?: File[]
}

export async function listMyPosts(status?: PostStatus) {
  const { data } = await apiClient.get<ApiEnvelope<Post[]>>('/posts', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function getPost(id: EntityId) {
  const { data } = await apiClient.get<ApiEnvelope<Post>>(`/posts/${id}`)
  return data.data
}

function buildFormData(input: PostInput): FormData {
  const form = new FormData()
  form.append('post[content]', input.content)
  form.append('post[visibility]', input.visibility)
  form.append('post[status]', input.status)
  input.media?.forEach((file) => form.append('post[media][]', file))
  return form
}

export async function createPost(input: PostInput) {
  const hasMedia = !!input.media?.length
  const { data } = hasMedia
    ? await apiClient.post<ApiEnvelope<Post>>('/posts', buildFormData(input))
    : await apiClient.post<ApiEnvelope<Post>>('/posts', {
        post: { content: input.content, visibility: input.visibility, status: input.status },
      })
  return data.data
}

export async function updatePost(id: EntityId, input: PostInput) {
  const hasMedia = !!input.media?.length
  const { data } = hasMedia
    ? await apiClient.patch<ApiEnvelope<Post>>(`/posts/${id}`, buildFormData(input))
    : await apiClient.patch<ApiEnvelope<Post>>(`/posts/${id}`, {
        post: { content: input.content, visibility: input.visibility, status: input.status },
      })
  return data.data
}

export async function deletePost(id: EntityId) {
  await apiClient.delete(`/posts/${id}`)
}

export interface FeedParams {
  page?: number
  per_page?: number
}

export interface FeedResult {
  posts: Post[]
  meta: ApiMeta
}

export async function getFeed(params: FeedParams = {}) {
  const { data } = await apiClient.get<ApiEnvelope<Post[]>>('/feed', { params })
  return { posts: data.data, meta: data.meta }
}
