import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import {
  useFollowList,
  useFollowMutations,
  useFollowing,
  useMyFollowingIds,
} from '@/features/followers/useFollowQueries'
import { withQueryClient } from '../../support/testProviders'
import type { User } from '@/types/user'

vi.mock('@/api/users')
const mockedUsersApi = vi.mocked(usersApi, true)

function makeUser(overrides: Partial<User> = {}): User {
  return { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace', ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
})

describe('useFollowing', () => {
  it('fetches my own following list by default', async () => {
    mockedUsersApi.listFollowing.mockResolvedValue([makeUser()])
    const { result } = renderHook(() => useFollowing(), { wrapper: withQueryClient(queryClient) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.listFollowing).toHaveBeenCalledWith(undefined)
  })
})

describe('useFollowList', () => {
  it('calls listFollowers for kind "followers"', async () => {
    mockedUsersApi.listFollowers.mockResolvedValue([makeUser()])
    const { result } = renderHook(() => useFollowList('followers', 'uuid-x'), {
      wrapper: withQueryClient(queryClient),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.listFollowers).toHaveBeenCalledWith('uuid-x')
    expect(mockedUsersApi.listFollowing).not.toHaveBeenCalled()
  })

  it('calls listFollowing for kind "following"', async () => {
    mockedUsersApi.listFollowing.mockResolvedValue([makeUser()])
    const { result } = renderHook(() => useFollowList('following', 'uuid-x'), {
      wrapper: withQueryClient(queryClient),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUsersApi.listFollowing).toHaveBeenCalledWith('uuid-x')
    expect(mockedUsersApi.listFollowers).not.toHaveBeenCalled()
  })
})

describe('useMyFollowingIds', () => {
  it('returns a set of uuids from my following list', async () => {
    mockedUsersApi.listFollowing.mockResolvedValue([makeUser({ uuid: 'a' }), makeUser({ uuid: 'b' })])
    const { result } = renderHook(() => useMyFollowingIds(), { wrapper: withQueryClient(queryClient) })
    await waitFor(() => expect(result.current.size).toBe(2))
    expect(result.current.has('a')).toBe(true)
    expect(result.current.has('b')).toBe(true)
  })

  it('returns an empty set while loading', () => {
    mockedUsersApi.listFollowing.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useMyFollowingIds(), { wrapper: withQueryClient(queryClient) })
    expect(result.current.size).toBe(0)
  })
})

describe('useFollowMutations', () => {
  it('follow invalidates only my following list and the target user\'s followers', async () => {
    mockedUsersApi.followUser.mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useFollowMutations(), { wrapper: withQueryClient(queryClient) })
    result.current.follow.mutate('target-uuid')

    await waitFor(() => expect(result.current.follow.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['following', 'me'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['followers', 'target-uuid'] })
    expect(invalidateSpy).toHaveBeenCalledTimes(2)
  })

  it('unfollow invalidates the same two keys', async () => {
    mockedUsersApi.unfollowUser.mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useFollowMutations(), { wrapper: withQueryClient(queryClient) })
    result.current.unfollow.mutate('target-uuid')

    await waitFor(() => expect(result.current.unfollow.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['following', 'me'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['followers', 'target-uuid'] })
  })
})
