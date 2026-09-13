import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/api/auth'
import { onUnauthorized } from '@/api/client'
import { getToken, setToken } from '@/api/tokenStore'
import type { RegisterPayload } from '@/api/auth'
import { rememberUser } from '@/lib/userDirectory'
import type { User } from '@/types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false
    if (!getToken()) {
      setStatus('unauthenticated')
      return
    }
    authApi
      .getMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        rememberUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setToken(null)
        setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => onUnauthorized(() => {
    setUser(null)
    setStatus('unauthenticated')
  }), [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password })
    setToken(result.token)
    setUser(result.user)
    rememberUser(result.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authApi.register(payload)
    setToken(result.token)
    setUser(result.user)
    rememberUser(result.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setToken(null)
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const updateUser = useCallback((next: User) => {
    setUser(next)
    rememberUser(next)
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, logout, updateUser }),
    [user, status, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
