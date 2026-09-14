import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import { setToken } from '@/api/tokenStore'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppRouter } from '@/routes/AppRouter'
import { createTestQueryClient } from '../support/testProviders'

beforeEach(() => {
  setToken(null)
  window.history.pushState({}, '', '/')
})

function renderApp() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('AppRouter', () => {
  it('redirects an unauthenticated visit to "/" down to the login page', async () => {
    renderApp()
    await waitFor(() => expect(screen.getByText('Welcome back')).toBeInTheDocument())
  })

  it('shows the 404 page for an unknown route regardless of auth state', async () => {
    window.history.pushState({}, '', '/this-route-does-not-exist')
    renderApp()
    await waitFor(() => expect(screen.getByText('Page not found')).toBeInTheDocument())
  })
})
