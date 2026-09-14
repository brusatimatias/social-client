import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { FollowListPage } from '@/features/followers/FollowListPage'
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

function renderPage(kind: 'followers' | 'following', initialEntries: string[] = ['/']) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <FollowListPage kind={kind} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FollowListPage', () => {
  it('shows "My followers" and calls listFollowers with no user_id by default', async () => {
    mockedUsersApi.listFollowers.mockResolvedValue([])
    renderPage('followers')
    expect(screen.getByText('My followers')).toBeInTheDocument()
    await waitFor(() => expect(mockedUsersApi.listFollowers).toHaveBeenCalledWith(undefined))
  })

  it("shows another user's followers and a back link when user_id is present", async () => {
    mockedUsersApi.listFollowers.mockResolvedValue([])
    renderPage('followers', ['/followers?user_id=other-uuid'])
    expect(screen.getByText("User's followers")).toBeInTheDocument()
    expect(screen.getByText('← Back to my followers')).toHaveAttribute('href', '/followers')
    await waitFor(() => expect(mockedUsersApi.listFollowers).toHaveBeenCalledWith('other-uuid'))
  })

  it('shows "My following" with a following-specific empty state', async () => {
    mockedUsersApi.listFollowing.mockResolvedValue([])
    renderPage('following')
    await waitFor(() => expect(screen.getByText('Not following anyone yet')).toBeInTheDocument())
    expect(screen.getByText('Follow people to see their posts in your feed.')).toBeInTheDocument()
  })

  it('shows an error state with retry on failure', async () => {
    mockedUsersApi.listFollowers.mockRejectedValue(new Error('boom'))
    renderPage('followers')
    await waitFor(() => expect(screen.getByText("Couldn't load followers.")).toBeInTheDocument())
  })

  it('renders the fetched users', async () => {
    mockedUsersApi.listFollowers.mockResolvedValue([{ id: 2, uuid: 'u2', name: 'Grace', lastname: 'Hopper' }])
    renderPage('followers')
    await waitFor(() => expect(screen.getByText('Grace Hopper')).toBeInTheDocument())
  })
})
