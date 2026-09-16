import { AxiosError } from 'axios'

export function extractApiErrors(error: unknown): string[] {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map(String)
    }
  }
  return ['Something went wrong. Please try again.']
}

export function extractMessagingApiErrors(error: unknown): string[] {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error?.message
    if (typeof message === 'string' && message.length > 0) {
      return [message]
    }
  }
  return ['Something went wrong. Please try again.']
}
