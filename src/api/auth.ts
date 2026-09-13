import { apiClient } from './client'
import type { ApiEnvelope } from '@/types/api'
import type { User } from '@/types/user'

export interface RegisterPayload {
  name: string
  lastname: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateMePayload {
  name?: string
  lastname?: string
  email?: string
  password?: string
  password_confirmation?: string
}

interface AuthResponse {
  token: string
  user: User
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/register', {
    user: payload,
  })
  return data.data
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', {
    auth: payload,
  })
  return data.data
}

export async function logout() {
  await apiClient.delete('/auth/logout')
}

export async function getMe() {
  const { data } = await apiClient.get<ApiEnvelope<User>>('/auth/me')
  return data.data
}

export async function updateMe(payload: UpdateMePayload) {
  const { data } = await apiClient.patch<ApiEnvelope<User>>('/auth/me', { user: payload })
  return data.data
}

export async function deleteMe() {
  await apiClient.delete('/auth/me')
}
