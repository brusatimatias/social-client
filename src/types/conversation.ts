import type { MessagingUser } from './messagingUser'
import type { Message } from './message'

export interface ConversationParticipant {
  id: number
  conversationId: number
  userId: number
  // Only embedded on GET /conversations/:id, not on the list endpoint or the create response.
  User?: MessagingUser
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  id: number
  isGroup: boolean
  name: string | null
  // Absent entirely on the create response; present but User-less on the list endpoint.
  participants?: ConversationParticipant[]
  lastMessage?: Message | null
  createdAt?: string
  updatedAt?: string
}
