import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from '@/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog open={false} title="Delete post" description="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title and description when open, defaulting the confirm label to Delete', () => {
    render(
      <ConfirmDialog open title="Delete post" description="This can't be undone." onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByRole('dialog', { name: 'Delete post' })).toBeInTheDocument()
    expect(screen.getByText("This can't be undone.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls onConfirm and onCancel from their respective buttons', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog open title="Delete post" description="Sure?" onConfirm={onConfirm} onCancel={onCancel} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables Cancel and shows a loading Confirm button while pending', () => {
    render(
      <ConfirmDialog
        open
        loading
        title="Delete post"
        description="Sure?"
        confirmLabel="Remove"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    // The pending spinner's own "Loading" label gets folded into the accessible name.
    expect(screen.getByRole('button', { name: /Remove/ })).toBeDisabled()
  })
})
