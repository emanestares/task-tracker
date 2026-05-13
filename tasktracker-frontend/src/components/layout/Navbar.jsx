import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils'

export default function Navbar({ onMenuClick, isAdmin }) {
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()

  return (
    <header
      className="flex-shrink-0 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b z-10"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Left: hamburger (mobile) + page indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu size={20} />
        </button>
        {isAdmin && (
          <span
            className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
          >
            Admin Panel
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification bell (visual only) */}
        <button
          className="relative p-2 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ml-1"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#0f0e0c' }}
          title={user?.name || user?.username}
        >
          {getInitials(user?.name || user?.username || 'U')}
        </div>
      </div>
    </header>
  )
}
