import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import * as usersApi from '@/api/users'
import { FeedPage } from '@/features/feed/FeedPage'
import { TestProviders } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/posts')
vi.mock('@/api/likes')
vi.mock('@/api/users')
const mockedPostsApi = vi.mocked(postsApi, true)
const mockedUsersApi = vi.mocked(usersApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 1, content: 'hi', visibility: 'public', status: 'published', user_id: 1, ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUsersApi.listFollowing.mockResolvedValue([])
})

function renderPage() {
  return render(
    <TestProviders>
      <FeedPage />
    </TestProviders>,
  )
}

describe('FeedPage', () => {
  it('shows an error state with retry on failure', async () => {
    mockedPostsApi.getFeed.mockRejectedValue(new Error('boom'))
    renderPage()
    await waitFor(() => expect(screen.getByText("Couldn't load your feed.")).toBeInTheDocument())
  })

  it('shows an empty state when the feed has no posts', async () => {
    mockedPostsApi.getFeed.mockResolvedValue({ posts: [], meta: {} })
    renderPage()
    await waitFor(() => expect(screen.getByText('Your feed is empty')).toBeInTheDocument())
  })

  it('renders feed posts once loaded', async () => {
    mockedPostsApi.getFeed.mockResolvedValue({ posts: [makePost({ content: 'feed post' })], meta: {} })
    renderPage()
    await waitFor(() => expect(screen.getByText('feed post')).toBeInTheDocument())
  })

  it('disables Previous on the first page and paginates forward on Next', async () => {
    mockedPostsApi.getFeed.mockResolvedValue({
      posts: [makePost()],
      meta: { current_page: 1, total_pages: 2 },
    })
    renderPage()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled())

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(mockedPostsApi.getFeed).toHaveBeenCalledWith({ page: 2, per_page: 20 }))
  })

  it('opens the post composer from "New post"', async () => {
    mockedPostsApi.getFeed.mockResolvedValue({ posts: [], meta: {} })
    renderPage()
    await waitFor(() => expect(screen.getByText('Your feed is empty')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'New post' }))
    expect(screen.getByRole('dialog', { name: 'Create post' })).toBeInTheDocument()
  })
})
