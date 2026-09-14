import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostCardSkeleton, Skeleton } from '@/components/Skeleton'

describe('Skeleton', () => {
  it('renders a pulsing placeholder block', () => {
    const { container } = render(<Skeleton className="h-4 w-4" />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })
})

describe('PostCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<PostCardSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
