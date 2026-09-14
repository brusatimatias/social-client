import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearToken, getToken, onTokenChange, setToken } from '@/api/tokenStore'

const STORAGE_KEY = 'social_client_token'

beforeEach(() => {
  setToken(null)
  localStorage.clear()
})

describe('tokenStore', () => {
  it('starts with no token once cleared', () => {
    expect(getToken()).toBeNull()
  })

  it('persists a set token to localStorage', () => {
    setToken('abc123')
    expect(getToken()).toBe('abc123')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('abc123')
  })

  it('removes the token from localStorage when cleared', () => {
    setToken('abc123')
    clearToken()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('notifies listeners on every change', () => {
    const listener = vi.fn()
    const unsubscribe = onTokenChange(listener)

    setToken('abc123')
    expect(listener).toHaveBeenCalledWith('abc123')

    clearToken()
    expect(listener).toHaveBeenCalledWith(null)

    unsubscribe()
    setToken('xyz')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
