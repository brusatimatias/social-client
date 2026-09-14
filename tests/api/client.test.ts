import type { AxiosAdapter } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, onUnauthorized } from '@/api/client'
import { getToken, setToken } from '@/api/tokenStore'

const originalAdapter = apiClient.defaults.adapter

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter
  setToken(null)
})

describe('apiClient request interceptor', () => {
  it('attaches a bearer token header when one is set', async () => {
    setToken('abc123')
    let seenAuth: unknown
    apiClient.defaults.adapter = (async (config) => {
      seenAuth = config.headers.Authorization
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }) as AxiosAdapter

    await apiClient.get('/whoami')
    expect(seenAuth).toBe('Bearer abc123')
  })

  it('sends no Authorization header when there is no token', async () => {
    setToken(null)
    let seenAuth: unknown
    apiClient.defaults.adapter = (async (config) => {
      seenAuth = config.headers.Authorization
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }) as AxiosAdapter

    await apiClient.get('/whoami')
    expect(seenAuth).toBeUndefined()
  })
})

describe('apiClient response interceptor', () => {
  beforeEach(() => setToken('abc123'))

  it('clears the token and notifies the unauthorized handler on a 401', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)

    apiClient.defaults.adapter = (async (config) => {
      const error = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config },
        config,
      })
      throw error
    }) as AxiosAdapter

    await expect(apiClient.get('/secret')).rejects.toThrow('Unauthorized')
    expect(getToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('leaves the token untouched for non-401 errors', async () => {
    apiClient.defaults.adapter = (async (config) => {
      const error = Object.assign(new Error('Server error'), {
        isAxiosError: true,
        response: { status: 500, data: {}, statusText: 'Error', headers: {}, config },
        config,
      })
      throw error
    }) as AxiosAdapter

    await expect(apiClient.get('/broken')).rejects.toThrow('Server error')
    expect(getToken()).toBe('abc123')
  })
})
