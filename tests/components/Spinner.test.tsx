import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from '@/components/Spinner'

describe('Spinner', () => {
  it('renders an accessible loading status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('applies the requested size class', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status').className).toContain('h-10')
  })
})
