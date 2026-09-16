import { messagingApiClient, type MessagingApiEnvelope } from './client'

export interface MessagingNotification {
  id: number
  [key: string]: unknown
}

export async function listNotifications() {
  const { data } = await messagingApiClient.get<MessagingApiEnvelope<MessagingNotification[]>>('/notifications')
  return data.data
}
