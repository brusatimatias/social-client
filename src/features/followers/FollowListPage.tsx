import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { UserListItem } from './UserListItem'
import { useFollowList, useFollowMutations, useMyFollowingIds, type FollowListKind } from './useFollowQueries'

const COPY: Record<
  FollowListKind,
  {
    title: string
    otherTitle: string
    backLabel: string
    backPath: string
    errorMessage: string
    emptyTitle: string
    emptyDescription?: string
  }
> = {
  followers: {
    title: 'My followers',
    otherTitle: "User's followers",
    backLabel: '← Back to my followers',
    backPath: '/followers',
    errorMessage: "Couldn't load followers.",
    emptyTitle: 'No followers yet',
  },
  following: {
    title: 'My following',
    otherTitle: "User's following",
    backLabel: '← Back to who I follow',
    backPath: '/following',
    errorMessage: "Couldn't load following.",
    emptyTitle: 'Not following anyone yet',
    emptyDescription: 'Follow people to see their posts in your feed.',
  },
}

export function FollowListPage({ kind }: { kind: FollowListKind }) {
  const copy = COPY[kind]
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id') ?? undefined
  const { user: me } = useAuth()
  const { showToast } = useToast()

  const { data: users, isLoading, isError, refetch } = useFollowList(kind, userId)
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
        <h1 className="text-xl font-bold text-gray-900">{userId ? copy.otherTitle : copy.title}</h1>
        {userId && (
          <Link to={copy.backPath} className="text-sm font-medium text-brand-600 hover:underline">
            {copy.backLabel}
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && <ErrorState message={copy.errorMessage} onRetry={refetch} />}

      {users && users.length === 0 && (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      )}

      {users && users.length > 0 && (
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
