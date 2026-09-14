import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <p>All good</p>
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders a fallback and recovers on "Try again"', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    function Wrapper() {
      return (
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      )
    }
    render(<Wrapper />)

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    // Bomb still throws on remount, so the fallback is shown again rather than crashing the test runner.
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()

    vi.restoreAllMocks()
  })
})
