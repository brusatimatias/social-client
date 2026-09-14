import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentForm } from '@/features/comments/CommentForm'

describe('CommentForm', () => {
  it('disables submit until there is non-whitespace content', async () => {
    render(<CommentForm onSubmit={vi.fn()} />)
    const submit = screen.getByRole('button', { name: 'Comment' })
    expect(submit).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Comment'), '   ')
    expect(submit).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Comment'), 'nice post')
    expect(submit).toBeEnabled()
  })

  it('submits the trimmed content and clears the field for a new comment', async () => {
    const onSubmit = vi.fn()
    render(<CommentForm onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('Comment')
    await userEvent.type(textarea, '  nice post  ')
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }))

    expect(onSubmit).toHaveBeenCalledWith('nice post')
    expect(textarea).toHaveValue('')
  })

  it('keeps the content in the field when editing (initialValue given)', async () => {
    const onSubmit = vi.fn()
    render(<CommentForm initialValue="original" submitLabel="Save" onSubmit={onSubmit} />)

    const textarea = screen.getByLabelText('Comment')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'edited')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith('edited')
    expect(textarea).toHaveValue('edited')
  })

  it('renders and calls onCancel only when provided', async () => {
    const onCancel = vi.fn()
    render(<CommentForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('omits the cancel button when onCancel is not given', () => {
    render(<CommentForm onSubmit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })
})
