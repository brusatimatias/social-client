import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '@/api/messaging/messages'
import { appendMessageToCache } from './messageCache'
import { useMessagingSelf } from './useMessagingSelf'

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient()
  const { data: self } = useMessagingSelf()

  return useMutation({
    mutationFn: (content: string) => {
      if (!self) throw new Error('Messaging user not resolved yet')
      return sendMessage(conversationId, { senderId: self.id, content })
    },
    onSuccess: (message) => appendMessageToCache(queryClient, message),
  })
}
