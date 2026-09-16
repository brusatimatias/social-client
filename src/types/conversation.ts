import type { MessagingUser } from './messagingUser'
import type { Message } from './message'

export interface Conversation {
  id: number
  isGroup: boolean
  name: string | null
  participants: MessagingUser[]
  lastMessage?: Message | null
  createdAt?: string
  updatedAt?: string
}
