import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { TASK_STATUS, TASK_PRIORITY } from '../../constants'
import { formatDate } from '../../utils'

const PRIORITY_COLORS = {
  HIGH: { dot: '#dc2626', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  MEDIUM: { dot: '#d97706', bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  LOW: { dot: '#16a34a', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function CalendarView({ tasks, onEdit, onDelete }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map dueDate → tasks
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const d = typeof t.dueDate === 'string' ? t.dueDate.slice(0, 10) : null
      if (!d) return // this stops null dates
      if (!map[d]) map[d] = []
      map[d].push(t)
    })
    return map
  }, [tasks])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) => d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate()

  const getDayKey = (d) => {
    if (!d) return null
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const selectedKey = selectedDay ? getDayKey(selectedDay) : null
  const selectedTasks = selectedKey ? (tasksByDate[selectedKey] || []) : []

  // Priority priority ordering for rendering dots
  const getPriorityColor = (task) => {
    const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW
    return p
  }

  return (
    <div className="space-y-3">
      <div className="card p-0 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="btn-ghost p-1.5"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }}
              className="btn-ghost px-2.5 py-1 text-xs"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="btn-ghost p-1.5"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div
          className="grid grid-cols-7 text-center"
          style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-xs font-semibold"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.04em', fontSize: '11px' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7" style={{ backgroundColor: 'var(--bg-card)' }}>
          {cells.map((day, idx) => {
            const key = getDayKey(day)
            const dayTasks = key ? (tasksByDate[key] || []) : []
            const isSelected = day && day === selectedDay
            const isTodayDay = isToday(day)

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                className="min-h-[70px] p-1.5 transition-colors cursor-pointer relative"
                style={{
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-primary)' : 'none',
                  borderBottom: idx < cells.length - 7 ? '1px solid var(--border-primary)' : 'none',
                  backgroundColor: isSelected
                    ? 'var(--accent-light)'
                    : day ? 'var(--bg-card)' : 'var(--bg-primary)',
                }}
              >
                {day && (
                  <>
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1"
                      style={{
                        backgroundColor: isTodayDay ? 'var(--accent-primary)' : 'transparent',
                        color: isTodayDay ? '#fff' : isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: isTodayDay ? '600' : '400',
                      }}
                    >
                      {day}
                    </div>

                    {/* Task dots / pills */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((task, i) => {
                        const pc = getPriorityColor(task)
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-1 px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: pc.bg,
                              border: `1px solid ${pc.border}`,
                            }}
                          >
                            <div
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: pc.dot }}
                            />
                            <span
                              className="text-xs truncate"
                              style={{ color: pc.text, fontSize: '10px', lineHeight: 1.3 }}
                            >
                              {task.title}
                            </span>
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <span className="text-xs pl-1" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[month]} {selectedDay}, {year}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>
              No tasks due on this day
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => {
                const pc = getPriorityColor(task)
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-md"
                    style={{ backgroundColor: pc.bg, border: `1px solid ${pc.border}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: pc.dot }} />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium ${task.status === TASK_STATUS.DONE ? 'line-through opacity-50' : ''}`}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {task.description.slice(0, 80)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className="badge"
                          style={{ backgroundColor: 'transparent', color: pc.text, fontSize: '10px' }}
                        >
                          {(task.priority || 'LOW').charAt(0) + (task.priority || 'LOW').slice(1).toLowerCase()} priority
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                          {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status?.charAt(0) + task.status?.slice(1).toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEdit(task)}
                        className="btn-ghost p-1"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="p-1 rounded-md transition-colors"
                        style={{ color: 'var(--priority-high)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Priority:</span>
        {Object.entries(PRIORITY_COLORS).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
