import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/Input'

describe('Input', () => {
  it('associates its label via htmlFor/id', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders without a label', () => {
    render(<Input aria-label="Search" />)
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('accepts typed input', async () => {
    render(<Input aria-label="Search" />)
    const input = screen.getByLabelText('Search')
    await userEvent.type(input, 'hello')
    expect(input).toHaveValue('hello')
  })
})
