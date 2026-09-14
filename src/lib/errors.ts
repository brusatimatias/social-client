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
