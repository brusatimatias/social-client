import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h1 className="text-lg font-semibold text-gray-900">Page not found</h1>
      <Link to="/feed" className="text-sm font-medium text-brand-600 hover:underline">
        Back to feed
      </Link>
    </div>
  )
}
