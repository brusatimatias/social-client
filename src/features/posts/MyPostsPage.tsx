import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PostCardSkeleton } from '@/components/Skeleton'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'
import type { Post, PostStatus } from '@/types/post'
import { PostCard } from './PostCard'
import { PostComposerModal } from './PostComposerModal'
import { StatusTabs } from './StatusTabs'
import { useDeletePost, useMyPosts } from './usePostsQueries'

export function MyPostsPage() {
  const [status, setStatus] = useState<PostStatus | undefined>(undefined)
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined)
  const [deletingPost, setDeletingPost] = useState<Post | null>(null)

  const { data: posts, isLoading, isError, refetch } = useMyPosts(status)
  const deletePost = useDeletePost()
  const { showToast } = useToast()

  const openCreate = () => {
    setEditingPost(undefined)
    setComposerOpen(true)
  }

  const openEdit = (post: Post) => {
    setEditingPost(post)
    setComposerOpen(true)
  }

  const handleDelete = () => {
    if (!deletingPost) return
    deletePost.mutate(deletingPost.id, {
      onSuccess: () => {
        showToast('Post deleted', 'success')
        setDeletingPost(null)
      },
      onError: (error) => {
        showToast(extractApiErrors(error)[0], 'error')
        setDeletingPost(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My posts</h1>
        <Button onClick={openCreate}>New post</Button>
      </div>

      <StatusTabs value={status} onChange={setStatus} />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load your posts." onRetry={refetch} />}

      {posts && posts.length === 0 && (
        <EmptyState
          title="No posts here yet"
          description="Create your first post to see it in this list."
          action={<Button onClick={openCreate}>Create your first post</Button>}
        />
      )}

      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onEdit={() => openEdit(post)} onDelete={() => setDeletingPost(post)} />
          ))}
        </div>
      )}

      <PostComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} post={editingPost} />

      <ConfirmDialog
        open={!!deletingPost}
        title="Delete post"
        description="This will permanently delete the post and its comments."
        loading={deletePost.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPost(null)}
      />
    </div>
  )
}
