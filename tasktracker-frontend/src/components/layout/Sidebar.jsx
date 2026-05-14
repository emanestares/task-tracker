import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Users, ListChecks,
  Settings, X, ShieldCheck, LogOut, Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'

const userNav = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.TASKS, icon: CheckSquare, label: 'My Tasks' },
  { to: ROUTES.PROFILE, icon: Settings, label: 'Settings' },
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
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 h-full"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-sidebar)',
        }}
      >
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex flex-col lg:hidden overflow-y-auto transition-transform duration-300 ease-in-out"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-sidebar)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg btn-ghost"
        >
          <X size={16} />
        </button>
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>
    </>
  )
}

function SidebarContent({ nav, user, initials, logout, isAdmin }) {
  return (
    <div className="flex flex-col h-full px-3 py-5 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
          }}
        >
          <Zap size={15} strokeWidth={2.5} color="#fff" />
        </div>
        <div>
          <span
            className="font-bold text-sm block leading-tight"
            style={{ color: 'var(--text-sidebar)', fontFamily: 'Inter Tight, Inter, sans-serif', letterSpacing: '-0.02em' }}
          >
            TaskFlow
          </span>
          {isAdmin && (
            <span className="text-xs flex items-center gap-0.5 font-medium" style={{ color: 'var(--accent-primary)' }}>
              <ShieldCheck size={9} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Section label */}
      <p className="px-3 mb-2 text-xs font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-sidebar-muted)', fontSize: '10px', opacity: 0.6 }}>
        {isAdmin ? 'Administration' : 'Navigation'}
      </p>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5">
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    color={isActive ? 'var(--text-sidebar-active)' : 'currentColor'}
                  />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="mt-4 pt-4 space-y-1"
        style={{ borderTop: '1px solid var(--border-sidebar)' }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ backgroundColor: 'var(--bg-sidebar-hover)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-sidebar)' }}>
              {user?.name || user?.username || 'User'}
            </p>
            <p className="truncate" style={{ color: 'var(--text-sidebar-muted)', fontSize: '11px' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="sidebar-link w-full text-left"
          style={{ color: '#ef4444' }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef2f2' }}>
            <LogOut size={13} strokeWidth={2} color="#ef4444" />
          </div>
          Sign out
        </button>
      </div>
    </div>
  )
}
