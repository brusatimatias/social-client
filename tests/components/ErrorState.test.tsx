import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBanner, ErrorState } from '@/components/ErrorState'

describe('ErrorState', () => {
  it('renders a default message', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('renders a custom message', () => {
    render(<ErrorState message="Couldn't load your feed." />)
    expect(screen.getByText("Couldn't load your feed.")).toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('omits the retry button when onRetry is not given', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('ErrorBanner', () => {
  it('renders nothing for an empty list', () => {
    const { container } = render(<ErrorBanner messages={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists every message', () => {
    render(<ErrorBanner messages={['Name is required', 'Email is invalid']} />)
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is invalid')).toBeInTheDocument()
  })
})
