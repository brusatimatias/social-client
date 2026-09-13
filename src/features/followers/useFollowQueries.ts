import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { followUser, listFollowers, listFollowing, unfollowUser } from '@/api/users'
import { rememberUsers } from '@/lib/userDirectory'

export function useFollowers(userId?: string) {
  const query = useQuery({
    queryKey: ['followers', userId ?? 'me'],
    queryFn: () => listFollowers(userId),
  })
  useEffect(() => {
    if (query.data) rememberUsers(query.data)
  }, [query.data])
  return query
}

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

export function useMyFollowingIds() {
  const { data } = useFollowing()
  return new Set((data ?? []).map((user) => user.uuid))
}

export function useFollowMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['followers'] })
    queryClient.invalidateQueries({ queryKey: ['following'] })
  }

  const follow = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: invalidate,
  })

  const unfollow = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: invalidate,
  })

  return { follow, unfollow }
}
