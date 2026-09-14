import { Button } from '@/components/Button'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { useFollowMutations, useMyFollowingIds } from '@/features/followers/useFollowQueries'

export function FollowAuthorButton({ authorUuid }: { authorUuid: string }) {
  const { showToast } = useToast()
  const myFollowingIds = useMyFollowingIds()
  const { follow, unfollow } = useFollowMutations()

  const isFollowing = myFollowingIds.has(authorUuid)
  const mutation = isFollowing ? unfollow : follow
  const pending = mutation.isPending && mutation.variables === authorUuid

  const toggle = () => {
    mutation.mutate(authorUuid, {
      onError: (error) => showToast(extractApiErrors(error)[0], 'error'),
    })
  }

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      loading={pending}
      onClick={toggle}
      className="!px-3 !py-1 text-xs"
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
