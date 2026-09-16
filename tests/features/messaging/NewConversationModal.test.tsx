import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import * as conversationsApi from '@/api/messaging/conversations'
import { NewConversationModal } from '@/features/messaging/NewConversationModal'
import { createTestQueryClient } from '../../support/testProviders'

vi.mock('@/api/users')
vi.mock('@/api/messaging/conversations')
const mockedUsersApi = vi.mocked(usersApi, true)
const mockedConversationsApi = vi.mocked(conversationsApi, true)

const me = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))

function makeMessagingError(message: string): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = { data: { error: { message } }, status: 422, statusText: 'Unprocessable', headers: {}, config: {} as never }
  return error
}

beforeEach(() => vi.clearAllMocks())

function renderModal(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/messages']}>
          <Routes>
            <Route path="/messages" element={<NewConversationModal open onClose={onClose} />} />
            <Route path="/messages/:conversationId" element={<div>Conversation detail</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('NewConversationModal', () => {
  it('shows a prompt before typing anything', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [], meta: {} })
    renderModal()
    await waitFor(() => expect(screen.getByText('Search for someone')).toBeInTheDocument())
  })

  it('searches for a user, creates a conversation, and navigates to it', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({
      users: [{ id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper' }],
      meta: {},
    })
    mockedConversationsApi.createConversation.mockResolvedValue({ id: 9, isGroup: false, name: null })
    const { onClose } = renderModal()

    await userEvent.type(screen.getByLabelText('Search people'), 'Grace')
    await waitFor(() => expect(screen.getByText('Grace Hopper')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Grace Hopper'))

    await waitFor(() =>
      expect(mockedConversationsApi.createConversation).toHaveBeenCalledWith('me-uuid', 'other-uuid'),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByText('Conversation detail')).toBeInTheDocument())
  })

  it('shows an error banner and does not navigate when creating the conversation fails', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({
      users: [{ id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper' }],
      meta: {},
    })
    mockedConversationsApi.createConversation.mockRejectedValue(makeMessagingError('Already in a conversation'))
    const { onClose } = renderModal()

    await userEvent.type(screen.getByLabelText('Search people'), 'Grace')
    await waitFor(() => expect(screen.getByText('Grace Hopper')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Grace Hopper'))

    await waitFor(() => expect(screen.getByText('Already in a conversation')).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })
})
