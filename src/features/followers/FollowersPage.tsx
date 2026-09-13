import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { UserListItem } from './UserListItem'
import { useFollowers, useFollowMutations, useMyFollowingIds } from './useFollowQueries'

export function FollowersPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id') ?? undefined
  const { user: me } = useAuth()
  const { showToast } = useToast()

  const { data: followers, isLoading, isError, refetch } = useFollowers(userId)
  const myFollowingIds = useMyFollowingIds()
  const { follow, unfollow } = useFollowMutations()

  const toggle = (targetUuid: string, isFollowing: boolean) => {
    const mutation = isFollowing ? unfollow : follow
    mutation.mutate(targetUuid, {
      onError: (error) => showToast(extractApiErrors(error)[0], 'error'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{userId ? "User's followers" : 'My followers'}</h1>
        {userId && (
          <Link to="/followers" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back to my followers
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load followers." onRetry={refetch} />}

      {followers && followers.length === 0 && <EmptyState title="No followers yet" />}

      {followers && followers.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-4">
          {followers.map((follower) => (
            <UserListItem
              key={follower.uuid}
              user={follower}
              isSelf={follower.uuid === me?.uuid}
              isFollowing={myFollowingIds.has(follower.uuid)}
              pending={
                (follow.isPending && follow.variables === follower.uuid) ||
                (unfollow.isPending && unfollow.variables === follower.uuid)
              }
              onToggleFollow={() => toggle(follower.uuid, myFollowingIds.has(follower.uuid))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
