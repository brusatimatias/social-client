export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  createdAt?: string
}

export interface SendMessagePayload {
  senderId: number
  content: string
}
