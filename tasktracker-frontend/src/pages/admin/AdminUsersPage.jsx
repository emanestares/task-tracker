import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, ShieldCheck, User, UserCheck, UserX,
  BadgePlus, BadgeMinus, Trash2, MoreHorizontal, Loader2,
} from 'lucide-react';
import AdminService from '../../services/adminService';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/index.jsx';
import { useDisclosure } from '../../hooks/index.js';
import { useAuth } from '../../context/AuthContext';
import { getInitials, formatDate } from '../../utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState(() => AdminService.getCachedUsers() || []);
  const [loading, setLoading] = useState(() => !AdminService.getCachedUsers());
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const deleteDialog = useDisclosure();

  const loadUsers = async (forceRefresh = false) => {
    const hasCachedUsers = !!AdminService.getCachedUsers();
    try {
      const data = await AdminService.getAllUsers({ forceRefresh });
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      if (!hasCachedUsers) setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoadId = setTimeout(() => { void loadUsers(); }, 0);
    const intervalId = setInterval(() => { void loadUsers(); }, 15000);
    return () => { clearTimeout(initialLoadId); clearInterval(intervalId); };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const close = (e) => {
      if (!e.target.closest('[data-actions-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openMenuId]);

  const filtered = useMemo(() =>
    users.filter((u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenMenuId(null);
    deleteDialog.open();
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await AdminService.deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      toast.success('User deleted.');
      deleteDialog.close();
      setSelectedUser(null);
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    setOpenMenuId(null);
    setTogglingId(user.id);
    try {
      const updated = user.isActive
        ? await AdminService.deactivateUser(user.id)
        : await AdminService.activateUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      toast.success(`${updated.name || updated.username} is now ${updated.isActive ? 'active' : 'inactive'}.`);
    } catch {
      toast.error('Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleRole = async (user) => {
    setOpenMenuId(null);
    setRoleUpdatingId(user.id);
    try {
      await AdminService.toggleUserRole(user.id);
      await loadUsers(true);
      toast.success(`${user.name || user.username} role updated.`);
    } catch {
      toast.error('Failed to update user role.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const isSelf = (user) => user.username === currentUser?.username;
  const isSuperAdminUser = (user) => user.role === 'SUPER_ADMIN';

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${filtered.length} registered user${filtered.length !== 1 ? 's' : ''}`}
      />

      <div className="mb-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, username, or email…"
          className="max-w-sm"
        />
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
                  <tr style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderTop: '1px solid var(--border-primary)',
                    borderBottom: '1px solid var(--border-primary)',
                  }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                      <th key={i}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)', width: h === '' ? 56 : undefined }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const busy = togglingId === user.id || roleUpdatingId === user.id;
                    return (
                      <tr key={user.id} className="table-row"
                        style={{ opacity: user.isActive === false ? 0.6 : 1 }}>
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
                          <ActionsMenu
                            user={user}
                            isSelf={isSelf(user)}
                            isSuperAdmin={isSuperAdmin}
                            isSuperAdminUser={isSuperAdminUser(user)}
                            busy={busy}
                            isOpen={openMenuId === user.id}
                            onOpen={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            onToggleActive={() => handleToggleActive(user)}
                            onToggleRole={() => handleToggleRole(user)}
                            onDelete={() => handleDeleteClick(user)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {filtered.map((user) => {
                const busy = togglingId === user.id || roleUpdatingId === user.id;
                return (
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RoleBadge role={user.role} />
                        <StatusBadge isActive={user.isActive} />
                      </div>
                    </div>
                    <ActionsMenu
                      user={user}
                      isSelf={isSelf(user)}
                      isSuperAdmin={isSuperAdmin}
                      isSuperAdminUser={isSuperAdminUser(user)}
                      busy={busy}
                      isOpen={openMenuId === user.id}
                      onOpen={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      onToggleActive={() => handleToggleActive(user)}
                      onToggleRole={() => handleToggleRole(user)}
                      onDelete={() => handleDeleteClick(user)}
                      alignRight
                    />
                  </div>
                );
              })}
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
  );
}

// ── ActionsMenu ───────────────────────────────────────────────────────────────

function ActionsMenu({
  user, isSelf, isSuperAdmin, isSuperAdminUser,
  busy, isOpen, onOpen,
  onToggleActive, onToggleRole, onDelete,
  alignRight = false,
}) {
  const ref = useRef(null);
  const active = user.isActive !== false;
  const canToggleActive = !isSelf && !isSuperAdminUser && (isSuperAdmin || user.role === 'USER');
  const canToggleRole = isSuperAdmin && !isSelf && !isSuperAdminUser;
  const canDelete = isSuperAdmin && !isSelf && !isSuperAdminUser;

  const items = [
    canToggleActive && {
      label: active ? 'Deactivate user' : 'Activate user',
      icon: active ? UserX : UserCheck,
      color: active ? '#d97706' : '#16a34a',
      bg: active ? '#fef3c7' : '#dcfce7',
      onClick: onToggleActive,
    },
    canToggleRole && {
      label: user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin',
      icon: user.role === 'ADMIN' ? BadgeMinus : BadgePlus,
      color: user.role === 'ADMIN' ? '#b45309' : '#2563eb',
      bg: user.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
      onClick: onToggleRole,
    },
    canDelete && { divider: true },
    canDelete && {
      label: 'Delete user',
      icon: Trash2,
      color: '#dc2626',
      bg: '#fef2f2',
      onClick: onDelete,
      danger: true,
    },
  ].filter(Boolean);

  const hasActions = items.some((i) => !i.divider);

  return (
    <div ref={ref} data-actions-menu style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={onOpen}
        disabled={busy || !hasActions}
        title={!hasActions ? 'No actions available' : 'Actions'}
        style={{
          width: 28, height: 28,
          borderRadius: 8,
          border: '1px solid var(--border-primary)',
          backgroundColor: isOpen ? 'var(--bg-tertiary)' : 'transparent',
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: (!hasActions || busy) ? 'not-allowed' : 'pointer',
          opacity: (!hasActions || busy) ? 0.4 : 1,
          transition: 'background-color 0.15s',
          flexShrink: 0,
        }}
      >
        {busy
          ? <Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} />
          : <MoreHorizontal size={14} />
        }
      </button>

      {isOpen && hasActions && (
        <div data-actions-menu style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: alignRight ? 0 : undefined,
          left: alignRight ? undefined : 0,
          zIndex: 50,
          minWidth: 180,
          borderRadius: 10,
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          padding: '4px 0',
        }}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ height: 1, backgroundColor: 'var(--border-primary)', margin: '4px 0' }} />
            ) : (
              <button
                key={i}
                onClick={item.onClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 14px',
                  background: 'none', border: 'none',
                  color: item.danger ? item.color : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  textAlign: 'left',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.bg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  backgroundColor: item.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={12} style={{ color: item.color }} />
                </span>
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN';
  const label = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'User';
  return (
    <span className="badge text-xs" style={{
      backgroundColor: isSuperAdmin ? '#fef3c7' : isAdmin ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
      color: isSuperAdmin ? '#92400e' : isAdmin ? 'var(--accent-primary)' : 'var(--text-secondary)',
    }}>
      {isSuperAdmin || isAdmin ? <ShieldCheck size={10} /> : <User size={10} />}
      {label}
    </span>
  );
}

function StatusBadge({ isActive }) {
  const active = isActive !== false;
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
  );
}