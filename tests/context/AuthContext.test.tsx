import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/api/auth'
import { onUnauthorized } from '@/api/client'
import { setToken } from '@/api/tokenStore'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import type { User } from '@/types/user'

vi.mock('@/api/auth')
vi.mock('@/api/client', () => ({ onUnauthorized: vi.fn() }))

const mockedAuthApi = vi.mocked(authApi, true)
const mockedOnUnauthorized = vi.mocked(onUnauthorized)

const user: User = { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' }

function AuthConsumer() {
  const { user: current, status, login, register, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{current?.name ?? 'none'}</span>
      <button onClick={() => login('ada@example.com', 'pw')}>Login</button>
      <button
        onClick={() =>
          register({ name: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', password: 'pw', password_confirmation: 'pw' })
        }
      >
        Register
      </button>
      {/* .catch here only silences the intentionally-rejected mock below; real callers don't need this */}
      <button onClick={() => logout().catch(() => {})}>Logout</button>
    </div>
  )
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  setToken(null)
})

describe('AuthProvider bootstrap', () => {
  it('resolves to unauthenticated immediately when there is no stored token', async () => {
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(mockedAuthApi.getMe).not.toHaveBeenCalled()
  })

  it('hydrates the user via GET /auth/me when a token is already stored', async () => {
    setToken('existing-token')
    mockedAuthApi.getMe.mockResolvedValue(user)

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('Ada')
  })

  it('falls back to unauthenticated and clears the token if hydration fails', async () => {
    setToken('stale-token')
    mockedAuthApi.getMe.mockRejectedValue(new Error('401'))

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
  })
})

describe('login / register / logout', () => {
  it('login stores the token and marks the user authenticated', async () => {
    mockedAuthApi.login.mockResolvedValue({ token: 't1', user })
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))

    await userEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('Ada')
  })

  it('register stores the token and marks the user authenticated', async () => {
    mockedAuthApi.register.mockResolvedValue({ token: 't1', user })
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))

    await userEvent.click(screen.getByText('Register'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
  })

  it('logout clears the user even if the API call fails', async () => {
    mockedAuthApi.login.mockResolvedValue({ token: 't1', user })
    mockedAuthApi.logout.mockRejectedValue(new Error('network error'))
    renderAuth()
    await userEvent.click(screen.getByText('Login'))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await userEvent.click(screen.getByText('Logout'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })
})

describe('unauthorized handler', () => {
  it('logs the user out when the api layer reports a 401', async () => {
    mockedAuthApi.login.mockResolvedValue({ token: 't1', user })
    renderAuth()
    await userEvent.click(screen.getByText('Login'))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    expect(mockedOnUnauthorized).toHaveBeenCalledTimes(1)
    const handler = mockedOnUnauthorized.mock.calls[0][0]
    handler()

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })
})
