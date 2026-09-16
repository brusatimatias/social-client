import { beforeEach, describe, expect, it, vi } from 'vitest'
import { messagingApiClient } from '@/api/messaging/client'
import { getMessagingUser } from '@/api/messaging/users'

vi.mock('@/api/messaging/client', () => ({
  messagingApiClient: { get: vi.fn(), post: vi.fn() },
}))

const mockedClient = vi.mocked(messagingApiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('getMessagingUser', () => {
  it('fetches the messaging-service user by uuid', async () => {
    const user = { id: 9, uuid: 'u1', name: 'Ada', lastname: 'Lovelace', fullName: 'Ada Lovelace' }
    mockedClient.get.mockResolvedValue({ data: { data: user } })

    const result = await getMessagingUser('u1')

    expect(mockedClient.get).toHaveBeenCalledWith('/users/u1')
    expect(result).toEqual(user)
  })
})
