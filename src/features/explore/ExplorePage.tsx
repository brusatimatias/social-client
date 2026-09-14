import { useState } from 'react'
import { Input } from '@/components/Input'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { UserListItem } from '@/features/followers/UserListItem'
import { useFollowMutations, useMyFollowingIds } from '@/features/followers/useFollowQueries'
import { useSearchUsers } from './useSearchUsers'

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const { user: me } = useAuth()
  const { showToast } = useToast()

  const { data, isLoading, isError, refetch } = useSearchUsers(debouncedQuery)
  const myFollowingIds = useMyFollowingIds()
  const { follow, unfollow } = useFollowMutations()

  const toggle = (targetUuid: string, isFollowing: boolean) => {
    const mutation = isFollowing ? unfollow : follow
    mutation.mutate(targetUuid, {
      onError: (error) => showToast(extractApiErrors(error)[0], 'error'),
    })
  }

  const users = data?.users ?? []

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Explore</h1>

      <Input
        aria-label="Search people"
        placeholder="Search by name..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load people." onRetry={refetch} />}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState
          title={query ? 'No matches' : 'No one to show yet'}
          description={query ? `No one found for "${query}".` : undefined}
        />
      )}

      {users.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-4">
          {users.map((user) => (
            <UserListItem
              key={user.uuid}
              user={user}
              isSelf={user.uuid === me?.uuid}
              isFollowing={myFollowingIds.has(user.uuid)}
              pending={
                (follow.isPending && follow.variables === user.uuid) ||
                (unfollow.isPending && unfollow.variables === user.uuid)
              }
              onToggleFollow={() => toggle(user.uuid, myFollowingIds.has(user.uuid))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
