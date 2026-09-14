import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TextArea } from '@/components/TextArea'

describe('TextArea', () => {
  it('associates its label via htmlFor/id', () => {
    render(<TextArea id="bio" label="Bio" />)
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
  })

  it('accepts typed input', async () => {
    render(<TextArea aria-label="Comment" />)
    const textarea = screen.getByLabelText('Comment')
    await userEvent.type(textarea, 'nice post')
    expect(textarea).toHaveValue('nice post')
  })
})
