import { Link } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import type { User } from '@/types/user'

interface UserListItemProps {
  user: User
  isSelf: boolean
  isFollowing: boolean
  pending: boolean
  onToggleFollow: () => void
}

export function UserListItem({ user, isSelf, isFollowing, pending, onToggleFollow }: UserListItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} lastname={user.lastname} avatarUrl={user.avatar_url} />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {user.name} {user.lastname}
          </p>
          <div className="flex gap-2 text-xs text-gray-400">
            <Link to={`/followers?user_id=${user.uuid}`} className="hover:text-brand-600 hover:underline">
              Followers
            </Link>
            <span>·</span>
            <Link to={`/following?user_id=${user.uuid}`} className="hover:text-brand-600 hover:underline">
              Following
            </Link>
          </div>
        </div>
      </div>
      {!isSelf && (
        <Button variant={isFollowing ? 'secondary' : 'primary'} loading={pending} onClick={onToggleFollow}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  )
}
