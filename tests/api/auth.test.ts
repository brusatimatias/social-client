import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/api/auth'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedClient = vi.mocked(apiClient, true)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('register / login / logout / getMe', () => {
  it('register posts the payload wrapped in a user key', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: { token: 't', user: {} } } })
    const payload = {
      name: 'Ada',
      lastname: 'Lovelace',
      email: 'ada@example.com',
      password: 'pw',
      password_confirmation: 'pw',
    }
    await authApi.register(payload)
    expect(mockedClient.post).toHaveBeenCalledWith('/auth/register', { user: payload })
  })

  it('login posts the payload wrapped in an auth key', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: { token: 't', user: {} } } })
    await authApi.login({ email: 'ada@example.com', password: 'pw' })
    expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', {
      auth: { email: 'ada@example.com', password: 'pw' },
    })
  })

  it('logout calls DELETE /auth/logout', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await authApi.logout()
    expect(mockedClient.delete).toHaveBeenCalledWith('/auth/logout')
  })

  it('getMe returns the unwrapped user', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: { uuid: 'u1', name: 'Ada', lastname: 'L' } } })
    const me = await authApi.getMe()
    expect(me).toEqual({ uuid: 'u1', name: 'Ada', lastname: 'L' })
  })
})

describe('updateMe', () => {
  it('sends plain JSON when there is no avatar', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: {} } })
    await authApi.updateMe({ name: 'Ada' })
    expect(mockedClient.patch).toHaveBeenCalledWith('/auth/me', { user: { name: 'Ada' } })
  })

  it('switches to multipart FormData when an avatar file is present', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: {} } })
    const avatar = new File(['x'], 'avatar.png', { type: 'image/png' })
    await authApi.updateMe({ name: 'Ada', avatar })

    expect(mockedClient.patch).toHaveBeenCalledTimes(1)
    const [url, body] = mockedClient.patch.mock.calls[0]
    expect(url).toBe('/auth/me')
    expect(body).toBeInstanceOf(FormData)
    const form = body as FormData
    expect(form.get('user[name]')).toBe('Ada')
    expect(form.get('user[avatar]')).toBe(avatar)
  })

  it('omits undefined fields from the multipart body', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: {} } })
    const avatar = new File(['x'], 'avatar.png', { type: 'image/png' })
    await authApi.updateMe({ avatar })

    const form = mockedClient.patch.mock.calls[0][1] as FormData
    expect(form.get('user[name]')).toBeNull()
    expect(form.get('user[avatar]')).toBe(avatar)
  })
})

describe('deleteMe', () => {
  it('calls DELETE /auth/me', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await authApi.deleteMe()
    expect(mockedClient.delete).toHaveBeenCalledWith('/auth/me')
  })
})
