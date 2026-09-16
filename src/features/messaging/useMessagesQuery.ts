import { useQuery } from '@tanstack/react-query'
import { listMessages } from '@/api/messaging/messages'

export function useMessagesQuery(conversationId: number) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => listMessages(conversationId),
    enabled: !!conversationId,
  })
}
