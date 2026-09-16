import axios from 'axios'
import { triggerUnauthorized } from '@/api/client'
import { clearToken, getToken } from '@/api/tokenStore'

const baseURL = import.meta.env.VITE_MESSAGING_API_BASE_URL ?? 'http://localhost:3001'

export const messagingApiClient = axios.create({ baseURL })

export interface MessagingApiEnvelope<T> {
  data: T
}

messagingApiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

messagingApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken()
      triggerUnauthorized()
    }
    return Promise.reject(error)
  },
)
