import { io } from 'socket.io-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setToken } from '@/api/tokenStore'
import {
  connectMessagingSocket,
  disconnectMessagingSocket,
  joinConversationRoom,
  onNewMessage,
} from '@/lib/messagingSocket'

vi.mock('socket.io-client', () => ({ io: vi.fn() }))
const mockedIo = vi.mocked(io)

function makeFakeSocket() {
  return { on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() }
}

beforeEach(() => {
  vi.clearAllMocks()
  disconnectMessagingSocket()
  setToken('token-123')
})

describe('connectMessagingSocket', () => {
  it('creates a socket with the current token in the auth payload', () => {
    const fake = makeFakeSocket()
    mockedIo.mockReturnValue(fake as never)

    connectMessagingSocket()

    expect(mockedIo).toHaveBeenCalledWith(expect.any(String), { auth: { token: 'token-123' } })
  })

  it('reuses the existing socket instead of creating a new one', () => {
    mockedIo.mockReturnValue(makeFakeSocket() as never)

    connectMessagingSocket()
    connectMessagingSocket()

    expect(mockedIo).toHaveBeenCalledTimes(1)
  })
})

describe('disconnectMessagingSocket', () => {
  it('disconnects the current socket and allows a fresh one to be created next time', () => {
    const fake = makeFakeSocket()
    mockedIo.mockReturnValue(fake as never)
    connectMessagingSocket()

    disconnectMessagingSocket()

    expect(fake.disconnect).toHaveBeenCalledTimes(1)

    mockedIo.mockReturnValue(makeFakeSocket() as never)
    connectMessagingSocket()
    expect(mockedIo).toHaveBeenCalledTimes(2)
  })
})

describe('joinConversationRoom', () => {
  it('emits joinRoom with the conversation id', () => {
    const fake = makeFakeSocket()
    mockedIo.mockReturnValue(fake as never)
    connectMessagingSocket()

    joinConversationRoom(5)

    expect(fake.emit).toHaveBeenCalledWith('joinRoom', 5)
  })

  it('does nothing when there is no active socket', () => {
    expect(() => joinConversationRoom(5)).not.toThrow()
  })
})

describe('onNewMessage', () => {
  it('subscribes to the newMessage event and can unsubscribe', () => {
    const fake = makeFakeSocket()
    mockedIo.mockReturnValue(fake as never)
    connectMessagingSocket()

    const callback = vi.fn()
    const unsubscribe = onNewMessage(callback)

    expect(fake.on).toHaveBeenCalledWith('newMessage', callback)

    unsubscribe()
    expect(fake.off).toHaveBeenCalledWith('newMessage', callback)
  })
})
