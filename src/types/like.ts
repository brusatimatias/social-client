import type { User } from './user'

export interface Like {
  id: number
  user?: User
  user_uuid?: string
  created_at?: string
}
