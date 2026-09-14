import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaUploadField } from '@/features/posts/MediaUploadField'

beforeEach(() => {
  // jsdom doesn't implement these; the component calls them for previews.
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
  })
})

function image(name = 'photo.png', sizeBytes = 1024) {
  const file = new File([new Uint8Array(sizeBytes)], name, { type: 'image/png' })
  return file
}

describe('MediaUploadField', () => {
  it('adds a valid file via the hidden input', async () => {
    const onChange = vi.fn()
    const { container } = render(<MediaUploadField files={[]} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    const file = image()
    await userEvent.upload(input, file)

    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('rejects a disallowed file type with an error message', async () => {
    const onChange = vi.fn()
    const { container } = render(<MediaUploadField files={[]} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    // userEvent.upload enforces the input's `accept` filter itself; use fireEvent to reach
    // the component's own JS-side validation instead of the browser's file picker filter.
    const badFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(screen.getByText(/isn't a supported image or video type/)).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('rejects a file larger than 10MB', async () => {
    const onChange = vi.fn()
    const { container } = render(<MediaUploadField files={[]} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    const bigFile = image('big.png', 11 * 1024 * 1024)
    await userEvent.upload(input, bigFile)

    expect(screen.getByText(/larger than 10MB/)).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('stops adding files once the 4-file limit is reached', async () => {
    const onChange = vi.fn()
    const existing = [image('a.png'), image('b.png'), image('c.png'), image('d.png')]
    const { container } = render(<MediaUploadField files={existing} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, image('e.png'))

    expect(screen.getByText('You can attach up to 4 files.')).toBeInTheDocument()
    // The component always calls onChange, even when nothing was actually added.
    expect(onChange).toHaveBeenCalledWith(existing)
  })

  it('removes a file when its remove button is clicked', async () => {
    const onChange = vi.fn()
    const existing = [image('a.png'), image('b.png')]
    render(<MediaUploadField files={existing} onChange={onChange} />)

    const removeButtons = screen.getAllByRole('button', { name: 'Remove file' })
    await userEvent.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([existing[1]])
  })
})
