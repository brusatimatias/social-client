import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import * as usersApi from '@/api/users'
import { MyPostsPage } from '@/features/posts/MyPostsPage'
import { TestProviders } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/posts')
vi.mock('@/api/likes')
vi.mock('@/api/users')
const mockedPostsApi = vi.mocked(postsApi, true)
const mockedUsersApi = vi.mocked(usersApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
const showToast = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }))

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
      <MyPostsPage />
    </TestProviders>,
  )
}

describe('MyPostsPage', () => {
  it('shows a loading skeleton then the post list', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([makePost({ content: 'first post' })])
    renderPage()
    await waitFor(() => expect(screen.getByText('first post')).toBeInTheDocument())
  })

  it('shows an error state with retry on failure', async () => {
    mockedPostsApi.listMyPosts.mockRejectedValue(new Error('boom'))
    renderPage()
    await waitFor(() => expect(screen.getByText("Couldn't load your posts.")).toBeInTheDocument())
  })

  it('shows an empty state with a CTA when there are no posts', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('No posts here yet')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Create your first post' })).toBeInTheDocument()
  })

  it('refetches with the selected status when a tab is clicked', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(mockedPostsApi.listMyPosts).toHaveBeenCalledWith(undefined))

    await userEvent.click(screen.getByText('Draft'))
    await waitFor(() => expect(mockedPostsApi.listMyPosts).toHaveBeenCalledWith('draft'))
  })

  it('opens the composer pre-filled when Edit is clicked', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([makePost({ content: 'editable post' })])
    renderPage()
    await waitFor(() => expect(screen.getByText('editable post')).toBeInTheDocument())

    await userEvent.click(screen.getByText('Edit'))
    expect(screen.getByRole('dialog', { name: 'Edit post' })).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toHaveValue('editable post')
  })

  it('deletes a post after confirming, and shows a success toast', async () => {
    mockedPostsApi.listMyPosts.mockResolvedValue([makePost({ content: 'doomed post' })])
    mockedPostsApi.deletePost.mockResolvedValue(undefined)
    renderPage()
    await waitFor(() => expect(screen.getByText('doomed post')).toBeInTheDocument())

    await userEvent.click(screen.getByText('Delete'))
    const dialog = screen.getByRole('dialog', { name: 'Delete post' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedPostsApi.deletePost).toHaveBeenCalledWith(1))
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Post deleted', 'success'))
  })
})
