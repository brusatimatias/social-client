import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Published</Badge>)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('defaults to the gray tone', () => {
    render(<Badge>Draft</Badge>)
    expect(screen.getByText('Draft').className).toContain('bg-gray-100')
  })

  it('applies the requested tone', () => {
    render(<Badge tone="red">Archived</Badge>)
    expect(screen.getByText('Archived').className).toContain('bg-red-100')
  })
})
