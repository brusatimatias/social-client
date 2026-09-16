import type { AxiosAdapter } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onUnauthorized } from '@/api/client'
import { messagingApiClient } from '@/api/messaging/client'
import { getToken, setToken } from '@/api/tokenStore'

const originalAdapter = messagingApiClient.defaults.adapter

afterEach(() => {
  messagingApiClient.defaults.adapter = originalAdapter
  setToken(null)
})

describe('messagingApiClient', () => {
  it('uses a baseURL rooted at /api/v1', () => {
    expect(messagingApiClient.defaults.baseURL).toMatch(/\/api\/v1$/)
  })

  it('attaches a bearer token header when one is set', async () => {
    setToken('abc123')
    let seenAuth: unknown
    messagingApiClient.defaults.adapter = (async (config) => {
      seenAuth = config.headers.Authorization
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }) as AxiosAdapter

    await messagingApiClient.get('/conversations')
    expect(seenAuth).toBe('Bearer abc123')
  })

  it('sends no Authorization header when there is no token', async () => {
    setToken(null)
    let seenAuth: unknown
    messagingApiClient.defaults.adapter = (async (config) => {
      seenAuth = config.headers.Authorization
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }) as AxiosAdapter

    await messagingApiClient.get('/conversations')
    expect(seenAuth).toBeUndefined()
  })

  it('clears the token and triggers the shared unauthorized handler on a 401', async () => {
    setToken('abc123')
    const handler = vi.fn()
    onUnauthorized(handler)

    messagingApiClient.defaults.adapter = (async (config) => {
      const error = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config },
        config,
      })
      throw error
    }) as AxiosAdapter

    await expect(messagingApiClient.get('/conversations')).rejects.toThrow('Unauthorized')
    expect(getToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('leaves the token untouched for non-401 errors', async () => {
    setToken('abc123')
    messagingApiClient.defaults.adapter = (async (config) => {
      const error = Object.assign(new Error('Server error'), {
        isAxiosError: true,
        response: { status: 500, data: {}, statusText: 'Error', headers: {}, config },
        config,
      })
      throw error
    }) as AxiosAdapter

    await expect(messagingApiClient.get('/conversations')).rejects.toThrow('Server error')
    expect(getToken()).toBe('abc123')
  })
})
