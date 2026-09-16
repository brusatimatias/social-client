import { beforeEach, describe, expect, it, vi } from 'vitest'
import { messagingApiClient } from '@/api/messaging/client'
import { createConversation, getConversation, listConversations } from '@/api/messaging/conversations'

vi.mock('@/api/messaging/client', () => ({
  messagingApiClient: { get: vi.fn(), post: vi.fn() },
}))

const mockedClient = vi.mocked(messagingApiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('listConversations', () => {
  it('fetches the conversation list', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    const result = await listConversations()
    expect(mockedClient.get).toHaveBeenCalledWith('/conversations')
    expect(result).toEqual([])
  })
})

describe('getConversation', () => {
  it('fetches a single conversation by id', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: { id: 4, isGroup: false, name: null } } })
    const result = await getConversation(4)
    expect(mockedClient.get).toHaveBeenCalledWith('/conversations/4')
    expect(result).toEqual({ id: 4, isGroup: false, name: null })
  })
})

describe('createConversation', () => {
  it('posts a 1:1 conversation payload with both uuids', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: { id: 5, isGroup: false, name: null } } })
    const result = await createConversation('me-uuid', 'other-uuid')
    expect(mockedClient.post).toHaveBeenCalledWith('/conversations', {
      isGroup: false,
      name: null,
      participantUuids: ['me-uuid', 'other-uuid'],
    })
    expect(result).toEqual({ id: 5, isGroup: false, name: null })
  })
})
