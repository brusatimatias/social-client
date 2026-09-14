import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { useSearchUsers } from '@/features/explore/useSearchUsers'
import { createTestQueryClient, withQueryClient } from '../../support/testProviders'

vi.mock('@/api/users')
const mockedUsersApi = vi.mocked(usersApi, true)

beforeEach(() => vi.clearAllMocks())

describe('useSearchUsers', () => {
  it('trims the query and passes undefined when it is blank', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [], meta: {} })
    const { result } = renderHook(() => useSearchUsers('   '), {
      wrapper: withQueryClient(createTestQueryClient()),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.searchUsers).toHaveBeenCalledWith({ q: undefined })
  })

  it('passes the trimmed query string', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [], meta: {} })
    const { result } = renderHook(() => useSearchUsers('  ada  '), {
      wrapper: withQueryClient(createTestQueryClient()),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.searchUsers).toHaveBeenCalledWith({ q: 'ada' })
  })
})
