import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils'

export default function Navbar({ onMenuClick, isAdmin }) {
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-5 z-10"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2">
          <Menu size={18} />
        </button>
        {isAdmin && (
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Admin Panel
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="btn-ghost p-2 rounded-lg"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark
            ? <Sun size={16} strokeWidth={1.75} />
            : <Moon size={16} strokeWidth={1.75} />
          }
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
          }}
          title={user?.name || user?.username}
        >
          {getInitials(user?.name || user?.username || 'U')}
        </div>
      </div>
    </header>
  )
}
