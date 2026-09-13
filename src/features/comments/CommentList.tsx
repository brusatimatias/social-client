import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { Post } from '@/types/post'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { useCommentMutations } from './useCommentMutations'

export function CommentList({ post }: { post: Post }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { create, update, remove } = useCommentMutations(post.id)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const comments = post.comments ?? []

  const handleCreate = (content: string) => {
    create.mutate(content, {
      onError: (error) => showToast(extractApiErrors(error)[0], 'error'),
    })
  }

  const handleUpdate = (commentId: number, content: string) => {
    update.mutate(
      { commentId, content },
      {
        onSuccess: () => setEditingId(null),
        onError: (error) => showToast(extractApiErrors(error)[0], 'error'),
      },
    )
  }

  const handleDelete = () => {
    if (!deletingId) return
    remove.mutate(deletingId, {
      onSuccess: () => setDeletingId(null),
      onError: (error) => {
        showToast(extractApiErrors(error)[0], 'error')
        setDeletingId(null)
      },
    })
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">Comments ({comments.length})</h3>
      <div className="mt-2 divide-y divide-gray-100">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isOwner={(comment.author ?? comment.user)?.uuid === user?.uuid}
            isEditing={editingId === comment.id}
            updating={update.isPending}
            onStartEdit={() => setEditingId(comment.id)}
            onCancelEdit={() => setEditingId(null)}
            onSubmitEdit={(content) => handleUpdate(comment.id, content)}
            onDelete={() => setDeletingId(comment.id)}
          />
        ))}
        {comments.length === 0 && (
          <p className="py-3 text-sm text-gray-400">No comments yet. Be the first to comment.</p>
        )}
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <CommentForm loading={create.isPending} onSubmit={handleCreate} />
      </div>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete comment"
        description="This action can't be undone."
        loading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
