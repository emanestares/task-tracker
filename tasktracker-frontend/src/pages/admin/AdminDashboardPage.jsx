import { useState, useEffect } from 'react'
import { Users, ListChecks, CheckCircle, Clock } from 'lucide-react'
import AdminService from '../../services/adminService'
import PageHeader from '../../components/common/PageHeader'
import { StatCard, StatusBadge } from '../../components/ui/index.jsx'
import { timeAgo, truncate } from '../../utils'
import { TASK_STATUS } from '../../constants'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [allUsers, allTasks] = await Promise.all([
          AdminService.getAllUsers(),
          AdminService.getAllTasks(),
        ])
        const tasks = Array.isArray(allTasks) ? allTasks : allTasks?.content ?? []
        const users = Array.isArray(allUsers) ? allUsers : []

        setStats({
          totalUsers: users.length,
          totalTasks: tasks.length,
          doneTasks: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
          inProgressTasks: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
        })
        setRecentTasks(tasks.slice(0, 8))
      } catch (e) {
        // Fallback mock for demo if backend not ready
        setStats({ totalUsers: 0, totalTasks: 0, doneTasks: 0, inProgressTasks: 0 })
        setRecentTasks([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="System-wide statistics and recent activity."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} loading={loading} color="#8b5cf6" />
        <StatCard label="Total Tasks" value={stats?.totalTasks} icon={ListChecks} loading={loading} color="var(--accent-primary)" />
        <StatCard label="Completed" value={stats?.doneTasks} icon={CheckCircle} loading={loading} color="#10b981" />
        <StatCard label="In Progress" value={stats?.inProgressTasks} icon={Clock} loading={loading} color="#3b82f6" />
      </div>

      {/* Recent tasks table */}
      <div className="card">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>
          Recent Tasks (All Users)
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-xl" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No tasks found in the system.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                  {['Task', 'User', 'Status', 'Created'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id} className="table-row">
                    <td className="px-6 py-3.5">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {truncate(task.title, 45)}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {task.user?.name || task.user?.username || task.userId || '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={task.status} />
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
    </div>
  )
}
