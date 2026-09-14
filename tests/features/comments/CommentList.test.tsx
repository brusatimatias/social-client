import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as commentsApi from '@/api/comments'
import { CommentList } from '@/features/comments/CommentList'
import { createTestQueryClient } from '../../support/testProviders'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

// CommentList reads comments from its `post` prop rather than subscribing to the query
// cache itself — in the real app, the parent page's usePost() re-renders it with fresh
// data. This harness reproduces that by subscribing to the same ['post', id] cache entry
// that useCommentMutations patches, so a mutation's effect is actually observable here.
function Harness({ post }: { post: Post }) {
  const { data } = useQuery({ queryKey: ['post', post.id], queryFn: () => Promise.resolve(post), initialData: post })
  return <CommentList post={data} />
}

vi.mock('@/api/comments')
const mockedCommentsApi = vi.mocked(commentsApi, true)

const me: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace' }
const showToast = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: me }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }))

function makePost(overrides: Partial<Post> = {}): Post {
  return { id: 9, content: 'hi', visibility: 'public', status: 'published', comments: [], ...overrides }
}

beforeEach(() => vi.clearAllMocks())

function renderList(post: Post) {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(['post', post.id], post)
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness post={post} />
    </QueryClientProvider>,
  )
}

describe('CommentList', () => {
  it('shows the comment count and an empty state when there are none', () => {
    renderList(makePost())
    expect(screen.getByText('Comments (0)')).toBeInTheDocument()
    expect(screen.getByText('No comments yet. Be the first to comment.')).toBeInTheDocument()
  })

  it('renders existing comments', () => {
    renderList(makePost({ comments: [{ id: 1, content: 'Nice!', user: me }] }))
    expect(screen.getByText('Comments (1)')).toBeInTheDocument()
    expect(screen.getByText('Nice!')).toBeInTheDocument()
  })

  it('creates a new comment via the form', async () => {
    const user = userEvent.setup()
    mockedCommentsApi.createComment.mockResolvedValue({ id: 5, content: 'hey' } as never)
    renderList(makePost())

    await user.type(screen.getByLabelText('Comment'), 'hey')
    await user.click(screen.getByRole('button', { name: 'Comment' }))

    await waitFor(() => expect(screen.getByText('hey')).toBeInTheDocument())
    expect(mockedCommentsApi.createComment).toHaveBeenCalledWith(9, 'hey')
  })

  it('shows a toast when creating a comment fails', async () => {
    const user = userEvent.setup()
    mockedCommentsApi.createComment.mockRejectedValue(new Error('boom'))
    renderList(makePost())

    await user.type(screen.getByLabelText('Comment'), 'hey')
    await user.click(screen.getByRole('button', { name: 'Comment' }))

    await waitFor(() => expect(showToast).toHaveBeenCalled())
  })

  it("lets the comment's owner edit it", async () => {
    const user = userEvent.setup()
    mockedCommentsApi.updateComment.mockResolvedValue({ id: 1, content: 'updated' } as never)
    renderList(makePost({ comments: [{ id: 1, content: 'original', user: me }] }))

    await user.click(screen.getByText('Edit'))
    // The bottom "new comment" form has its own textarea with the same label; the edit
    // form for this comment renders first in the DOM.
    const editField = screen.getAllByLabelText('Comment')[0]
    await user.clear(editField)
    await user.type(editField, 'updated')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockedCommentsApi.updateComment).toHaveBeenCalledWith(9, 1, 'updated'))
  })

  it("does not show Edit/Delete for someone else's comment", () => {
    renderList(
      makePost({
        comments: [{ id: 1, content: 'not mine', user: { id: 2, uuid: 'other', name: 'Bob', lastname: 'X' } }],
      }),
    )
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('deletes a comment after confirming the dialog', async () => {
    const user = userEvent.setup()
    mockedCommentsApi.deleteComment.mockResolvedValue(undefined)
    renderList(makePost({ comments: [{ id: 1, content: 'bye', user: me }] }))

    await user.click(screen.getByText('Delete'))
    const dialog = screen.getByRole('dialog', { name: 'Delete comment' })

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedCommentsApi.deleteComment).toHaveBeenCalledWith(9, 1))
  })
})
