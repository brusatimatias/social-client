import { messagingApiClient, type MessagingApiEnvelope } from './client'
import type { Message, SendMessagePayload } from '@/types/message'

export async function listMessages(conversationId: number) {
  const { data } = await messagingApiClient.get<MessagingApiEnvelope<Message[]>>(
    `/conversations/${conversationId}/messages`,
  )
  return data.data
}

export async function sendMessage(conversationId: number, payload: SendMessagePayload) {
  const { data } = await messagingApiClient.post<MessagingApiEnvelope<Message>>(
    `/conversations/${conversationId}/messages`,
    payload,
  )
  return data.data
}
