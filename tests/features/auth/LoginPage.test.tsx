import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/LoginPage'

const login = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ login }) }))

beforeEach(() => vi.clearAllMocks())

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<div>Feed page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('logs in with the entered credentials and navigates to the feed', async () => {
    login.mockResolvedValue(undefined)
    renderPage()

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(login).toHaveBeenCalledWith('ada@example.com', 'password123')
    await waitFor(() => expect(screen.getByText('Feed page')).toBeInTheDocument())
  })

  it('shows the API error and stays on the page when login fails', async () => {
    login.mockRejectedValue(new Error('Invalid credentials'))
    renderPage()

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument())
    expect(screen.queryByText('Feed page')).not.toBeInTheDocument()
  })

  it('links to the register page', () => {
    login.mockResolvedValue(undefined)
    renderPage()
    expect(screen.getByText('Sign up')).toHaveAttribute('href', '/register')
  })
})
