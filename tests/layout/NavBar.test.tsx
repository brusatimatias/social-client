import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavBar } from '@/layout/NavBar'
import type { User } from '@/types/user'

const user: User = { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' }
const logout = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user, logout }) }))

beforeEach(() => vi.clearAllMocks())

function renderNav() {
  return render(
    <MemoryRouter initialEntries={['/feed']}>
      <Routes>
        <Route path="/feed" element={<NavBar />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NavBar', () => {
  it('renders every primary nav link', () => {
    renderNav()
    ;['Feed', 'Explore', 'My Posts', 'Messages', 'Followers', 'Following'].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    })
  })

  it("shows the current user's name", () => {
    renderNav()
    expect(screen.getAllByText('Ada').length).toBeGreaterThan(0)
  })

  it('toggles the mobile menu', async () => {
    renderNav()
    expect(screen.getAllByText('Feed')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    expect(screen.getAllByText('Feed')).toHaveLength(2)
  })

  it('logs out and navigates to /login', async () => {
    logout.mockResolvedValue(undefined)
    renderNav()

    await userEvent.click(screen.getAllByText('Logout')[0])

    expect(logout).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument())
  })
})
