import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '@/api/users'
import { PostCard } from '@/features/posts/PostCard'
import { rememberUser } from '@/lib/userDirectory'
import { TestProviders } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/likes')
vi.mock('@/api/users')
vi.mocked(usersApi).listFollowing.mockResolvedValue([])
vi.mocked(usersApi).listFollowers.mockResolvedValue([])

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    content: 'Hello world',
    visibility: 'public',
    status: 'published',
    user_id: 1,
    ...overrides,
  }
}

beforeEach(() => vi.clearAllMocks())

function renderCard(post: Post, onEdit?: () => void, onDelete?: () => void) {
  return render(
    <TestProviders>
      <PostCard post={post} onEdit={onEdit} onDelete={onDelete} />
    </TestProviders>,
  )
}

describe('PostCard', () => {
  it('shows "You" and no follow button for my own post', () => {
    renderCard(makePost({ user_id: 1 }))
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument()
  })

  it("shows the author's name and a follow button for someone else's post", () => {
    renderCard(
      makePost({
        user_id: 2,
        author: { id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper' },
      }),
    )
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()
  })

  it('falls back to "Unknown user" when there is no author information at all', () => {
    renderCard(makePost({ user_id: 99, author: undefined }))
    expect(screen.getByText('Unknown user')).toBeInTheDocument()
  })

  it('renders the post content and status/visibility badges', () => {
    renderCard(makePost({ content: 'Nice day', status: 'draft', visibility: 'followers' }))
    expect(screen.getByText('Nice day')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(screen.getByText('followers')).toBeInTheDocument()
  })

  it('renders images and videos in the media grid', () => {
    const { container } = renderCard(
      makePost({ media: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.mp4'] }),
    )
    expect(container.querySelector('img[src="https://cdn.example.com/a.png"]')).toBeInTheDocument()
    expect(container.querySelector('video')).toHaveAttribute('src', 'https://cdn.example.com/b.mp4')
  })

  it('shows Edit/Delete only when the corresponding handlers are given', () => {
    const { rerender } = renderCard(makePost())
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()

    rerender(
      <TestProviders>
        <PostCard post={makePost()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </TestProviders>,
    )
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it("falls back to the user directory's avatar when post.author omits it", () => {
    rememberUser({ id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper', avatar_url: 'g.png' })
    const { container } = renderCard(
      makePost({ user_id: 2, author: { id: 2, uuid: 'other-uuid', name: 'Grace', lastname: 'Hopper' } }),
    )
    expect(container.querySelector('img[src="g.png"]')).toBeInTheDocument()
  })
})
