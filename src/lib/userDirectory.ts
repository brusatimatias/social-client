import { useSyncExternalStore } from 'react'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

export interface DirectoryUser {
  id: number
  uuid: string
  name: string
  lastname: string
  avatarUrl?: string
}

const directory = new Map<number, DirectoryUser>()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function rememberUser(user: Partial<User> & { id?: unknown; uuid?: unknown }): void {
  const id = typeof user.id === 'number' ? user.id : undefined
  const uuid = typeof user.uuid === 'string' ? user.uuid : undefined
  if (id === undefined || uuid === undefined) return
  const existing = directory.get(id)
  // Some payloads (e.g. post.author) omit avatar_url entirely rather than sending
  // it as null — don't let those clobber a richer avatar we cached elsewhere.
  const avatarUrl = 'avatar_url' in user ? (user.avatar_url ?? undefined) : existing?.avatarUrl
  directory.set(id, {
    id,
    uuid,
    name: user.name ?? existing?.name ?? '',
    lastname: user.lastname ?? existing?.lastname ?? '',
    avatarUrl,
  })
  notify()
}

export function rememberUsers(users: Array<Partial<User> & { id?: unknown; uuid?: unknown }>): void {
  users.forEach(rememberUser)
}

export function rememberPostParticipants(posts: Post[]): void {
  posts.forEach((post) => {
    if (post.author) rememberUser(post.author)
    post.comments?.forEach((comment) => {
      const author = comment.author ?? comment.user
      if (author) rememberUser(author)
    })
    post.likes?.forEach((like) => {
      if (like.user) rememberUser(like.user)
    })
  })
}

export function getDirectoryUser(id?: number): DirectoryUser | undefined {
  if (id === undefined) return undefined
  return directory.get(id)
}

export function useDirectoryUser(id?: number): DirectoryUser | undefined {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => getDirectoryUser(id),
  )
}
