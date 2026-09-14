import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/Avatar'
import { cn } from '@/lib/utils'

const links = [
  { to: '/feed', label: 'Feed' },
  { to: '/explore', label: 'Explore' },
  { to: '/posts', label: 'My Posts' },
  { to: '/followers', label: 'Followers' },
  { to: '/following', label: 'Following' },
]

export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    )

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <NavLink to="/feed" className="text-lg font-bold text-brand-600">
            Social
          </NavLink>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <NavLink to="/profile/me" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100">
            <Avatar name={user?.name} lastname={user?.lastname} size="sm" />
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3 sm:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile/me" className={linkClass} onClick={() => setMenuOpen(false)}>
            Profile
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  )
}
