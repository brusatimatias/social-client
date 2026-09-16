import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as conversationsApi from '@/api/messaging/conversations'
import * as messagingSocket from '@/lib/messagingSocket'
import { ConversationsPage } from '@/features/messaging/ConversationsPage'
import { TestProviders } from '../../support/testProviders'
import type { Conversation } from '@/types/conversation'

vi.mock('@/api/messaging/conversations')
vi.mock('@/api/users')
vi.mock('@/lib/messagingSocket')
const mockedConversationsApi = vi.mocked(conversationsApi, true)
const mockedSocket = vi.mocked(messagingSocket, true)

const me = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me, status: 'authenticated' }) }))

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { id: 4, isGroup: false, name: null, ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedSocket.onNewMessage.mockReturnValue(vi.fn())
})

function renderPage() {
  return render(
    <TestProviders>
      <ConversationsPage />
    </TestProviders>,
  )
}

describe('ConversationsPage', () => {
  it('shows an empty state when there are no conversations', async () => {
    mockedConversationsApi.listConversations.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('No conversations yet')).toBeInTheDocument())
  })

  it('shows an error state with retry on failure', async () => {
    mockedConversationsApi.listConversations.mockRejectedValue(new Error('boom'))
    renderPage()
    await waitFor(() => expect(screen.getByText("Couldn't load your conversations.")).toBeInTheDocument())
  })

  it('opens the new conversation modal', async () => {
    mockedConversationsApi.listConversations.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('No conversations yet')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'New message' }))

    expect(screen.getByRole('dialog', { name: 'New message' })).toBeInTheDocument()
  })

  it('renders one row per conversation, fetching each detail', async () => {
    mockedConversationsApi.listConversations.mockResolvedValue([makeConversation({ id: 1 }), makeConversation({ id: 2 })])
    mockedConversationsApi.getConversation.mockResolvedValue(makeConversation())

    renderPage()

    await waitFor(() => expect(mockedConversationsApi.getConversation).toHaveBeenCalledTimes(2))
    expect(mockedConversationsApi.getConversation).toHaveBeenCalledWith(1)
    expect(mockedConversationsApi.getConversation).toHaveBeenCalledWith(2)
  })
})
