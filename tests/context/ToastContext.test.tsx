import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from '@/context/ToastContext'

function ToastTrigger() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('Saved!', 'success')}>Show success</button>
      <button onClick={() => showToast('Something broke')}>Show default</button>
    </div>
  )
}

describe('ToastProvider', () => {
  afterEach(() => {
    // Safety net in case the fake-timers test below throws before restoring real timers.
    vi.useRealTimers()
  })

  it('renders a toast with the given message and variant', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    )

    await user.click(screen.getByText('Show success'))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Saved!')
    expect(alert.className).toContain('bg-green-600')
  })

  it('defaults to the info variant when none is given', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    )

    await user.click(screen.getByText('Show default'))

    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-gray-900')
  })

  it('auto-dismisses a toast after 4 seconds', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByText('Show success'))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(4000))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('throws when useToast is called outside a provider', () => {
    function Bare() {
      useToast()
      return null
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bare />)).toThrow('useToast must be used within a ToastProvider')
    spy.mockRestore()
  })
})
