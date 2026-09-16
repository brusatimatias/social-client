import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import { appendMessageToCache } from '@/features/messaging/messageCache'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'

function makeMessage(overrides: Partial<Message> = {}): Message {
  return { id: 1, conversationId: 4, senderId: 9, content: 'hi', ...overrides }
}

let queryClient: QueryClient

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('appendMessageToCache', () => {
  it('appends the message to the matching messages cache', () => {
    queryClient.setQueryData(['messages', 4], [makeMessage({ id: 1 })])

    appendMessageToCache(queryClient, makeMessage({ id: 2, content: 'second' }))

    expect(queryClient.getQueryData(['messages', 4])).toEqual([
      makeMessage({ id: 1 }),
      makeMessage({ id: 2, content: 'second' }),
    ])
  })

  it('does not duplicate a message already in the cache', () => {
    queryClient.setQueryData(['messages', 4], [makeMessage({ id: 1 })])

    appendMessageToCache(queryClient, makeMessage({ id: 1 }))

    expect(queryClient.getQueryData(['messages', 4])).toEqual([makeMessage({ id: 1 })])
  })

  it('leaves an uncached messages query untouched', () => {
    appendMessageToCache(queryClient, makeMessage())
    expect(queryClient.getQueryData(['messages', 4])).toBeUndefined()
  })

  it('sets the conversation lastMessage and moves it to the front of the list', () => {
    const conversations: Conversation[] = [
      { id: 1, isGroup: false, name: null },
      { id: 4, isGroup: false, name: null },
    ]
    queryClient.setQueryData(['conversations'], conversations)

    appendMessageToCache(queryClient, makeMessage({ id: 9, conversationId: 4, content: 'hey' }))

    const cached = queryClient.getQueryData<Conversation[]>(['conversations'])
    expect(cached?.map((c) => c.id)).toEqual([4, 1])
    expect(cached?.[0].lastMessage?.content).toBe('hey')
  })

  it('leaves the conversations cache untouched when the conversation is not present', () => {
    const conversations: Conversation[] = [{ id: 1, isGroup: false, name: null }]
    queryClient.setQueryData(['conversations'], conversations)

    appendMessageToCache(queryClient, makeMessage({ conversationId: 999 }))

    expect(queryClient.getQueryData(['conversations'])).toEqual(conversations)
  })
})
