import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import * as usersApi from '@/api/users'
import { PostDetailPage } from '@/features/posts/PostDetailPage'
import { createTestQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/posts')
vi.mock('@/api/likes')
vi.mock('@/api/comments')
vi.mock('@/api/users')
const mockedPostsApi = vi.mocked(postsApi, true)
const mockedUsersApi = vi.mocked(usersApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 16, content: 'hi', visibility: 'public', status: 'published', user_id: 1, comments: [], ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUsersApi.listFollowing.mockResolvedValue([])
})

function renderAt(path: string) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PostDetailPage', () => {
  it('fetches the post using a numeric id, not the raw string route param', async () => {
    mockedPostsApi.getPost.mockResolvedValue(makePost())
    renderAt('/posts/16')
    await waitFor(() => expect(mockedPostsApi.getPost).toHaveBeenCalledWith(16))
  })

  it('renders the post content and its comments section once loaded', async () => {
    mockedPostsApi.getPost.mockResolvedValue(makePost({ content: 'a great post', comments: [{ id: 1, content: 'nice', user: me }] }))
    renderAt('/posts/16')
    await waitFor(() => expect(screen.getByText('a great post')).toBeInTheDocument())
    expect(screen.getByText('Comments (1)')).toBeInTheDocument()
    expect(screen.getByText('nice')).toBeInTheDocument()
  })

  it('shows an error state with retry when the post fails to load', async () => {
    mockedPostsApi.getPost.mockRejectedValue(new Error('boom'))
    renderAt('/posts/16')
    await waitFor(() => expect(screen.getByText("Couldn't load this post.")).toBeInTheDocument())
  })

  it('links back to the feed', async () => {
    mockedPostsApi.getPost.mockResolvedValue(makePost())
    renderAt('/posts/16')
    await waitFor(() => expect(screen.getByText('← Back')).toHaveAttribute('href', '/feed'))
  })
})
