import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { UserListItem } from '@/features/followers/UserListItem'
import type { User } from '@/types/user'

const user: User = { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' }

function renderItem(props: Partial<ComponentProps<typeof UserListItem>> = {}) {
  return render(
    <MemoryRouter>
      <UserListItem
        user={user}
        isSelf={false}
        isFollowing={false}
        pending={false}
        onToggleFollow={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('UserListItem', () => {
  it("renders the user's full name", () => {
    renderItem()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('links to their followers/following lists by uuid', () => {
    renderItem()
    expect(screen.getByText('Followers')).toHaveAttribute('href', '/followers?user_id=u1')
    expect(screen.getByText('Following')).toHaveAttribute('href', '/following?user_id=u1')
  })

  it('hides the follow button for myself', () => {
    renderItem({ isSelf: true })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows "Follow" or "Unfollow" depending on isFollowing', () => {
    const { rerender } = renderItem({ isFollowing: false })
    expect(screen.getByRole('button')).toHaveTextContent('Follow')

    rerender(
      <MemoryRouter>
        <UserListItem user={user} isSelf={false} isFollowing pending={false} onToggleFollow={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Unfollow')
  })

  it('calls onToggleFollow when clicked', async () => {
    const onToggleFollow = vi.fn()
    renderItem({ onToggleFollow })
    await userEvent.click(screen.getByRole('button'))
    expect(onToggleFollow).toHaveBeenCalledTimes(1)
  })
})
