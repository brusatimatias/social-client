import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '@/features/auth/RegisterPage'

const register = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ register }) }))

beforeEach(() => vi.clearAllMocks())

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feed" element={<div>Feed page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Name'), 'Ada')
  await userEvent.type(screen.getByLabelText('Last name'), 'Lovelace')
  await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'password123')
  await userEvent.type(screen.getByLabelText('Confirm password'), 'password123')
}

describe('RegisterPage', () => {
  it('registers with all form fields and navigates to the feed', async () => {
    register.mockResolvedValue(undefined)
    renderPage()
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(register).toHaveBeenCalledWith({
      name: 'Ada',
      lastname: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    })
    await waitFor(() => expect(screen.getByText('Feed page')).toBeInTheDocument())
  })

  it('shows the API error and stays on the page when registration fails', async () => {
    register.mockRejectedValue(new Error('Email already taken'))
    renderPage()
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() => expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument())
    expect(screen.queryByText('Feed page')).not.toBeInTheDocument()
  })

  it('links to the login page', () => {
    register.mockResolvedValue(undefined)
    renderPage()
    expect(screen.getByText('Log in')).toHaveAttribute('href', '/login')
  })
})
