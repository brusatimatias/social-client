import { describe, expect, it } from 'vitest'
import { getDirectoryUser, rememberPostParticipants, rememberUser, rememberUsers } from '@/lib/userDirectory'
import type { Post } from '@/types/post'

// The directory is a module-level singleton, so each test uses its own id range to avoid interference.

describe('rememberUser', () => {
  it('ignores payloads missing a numeric id or a uuid', () => {
    rememberUser({ uuid: 'no-id' })
    rememberUser({ id: 1 })
    expect(getDirectoryUser(1)).toBeUndefined()
  })

  it('stores a full user', () => {
    rememberUser({ id: 10, uuid: 'u10', name: 'Ada', lastname: 'Lovelace', avatar_url: 'a.png' })
    expect(getDirectoryUser(10)).toEqual({
      id: 10,
      uuid: 'u10',
      name: 'Ada',
      lastname: 'Lovelace',
      avatarUrl: 'a.png',
    })
  })

  it('merges onto an existing entry instead of overwriting missing fields', () => {
    rememberUser({ id: 20, uuid: 'u20', name: 'Grace', lastname: 'Hopper', avatar_url: 'g.png' })
    // A leaner payload (e.g. post.author) that omits avatar_url entirely...
    rememberUser({ id: 20, uuid: 'u20', name: 'Grace', lastname: 'Hopper' })
    // ...must not blank out the avatar already known from a richer source.
    expect(getDirectoryUser(20)?.avatarUrl).toBe('g.png')
  })

  it('does blank out the avatar when the payload explicitly sends avatar_url: null', () => {
    rememberUser({ id: 30, uuid: 'u30', name: 'Alan', lastname: 'Turing', avatar_url: 'a.png' })
    rememberUser({ id: 30, uuid: 'u30', name: 'Alan', lastname: 'Turing', avatar_url: null })
    expect(getDirectoryUser(30)?.avatarUrl).toBeUndefined()
  })
})

describe('rememberUsers', () => {
  it('remembers every user in the list', () => {
    rememberUsers([
      { id: 40, uuid: 'u40', name: 'A', lastname: 'B' },
      { id: 41, uuid: 'u41', name: 'C', lastname: 'D' },
    ])
    expect(getDirectoryUser(40)?.uuid).toBe('u40')
    expect(getDirectoryUser(41)?.uuid).toBe('u41')
  })
})

describe('rememberPostParticipants', () => {
  it('remembers the author, comment authors, and likers embedded in posts', () => {
    const posts: Post[] = [
      {
        id: 1,
        content: 'hi',
        visibility: 'public',
        status: 'published',
        author: { id: 50, uuid: 'u50', name: 'Post', lastname: 'Author' },
        comments: [
          {
            id: 1,
            content: 'nice',
            user: { id: 51, uuid: 'u51', name: 'Commenter', lastname: 'One' },
          },
        ],
        likes: [{ id: 1, user: { id: 52, uuid: 'u52', name: 'Liker', lastname: 'One' } }],
      },
    ]
    rememberPostParticipants(posts)
    expect(getDirectoryUser(50)?.name).toBe('Post')
    expect(getDirectoryUser(51)?.name).toBe('Commenter')
    expect(getDirectoryUser(52)?.name).toBe('Liker')
  })

  it('prefers a comment.author over comment.user when both are present', () => {
    const posts: Post[] = [
      {
        id: 2,
        content: 'hi',
        visibility: 'public',
        status: 'published',
        comments: [
          {
            id: 2,
            content: 'nice',
            author: { id: 60, uuid: 'u60', name: 'Author', lastname: 'Field' },
            user: { id: 61, uuid: 'u61', name: 'User', lastname: 'Field' },
          },
        ],
      },
    ]
    rememberPostParticipants(posts)
    expect(getDirectoryUser(60)?.name).toBe('Author')
    expect(getDirectoryUser(61)).toBeUndefined()
  })
})
