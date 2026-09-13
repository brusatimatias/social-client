import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/Spinner'

export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/feed" replace />
  }

  return <Outlet />
}
