import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, CheckCircle2, Plus, ArrowRight, Flame, TrendingUp, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/index.js'
import PageHeader from '../../components/common/PageHeader'
import { StatusBadge, EmptyState } from '../../components/ui/index.jsx'
import { ROUTES, TASK_STATUS, TASK_PRIORITY } from '../../constants'
import { formatDate, timeAgo, truncate } from '../../utils'

function DonutChart({ done, inProgress, todo, total }) {
  const size = 130
  const strokeWidth = 15
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const segments = [
    { value: done, color: '#10b981', label: 'Done' },
    { value: inProgress, color: '#2563eb', label: 'In Progress' },
    { value: todo, color: '#e2e8f0', label: 'To Do' },
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
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}>
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
              style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'Inter Tight, Inter, sans-serif' }}>
            {completionPct}%
          </span>
          <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>complete</span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {seg.value}
            </span>
          </div>
        ))}
        <div className="pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total tasks</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const STAT_CARDS = (stats) => [
  {
    label: 'Total',
    value: stats.total,
    icon: Activity,
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    iconColor: '#2563eb',
    border: '#bfdbfe',
  },
  {
    label: 'To Do',
    value: stats.todo,
    icon: Clock,
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    iconColor: '#64748b',
    border: '#e2e8f0',
  },
  {
    label: 'In Progress',
    value: stats.inProgress,
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    iconColor: '#7c3aed',
    border: '#ddd6fe',
  },
  {
    label: 'Completed',
    value: stats.done,
    icon: CheckCircle2,
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    iconColor: '#10b981',
    border: '#a7f3d0',
  },
]

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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's what's happening with your tasks today."
        action={
          <Link to={ROUTES.TASKS} className="btn-primary">
            <Plus size={15} />
            New Task
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(stats).map(({ label, value, icon: Icon, gradient, iconColor, border }) => (
          <div
            key={label}
            className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
            style={{
              background: gradient,
              border: `1px solid ${border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={16} style={{ color: iconColor }} strokeWidth={2} />
              <span className="text-xs font-semibold" style={{ color: iconColor }}>{label}</span>
            </div>
            {loading
              ? <div className="skeleton h-8 w-12 rounded-lg" />
              : <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: '#0f172a', fontFamily: 'Inter Tight, Inter, sans-serif', margin: 0 }}>{value}</p>
            }
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Donut chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Task Completion</h2>
            {!loading && stats.total > 0 && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}
              >
                {stats.done} done
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex gap-6">
              <div className="skeleton w-[130px] h-[130px] rounded-full flex-shrink-0" />
              <div className="space-y-3 flex-1 pt-2">
                {[1,2,3].map(i => <div key={i} className="skeleton h-4 rounded-lg" />)}
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
          ) : (
            <DonutChart done={stats.done} inProgress={stats.inProgress} todo={stats.todo} total={stats.total} />
          )}
        </div>

        {/* High priority */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={15} color="#ef4444" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>High Priority</h2>
            </div>
            <Link to={ROUTES.TASKS} className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all" style={{ color: 'var(--accent-primary)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : urgentTasks.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: '#10b981' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>No high priority tasks!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--priority-high-bg)',
                    border: '1px solid var(--priority-high-border)',
                    boxShadow: '0 1px 3px rgba(239,68,68,0.08)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: '#ef4444' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs mt-0.5 font-medium" style={{ color: '#ef4444' }}>Due {formatDate(task.dueDate)}</p>
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
          <Link to={ROUTES.TASKS} className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all" style={{ color: 'var(--accent-primary)' }}>
            All tasks <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="skeleton w-2.5 h-2.5 rounded-full flex-shrink-0" />
                <div className="skeleton h-4 flex-1 rounded-lg" />
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-3 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create your first task to get started tracking your work."
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
                className="flex items-center gap-3.5 py-3 group"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--border-primary)' : 'none' }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      task.status === TASK_STATUS.DONE ? '#10b981'
                      : task.status === TASK_STATUS.IN_PROGRESS ? '#2563eb'
                      : task.status === TASK_STATUS.CANCELLED ? '#ef4444'
                      : '#94a3b8',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate transition-colors group-hover:text-blue-600 ${task.status === TASK_STATUS.DONE ? 'line-through opacity-40' : ''}`}
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
                <StatusBadge status={task.status} />
                <span className="text-xs hidden sm:block flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
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
