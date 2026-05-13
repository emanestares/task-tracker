import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, CheckCircle, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/index.js'
import PageHeader from '../../components/common/PageHeader'
import { StatusBadge, EmptyState } from '../../components/ui/index.jsx'
import { ROUTES, TASK_STATUS, TASK_PRIORITY } from '../../constants'
import { formatDate, timeAgo, truncate } from '../../utils'

// Minimal donut chart using SVG
function DonutChart({ done, inProgress, todo, total }) {
  const size = 120
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const segments = [
    { value: done, color: '#16a34a', label: 'Done' },
    { value: inProgress, color: '#2563eb', label: 'In Progress' },
    { value: todo, color: '#e4e4e7', label: 'To Do' },
  ]

  let offset = 0
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = pct * circumference
    const arc = { ...seg, dashArray: `${dash} ${circumference - dash}`, dashOffset: -offset * circumference }
    offset += pct
    return arc
  })

  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{completionPct}%</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>done</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span className="text-xs font-semibold ml-auto pl-4" style={{ color: 'var(--text-primary)' }}>{seg.value}</span>
          </div>
        ))}
        <div className="pt-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</span>
            <span className="text-xs font-semibold ml-auto pl-4" style={{ color: 'var(--text-primary)' }}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PRIORITY_CONFIG = {
  HIGH: { color: 'var(--priority-high)', bg: 'var(--priority-high-bg)', label: 'High' },
  MEDIUM: { color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)', label: 'Medium' },
  LOW: { color: 'var(--priority-low)', bg: 'var(--priority-low-bg)', label: 'Low' },
}

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

  const urgentTasks = useMemo(() =>
    tasks.filter((t) => t.priority === TASK_PRIORITY.HIGH && t.status !== TASK_STATUS.DONE).slice(0, 3),
  [tasks])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's your task overview for today."
        action={
          <Link to={ROUTES.TASKS} className="btn-primary">
            <Plus size={14} />
            New Task
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: CheckSquare, color: 'var(--accent-primary)' },
          { label: 'To Do', value: stats.todo, icon: Clock, color: 'var(--text-muted)' },
          { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'var(--accent-primary)' },
          { label: 'Completed', value: stats.done, icon: CheckCircle, color: 'var(--priority-low)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <Icon size={14} style={{ color }} />
            </div>
            {loading ? (
              <div className="skeleton h-7 w-12 rounded" />
            ) : (
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Completion chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Completion</h2>
          </div>
          {loading ? (
            <div className="flex items-center gap-6">
              <div className="skeleton w-[120px] h-[120px] rounded-full" />
              <div className="space-y-2 flex-1">
                {[1,2,3].map(i => <div key={i} className="skeleton h-4 rounded" />)}
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
            </div>
          ) : (
            <DonutChart
              done={stats.done}
              inProgress={stats.inProgress}
              todo={stats.todo}
              total={stats.total}
            />
          )}
        </div>

        {/* Urgent tasks */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>High Priority</h2>
            <Link
              to={ROUTES.TASKS}
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--accent-primary)' }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
          ) : urgentTasks.length === 0 ? (
            <div className="py-5 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No high priority tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md"
                  style={{ backgroundColor: 'var(--priority-high-bg)', border: '1px solid var(--priority-high-border)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--priority-high)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--priority-high)' }}>Due {formatDate(task.dueDate)}</p>
                    )}
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Tasks</h2>
          <Link
            to={ROUTES.TASKS}
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--accent-primary)' }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="skeleton h-3 w-3 rounded-full" />
                <div className="skeleton h-3.5 flex-1 rounded" />
                <div className="skeleton h-5 w-16 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
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
                <Plus size={13} /> Create Task
              </Link>
            }
          />
        ) : (
          <div>
            {recent.map((task, i) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--border-primary)' : 'none' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      task.status === TASK_STATUS.DONE ? 'var(--priority-low)'
                      : task.status === TASK_STATUS.IN_PROGRESS ? 'var(--accent-primary)'
                      : task.status === TASK_STATUS.CANCELLED ? 'var(--priority-high)'
                      : 'var(--text-muted)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${task.status === TASK_STATUS.DONE ? 'line-through opacity-50' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {truncate(task.description, 55)}
                    </p>
                  )}
                </div>
                <StatusBadge status={task.status} />
                <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(task.createdAt || task.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
