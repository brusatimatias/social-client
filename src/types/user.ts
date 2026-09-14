export interface User {
  id?: number
  uuid: string
  name: string
  lastname: string
  email?: string
  avatar_url?: string | null
  created_at?: string
  followers_count?: number
  following_count?: number
  [key: string]: unknown
}
