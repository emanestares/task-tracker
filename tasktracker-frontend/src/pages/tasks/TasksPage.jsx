import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Calendar, List, BarChart2, Search, X, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useTasks, useDebounce, useDisclosure } from '../../hooks/index.js'
import { TASK_STATUS, PAGINATION_LIMIT } from '../../constants'
import PageHeader from '../../components/common/PageHeader'
import TaskForm from '../../components/forms/TaskForm'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { StatusBadge, EmptyState, Pagination } from '../../components/ui/index.jsx'
import { formatDate, timeAgo, truncate } from '../../utils'
import CalendarView from './CalendarView'

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   dot: '#ef4444', bg: 'var(--priority-high-bg)',   border: 'var(--priority-high-border)' },
  MEDIUM: { label: 'Medium', dot: '#f59e0b', bg: 'var(--priority-medium-bg)', border: 'var(--priority-medium-border)' },
  LOW:    { label: 'Low',    dot: '#10b981', bg: 'var(--priority-low-bg)',    border: 'var(--priority-low-border)' },
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '999px',
        fontSize: '13px', fontWeight: 700,
        backgroundColor: cfg.bg, color: cfg.dot, border: `1.5px solid ${cfg.border}`,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

/* ── Priority Chart ─────────────────────────────────────────── */
function PriorityChart({ tasks }) {
  const counts = useMemo(() => {
    const active = tasks.filter(t => t.status !== TASK_STATUS.CANCELLED)
    return ['HIGH', 'MEDIUM', 'LOW'].map(p => ({
      key: p,
      label: p.charAt(0) + p.slice(1).toLowerCase(),
      color: PRIORITY_CONFIG[p].dot,
      bg: PRIORITY_CONFIG[p].bg,
      border: PRIORITY_CONFIG[p].border,
      total: active.filter(t => t.priority === p).length,
      done: active.filter(t => t.priority === p && t.status === TASK_STATUS.DONE).length,
    }))
  }, [tasks])

  const maxVal = Math.max(...counts.map(c => c.total), 1)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}>
            <TrendingUp size={17} color="#2563eb" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Priority Breakdown</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Completion by priority level</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: 0 }}>
            {counts.reduce((s, c) => s + c.done, 0)}/{counts.reduce((s, c) => s + c.total, 0)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>tasks done</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {counts.map(({ key, label, color, total, done }) => {
          const pct = (total / maxVal) * 100
          const donePct = total > 0 ? (done / total) * 100 : 0
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{label} Priority</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{done} of {total} done</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color, minWidth: 24, textAlign: 'right' }}>{total}</span>
                </div>
              </div>
              <div style={{ height: 14, borderRadius: 999, overflow: 'hidden', backgroundColor: color + '18', border: `1px solid ${color}28` }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color + '30', borderRadius: 999, position: 'relative', overflow: 'hidden', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}>
                  <div style={{ height: '100%', width: `${donePct}%`, backgroundColor: color, borderRadius: 999, boxShadow: `0 0 8px ${color}80`, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s' }} />
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {total > 0 ? `${Math.round(donePct)}% complete` : 'No tasks'}
                {total > 0 && done === total ? ' · ✓ All done!' : ''}
              </p>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-primary)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {counts.map(({ key, label, color, total, done }) => (
          <div key={key} style={{ textAlign: 'center', padding: '16px 8px', borderRadius: 14, backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, margin: '0 0 4px' }}>{total}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{done} done</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
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
  const [sortBy, setSortBy] = useState('priority')
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list')

  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let result = tasks.filter(t => {
      const matchSearch = !debouncedSearch ||
        t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchStatus = !statusFilter || t.status === statusFilter
      const matchPriority = !priorityFilter || t.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
    return [...result].sort((a, b) => {
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [tasks, debouncedSearch, statusFilter, priorityFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_LIMIT))
  const paginated = filtered.slice((page - 1) * PAGINATION_LIMIT, page * PAGINATION_LIMIT)

  const handleCreate = async (form) => {
    setFormLoading(true)
    try { await createTask(form); createModal.close() } catch { } finally { setFormLoading(false) }
  }
  const handleEdit = (task) => { setSelectedTask(task); editModal.open() }
  const handleUpdate = async (form) => {
    setFormLoading(true)
    try { await updateTask(selectedTask.id, form); editModal.close(); setSelectedTask(null) } catch { } finally { setFormLoading(false) }
  }
  const handleDeleteClick = (task) => { setSelectedTask(task); deleteDialog.open() }
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try { await deleteTask(selectedTask.id); deleteDialog.close(); setSelectedTask(null) } catch { } finally { setDeleteLoading(false) }
  }

  const hasFilters = search || statusFilter || priorityFilter
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }

  /* shared select style */
  const selStyle = (active) => ({
    padding: '9px 14px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: active ? '1.5px solid var(--accent-primary)' : '1.5px solid var(--border-secondary)',
    backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
    color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'auto',
    minWidth: 130,
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''} ${hasFilters ? 'matching filters' : 'total'}`}
        action={
          <button className="btn-primary" onClick={createModal.open}>
            <Plus size={16} /> New Task
          </button>
        }
      />

      {/* ═══════════════════════════════════════════
          TWO-LAYER TOOLBAR
          Layer 1 — Search bar + View toggle
          Layer 2 — Filters + Sort
      ═══════════════════════════════════════════ */}
      <div style={{ borderRadius: 14, border: '1px solid var(--border-primary)', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>

        {/* ── Layer 1: Search + View Toggle ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          {/* Search — icon is inside */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-primary)',
          }}>
            <Search size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tasks by title or description…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, color: 'var(--text-primary)',
                caretColor: 'var(--accent-primary)',
              }}
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: 4, borderRadius: 10,
            border: '1.5px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-primary)',
            flexShrink: 0,
          }}>
            {[['list', List, 'List'], ['chart', BarChart2, 'Chart'], ['calendar', Calendar, 'Calendar']].map(([id, Icon, lbl]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                title={lbl}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  backgroundColor: view === id ? 'var(--accent-primary)' : 'transparent',
                  color: view === id ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  boxShadow: view === id ? '0 1px 4px rgba(37,99,235,0.35)' : 'none',
                }}
              >
                <Icon size={14} />
                <span>{lbl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Layer 2: Filters + Sort ── */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          padding: '12px 16px',
          backgroundColor: 'var(--bg-tertiary)',
        }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
              Filters
            </span>
          </div>

          {/* Status */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={selStyle(!!statusFilter)}>
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority */}
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} style={selStyle(!!priorityFilter)}>
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Divider */}
          <div style={{ width: 1, height: 22, backgroundColor: 'var(--border-secondary)', margin: '0 2px' }} />

          {/* Sort label */}
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Sort</span>

          {/* Sort select */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selStyle(false)}>
            <option value="priority">By Priority</option>
            <option value="dueDate">By Due Date</option>
            <option value="created">Newest First</option>
          </select>

          {/* Active chips + clear — pushed right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {statusFilter && <Chip label={statusFilter.replace('_', ' ')} onRemove={() => { setStatusFilter(''); setPage(1) }} />}
            {priorityFilter && <Chip label={priorityFilter} onRemove={() => { setPriorityFilter(''); setPage(1) }} />}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{ padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid var(--priority-high-border)', backgroundColor: 'var(--priority-high-bg)', color: '#ef4444', cursor: 'pointer' }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {view === 'chart' && <PriorityChart tasks={tasks} />}

      {/* Calendar */}
      {view === 'calendar' && <CalendarView tasks={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />}

      {/* List */}
      {view === 'list' && (
        <>
          {loading ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: '1px solid var(--border-primary)' }}>
                  <div className="skeleton" style={{ height: 16, flex: 1, borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 30, width: 90, borderRadius: 999 }} />
                  <div className="skeleton" style={{ height: 30, width: 76, borderRadius: 999 }} />
                  <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={CheckSquare}
                title={hasFilters ? 'No matching tasks' : 'No tasks yet'}
                description={hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
                action={!hasFilters && <button className="btn-primary" onClick={createModal.open}><Plus size={14} /> New Task</button>}
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-primary)' }}>
                      {['Task', 'Status', 'Priority', 'Due Date', 'Created', ''].map(h => (
                        <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(task => (
                      <tr key={task.id} className="table-row group">
                        <td style={{ padding: '16px 20px', maxWidth: 280 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 5, height: 44, borderRadius: 999, flexShrink: 0, backgroundColor: PRIORITY_CONFIG[task.priority]?.dot || '#94a3b8' }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                fontSize: 15, fontWeight: 600, margin: '0 0 2px',
                                color: 'var(--text-primary)',
                                textDecoration: task.status === TASK_STATUS.DONE ? 'line-through' : 'none',
                                opacity: task.status === TASK_STATUS.DONE ? 0.45 : 1,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240,
                              }}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                                  {truncate(task.description, 55)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}><StatusBadge status={task.status} /></td>
                        <td style={{ padding: '16px 20px' }}><PriorityBadge priority={task.priority} /></td>
                        <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {task.dueDate ? formatDate(task.dueDate) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                          {timeAgo(task.createdAt || task.created_at)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => handleEdit(task)} className="btn-ghost" style={{ padding: '7px 8px' }} title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(task)}
                              style={{ padding: '7px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--priority-high-bg)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {paginated.map(task => (
                  <div
                    key={task.id}
                    style={{
                      borderRadius: 14, padding: '16px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderLeft: `5px solid ${PRIORITY_CONFIG[task.priority]?.dot || '#94a3b8'}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 16, fontWeight: 700, margin: '0 0 4px',
                          color: 'var(--text-primary)',
                          textDecoration: task.status === TASK_STATUS.DONE ? 'line-through' : 'none',
                          opacity: task.status === TASK_STATUS.DONE ? 0.45 : 1,
                        }}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                            {truncate(task.description, 80)}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => handleEdit(task)} className="btn-ghost" style={{ padding: '7px 8px' }}><Pencil size={15} /></button>
                        <button onClick={() => handleDeleteClick(task)} style={{ padding: '7px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span style={{ fontSize: 13, fontWeight: 600, padding: '5px 10px', borderRadius: 999, backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {timeAgo(task.createdAt || task.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </>
          )}
        </>
      )}

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Task" size="md">
        <TaskForm onSubmit={handleCreate} onCancel={createModal.close} loading={formLoading} />
      </Modal>
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Task" size="md">
        {selectedTask && <TaskForm initial={selectedTask} onSubmit={handleUpdate} onCancel={editModal.close} loading={formLoading} />}
      </Modal>
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete this task?"
        description={`"${selectedTask?.title}" will be permanently deleted and cannot be recovered.`}
        confirmLabel="Delete Task"
      />
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid var(--accent-muted)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'inherit', opacity: 0.7 }}>
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  )
}
