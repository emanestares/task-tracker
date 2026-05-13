import { useState, useEffect, useMemo } from 'react'
import { ListChecks } from 'lucide-react'
import AdminService from '../../services/adminService'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import { StatusBadge, EmptyState, Pagination, Spinner } from '../../components/ui/index.jsx'
import { TASK_STATUS, PAGINATION_LIMIT } from '../../constants'
import { formatDate, timeAgo, truncate } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    AdminService.getAllTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : data?.content ?? []))
      .catch(() => toast.error('Failed to load tasks.'))
      .finally(() => setLoading(false))
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search tasks…" className="flex-1" />
        <select
          className="input-field text-sm"
          value={statusFilter}
          onChange={(e) => handleStatus(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">All Status</option>
          {Object.entries(TASK_STATUS).map(([k, v]) => (
            <option key={k} value={v}>
              {v === 'IN_PROGRESS' ? 'In Progress' : v.charAt(0) + v.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {(search || statusFilter) && (
          <button className="btn-secondary text-sm"
            onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}>
            Clear
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size={28} />
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState icon={ListChecks} title="No tasks found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto -mx-6">
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
