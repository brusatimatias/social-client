import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { NotFoundPage } from './NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ExplorePage = lazy(() =>
  import('@/features/explore/ExplorePage').then((m) => ({ default: m.ExplorePage })),
)
const FeedPage = lazy(() => import('@/features/feed/FeedPage').then((m) => ({ default: m.FeedPage })))
const FollowListPage = lazy(() =>
  import('@/features/followers/FollowListPage').then((m) => ({ default: m.FollowListPage })),
)
const MyPostsPage = lazy(() =>
  import('@/features/posts/MyPostsPage').then((m) => ({ default: m.MyPostsPage })),
)
const PostDetailPage = lazy(() =>
  import('@/features/posts/PostDetailPage').then((m) => ({ default: m.PostDetailPage })),
)
const MyProfilePage = lazy(() =>
  import('@/features/profile/MyProfilePage').then((m) => ({ default: m.MyProfilePage })),
)

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" className="text-brand-600" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/posts" element={<MyPostsPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/profile/me" element={<MyProfilePage />} />
            <Route path="/followers" element={<FollowListPage key="followers" kind="followers" />} />
            <Route path="/following" element={<FollowListPage key="following" kind="following" />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
