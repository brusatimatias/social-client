import { useState } from 'react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PostCardSkeleton } from '@/components/Skeleton'
import { PostCard } from '@/features/posts/PostCard'
import { PostComposerModal } from '@/features/posts/PostComposerModal'
import { useFeedQuery } from './useFeedQuery'

const PER_PAGE = 20

export function FeedPage() {
  const [page, setPage] = useState(1)
  const [composerOpen, setComposerOpen] = useState(false)
  const { data, isLoading, isError, refetch, isPlaceholderData } = useFeedQuery(page, PER_PAGE)

  const posts = data?.posts ?? []
  const totalPages = typeof data?.meta.total_pages === 'number' ? data.meta.total_pages : undefined
  const hasNext = totalPages ? page < totalPages : posts.length === PER_PAGE

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Feed</h1>
        <Button onClick={() => setComposerOpen(true)}>New post</Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load your feed." onRetry={refetch} />}

      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState
          title="Your feed is empty"
          description="Follow people or create your first post to see activity here."
        />
      )}

      {posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {(page > 1 || hasNext) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <Button
            variant="secondary"
            disabled={!hasNext || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <PostComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  )
}
