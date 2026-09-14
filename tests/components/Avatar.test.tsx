import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from '@/components/Avatar'

// The <img> has alt="" (decorative), so it's exposed with role "presentation", not "img" —
// query it directly instead of via getByRole.

describe('Avatar', () => {
  it('renders an image when avatarUrl is given', () => {
    const { container } = render(
      <Avatar name="Ada" lastname="Lovelace" avatarUrl="https://cdn.example.com/a.png" />,
    )
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/a.png')
  })

  it('falls back to initials when there is no avatarUrl', () => {
    const { container } = render(<Avatar name="Ada" lastname="Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('falls back to initials when the image fails to load', () => {
    const { container } = render(
      <Avatar name="Ada" lastname="Lovelace" avatarUrl="https://cdn.example.com/broken.png" />,
    )
    fireEvent.error(container.querySelector('img') as Element)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('resets the failed state when avatarUrl changes', () => {
    const { container, rerender } = render(
      <Avatar name="Ada" lastname="Lovelace" avatarUrl="https://cdn.example.com/a.png" />,
    )
    fireEvent.error(container.querySelector('img') as Element)
    expect(screen.getByText('AL')).toBeInTheDocument()

    rerender(<Avatar name="Ada" lastname="Lovelace" avatarUrl="https://cdn.example.com/b.png" />)
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/b.png')
  })
})
