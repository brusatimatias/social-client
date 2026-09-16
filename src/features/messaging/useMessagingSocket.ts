import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import {
  connectMessagingSocket,
  disconnectMessagingSocket,
  joinConversationRoom,
  onNewMessage,
} from '@/lib/messagingSocket'
import { appendMessageToCache } from './messageCache'
import type { Conversation } from '@/types/conversation'

export function useMessagingSocket(): void {
  const { status } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== 'authenticated') return

    connectMessagingSocket()

    const joinKnownConversations = () => {
      const conversations = queryClient.getQueryData<Conversation[]>(['conversations'])
      conversations?.forEach((conversation) => joinConversationRoom(conversation.id))
    }
    joinKnownConversations()

    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'conversations') {
        joinKnownConversations()
      }
    })
    const unsubscribeSocket = onNewMessage((message) => appendMessageToCache(queryClient, message))

    return () => {
      unsubscribeCache()
      unsubscribeSocket()
      disconnectMessagingSocket()
    }
  }, [status, queryClient])
}
