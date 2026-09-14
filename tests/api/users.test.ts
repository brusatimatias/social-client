import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedClient = vi.mocked(apiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('listFollowers / listFollowing', () => {
  it('fetches my own followers with no params', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await usersApi.listFollowers()
    expect(mockedClient.get).toHaveBeenCalledWith('/users/followers', { params: undefined })
  })

  it('fetches another user\'s followers by user_id', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await usersApi.listFollowers('uuid-1')
    expect(mockedClient.get).toHaveBeenCalledWith('/users/followers', { params: { user_id: 'uuid-1' } })
  })

  it('fetches following the same way', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await usersApi.listFollowing('uuid-1')
    expect(mockedClient.get).toHaveBeenCalledWith('/users/following', { params: { user_id: 'uuid-1' } })
  })
})

describe('searchUsers', () => {
  it('returns users and meta from the envelope', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [{ uuid: 'u1' }], meta: { total_count: 1 } } })
    const result = await usersApi.searchUsers({ q: 'ada' })
    expect(mockedClient.get).toHaveBeenCalledWith('/users/search', { params: { q: 'ada' } })
    expect(result).toEqual({ users: [{ uuid: 'u1' }], meta: { total_count: 1 } })
  })

  it('defaults params to an empty object', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [], meta: {} } })
    await usersApi.searchUsers()
    expect(mockedClient.get).toHaveBeenCalledWith('/users/search', { params: {} })
  })
})

describe('followUser / unfollowUser', () => {
  it('posts to the follow endpoint', async () => {
    mockedClient.post.mockResolvedValue({ data: {} })
    await usersApi.followUser('uuid-1')
    expect(mockedClient.post).toHaveBeenCalledWith('/users/uuid-1/follow')
  })

  it('deletes the follow endpoint to unfollow', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await usersApi.unfollowUser('uuid-1')
    expect(mockedClient.delete).toHaveBeenCalledWith('/users/uuid-1/follow')
  })
})
