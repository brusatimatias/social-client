import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import { PostComposerModal } from '@/features/posts/PostComposerModal'
import { createTestQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'

function makeAxiosError(errors: string[]): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = { data: { errors }, status: 422, statusText: 'Unprocessable', headers: {}, config: {} as never }
  return error
}

vi.mock('@/api/posts')
const mockedPostsApi = vi.mocked(postsApi, true)

beforeEach(() => vi.clearAllMocks())

function renderModal(props: Partial<Parameters<typeof PostComposerModal>[0]> = {}) {
  const queryClient = createTestQueryClient()
  const onClose = vi.fn()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <PostComposerModal open onClose={onClose} {...props} />
    </QueryClientProvider>,
  )
  return { onClose, ...utils }
}

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 16, content: 'original', visibility: 'followers', status: 'draft', ...overrides }
}

describe('PostComposerModal', () => {
  it('shows "Create post" with an empty form when no post is given', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Create post' })).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled()
  })

  it('shows "Edit post" pre-filled with the post being edited', () => {
    renderModal({ post: makePost() })
    expect(screen.getByRole('dialog', { name: 'Edit post' })).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toHaveValue('original')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('enables Post once content is typed', async () => {
    renderModal()
    await userEvent.type(screen.getByLabelText('Content'), 'hello world')
    expect(screen.getByRole('button', { name: 'Post' })).toBeEnabled()
  })

  it('creates a post with the form values and closes on success', async () => {
    mockedPostsApi.createPost.mockResolvedValue(makePost({ id: 1 }))
    const { onClose } = renderModal()

    await userEvent.type(screen.getByLabelText('Content'), 'hello world')
    await userEvent.click(screen.getByRole('button', { name: 'Post' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(mockedPostsApi.createPost).toHaveBeenCalledWith({
      content: 'hello world',
      visibility: 'public',
      status: 'published',
      media: [],
    })
  })

  it('updates a post using its id when editing', async () => {
    mockedPostsApi.updatePost.mockResolvedValue(makePost({ content: 'edited' }))
    const { onClose } = renderModal({ post: makePost() })

    const textarea = screen.getByLabelText('Content')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'edited')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(mockedPostsApi.updatePost).toHaveBeenCalledWith(16, expect.objectContaining({ content: 'edited' })))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the API error banner and does not close on failure', async () => {
    mockedPostsApi.createPost.mockRejectedValue(makeAxiosError(['Content is too short']))
    const { onClose } = renderModal()

    await userEvent.type(screen.getByLabelText('Content'), 'hi')
    await userEvent.click(screen.getByRole('button', { name: 'Post' }))

    await waitFor(() => expect(screen.getByText('Content is too short')).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose from the Cancel button without submitting', async () => {
    const { onClose } = renderModal()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockedPostsApi.createPost).not.toHaveBeenCalled()
  })
})
