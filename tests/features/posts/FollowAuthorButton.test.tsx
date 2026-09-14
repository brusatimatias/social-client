import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { FollowAuthorButton } from '@/features/posts/FollowAuthorButton'
import { createTestQueryClient } from '../../support/testProviders'

vi.mock('@/api/users')
const mockedUsersApi = vi.mocked(usersApi, true)

const showToast = vi.fn()
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }))

beforeEach(() => vi.clearAllMocks())

function renderButton(authorUuid: string, followingUuids: string[] = []) {
  mockedUsersApi.listFollowing.mockResolvedValue(followingUuids.map((uuid) => ({ id: 1, uuid, name: 'A', lastname: 'B' })))
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <FollowAuthorButton authorUuid={authorUuid} />
    </QueryClientProvider>,
  )
}

describe('FollowAuthorButton', () => {
  it('shows "Follow" when I do not already follow the author', async () => {
    renderButton('author-uuid')
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Follow'))
  })

  it('shows "Unfollow" when I already follow the author', async () => {
    renderButton('author-uuid', ['author-uuid'])
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Unfollow'))
  })

  it('calls followUser when clicked while not following', async () => {
    const user = userEvent.setup()
    mockedUsersApi.followUser.mockResolvedValue(undefined)
    renderButton('author-uuid')
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Follow'))

    await user.click(screen.getByRole('button'))
    expect(mockedUsersApi.followUser).toHaveBeenCalledWith('author-uuid')
  })

  it('calls unfollowUser when clicked while following', async () => {
    const user = userEvent.setup()
    mockedUsersApi.unfollowUser.mockResolvedValue(undefined)
    renderButton('author-uuid', ['author-uuid'])
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Unfollow'))

    await user.click(screen.getByRole('button'))
    expect(mockedUsersApi.unfollowUser).toHaveBeenCalledWith('author-uuid')
  })

  it('shows a toast when the mutation fails', async () => {
    const user = userEvent.setup()
    mockedUsersApi.followUser.mockRejectedValue(new Error('nope'))
    renderButton('author-uuid')
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Follow'))

    await user.click(screen.getByRole('button'))
    await waitFor(() => expect(showToast).toHaveBeenCalled())
  })
})
