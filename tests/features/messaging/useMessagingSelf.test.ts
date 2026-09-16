import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as messagingUsersApi from '@/api/messaging/users'
import { useMessagingSelf } from '@/features/messaging/useMessagingSelf'
import { withQueryClient } from '../../support/testProviders'
import type { User } from '@/types/user'

vi.mock('@/api/messaging/users')
const mockedUsersApi = vi.mocked(messagingUsersApi, true)

let currentUser: User | null = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: currentUser }) }))

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  currentUser = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('useMessagingSelf', () => {
  it('resolves the messaging-service-local user for the current uuid', async () => {
    mockedUsersApi.getMessagingUser.mockResolvedValue({
      id: 9,
      uuid: 'me-uuid',
      name: 'Ada',
      lastname: 'Lovelace',
      fullName: 'Ada Lovelace',
    })
    const { result } = renderHook(() => useMessagingSelf(), { wrapper: withQueryClient(queryClient) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.getMessagingUser).toHaveBeenCalledWith('me-uuid')
    expect(result.current.data?.id).toBe(9)
  })

  it('is disabled when there is no authenticated user', () => {
    currentUser = null
    const { result } = renderHook(() => useMessagingSelf(), { wrapper: withQueryClient(queryClient) })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedUsersApi.getMessagingUser).not.toHaveBeenCalled()
  })
})
