const STORAGE_KEY = 'social_client_token'

let token: string | null = localStorage.getItem(STORAGE_KEY)
const listeners = new Set<(token: string | null) => void>()

export function getToken(): string | null {
  return token
}

export function setToken(next: string | null): void {
  token = next
  if (next) {
    localStorage.setItem(STORAGE_KEY, next)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  listeners.forEach((listener) => listener(token))
}

export function clearToken(): void {
  setToken(null)
}

export function onTokenChange(listener: (token: string | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
