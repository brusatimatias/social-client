import type { QueryClient } from '@tanstack/react-query'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'

export function appendMessageToCache(queryClient: QueryClient, message: Message): void {
  queryClient.setQueryData<Message[]>(['messages', message.conversationId], (messages) => {
    if (!messages) return messages
    if (messages.some((existing) => existing.id === message.id)) return messages
    return [...messages, message]
  })

  queryClient.setQueryData<Conversation[]>(['conversations'], (conversations) => {
    if (!conversations) return conversations
    const target = conversations.find((conversation) => conversation.id === message.conversationId)
    if (!target) return conversations
    const updated = { ...target, lastMessage: message }
    return [updated, ...conversations.filter((conversation) => conversation.id !== message.conversationId)]
  })
}
