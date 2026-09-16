import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as conversationsApi from '@/api/messaging/conversations'
import { ConversationListItem } from '@/features/messaging/ConversationListItem'
import { TestProviders } from '../../support/testProviders'
import type { Conversation } from '@/types/conversation'
import type { User } from '@/types/user'

vi.mock('@/api/messaging/conversations')
const mockedConversationsApi = vi.mocked(conversationsApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { id: 4, isGroup: false, name: null, ...overrides }
}

beforeEach(() => vi.clearAllMocks())

describe('ConversationListItem', () => {
  it("shows the other participant's name once the detail resolves", async () => {
    mockedConversationsApi.getConversation.mockResolvedValue({
      ...makeConversation(),
      participants: [
        {
          id: 1,
          conversationId: 4,
          userId: 1,
          User: { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace', fullName: 'Ada Lovelace' },
        },
        {
          id: 2,
          conversationId: 4,
          userId: 2,
          User: { id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper', fullName: 'Grace Hopper' },
        },
      ],
    })

    render(
      <TestProviders>
        <ConversationListItem conversation={makeConversation()} />
      </TestProviders>,
    )

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument()
  })

  it('falls back to a generic label while the detail is loading', () => {
    mockedConversationsApi.getConversation.mockReturnValue(new Promise(() => {}))

    render(
      <TestProviders>
        <ConversationListItem conversation={makeConversation()} />
      </TestProviders>,
    )

    expect(screen.getByText('Conversation')).toBeInTheDocument()
  })

  it('shows the last message preview when present', () => {
    mockedConversationsApi.getConversation.mockReturnValue(new Promise(() => {}))

    render(
      <TestProviders>
        <ConversationListItem
          conversation={makeConversation({
            lastMessage: { id: 1, conversationId: 4, senderId: 2, content: 'Hey there' },
          })}
        />
      </TestProviders>,
    )

    expect(screen.getByText('Hey there')).toBeInTheDocument()
  })
})
