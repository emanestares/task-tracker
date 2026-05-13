import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils'

export default function Navbar({ onMenuClick, isAdmin }) {
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 border-b z-10"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-1.5"
        >
          <Menu size={17} />
        </button>
        {isAdmin && (
          <span
            className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
          >
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="btn-ghost p-1.5"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer ml-1"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid var(--accent-muted)' }}
          title={user?.name || user?.username}
        >
          {getInitials(user?.name || user?.username || 'U')}
        </div>
      </div>
    </header>
  )
}
