import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { extractApiErrors, extractMessagingApiErrors } from '@/lib/errors'

function makeAxiosError(data: unknown): AxiosError {
  const error = new AxiosError('Request failed')
  error.response = { data, status: 422, statusText: 'Unprocessable', headers: {}, config: {} as never }
  return error
}

describe('extractApiErrors', () => {
  it('returns the flat errors array from an Axios error response', () => {
    expect(extractApiErrors(makeAxiosError({ errors: ['Unauthorized'] }))).toEqual(['Unauthorized'])
  })

  it('stringifies non-string entries in the errors array', () => {
    expect(extractApiErrors(makeAxiosError({ errors: [404] }))).toEqual(['404'])
  })

  it('falls back to a generic message when the errors array is empty', () => {
    expect(extractApiErrors(makeAxiosError({ errors: [] }))).toEqual([
      'Something went wrong. Please try again.',
    ])
  })

  it('falls back to a generic message when there is no errors field', () => {
    expect(extractApiErrors(makeAxiosError({}))).toEqual(['Something went wrong. Please try again.'])
  })

  it('falls back to a generic message for a non-Axios error', () => {
    expect(extractApiErrors(new Error('boom'))).toEqual(['Something went wrong. Please try again.'])
  })
})

describe('extractMessagingApiErrors', () => {
  it('returns the nested error message from an Axios error response', () => {
    expect(extractMessagingApiErrors(makeAxiosError({ error: { message: 'Missing auth token' } }))).toEqual([
      'Missing auth token',
    ])
  })

  it('falls back to a generic message when the error message is empty', () => {
    expect(extractMessagingApiErrors(makeAxiosError({ error: { message: '' } }))).toEqual([
      'Something went wrong. Please try again.',
    ])
  })

  it('falls back to a generic message when there is no error field', () => {
    expect(extractMessagingApiErrors(makeAxiosError({}))).toEqual(['Something went wrong. Please try again.'])
  })

  it('falls back to a generic message for a non-Axios error', () => {
    expect(extractMessagingApiErrors(new Error('boom'))).toEqual(['Something went wrong. Please try again.'])
  })
})
