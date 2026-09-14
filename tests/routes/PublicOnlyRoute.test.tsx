import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/context/AuthContext'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'

vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }))
const mockedUseAuth = vi.mocked(useAuth)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Login form</div>} />
        </Route>
        <Route path="/feed" element={<div>Feed page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicOnlyRoute', () => {
  it('shows a spinner while auth status is loading', () => {
    mockedUseAuth.mockReturnValue({ status: 'loading' } as never)
    renderAt('/login')
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('redirects to /feed when already authenticated', () => {
    mockedUseAuth.mockReturnValue({ status: 'authenticated' } as never)
    renderAt('/login')
    expect(screen.getByText('Feed page')).toBeInTheDocument()
  })

  it('renders the matched route when unauthenticated', () => {
    mockedUseAuth.mockReturnValue({ status: 'unauthenticated' } as never)
    renderAt('/login')
    expect(screen.getByText('Login form')).toBeInTheDocument()
  })
})
