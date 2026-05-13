import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/index.js'
import PageHeader from '../../components/common/PageHeader'
import { StatCard, StatusBadge, EmptyState } from '../../components/ui/index.jsx'
import { ROUTES, TASK_STATUS } from '../../constants'
import { formatDate, timeAgo, truncate } from '../../utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, loading } = useTasks()

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === TASK_STATUS.TODO).length,
    inProgress: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
    done: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
  }), [tasks])

  const recent = useMemo(() => tasks.slice(0, 5), [tasks])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's what's happening with your tasks today."
        action={
          <Link to={ROUTES.TASKS} className="btn-primary">
            <Plus size={16} />
            New Task
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats.total} icon={CheckSquare} loading={loading} color="var(--accent-primary)" />
        <StatCard label="To Do" value={stats.todo} icon={Clock} loading={loading} color="#6b7280" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} loading={loading} color="#3b82f6" />
        <StatCard label="Completed" value={stats.done} icon={CheckCircle} loading={loading} color="#10b981" />
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Recent Tasks</h2>
          <Link
            to={ROUTES.TASKS}
            className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: 'var(--accent-primary)' }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="skeleton h-4 flex-1 rounded-md" />
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create your first task to get started."
            action={
              <Link to={ROUTES.TASKS} className="btn-primary">
                <Plus size={15} /> Create Task
              </Link>
            }
          />
        ) : (
          <div>
            {recent.map((task, i) => (
              <div
                key={task.id}
                className="flex items-center gap-4 py-3.5 transition-colors"
                style={{
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}
              >
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      task.status === TASK_STATUS.DONE ? '#10b981'
                      : task.status === TASK_STATUS.IN_PROGRESS ? '#3b82f6'
                      : task.status === TASK_STATUS.CANCELLED ? '#ef4444'
                      : '#9ca3af',
                  }}
                />

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${task.status === TASK_STATUS.DONE ? 'line-through opacity-60' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {truncate(task.description, 60)}
                    </p>
                  )}
                </div>

                {/* Badge */}
                <StatusBadge status={task.status} />

                {/* Date */}
                <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(task.createdAt || task.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress overview */}
      {!loading && tasks.length > 0 && (
        <div className="card mt-4">
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Completion Progress</h2>
          <div className="space-y-3">
            {[
              { label: 'Done', count: stats.done, color: '#10b981' },
              { label: 'In Progress', count: stats.inProgress, color: '#3b82f6' },
              { label: 'To Do', count: stats.todo, color: '#9ca3af' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {count} / {stats.total}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%',
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
