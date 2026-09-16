import { messagingApiClient, type MessagingApiEnvelope } from './client'
import type { Conversation } from '@/types/conversation'

export async function listConversations() {
  const { data } = await messagingApiClient.get<MessagingApiEnvelope<Conversation[]>>('/conversations')
  return data.data
}

export async function getConversation(conversationId: number) {
  const { data } = await messagingApiClient.get<MessagingApiEnvelope<Conversation>>(
    `/conversations/${conversationId}`,
  )
  return data.data
}

export async function createConversation(myUuid: string, otherUuid: string) {
  const { data } = await messagingApiClient.post<MessagingApiEnvelope<Conversation>>('/conversations', {
    isGroup: false,
    name: null,
    participantUuids: [myUuid, otherUuid],
  })
  return data.data
}
