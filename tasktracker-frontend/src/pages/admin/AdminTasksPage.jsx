import { useState, useEffect, useMemo } from 'react'
import { ListChecks } from 'lucide-react'
import AdminService from '../../services/adminService'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import { StatusBadge, EmptyState, Pagination } from '../../components/ui/index.jsx'
import { TASK_STATUS, PAGINATION_LIMIT } from '../../constants'
import { formatDate, timeAgo, truncate } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState(() => AdminService.getCachedTasks() || [])
  const [loading, setLoading] = useState(() => !AdminService.getCachedTasks())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadTasks = async (forceRefresh = false) => {
    const hasCachedTasks = !!AdminService.getCachedTasks()
    try {
      const data = await AdminService.getAllTasks({ forceRefresh })
      setTasks(Array.isArray(data) ? data : data?.content ?? [])
    } catch {
      toast.error('Failed to load tasks.')
    } finally {
      if (!hasCachedTasks) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const initialLoadId = setTimeout(() => {
      void loadTasks()
    }, 0)

    const intervalId = setInterval(() => {
      void loadTasks()
    }, 15000)

    return () => {
      clearTimeout(initialLoadId)
      clearInterval(intervalId)
    }
  }, [])

  const filtered = useMemo(() =>
    tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || t.status === statusFilter
      return matchSearch && matchStatus
    }), [tasks, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_LIMIT))
  const paginated = filtered.slice((page - 1) * PAGINATION_LIMIT, page * PAGINATION_LIMIT)

  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleStatus = (v) => { setStatusFilter(v); setPage(1) }

  return (
    <div>
      <PageHeader
        title="All Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''} system-wide`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:items-center">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search tasks…" />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input-field text-sm h-10 px-3 py-2 rounded-lg"
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value)}
            style={{ minWidth: 150, color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <option value="">All Status</option>
            {Object.entries(TASK_STATUS).map(([k, v]) => (
              <option key={k} value={v}>
                {v === 'IN_PROGRESS' ? 'In Progress' : v.charAt(0) + v.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button className="btn-secondary text-xs px-3 py-2 h-10 flex items-center justify-center whitespace-nowrap"
              onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-6">
            <EmptyState icon={ListChecks} title="No tasks found" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                  {['Task', 'Assigned User', 'Status', 'Due Date', 'Created'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((task) => (
                  <tr key={task.id} className="table-row">
                    <td className="px-6 py-3.5 max-w-xs">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {truncate(task.title, 50)}
                      </p>
                      {task.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {truncate(task.description, 50)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {task.user?.name || task.user?.username || task.userId || '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(task.createdAt || task.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
