import type { Comment } from './comment'
import type { Like } from './like'
import type { User } from './user'

export type PostVisibility = 'public' | 'followers'
export type PostStatus = 'draft' | 'published' | 'archived'

export interface Post {
  id: number
  content: string
  visibility: PostVisibility
  status: PostStatus
  user_id?: number
  author?: User
  media?: string[]
  comments?: Comment[]
  likes?: Like[]
  comments_count?: number
  likes_count?: number
  liked_by_me?: boolean
  my_like_id?: number
  created_at?: string
  updated_at?: string
}

export interface PostFormValues {
  content: string
  visibility: PostVisibility
  status: PostStatus
  media: File[]
}
