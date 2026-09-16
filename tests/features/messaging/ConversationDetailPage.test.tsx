import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as conversationsApi from '@/api/messaging/conversations'
import * as messagesApi from '@/api/messaging/messages'
import * as messagingUsersApi from '@/api/messaging/users'
import * as messagingSocket from '@/lib/messagingSocket'
import { ConversationDetailPage } from '@/features/messaging/ConversationDetailPage'
import { createTestQueryClient } from '../../support/testProviders'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'

vi.mock('@/api/messaging/conversations')
vi.mock('@/api/messaging/messages')
vi.mock('@/api/messaging/users')
vi.mock('@/lib/messagingSocket')

const mockedConversationsApi = vi.mocked(conversationsApi, true)
const mockedMessagesApi = vi.mocked(messagesApi, true)
const mockedUsersApi = vi.mocked(messagingUsersApi, true)
const mockedSocket = vi.mocked(messagingSocket, true)

const me = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me, status: 'authenticated' }) }))

function makeMessagingError(message: string): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = { data: { error: { message } }, status: 422, statusText: 'Unprocessable', headers: {}, config: {} as never }
  return error
}

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 4,
    isGroup: false,
    name: null,
    participants: [
      {
        id: 1,
        conversationId: 4,
        userId: 9,
        User: { id: 9, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace', fullName: 'Ada Lovelace' },
      },
      {
        id: 2,
        conversationId: 4,
        userId: 10,
        User: { id: 10, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper', fullName: 'Grace Hopper' },
      },
    ],
    ...overrides,
  }
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return { id: 1, conversationId: 4, senderId: 9, content: 'hi', ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedSocket.onNewMessage.mockReturnValue(vi.fn())
  mockedUsersApi.getMessagingUser.mockResolvedValue({
    id: 9,
    uuid: 'me-uuid',
    name: 'Ada',
    lastname: 'Lovelace',
    fullName: 'Ada Lovelace',
  })
  mockedConversationsApi.getConversation.mockResolvedValue(makeConversation())
})

function renderPage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/messages/4']}>
        <Routes>
          <Route path="/messages/:conversationId" element={<ConversationDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ConversationDetailPage', () => {
  it("shows the other participant's name in the header", async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Grace Hopper' })).toBeInTheDocument())
  })

  it('shows an empty state with no messages', async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('No messages yet')).toBeInTheDocument())
  })

  it("renders my messages and the other participant's messages", async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([
      makeMessage({ id: 1, senderId: 9, content: 'mine' }),
      makeMessage({ id: 2, senderId: 10, content: 'theirs' }),
    ])
    renderPage()
    await waitFor(() => expect(screen.getByText('mine')).toBeInTheDocument())
    expect(screen.getByText('theirs')).toBeInTheDocument()
  })

  it('sends a message and shows it immediately, clearing the draft', async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    mockedMessagesApi.sendMessage.mockResolvedValue(makeMessage({ id: 5, content: 'hello there' }))
    renderPage()

    await waitFor(() => expect(screen.getByText('No messages yet')).toBeInTheDocument())
    const textarea = screen.getByLabelText('Message')
    await userEvent.type(textarea, 'hello there')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(mockedMessagesApi.sendMessage).toHaveBeenCalledWith(4, { senderId: 9, content: 'hello there' }),
    )
    await waitFor(() => expect(screen.getByText('hello there')).toBeInTheDocument())
    expect(textarea).toHaveValue('')
  })

  it('sends on Enter without Shift', async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    mockedMessagesApi.sendMessage.mockResolvedValue(makeMessage({ id: 6, content: 'quick' }))
    renderPage()

    await waitFor(() => expect(screen.getByText('No messages yet')).toBeInTheDocument())
    const textarea = screen.getByLabelText('Message')
    await userEvent.type(textarea, 'quick')
    fireEvent.keyDown(textarea, { key: 'Enter' })

    await waitFor(() =>
      expect(mockedMessagesApi.sendMessage).toHaveBeenCalledWith(4, { senderId: 9, content: 'quick' }),
    )
  })

  it('shows an error banner and restores the draft when sending fails', async () => {
    mockedMessagesApi.listMessages.mockResolvedValue([])
    mockedMessagesApi.sendMessage.mockRejectedValue(makeMessagingError('Conversation not found'))
    renderPage()

    await waitFor(() => expect(screen.getByText('No messages yet')).toBeInTheDocument())
    const textarea = screen.getByLabelText('Message')
    await userEvent.type(textarea, 'oops')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(screen.getByText('Conversation not found')).toBeInTheDocument())
    expect(textarea).toHaveValue('oops')
  })
})
