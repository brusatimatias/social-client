import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as likesApi from '@/api/likes'
import { LikeButton } from '@/features/likes/LikeButton'
import { createTestQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

vi.mock('@/api/likes')
const mockedLikesApi = vi.mocked(likesApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
const showToast = vi.fn()

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }))

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 1, content: 'hi', visibility: 'public', status: 'published', ...overrides }
}

function renderButton(post: Post, queryClient = createTestQueryClient()) {
  queryClient.setQueryData(['post', post.id], post)
  return { queryClient, ...render(<QueryClientProvider client={queryClient}><LikeButton post={post} /></QueryClientProvider>) }
}

beforeEach(() => vi.clearAllMocks())

describe('LikeButton', () => {
  it('renders the unliked state with the current count', () => {
    renderButton(makePost({ likes_count: 3 }))
    expect(screen.getByText('🤍')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders the liked state when the post says liked_by_me', () => {
    renderButton(makePost({ likes_count: 1, liked_by_me: true, my_like_id: 5 }))
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })

  it('creates a like and patches the post cache with the new like id', async () => {
    const user = userEvent.setup()
    mockedLikesApi.createLike.mockResolvedValue({ id: 42 })
    const { queryClient } = renderButton(makePost({ likes_count: 0 }))

    await user.click(screen.getByRole('button'))

    expect(mockedLikesApi.createLike).toHaveBeenCalledWith(1)
    await waitFor(() => {
      const cached = queryClient.getQueryData<Post>(['post', 1])
      expect(cached?.my_like_id).toBe(42)
      expect(cached?.liked_by_me).toBe(true)
    })
  })

  it('deletes the like using the existing like id when already liked', async () => {
    const user = userEvent.setup()
    mockedLikesApi.deleteLike.mockResolvedValue(undefined)
    renderButton(makePost({ likes_count: 1, liked_by_me: true, my_like_id: 5 }))

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(mockedLikesApi.deleteLike).toHaveBeenCalledWith(1, 5))
  })

  it('rolls back the optimistic update and toasts an error on failure', async () => {
    const user = userEvent.setup()
    mockedLikesApi.createLike.mockRejectedValue(new Error('nope'))
    const { queryClient } = renderButton(makePost({ likes_count: 0, liked_by_me: false }))

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(showToast).toHaveBeenCalled())
    const cached = queryClient.getQueryData<Post>(['post', 1])
    expect(cached?.liked_by_me).toBe(false)
    expect(cached?.likes_count).toBe(0)
  })
})
