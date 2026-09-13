import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { FeedPage } from '@/features/feed/FeedPage'
import { FollowersPage } from '@/features/followers/FollowersPage'
import { FollowingPage } from '@/features/followers/FollowingPage'
import { MyPostsPage } from '@/features/posts/MyPostsPage'
import { PostDetailPage } from '@/features/posts/PostDetailPage'
import { MyProfilePage } from '@/features/profile/MyProfilePage'
import { NotFoundPage } from './NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/posts" element={<MyPostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/profile/me" element={<MyProfilePage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/following" element={<FollowingPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
