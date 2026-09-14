import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { ExplorePage } from '@/features/explore/ExplorePage'
import { createTestQueryClient } from '../../support/testProviders'
import type { User } from '@/types/user'

vi.mock('@/api/users')
const mockedUsersApi = vi.mocked(usersApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

beforeEach(() => {
  vi.clearAllMocks()
  mockedUsersApi.listFollowing.mockResolvedValue([])
})

function renderPage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ExplorePage', () => {
  it('shows a browsable list before typing anything', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [{ id: 2, uuid: 'u2', name: 'Grace', lastname: 'Hopper' }], meta: {} })
    renderPage()
    await waitFor(() => expect(screen.getByText('Grace Hopper')).toBeInTheDocument())
    expect(mockedUsersApi.searchUsers).toHaveBeenCalledWith({ q: undefined })
  })

  it('shows an empty state with a query-specific message when there are no matches', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [], meta: {} })
    renderPage()
    await userEvent.type(screen.getByLabelText('Search people'), 'zzz')
    await waitFor(() => expect(screen.getByText('No matches')).toBeInTheDocument(), { timeout: 2000 })
    expect(screen.getByText('No one found for "zzz".')).toBeInTheDocument()
  })

  it('shows an error state with retry on failure', async () => {
    mockedUsersApi.searchUsers.mockRejectedValue(new Error('boom'))
    renderPage()
    await waitFor(() => expect(screen.getByText("Couldn't load people.")).toBeInTheDocument())
  })

  it('lets me follow a searched user', async () => {
    mockedUsersApi.searchUsers.mockResolvedValue({ users: [{ id: 2, uuid: 'u2', name: 'Grace', lastname: 'Hopper' }], meta: {} })
    mockedUsersApi.followUser.mockResolvedValue(undefined)
    renderPage()
    await waitFor(() => expect(screen.getByText('Grace Hopper')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Follow' }))
    expect(mockedUsersApi.followUser).toHaveBeenCalledWith('u2')
  })
})
