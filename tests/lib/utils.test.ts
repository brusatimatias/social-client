import { describe, expect, it } from 'vitest'
import { cn, formatDate, initials, isVideoUrl } from '@/lib/utils'

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })
})

describe('initials', () => {
  it('combines the first letter of name and lastname', () => {
    expect(initials('Ada', 'Lovelace')).toBe('AL')
  })

  it('falls back to a placeholder when nothing is given', () => {
    expect(initials()).toBe('?')
  })
})

describe('isVideoUrl', () => {
  it('recognizes known video extensions regardless of query string', () => {
    expect(isVideoUrl('https://cdn.example.com/blob/redirect/abc/clip.mp4?x=1')).toBe(true)
  })

  it('treats everything else as an image', () => {
    expect(isVideoUrl('https://cdn.example.com/blob/redirect/abc/photo.png')).toBe(false)
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).not.toBe('')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('returns an empty string when given nothing', () => {
    expect(formatDate(undefined)).toBe('')
  })
})
