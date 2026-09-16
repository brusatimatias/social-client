import type { MessagingUser } from './messagingUser'

export interface Conversation {
  id: number
  isGroup: boolean
  name: string | null
  participants: MessagingUser[]
  createdAt?: string
  updatedAt?: string
}
