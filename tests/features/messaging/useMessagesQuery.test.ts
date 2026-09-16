import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as messagesApi from '@/api/messaging/messages'
import { useMessagesQuery } from '@/features/messaging/useMessagesQuery'
import { withQueryClient } from '../../support/testProviders'

vi.mock('@/api/messaging/messages')
const mockedMessagesApi = vi.mocked(messagesApi, true)

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('useMessagesQuery', () => {
  it('is disabled for a falsy conversation id', () => {
    const { result } = renderHook(() => useMessagesQuery(0), { wrapper: withQueryClient(queryClient) })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedMessagesApi.listMessages).not.toHaveBeenCalled()
  })

  it('fetches messages for the given conversation', async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    const { result } = renderHook(() => useMessagesQuery(4), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedMessagesApi.listMessages).toHaveBeenCalledWith(4)
  })
})
