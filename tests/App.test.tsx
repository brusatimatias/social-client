import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setToken } from '@/api/tokenStore'
import App from '@/App'

beforeEach(() => {
  setToken(null)
  window.history.pushState({}, '', '/')
})

describe('App', () => {
  it('boots the full provider stack and redirects an unauthenticated visit to login', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Welcome back')).toBeInTheDocument())
  })
})
