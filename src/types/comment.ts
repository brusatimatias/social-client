import type { User } from './user'

export interface Comment {
  id: number
  content: string
  author?: User
  user?: User
  created_at?: string
  updated_at?: string
}
