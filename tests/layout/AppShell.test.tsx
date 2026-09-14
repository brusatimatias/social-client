import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from '@/layout/AppShell'
import type { User } from '@/types/user'

const user: User = { id: 1, uuid: 'u1', name: 'Ada', lastname: 'Lovelace' }
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user, logout: vi.fn() }) }))

describe('AppShell', () => {
  it('renders the nav bar and its children', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>Page content</p>
        </AppShell>
      </MemoryRouter>,
    )
    expect(screen.getByText('Social')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })
})
