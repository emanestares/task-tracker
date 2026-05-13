import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Users, ListChecks,
  Settings, X, ShieldCheck, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

const userNav = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.TASKS, icon: CheckSquare, label: 'My Tasks' },
  { to: ROUTES.PROFILE, icon: Settings, label: 'Profile' },
]

const adminNav = [
  { to: ROUTES.ADMIN, icon: LayoutDashboard, label: 'Overview', end: true },
  { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
  { to: ROUTES.ADMIN_TASKS, icon: ListChecks, label: 'All Tasks' },
]

export default function Sidebar({ open, onClose, isAdmin }) {
  const { user, logout } = useAuth()
  const nav = isAdmin ? adminNav : userNav

  const initials = (user?.name || user?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[260px] flex-shrink-0 h-full overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[260px] flex flex-col lg:hidden
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-sidebar-muted)' }}
        >
          <X size={18} />
        </button>
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>
    </>
  )
}

function SidebarContent({ nav, user, initials, logout, isAdmin }) {
  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)' }}>
          <CheckSquare size={16} strokeWidth={2.5} color="#0f0e0c" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight block" style={{ color: 'var(--text-sidebar)', fontFamily: 'Syne, sans-serif' }}>
            TaskFlow
          </span>
          {isAdmin && (
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
              <ShieldCheck size={10} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--text-sidebar-muted)', opacity: 0.6 }}>
          {isAdmin ? 'Administration' : 'Navigation'}
        </p>
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#0f0e0c' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-sidebar)' }}>
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-sidebar-muted)' }}>
              {user?.email || user?.role || ''}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left"
          style={{ color: '#ef4444' }}
        >
          <LogOut size={17} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </div>
  )
}
