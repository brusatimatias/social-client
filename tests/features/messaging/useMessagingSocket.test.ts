import { renderHook } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as messagingSocket from '@/lib/messagingSocket'
import { useMessagingSocket } from '@/features/messaging/useMessagingSocket'
import { withQueryClient } from '../../support/testProviders'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'

vi.mock('@/lib/messagingSocket')
const mockedSocket = vi.mocked(messagingSocket, true)

let authStatus: 'loading' | 'authenticated' | 'unauthenticated' = 'authenticated'
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ status: authStatus }) }))

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { id: 1, isGroup: false, name: null, ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  authStatus = 'authenticated'
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mockedSocket.onNewMessage.mockReturnValue(vi.fn())
})

describe('useMessagingSocket', () => {
  it('does nothing when not authenticated', () => {
    authStatus = 'unauthenticated'
    renderHook(() => useMessagingSocket(), { wrapper: withQueryClient(queryClient) })
    expect(mockedSocket.connectMessagingSocket).not.toHaveBeenCalled()
  })

  it('connects and joins every conversation already in the cache', () => {
    queryClient.setQueryData(['conversations'], [makeConversation({ id: 1 }), makeConversation({ id: 2 })])

    renderHook(() => useMessagingSocket(), { wrapper: withQueryClient(queryClient) })

    expect(mockedSocket.connectMessagingSocket).toHaveBeenCalledTimes(1)
    expect(mockedSocket.joinConversationRoom).toHaveBeenCalledWith(1)
    expect(mockedSocket.joinConversationRoom).toHaveBeenCalledWith(2)
  })

  it('joins a newly-added conversation without remounting', () => {
    renderHook(() => useMessagingSocket(), { wrapper: withQueryClient(queryClient) })
    mockedSocket.joinConversationRoom.mockClear()

    queryClient.setQueryData(['conversations'], [makeConversation({ id: 3 })])

    expect(mockedSocket.joinConversationRoom).toHaveBeenCalledWith(3)
  })

  it('patches the message cache when a new message arrives over the socket', () => {
    let handler: (message: Message) => void = () => {}
    mockedSocket.onNewMessage.mockImplementation((callback) => {
      handler = callback
      return vi.fn()
    })
    queryClient.setQueryData(['messages', 4], [])
    queryClient.setQueryData(['conversations'], [makeConversation({ id: 4 })])

    renderHook(() => useMessagingSocket(), { wrapper: withQueryClient(queryClient) })
    handler({ id: 1, conversationId: 4, senderId: 9, content: 'hi' })

    expect(queryClient.getQueryData(['messages', 4])).toEqual([
      { id: 1, conversationId: 4, senderId: 9, content: 'hi' },
    ])
  })

  it('disconnects and unsubscribes on unmount', () => {
    const unsubscribeSocket = vi.fn()
    mockedSocket.onNewMessage.mockReturnValue(unsubscribeSocket)
    const { unmount } = renderHook(() => useMessagingSocket(), { wrapper: withQueryClient(queryClient) })

    unmount()

    expect(unsubscribeSocket).toHaveBeenCalledTimes(1)
    expect(mockedSocket.disconnectMessagingSocket).toHaveBeenCalledTimes(1)
  })
})
