import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '@/components/EmptyState'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders an optional description and action', () => {
    render(<EmptyState title="Nothing here" description="Try again later" action={<button>Retry</button>} />)
    expect(screen.getByText('Try again later')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('omits the description when none is given', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByText('Try again later')).not.toBeInTheDocument()
  })
})
