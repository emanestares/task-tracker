import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Calendar, List, ArrowUpDown } from 'lucide-react'
import { useTasks, useDebounce, useDisclosure } from '../../hooks/index.js'
import { TASK_STATUS, TASK_PRIORITY, PAGINATION_LIMIT } from '../../constants'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import TaskForm from '../../components/forms/TaskForm'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { StatusBadge, EmptyState, Pagination } from '../../components/ui/index.jsx'
import { formatDate, timeAgo, truncate } from '../../utils'
import CalendarView from './CalendarView'

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const PRIORITY_CONFIG = {
  HIGH: { label: 'High', color: 'var(--priority-high)', bg: 'var(--priority-high-bg)', border: 'var(--priority-high-border)' },
  MEDIUM: { label: 'Medium', color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)', border: 'var(--priority-medium-border)' },
  LOW: { label: 'Low', color: 'var(--priority-low)', bg: 'var(--priority-low-bg)', border: 'var(--priority-low-border)' },
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()

  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const deleteDialog = useDisclosure()

  const [selectedTask, setSelectedTask] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('priority') // 'priority' | 'dueDate' | 'created'
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list') // 'list' | 'calendar'

  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let result = tasks.filter((t) => {
      const matchSearch =
        !debouncedSearch ||
        t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchStatus = !statusFilter || t.status === statusFilter
      const matchPriority = !priorityFilter || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        const pa = PRIORITY_ORDER[a.priority] ?? 2
        const pb = PRIORITY_ORDER[b.priority] ?? 2
        return pa !== pb ? pa - pb : 0
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy === 'created') {
        const da = new Date(a.createdAt || a.created_at || 0)
        const db = new Date(b.createdAt || b.created_at || 0)
        return db - da
      }
      return 0
    })

    return result
  }, [tasks, debouncedSearch, statusFilter, priorityFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_LIMIT))
  const paginated = filtered.slice((page - 1) * PAGINATION_LIMIT, page * PAGINATION_LIMIT)

  const handlePageChange = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleStatusFilter = (v) => { setStatusFilter(v); setPage(1) }
  const handlePriorityFilter = (v) => { setPriorityFilter(v); setPage(1) }

  const handleCreate = async (form) => {
    setFormLoading(true)
    try { await createTask(form); createModal.close() }
    catch { } finally { setFormLoading(false) }
  }

  const handleEdit = (task) => { setSelectedTask(task); editModal.open() }
  const handleUpdate = async (form) => {
    setFormLoading(true)
    try { await updateTask(selectedTask.id, form); editModal.close(); setSelectedTask(null) }
    catch { } finally { setFormLoading(false) }
  }

  const handleDeleteClick = (task) => { setSelectedTask(task); deleteDialog.open() }
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try { await deleteTask(selectedTask.id); deleteDialog.close(); setSelectedTask(null) }
    catch { } finally { setDeleteLoading(false) }
  }

  const hasFilters = search || statusFilter || priorityFilter

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="My Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn-primary" onClick={createModal.open}>
            <Plus size={14} /> New Task
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search tasks…" className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <select
            className="input-field text-xs"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ minWidth: 110 }}
          >
            <option value="">All Status</option>
            {Object.entries(TASK_STATUS).map(([k, v]) => (
              <option key={k} value={v}>
                {v === 'IN_PROGRESS' ? 'In Progress' : v.charAt(0) + v.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <select
            className="input-field text-xs"
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value)}
            style={{ minWidth: 100 }}
          >
            <option value="">All Priority</option>
            {Object.entries(TASK_PRIORITY).map(([k, v]) => (
              <option key={k} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="input-field text-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: 110 }}
          >
            <option value="priority">Sort: Priority</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="created">Sort: Newest</option>
          </select>

          {hasFilters && (
            <button
              className="btn-ghost text-xs"
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }}
            >
              Clear
            </button>
          )}

          {/* View toggle */}
          <div
            className="flex rounded-md overflow-hidden"
            style={{ border: '1px solid var(--border-primary)' }}
          >
            <button
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: view === 'list' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: view === 'list' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setView('list')}
              title="List view"
            >
              <List size={13} />
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: view === 'calendar' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: view === 'calendar' ? '#fff' : 'var(--text-secondary)',
                borderLeft: '1px solid var(--border-primary)',
              }}
              onClick={() => setView('calendar')}
              title="Calendar view"
            >
              <Calendar size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar view */}
      {view === 'calendar' && (
        <CalendarView tasks={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />
      )}

      {/* List view */}
      {view === 'list' && (
        <>
          {loading ? (
            <TaskListSkeleton />
          ) : paginated.length === 0 ? (
            <div className="card py-6">
              <EmptyState
                icon={CheckSquare}
                title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
                description={hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
                action={
                  !hasFilters && (
                    <button className="btn-primary" onClick={createModal.open}>
                      <Plus size={13} /> Create Task
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div
                className="hidden md:block overflow-x-auto rounded-lg"
                style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}
              >
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                      {['Task', 'Status', 'Priority', 'Due Date', 'Created', ''].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-semibold"
                          style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((task) => (
                      <tr key={task.id} className="table-row">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            {/* Priority indicator bar */}
                            <div
                              className="w-0.5 h-6 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  task.priority === 'HIGH' ? 'var(--priority-high)'
                                  : task.priority === 'MEDIUM' ? 'var(--priority-medium)'
                                  : 'var(--priority-low)',
                              }}
                            />
                            <div>
                              <p
                                className={`font-medium truncate ${task.status === TASK_STATUS.DONE ? 'line-through opacity-40' : ''}`}
                                style={{ color: 'var(--text-primary)', maxWidth: 200 }}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="mt-0.5 truncate" style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                                  {truncate(task.description, 50)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {task.dueDate ? formatDate(task.dueDate) : '—'}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                          {timeAgo(task.createdAt || task.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(task)}
                              className="btn-ghost p-1.5"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(task)}
                              className="p-1.5 rounded-md transition-colors"
                              style={{ color: 'var(--priority-high)' }}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {paginated.map((task) => (
                  <div key={task.id} className="card">
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className="w-1 h-full min-h-[2rem] rounded-full flex-shrink-0 mt-1"
                        style={{
                          backgroundColor:
                            task.priority === 'HIGH' ? 'var(--priority-high)'
                            : task.priority === 'MEDIUM' ? 'var(--priority-medium)'
                            : 'var(--priority-low)',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium leading-snug ${task.status === TASK_STATUS.DONE ? 'line-through opacity-40' : ''}`}
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {truncate(task.description, 70)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(task)} className="btn-ghost p-1.5"><Pencil size={12} /></button>
                        <button onClick={() => handleDeleteClick(task)} className="p-1.5 rounded-md" style={{ color: 'var(--priority-high)' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(task.dueDate)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            </>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New Task" size="md">
        <TaskForm onSubmit={handleCreate} onCancel={createModal.close} loading={formLoading} />
      </Modal>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Task" size="md">
        {selectedTask && (
          <TaskForm initial={selectedTask} onSubmit={handleUpdate} onCancel={editModal.close} loading={formLoading} />
        )}
      </Modal>

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

function TaskListSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="skeleton h-3 flex-1 rounded" />
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-5 w-14 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}
