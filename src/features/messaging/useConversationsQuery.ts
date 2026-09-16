import { useQuery } from '@tanstack/react-query'
import { listConversations } from '@/api/messaging/conversations'

export function useConversationsQuery() {
  return useQuery({ queryKey: ['conversations'], queryFn: listConversations })
}
