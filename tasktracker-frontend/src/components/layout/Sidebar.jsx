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
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 h-full overflow-y-auto"
        style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)' }}
      >
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col lg:hidden
          transform transition-transform duration-250 ease-in-out overflow-y-auto`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-sidebar-muted)' }}
        >
          <X size={15} />
        </button>
        <SidebarContent nav={nav} user={user} initials={initials} logout={logout} isAdmin={isAdmin} />
      </aside>
    </>
  )
}

function SidebarContent({ nav, user, initials, logout, isAdmin }) {
  return (
    <div className="flex flex-col h-full px-3 py-5">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-7">
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <CheckSquare size={13} strokeWidth={2.5} color="#fff" />
        </div>
        <div>
          <span
            className="font-semibold text-sm block leading-tight"
            style={{ color: 'var(--text-sidebar)', letterSpacing: '-0.01em' }}
          >
            TaskFlow
          </span>
          {isAdmin && (
            <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-primary)' }}>
              <ShieldCheck size={9} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav section label */}
      <p className="text-xs font-semibold uppercase tracking-widest px-2.5 mb-2"
        style={{ color: 'var(--text-sidebar-muted)', opacity: 0.5, fontSize: '10px' }}>
        {isAdmin ? 'Admin' : 'Workspace'}
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-sidebar)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-sidebar)' }}>
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-sidebar-muted)', fontSize: '11px' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left"
          style={{ color: '#f87171' }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  )
}
