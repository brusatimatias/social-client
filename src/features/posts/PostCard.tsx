import { Link } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { useAuth } from '@/context/AuthContext'
import { formatDate, isVideoUrl } from '@/lib/utils'
import { useDirectoryUser } from '@/lib/userDirectory'
import { LikeButton } from '@/features/likes/LikeButton'
import type { Post } from '@/types/post'

interface PostCardProps {
  post: Post
  onEdit?: () => void
  onDelete?: () => void
}

const statusTone = { published: 'green', draft: 'amber', archived: 'gray' } as const

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const { user: me } = useAuth()
  const directoryAuthor = useDirectoryUser(post.user_id)
  const commentsCount = post.comments_count ?? post.comments?.length ?? 0
  const isMine = me?.id !== undefined && me.id === post.user_id
  const author = post.author ?? directoryAuthor
  const authorLabel = isMine ? 'You' : author ? `${author.name} ${author.lastname}` : 'Unknown user'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={author?.name} lastname={author?.lastname} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{authorLabel}</p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={statusTone[post.status]}>{post.status}</Badge>
          <Badge>{post.visibility}</Badge>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{post.content}</p>

      {!!post.media?.length && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.media.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-md bg-gray-100">
              {isVideoUrl(url) ? (
                <video src={url} controls className="max-h-72 w-full object-cover" />
              ) : (
                <img src={url} alt="" className="max-h-72 w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="flex items-center gap-3">
          <LikeButton post={post} />
          <Link to={`/posts/${post.id}`} className="text-sm text-gray-500 hover:text-gray-800">
            💬 {commentsCount}
          </Link>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-3 text-xs font-medium text-gray-400">
            {onEdit && (
              <button type="button" onClick={onEdit} className="hover:text-gray-700">
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete} className="hover:text-red-600">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
