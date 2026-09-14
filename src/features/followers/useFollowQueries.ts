import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { followUser, listFollowers, listFollowing, unfollowUser } from '@/api/users'
import { rememberUsers } from '@/lib/userDirectory'

export function useFollowing(userId?: string) {
  const query = useQuery({
    queryKey: ['following', userId ?? 'me'],
    queryFn: () => listFollowing(userId),
  })
  useEffect(() => {
    if (query.data) rememberUsers(query.data)
  }, [query.data])
  return query
}

export type FollowListKind = 'followers' | 'following'

export function useFollowList(kind: FollowListKind, userId?: string) {
  // A single unconditional useQuery call — only the fetcher/queryKey branch on
  // `kind`, so this never risks violating the rules of hooks.
  const fetcher = kind === 'followers' ? listFollowers : listFollowing
  const query = useQuery({
    queryKey: [kind, userId ?? 'me'],
    queryFn: () => fetcher(userId),
  })
  useEffect(() => {
    if (query.data) rememberUsers(query.data)
  }, [query.data])
  return query
}

export function useMyFollowingIds() {
  const { data } = useFollowing()
  return new Set((data ?? []).map((user) => user.uuid))
}

export function useFollowMutations() {
  const queryClient = useQueryClient()
  // Following/unfollowing user X only ever changes two lists: my own
  // following list, and X's followers list — never anyone else's, so there's
  // no need to invalidate every cached ['followers'|'following', *] variant.
  const invalidateFor = (targetUuid: string) => {
    queryClient.invalidateQueries({ queryKey: ['following', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['followers', targetUuid] })
  }

  const follow = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: (_data, userId) => invalidateFor(userId),
  })

  const unfollow = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: (_data, userId) => invalidateFor(userId),
  })

  return { follow, unfollow }
}
