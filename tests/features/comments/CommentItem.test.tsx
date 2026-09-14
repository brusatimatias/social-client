import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentItem } from '@/features/comments/CommentItem'
import type { Comment } from '@/types/comment'

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return { id: 1, content: 'Nice post!', user: { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' }, ...overrides }
}

const noop = () => {}

describe('CommentItem', () => {
  it("renders the comment author (preferring author over user) and content", () => {
    render(
      <CommentItem
        comment={makeComment({ author: { id: 2, uuid: 'u2', name: 'Grace', lastname: 'Hopper' } })}
        isOwner={false}
        isEditing={false}
        updating={false}
        onStartEdit={noop}
        onCancelEdit={noop}
        onSubmitEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Nice post!')).toBeInTheDocument()
  })

  it('shows Edit/Delete only when isOwner is true and not currently editing', () => {
    const { rerender } = render(
      <CommentItem
        comment={makeComment()}
        isOwner={false}
        isEditing={false}
        updating={false}
        onStartEdit={noop}
        onCancelEdit={noop}
        onSubmitEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()

    rerender(
      <CommentItem
        comment={makeComment()}
        isOwner
        isEditing={false}
        updating={false}
        onStartEdit={noop}
        onCancelEdit={noop}
        onSubmitEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders a CommentForm instead of the plain text while editing', () => {
    render(
      <CommentItem
        comment={makeComment({ content: 'original' })}
        isOwner
        isEditing
        updating={false}
        onStartEdit={noop}
        onCancelEdit={noop}
        onSubmitEdit={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByLabelText('Comment')).toHaveValue('original')
    expect(screen.queryByText('original', { selector: 'p' })).not.toBeInTheDocument()
  })

  it('calls onStartEdit / onDelete from their buttons', async () => {
    const onStartEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <CommentItem
        comment={makeComment()}
        isOwner
        isEditing={false}
        updating={false}
        onStartEdit={onStartEdit}
        onCancelEdit={noop}
        onSubmitEdit={noop}
        onDelete={onDelete}
      />,
    )
    await userEvent.click(screen.getByText('Edit'))
    expect(onStartEdit).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
