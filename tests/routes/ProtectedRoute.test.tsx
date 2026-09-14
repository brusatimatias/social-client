import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }))
const mockedUseAuth = vi.mocked(useAuth)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<div>Feed content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows a spinner while auth status is loading', () => {
    mockedUseAuth.mockReturnValue({ status: 'loading' } as never)
    renderAt('/feed')
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    mockedUseAuth.mockReturnValue({ status: 'unauthenticated' } as never)
    renderAt('/feed')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the app shell and the matched route when authenticated', () => {
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' },
      logout: vi.fn(),
    } as never)
    renderAt('/feed')
    expect(screen.getByText('Feed content')).toBeInTheDocument()
    expect(screen.getByText('Social')).toBeInTheDocument()
  })
})
