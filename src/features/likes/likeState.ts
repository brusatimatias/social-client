import type { Post } from '@/types/post'

export interface MyLikeState {
  liked: boolean
  likeId?: number
}

export function getMyLikeState(post: Post, myUuid?: string): MyLikeState {
  if (typeof post.liked_by_me === 'boolean') {
    return { liked: post.liked_by_me, likeId: post.my_like_id }
  }
  if (Array.isArray(post.likes) && myUuid) {
    const mine = post.likes.find((like) => like.user?.uuid === myUuid || like.user_uuid === myUuid)
    return { liked: !!mine, likeId: mine?.id }
  }
  return { liked: false, likeId: undefined }
}
