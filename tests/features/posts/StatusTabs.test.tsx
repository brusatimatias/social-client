import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StatusTabs } from '@/features/posts/StatusTabs'

describe('StatusTabs', () => {
  it('renders all four tabs', () => {
    render(<StatusTabs value={undefined} onChange={vi.fn()} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(<StatusTabs value="draft" onChange={vi.fn()} />)
    expect(screen.getByText('Draft').className).toContain('border-brand-600')
    expect(screen.getByText('Published').className).not.toContain('border-brand-600')
  })

  it('calls onChange with the tab value, including undefined for "All"', async () => {
    const onChange = vi.fn()
    render(<StatusTabs value="draft" onChange={onChange} />)

    await userEvent.click(screen.getByText('Published'))
    expect(onChange).toHaveBeenCalledWith('published')

    await userEvent.click(screen.getByText('All'))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})
