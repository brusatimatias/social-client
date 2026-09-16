import { io, type Socket } from 'socket.io-client'
import { getToken } from '@/api/tokenStore'
import type { Message } from '@/types/message'

const baseURL = import.meta.env.VITE_MESSAGING_API_BASE_URL ?? 'http://localhost:3001'

let socket: Socket | null = null

export function connectMessagingSocket(): Socket {
  if (!socket) {
    socket = io(baseURL, { auth: { token: getToken() } })
  }
  return socket
}

export function disconnectMessagingSocket(): void {
  socket?.disconnect()
  socket = null
}

export function joinConversationRoom(conversationId: number): void {
  socket?.emit('joinRoom', conversationId)
}

export function onNewMessage(callback: (message: Message) => void): () => void {
  socket?.on('newMessage', callback)
  return () => socket?.off('newMessage', callback)
}
