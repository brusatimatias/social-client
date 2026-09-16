import axios from 'axios'
import { clearToken, getToken } from './tokenStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export const apiClient = axios.create({ baseURL })

let unauthorizedHandler: (() => void) | null = null

export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

// Lets other API clients (e.g. the messaging API's) reuse the same
// AuthContext-registered handler on their own 401s, instead of each
// backend needing its own registration wired up separately.
export function triggerUnauthorized(): void {
  unauthorizedHandler?.()
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
