import { messagingApiClient, type MessagingApiEnvelope } from './client'
import type { MessagingUser } from '@/types/messagingUser'

export async function getMessagingUser(uuid: string) {
  const { data } = await messagingApiClient.get<MessagingApiEnvelope<MessagingUser>>(`/users/${uuid}`)
  return data.data
}
