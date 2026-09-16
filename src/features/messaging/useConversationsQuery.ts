import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createConversation, listConversations } from '@/api/messaging/conversations'
import { useAuth } from '@/context/AuthContext'
import type { Conversation } from '@/types/conversation'

export function useConversationsQuery() {
  return useQuery({ queryKey: ['conversations'], queryFn: listConversations })
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
