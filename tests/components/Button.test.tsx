import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders its children and responds to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables the button and hides interaction while loading', () => {
    render(<Button loading>Save</Button>)

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
