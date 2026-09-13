import { Avatar } from '@/components/Avatar'
import { formatDate } from '@/lib/utils'
import type { Comment } from '@/types/comment'
import { CommentForm } from './CommentForm'

interface CommentItemProps {
  comment: Comment
  isOwner: boolean
  isEditing: boolean
  updating: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmitEdit: (content: string) => void
  onDelete: () => void
}

export function CommentItem({
  comment,
  isOwner,
  isEditing,
  updating,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
}: CommentItemProps) {
  const author = comment.author ?? comment.user

  return (
    <div className="flex gap-3 py-3">
      <Avatar name={author?.name} lastname={author?.lastname} size="sm" />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {author?.name} {author?.lastname}
          </span>
          <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
        </div>
        {isEditing ? (
          <div className="mt-1">
            <CommentForm
              initialValue={comment.content}
              submitLabel="Save"
              loading={updating}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
            />
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
        )}
        {isOwner && !isEditing && (
          <div className="mt-1 flex gap-3 text-xs font-medium text-gray-400">
            <button type="button" onClick={onStartEdit} className="hover:text-gray-700">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="hover:text-red-600">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
