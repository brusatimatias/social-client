import { Link, useParams } from 'react-router-dom'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { PostCardSkeleton } from '@/components/Skeleton'
import { CommentList } from '@/features/comments/CommentList'
import { PostCard } from './PostCard'
import { usePost } from './usePostsQueries'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading, isError, refetch } = usePost(id ?? '')

  return (
    <div className="flex flex-col gap-4">
      <Link to="/feed" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back
      </Link>

      {isLoading && <PostCardSkeleton />}
      {isError && <ErrorState message="Couldn't load this post." onRetry={refetch} />}

      {post && (
        <>
          <PostCard post={post} />
          <Card className="p-4">
            <CommentList post={post} />
          </Card>
        </>
      )}
    </div>
  )
}
