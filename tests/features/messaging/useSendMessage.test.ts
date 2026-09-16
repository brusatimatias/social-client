import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as messagesApi from '@/api/messaging/messages'
import { useSendMessage } from '@/features/messaging/useSendMessage'
import { withQueryClient } from '../../support/testProviders'
import type { Message } from '@/types/message'

vi.mock('@/api/messaging/messages')
vi.mock('@/api/messaging/users')
const mockedMessagesApi = vi.mocked(messagesApi, true)

const me = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))

function makeMessage(overrides: Partial<Message> = {}): Message {
  return { id: 1, conversationId: 4, senderId: 9, content: 'hi', ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  queryClient.setQueryData(['messagingUser', 'me-uuid'], {
    id: 9,
    uuid: 'me-uuid',
    name: 'Ada',
    lastname: 'Lovelace',
    fullName: 'Ada Lovelace',
  })
})

describe('useSendMessage', () => {
  it('sends the message using the resolved messaging-local senderId', async () => {
    mockedMessagesApi.sendMessage.mockResolvedValue(makeMessage())
    const { result } = renderHook(() => useSendMessage(4), { wrapper: withQueryClient(queryClient) })

    result.current.mutate('hi')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedMessagesApi.sendMessage).toHaveBeenCalledWith(4, { senderId: 9, content: 'hi' })
  })

  it('appends the sent message to the messages cache on success', async () => {
    queryClient.setQueryData(['messages', 4], [])
    mockedMessagesApi.sendMessage.mockResolvedValue(makeMessage({ id: 5, content: 'hey' }))
    const { result } = renderHook(() => useSendMessage(4), { wrapper: withQueryClient(queryClient) })

    result.current.mutate('hey')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['messages', 4])).toEqual([makeMessage({ id: 5, content: 'hey' })])
  })

  it('fails without calling the API when the messaging-local user has not resolved yet', async () => {
    queryClient.removeQueries({ queryKey: ['messagingUser', 'me-uuid'] })
    const { result } = renderHook(() => useSendMessage(4), { wrapper: withQueryClient(queryClient) })

    result.current.mutate('hi')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockedMessagesApi.sendMessage).not.toHaveBeenCalled()
  })
})
