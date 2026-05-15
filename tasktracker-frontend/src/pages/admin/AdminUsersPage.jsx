import { useState, useEffect, useMemo } from 'react'
import { Trash2, Users, ShieldCheck, User, UserCheck, UserX, Loader2 } from 'lucide-react'
import AdminService from '../../services/adminService'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/index.jsx'
import { useDisclosure } from '../../hooks/index.js'
import { useAuth } from '../../context/AuthContext'
import { getInitials, formatDate } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState(() => AdminService.getCachedUsers() || [])
  const [loading, setLoading] = useState(() => !AdminService.getCachedUsers())
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const deleteDialog = useDisclosure()

  const loadUsers = async (forceRefresh = false) => {
    const hasCachedUsers = !!AdminService.getCachedUsers()
    try {
      const data = await AdminService.getAllUsers({ forceRefresh })
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load users.')
    } finally {
      if (!hasCachedUsers) setLoading(false)
    }
  }

  useEffect(() => {
    const initialLoadId = setTimeout(() => { void loadUsers() }, 0)
    const intervalId = setInterval(() => { void loadUsers() }, 15000)
    return () => { clearTimeout(initialLoadId); clearInterval(intervalId) }
  }, [])

  const filtered = useMemo(() =>
    users.filter((u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    deleteDialog.open()
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      await AdminService.deleteUser(selectedUser.id)
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      toast.success('User deleted.')
      deleteDialog.close()
      setSelectedUser(null)
    } catch {
      toast.error('Failed to delete user.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleActive = async (user) => {
    if (user.username === currentUser?.username) {
      toast.error("You can't deactivate your own account.")
      return
    }
    setTogglingId(user.id)
    try {
      const updated = user.isActive
        ? await AdminService.deactivateUser(user.id)
        : await AdminService.activateUser(user.id)
      setUsers((prev) => prev.map((u) => u.id === updated.id ? { ...u, ...updated } : u))
      toast.success(`${updated.name || updated.username} is now ${updated.isActive ? 'active' : 'inactive'}.`)
    } catch {
      toast.error('Failed to update user status.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${filtered.length} registered user${filtered.length !== 1 ? 's' : ''}`}
      />

      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, username, or email…" className="max-w-sm" />
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6">
            <EmptyState icon={Users} title="No users found" description="No users match your search." />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="table-row" style={{ opacity: user.isActive === false ? 0.6 : 1 }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}>
                            {getInitials(user.name || user.username || 'U')}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {user.name || '—'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {user.email || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(user.createdAt || user.created_at)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <ActiveToggle
                            isActive={user.isActive}
                            loading={togglingId === user.id}
                            disabled={user.username === currentUser?.username}
                            onToggle={() => handleToggleActive(user)}
                            title={user.username === currentUser?.username ? "You can't deactivate yourself" : user.isActive ? 'Deactivate user' : 'Activate user'}
                          />
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-3 px-4"
                  style={{ borderBottom: '1px solid var(--border-primary)', opacity: user.isActive === false ? 0.6 : 1 }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-primary)' }}>
                    {getInitials(user.name || user.username || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name || user.username}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </p>
                  </div>
                  <RoleBadge role={user.role} />
                  <ActiveToggle
                    isActive={user.isActive}
                    loading={togglingId === user.id}
                    disabled={user.username === currentUser?.username}
                    onToggle={() => handleToggleActive(user)}
                    title={user.username === currentUser?.username ? "You can't deactivate yourself" : user.isActive ? 'Deactivate' : 'Activate'}
                  />
                  <button onClick={() => handleDeleteClick(user)}
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete this user?"
        description={`"${selectedUser?.name || selectedUser?.username}" and all their data will be permanently removed.`}
        confirmLabel="Delete User"
      />
    </div>
  )
}

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span className="badge text-xs" style={{
      backgroundColor: isAdmin ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
      color: isAdmin ? 'var(--accent-primary)' : 'var(--text-secondary)',
    }}>
      {isAdmin ? <ShieldCheck size={10} /> : <User size={10} />}
      {role || 'USER'}
    </span>
  )
}

function StatusBadge({ isActive }) {
  const active = isActive !== false
  return (
    <span className="badge text-xs" style={{
      backgroundColor: active ? '#dcfce7' : '#fef3c7',
      color: active ? '#15803d' : '#92400e',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: active ? '#16a34a' : '#d97706',
        display: 'inline-block', flexShrink: 0,
      }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function ActiveToggle({ isActive, loading, disabled, onToggle, title }) {
  const active = isActive !== false
  return (
    <button
      onClick={onToggle}
      disabled={disabled || loading}
      title={title}
      className="p-1.5 rounded-lg transition-colors"
      style={{
        color: active ? '#16a34a' : '#d97706',
        backgroundColor: active ? '#dcfce7' : '#fef3c7',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        flexShrink: 0,
      }}
    >
      {loading
        ? <Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} />
        : active
          ? <UserCheck size={13} />
          : <UserX size={13} />
      }
    </button>
  )
}