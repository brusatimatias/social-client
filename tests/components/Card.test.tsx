import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from '@/components/Card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>content</Card>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('merges a custom className with its defaults', () => {
    render(
      <Card data-testid="card" className="p-4">
        content
      </Card>,
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('rounded-lg')
    expect(card.className).toContain('p-4')
  })
})
