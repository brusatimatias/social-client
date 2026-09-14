import { describe, expect, it } from 'vitest'
import { getMyLikeState } from '@/features/likes/likeState'
import type { Post } from '@/types/post'

function basePost(overrides: Partial<Post> = {}): Post {
  return { id: 1, content: 'hi', visibility: 'public', status: 'published', ...overrides }
}

describe('getMyLikeState', () => {
  it('prefers liked_by_me/my_like_id when present', () => {
    const post = basePost({ liked_by_me: true, my_like_id: 99, likes: [] })
    expect(getMyLikeState(post, 'me-uuid')).toEqual({ liked: true, likeId: 99 })
  })

  it('treats liked_by_me: false as authoritative even if likes[] would suggest otherwise', () => {
    const post = basePost({ liked_by_me: false, likes: [{ id: 1, user_uuid: 'me-uuid' }] })
    expect(getMyLikeState(post, 'me-uuid')).toEqual({ liked: false, likeId: undefined })
  })

  it('falls back to scanning the embedded likes[] array by uuid', () => {
    const post = basePost({ likes: [{ id: 5, user: { id: 1, uuid: 'me-uuid', name: 'A', lastname: 'B' } }] })
    expect(getMyLikeState(post, 'me-uuid')).toEqual({ liked: true, likeId: 5 })
  })

  it('matches on the flat user_uuid field as a fallback', () => {
    const post = basePost({ likes: [{ id: 6, user_uuid: 'me-uuid' }] })
    expect(getMyLikeState(post, 'me-uuid')).toEqual({ liked: true, likeId: 6 })
  })

  it('returns not liked when no like matches my uuid', () => {
    const post = basePost({ likes: [{ id: 7, user_uuid: 'someone-else' }] })
    expect(getMyLikeState(post, 'me-uuid')).toEqual({ liked: false, likeId: undefined })
  })

  it('returns not liked when there is no way to resolve state', () => {
    const post = basePost()
    expect(getMyLikeState(post, undefined)).toEqual({ liked: false, likeId: undefined })
  })
})
