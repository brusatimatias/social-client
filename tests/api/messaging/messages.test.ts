import { beforeEach, describe, expect, it, vi } from 'vitest'
import { messagingApiClient } from '@/api/messaging/client'
import { listMessages, sendMessage } from '@/api/messaging/messages'

vi.mock('@/api/messaging/client', () => ({
  messagingApiClient: { get: vi.fn(), post: vi.fn() },
}))

const mockedClient = vi.mocked(messagingApiClient, true)

beforeEach(() => vi.clearAllMocks())

describe('listMessages', () => {
  it('fetches messages for the given conversation', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await listMessages(4)
    expect(mockedClient.get).toHaveBeenCalledWith('/conversations/4/messages')
  })
})

describe('sendMessage', () => {
  it('posts the senderId and content', async () => {
    const message = { id: 1, conversationId: 4, senderId: 9, content: 'hi' }
    mockedClient.post.mockResolvedValue({ data: { data: message } })

    const result = await sendMessage(4, { senderId: 9, content: 'hi' })

    expect(mockedClient.post).toHaveBeenCalledWith('/conversations/4/messages', { senderId: 9, content: 'hi' })
    expect(result).toEqual(message)
  })
})
