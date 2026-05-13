import { useState, useMemo } from 'react'
import { Plus, Filter, Pencil, Trash2, CheckSquare } from 'lucide-react'
import { useTasks, useDebounce, useDisclosure } from '../../hooks/index.js'
import { TASK_STATUS, TASK_PRIORITY, PAGINATION_LIMIT } from '../../constants'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import TaskForm from '../../components/forms/TaskForm'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { StatusBadge, EmptyState, Pagination, Spinner } from '../../components/ui/index.jsx'
import { formatDate, timeAgo, truncate } from '../../utils'

export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()

  // Modal state
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const deleteDialog = useDisclosure()

  const [selectedTask, setSelectedTask] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Search & filter
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 250)

  // Client-side filter (if backend doesn't support query params)
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !debouncedSearch ||
        t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchStatus = !statusFilter || t.status === statusFilter
      const matchPriority = !priorityFilter || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [tasks, debouncedSearch, statusFilter, priorityFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_LIMIT))
  const paginated = filtered.slice((page - 1) * PAGINATION_LIMIT, page * PAGINATION_LIMIT)

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset page on filter change
  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setPage(1) }
  const handlePriorityFilter = (v) => { setPriorityFilter(v); setPage(1) }

  // CRUD handlers
  const handleCreate = async (form) => {
    setFormLoading(true)
    try {
      await createTask(form)
      createModal.close()
    } catch { /* handled */ } finally { setFormLoading(false) }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    editModal.open()
  }

  const handleUpdate = async (form) => {
    setFormLoading(true)
    try {
      await updateTask(selectedTask.id, form)
      editModal.close()
      setSelectedTask(null)
    } catch { /* handled */ } finally { setFormLoading(false) }
  }

  const handleDeleteClick = (task) => {
    setSelectedTask(task)
    deleteDialog.open()
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      await deleteTask(selectedTask.id)
      deleteDialog.close()
      setSelectedTask(null)
    } catch { /* handled */ } finally { setDeleteLoading(false) }
  }

  const hasFilters = search || statusFilter || priorityFilter

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''} total`}
        action={
          <button className="btn-primary" onClick={createModal.open}>
            <Plus size={16} /> New Task
          </button>
        }
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search tasks…"
          className="flex-1"
        />
        <div className="flex gap-2">
          <select
            className="input-field text-sm"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ minWidth: 130 }}
          >
            <option value="">All Status</option>
            {Object.entries(TASK_STATUS).map(([k, v]) => (
              <option key={k} value={v}>
                {v === 'IN_PROGRESS' ? 'In Progress' : v.charAt(0) + v.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            className="input-field text-sm"
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Priority</option>
            {Object.entries(TASK_PRIORITY).map(([k, v]) => (
              <option key={k} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              className="btn-secondary text-sm px-3"
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Task list / table */}
      {loading ? (
        <TaskListSkeleton />
      ) : paginated.length === 0 ? (
        <div className="card py-8">
          <EmptyState
            icon={CheckSquare}
            title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Create your first task to get started.'
            }
            action={
              !hasFilters && (
                <button className="btn-primary" onClick={createModal.open}>
                  <Plus size={15} /> Create Task
                </button>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                  {['Title', 'Status', 'Priority', 'Due Date', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((task) => (
                  <tr key={task.id} className="table-row">
                    <td className="px-4 py-4 max-w-xs">
                      <p className={`font-medium truncate ${task.status === TASK_STATUS.DONE ? 'line-through opacity-50' : ''}`}
                        style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {truncate(task.description, 55)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(task.createdAt || task.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}
                          title="Delete"
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
            {paginated.map((task) => (
              <div key={task.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className={`font-semibold text-sm leading-snug ${task.status === TASK_STATUS.DONE ? 'line-through opacity-50' : ''}`}
                    style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                  </p>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => handleEdit(task)}
                      className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeleteClick(task)}
                      className="p-1.5 rounded-lg" style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {truncate(task.description, 80)}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {timeAgo(task.createdAt || task.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Task" size="md">
        <TaskForm onSubmit={handleCreate} onCancel={createModal.close} loading={formLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Task" size="md">
        {selectedTask && (
          <TaskForm
            initial={selectedTask}
            onSubmit={handleUpdate}
            onCancel={editModal.close}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete this task?"
        description={`"${selectedTask?.title}" will be permanently deleted.`}
        confirmLabel="Delete Task"
      />
    </div>
  )
}

function PriorityBadge({ priority }) {
  const map = {
    HIGH: { label: 'High', bg: '#fef2f2', color: '#dc2626' },
    MEDIUM: { label: 'Medium', bg: '#fffbeb', color: '#d97706' },
    LOW: { label: 'Low', bg: '#f0fdf4', color: '#16a34a' },
  }
  const style = map[priority] || map.LOW
  return (
    <span className="badge text-xs" style={{ backgroundColor: style.bg, color: style.color }}>
      {style.label}
    </span>
  )
}

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4">
          <div className="skeleton h-4 flex-1 rounded-md" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-4 w-16 rounded-md" />
        </div>
      ))}
    </div>
  )
}
