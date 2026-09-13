import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { UserListItem } from './UserListItem'
import { useFollowing, useFollowMutations, useMyFollowingIds } from './useFollowQueries'

export function FollowingPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id') ?? undefined
  const { user: me } = useAuth()
  const { showToast } = useToast()

  const { data: following, isLoading, isError, refetch } = useFollowing(userId)
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
        <h1 className="text-xl font-bold text-gray-900">{userId ? "User's following" : 'My following'}</h1>
        {userId && (
          <Link to="/following" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back to who I follow
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load following." onRetry={refetch} />}

      {following && following.length === 0 && (
        <EmptyState title="Not following anyone yet" description="Follow people to see their posts in your feed." />
      )}

      {following && following.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-4">
          {following.map((followedUser) => (
            <UserListItem
              key={followedUser.uuid}
              user={followedUser}
              isSelf={followedUser.uuid === me?.uuid}
              isFollowing={myFollowingIds.has(followedUser.uuid)}
              pending={
                (follow.isPending && follow.variables === followedUser.uuid) ||
                (unfollow.isPending && unfollow.variables === followedUser.uuid)
              }
              onToggleFollow={() => toggle(followedUser.uuid, myFollowingIds.has(followedUser.uuid))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
