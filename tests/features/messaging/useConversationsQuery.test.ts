import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as conversationsApi from '@/api/messaging/conversations'
import {
  useConversationQuery,
  useConversationsQuery,
  useCreateConversation,
} from '@/features/messaging/useConversationsQuery'
import { withQueryClient } from '../../support/testProviders'
import type { Conversation } from '@/types/conversation'
import type { User } from '@/types/user'

vi.mock('@/api/messaging/conversations')
const mockedConversationsApi = vi.mocked(conversationsApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { id: 1, isGroup: false, name: null, ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
})

describe('useConversationsQuery', () => {
  it('fetches the conversation list', async () => {
    mockedConversationsApi.listConversations.mockResolvedValue([makeConversation()])
    const { result } = renderHook(() => useConversationsQuery(), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([makeConversation()])
  })
})

describe('useConversationQuery', () => {
  it('is disabled for a falsy id', () => {
    const { result } = renderHook(() => useConversationQuery(0), { wrapper: withQueryClient(queryClient) })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedConversationsApi.getConversation).not.toHaveBeenCalled()
  })

  it('fetches the conversation by id', async () => {
    mockedConversationsApi.getConversation.mockResolvedValue(makeConversation({ id: 4 }))
    const { result } = renderHook(() => useConversationQuery(4), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedConversationsApi.getConversation).toHaveBeenCalledWith(4)
  })
})

describe('useCreateConversation', () => {
  it('creates a conversation using my uuid and the target uuid', async () => {
    mockedConversationsApi.createConversation.mockResolvedValue(makeConversation({ id: 7 }))
    const { result } = renderHook(() => useCreateConversation(), { wrapper: withQueryClient(queryClient) })

    result.current.mutate('other-uuid')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedConversationsApi.createConversation).toHaveBeenCalledWith('me-uuid', 'other-uuid')
  })

  it('prepends the new conversation to the cached list', async () => {
    queryClient.setQueryData(['conversations'], [makeConversation({ id: 1 })])
    mockedConversationsApi.createConversation.mockResolvedValue(makeConversation({ id: 7 }))
    const { result } = renderHook(() => useCreateConversation(), { wrapper: withQueryClient(queryClient) })

    result.current.mutate('other-uuid')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData<Conversation[]>(['conversations'])).toEqual([
      makeConversation({ id: 7 }),
      makeConversation({ id: 1 }),
    ])
  })
})
