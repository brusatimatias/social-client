import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createConversation, getConversation, listConversations } from '@/api/messaging/conversations'
import { useAuth } from '@/context/AuthContext'
import type { Conversation } from '@/types/conversation'

export function useConversationsQuery() {
  return useQuery({ queryKey: ['conversations'], queryFn: listConversations })
}

// GET /conversations/:id is the only endpoint that embeds each participant's
// User (uuid/name) — the list endpoint only returns bare {userId} rows.
export function useConversationQuery(conversationId: number) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (otherUuid: string) => createConversation(user!.uuid, otherUuid),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (conversations) =>
        conversations ? [conversation, ...conversations] : [conversation],
      )
    },
  })
}
