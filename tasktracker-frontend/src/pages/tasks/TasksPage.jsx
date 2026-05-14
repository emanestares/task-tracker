import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Calendar, List, BarChart2, Search, X, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
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

const P = {
  HIGH:   { label: 'High',   dot: '#ef4444', bg: 'var(--priority-high-bg)',   border: 'var(--priority-high-border)' },
  MEDIUM: { label: 'Medium', dot: '#f59e0b', bg: 'var(--priority-medium-bg)', border: 'var(--priority-medium-border)' },
  LOW:    { label: 'Low',    dot: '#10b981', bg: 'var(--priority-low-bg)',    border: 'var(--priority-low-border)' },
}

function PriorityBadge({ priority }) {
  const cfg = P[priority] || P.LOW
  return (
    <span className="badge" style={{ backgroundColor:cfg.bg, color:cfg.dot, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   DONUT CHART — matches dashboard style
══════════════════════════════════════════════════════════════ */
function DonutChart({ segments, total, centerLabel }) {
  const size = 148
  const strokeWidth = 14
  const gap = 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2, cy = size / 2

  let offset = 0
  const gapAngle = total > 0 ? gap / circumference : 0
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0
    const adjustedPct = Math.max(0, pct - gapAngle)
    const dash = adjustedPct * circumference
    const arc = { ...seg, dashArray: `${dash} ${circumference - dash}`, dashOffset: -offset * circumference }
    offset += pct
    return arc
  })

  const donePct = total > 0 ? Math.round(((segments.find(s => s.key === 'DONE')?.value || 0) / total) * 100) : 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:24 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-primary)" strokeWidth={strokeWidth} />
            {arcs.map((arc, i) => (
              <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
                stroke={arc.color} strokeWidth={strokeWidth}
                strokeDasharray={arc.dashArray} strokeDashoffset={arc.dashOffset}
                strokeLinecap="round"
                style={{ transition:'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
              />
            ))}
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:24, fontWeight:800, lineHeight:1, color:'var(--text-primary)', fontFamily:'Inter Tight, Inter, sans-serif' }}>{donePct}%</span>
            <span style={{ fontSize:11, fontWeight:500, marginTop:2, color:'var(--text-muted)' }}>done</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1 }}>
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
            return (
              <div key={seg.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:seg.color, flexShrink:0 }} />
                <span style={{ fontSize:12, flex:1, color:'var(--text-secondary)' }}>{seg.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{seg.value}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontVariantNumeric:'tabular-nums', minWidth:28, textAlign:'right' }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
      {/* mini progress bar row */}
      <div style={{ display:'flex', gap:3 }}>
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0
          return (
            <div key={seg.label} style={{ flex:1, height:4, borderRadius:999, background:'var(--border-primary)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, backgroundColor:seg.color, borderRadius:999, transition:'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CHART VIEW
══════════════════════════════════════════════════════════════ */
function ChartView({ tasks }) {
  const barRef = useRef(null)

  const stats = useMemo(() => {
    const byStatus = {
      TODO:        tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE:        tasks.filter(t => t.status === 'DONE').length,
      CANCELLED:   tasks.filter(t => t.status === 'CANCELLED').length,
    }
    const byPriority = ['HIGH','MEDIUM','LOW'].map(k => ({
      key: k,
      label: k[0] + k.slice(1).toLowerCase(),
      color: P[k].dot,
      total: tasks.filter(t => t.priority === k).length,
      done:  tasks.filter(t => t.priority === k && t.status === 'DONE').length,
      inProgress: tasks.filter(t => t.priority === k && t.status === 'IN_PROGRESS').length,
      todo: tasks.filter(t => t.priority === k && t.status === 'TODO').length,
    }))
    return { byStatus, byPriority, total: tasks.length }
  }, [tasks])

  const statusSegments = [
    { key:'DONE',        label:'Done',        value: stats.byStatus.DONE,        color:'#10b981' },
    { key:'IN_PROGRESS', label:'In Progress', value: stats.byStatus.IN_PROGRESS, color:'#6366f1' },
    { key:'TODO',        label:'To Do',       value: stats.byStatus.TODO,        color:'#e2e8f0' },
    { key:'CANCELLED',   label:'Cancelled',   value: stats.byStatus.CANCELLED,   color:'#f43f5e' },
  ]

  const prioritySegments = [
    { key:'HIGH',   label:'High',   value: stats.byPriority[0]?.total ?? 0, color:'#ef4444' },
    { key:'MEDIUM', label:'Medium', value: stats.byPriority[1]?.total ?? 0, color:'#f59e0b' },
    { key:'LOW',    label:'Low',    value: stats.byPriority[2]?.total ?? 0, color:'#10b981' },
  ]

  /* ── Bar Chart ── */
  useEffect(() => {
    const canvas = barRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth, H = canvas.clientHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const padL = 12, padR = 12, padT = 16, padB = 44
    const chartW = W - padL - padR
    const chartH = H - padT - padB

    const groups   = stats.byPriority
    const maxVal   = Math.max(...groups.map(g => g.total), 1)
    const groupW   = chartW / groups.length
    const barW     = groupW * 0.22
    const gap      = barW * 0.35
    const subColors = ['#e2e8f0','#6366f1','#10b981']
    const subKeys   = ['todo','inProgress','done']

    // subtle gridlines
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const y = padT + chartH - (i / steps) * chartH
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(148,163,184,0.12)'
      ctx.lineWidth = 1
      ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke()
    }

    groups.forEach((g, gi) => {
      const groupX = padL + gi * groupW + groupW / 2
      const startX = groupX - (3 * barW + 2 * gap) / 2

      subKeys.forEach((key, ki) => {
        const val = g[key]
        const barH = val > 0 ? Math.max((val / maxVal) * chartH, 4) : 0
        const x = startX + ki * (barW + gap)
        const y = padT + chartH - barH
        const rad = Math.min(barW / 2, 5)

        ctx.beginPath()
        ctx.moveTo(x + rad, y)
        ctx.lineTo(x + barW - rad, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + rad)
        ctx.lineTo(x + barW, y + barH)
        ctx.lineTo(x, y + barH)
        ctx.lineTo(x, y + rad)
        ctx.quadraticCurveTo(x, y, x + rad, y)
        ctx.closePath()
        ctx.fillStyle = subColors[ki]
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // X group label
      ctx.fillStyle = '#64748b'
      ctx.font = `600 12px Inter, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(g.label, groupX, padT + chartH + 12)

      // small colored dot under label
      const dotColors = ['#ef4444','#f59e0b','#10b981']
      ctx.beginPath()
      ctx.arc(groupX, padT + chartH + 28, 4, 0, Math.PI * 2)
      ctx.fillStyle = dotColors[gi]
      ctx.fill()
    })
  }, [stats])

  const barLegend = [
    { label:'To Do',       color:'#e2e8f0' },
    { label:'In Progress', color:'#6366f1' },
    { label:'Done',        color:'#10b981' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Status donut */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:0 }}>By Status</h3>
            {stats.total > 0 && (
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, backgroundColor:'#ecfdf5', color:'#10b981', border:'1px solid #a7f3d0' }}>
                {stats.byStatus.DONE} done
              </span>
            )}
          </div>
          {stats.total === 0
            ? <p style={{ fontSize:12, textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>No tasks yet</p>
            : <DonutChart segments={statusSegments} total={stats.total} />
          }
        </div>

        {/* Priority donut */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:0 }}>By Priority</h3>
            {stats.byPriority[0]?.total > 0 && (
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, backgroundColor:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca' }}>
                {stats.byPriority[0].total} high
              </span>
            )}
          </div>
          {stats.total === 0
            ? <p style={{ fontSize:12, textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>No tasks yet</p>
            : <DonutChart segments={prioritySegments} total={prioritySegments.reduce((s, seg) => s + seg.value, 0)} />
          }
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:'0 0 2px' }}>Status by Priority</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>To Do / In Progress / Done per priority level</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            {barLegend.map(({ label, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:3, backgroundColor:color, border: color === '#e2e8f0' ? '1px solid #cbd5e1' : 'none' }} />
                <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <canvas ref={barRef} style={{ width:'100%', height:200 }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const createModal  = useDisclosure()
  const editModal    = useDisclosure()
  const deleteDialog = useDisclosure()

  const [selectedTask,  setSelectedTask]  = useState(null)
  const [formLoading,   setFormLoading]   = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy,         setSortBy]         = useState('priority')
  const [sortDir,        setSortDir]        = useState('asc')   // ← asc / desc toggle
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list')

  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let r = tasks.filter(t => {
      const ms = !debouncedSearch || t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || t.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const mv = !statusFilter   || t.status   === statusFilter
      const mp = !priorityFilter || t.priority === priorityFilter
      return ms && mv && mp
    })

    r = [...r].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'priority') cmp = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
      else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) cmp = 0
        else if (!a.dueDate) cmp = 1
        else if (!b.dueDate) cmp = -1
        else cmp = new Date(a.dueDate) - new Date(b.dueDate)
      } else {
        cmp = new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return r
  }, [tasks, debouncedSearch, statusFilter, priorityFilter, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_LIMIT))
  const paginated  = filtered.slice((page - 1) * PAGINATION_LIMIT, page * PAGINATION_LIMIT)

  const handleCreate        = async (form) => { setFormLoading(true);  try { await createTask(form);                  createModal.close()                      } catch {} finally { setFormLoading(false)  } }
  const handleEdit          = (task) => { setSelectedTask(task); editModal.open() }
  const handleUpdate        = async (form) => { setFormLoading(true);  try { await updateTask(selectedTask.id, form); editModal.close(); setSelectedTask(null)  } catch {} finally { setFormLoading(false)  } }
  const handleDeleteClick   = (task) => { setSelectedTask(task); deleteDialog.open() }
  const handleDeleteConfirm = async ()     => { setDeleteLoading(true); try { await deleteTask(selectedTask.id);        deleteDialog.close(); setSelectedTask(null) } catch {} finally { setDeleteLoading(false) } }

  const hasFilters = search || statusFilter || priorityFilter
  const clearAll   = () => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }

  const sel = (active) => ({
    fontSize:14, fontWeight:600, padding:'9px 14px', borderRadius:10,
    border: active ? '1.5px solid var(--accent-primary)' : '1.5px solid var(--border-secondary)',
    backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
    color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
    outline:'none', cursor:'pointer', minWidth:130,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }} className="animate-fade-in">
      <PageHeader
        title="My Tasks"
        subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''} ${hasFilters ? 'matching filters' : 'total'}`}
        action={<button className="btn-primary" onClick={createModal.open}><Plus size={16} /> New Task</button>}
      />

      {/* ══════════════════════════════════════════════
          TOOLBAR — two rows
          Row 1: search + view switcher
          Row 2: filters + sort + asc/desc toggle
      ══════════════════════════════════════════════ */}
      <div style={{ borderRadius:14, border:'1px solid var(--border-primary)', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.07)' }}>

        {/* Row 1 */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', backgroundColor:'var(--bg-secondary)', borderBottom:'1px solid var(--border-primary)' }}>

          {/* Search */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:10, border:'1.5px solid var(--border-secondary)', backgroundColor:'var(--bg-primary)' }}>
            <Search size={18} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tasks by title or description…"
              style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:15, color:'var(--text-primary)', caretColor:'var(--accent-primary)' }}
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', color:'var(--text-muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* View switcher */}
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:4, borderRadius:10, border:'1.5px solid var(--border-secondary)', backgroundColor:'var(--bg-primary)', flexShrink:0 }}>
            {[['list','List',List],['chart','Chart',BarChart2],['calendar','Calendar',Calendar]].map(([id,lbl,Icon]) => (
              <button key={id} onClick={() => setView(id)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
                  backgroundColor: view===id ? 'var(--accent-primary)' : 'transparent',
                  color:           view===id ? '#fff' : 'var(--text-secondary)',
                  boxShadow:       view===id ? '0 1px 4px rgba(37,99,235,.35)' : 'none',
                  transition:'all .15s' }}>
                <Icon size={15} />{lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:10, padding:'12px 16px', backgroundColor:'var(--bg-tertiary)' }}>

          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <SlidersHorizontal size={15} style={{ color:'var(--text-muted)' }} />
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-muted)' }}>Filters</span>
          </div>

          <select value={statusFilter}   onChange={e => { setStatusFilter(e.target.value);   setPage(1) }} style={sel(!!statusFilter)}>
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} style={sel(!!priorityFilter)}>
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <div style={{ width:1, height:24, backgroundColor:'var(--border-secondary)' }} />

          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <ArrowUpDown size={15} style={{ color:'var(--text-muted)' }} />
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-muted)' }}>Sort</span>
          </div>

          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }} style={sel(false)}>
            <option value="priority">By Priority</option>
            <option value="dueDate">By Due Date</option>
            <option value="created">By Created</option>
          </select>

          {/* Asc / Desc toggle */}
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            title={sortDir === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--border-secondary)', backgroundColor:'var(--bg-secondary)', color:'var(--text-primary)', cursor:'pointer', fontSize:14, fontWeight:600, transition:'all .15s' }}
          >
            {sortDir === 'asc'
              ? <><ArrowUp size={15} /> Asc</>
              : <><ArrowDown size={15} /> Desc</>
            }
          </button>

          {/* Active chips + clear */}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {statusFilter   && <Chip label={statusFilter.replace('_',' ')}   onRemove={() => { setStatusFilter('');   setPage(1) }} />}
            {priorityFilter && <Chip label={priorityFilter}                   onRemove={() => { setPriorityFilter(''); setPage(1) }} />}
            {hasFilters && (
              <button onClick={clearAll} style={{ padding:'6px 16px', borderRadius:999, fontSize:13, fontWeight:700, border:'1px solid var(--priority-high-border)', backgroundColor:'var(--priority-high-bg)', color:'#ef4444', cursor:'pointer' }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart view */}
      {view === 'chart' && <ChartView tasks={tasks} />}

      {/* Calendar view */}
      {view === 'calendar' && <CalendarView tasks={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />}

      {/* List view */}
      {view === 'list' && (
        <>
          {loading ? (
            <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid var(--border-primary)', backgroundColor:'var(--bg-card)' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:'1px solid var(--border-primary)' }}>
                  <div className="skeleton" style={{ height:16, flex:1, borderRadius:8 }} />
                  <div className="skeleton" style={{ height:32, width:96, borderRadius:999 }} />
                  <div className="skeleton" style={{ height:32, width:80, borderRadius:999 }} />
                  <div className="skeleton" style={{ height:14, width:80, borderRadius:8 }} />
                  <div className="skeleton" style={{ height:32, width:64, borderRadius:8 }} />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={CheckSquare}
                title={hasFilters ? 'No matching tasks' : 'No tasks yet'}
                description={hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
                action={!hasFilters && <button className="btn-primary" onClick={createModal.open}><Plus size={14}/> New Task</button>}
              />
            </div>
          ) : (
            <>
              {/* Table — no mobile card fallback, always show table */}
              <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid var(--border-primary)', backgroundColor:'var(--bg-card)', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
                    <thead>
                      <tr style={{ backgroundColor:'var(--bg-tertiary)', borderBottom:'2px solid var(--border-primary)' }}>
                        {['Task','Status','Priority','Due Date','Created','Actions'].map(h => (
                          <th key={h} style={{ padding:'16px 22px', textAlign:'left', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map(task => (
                        <tr key={task.id} className="table-row">
                          <td style={{ padding:'18px 22px', maxWidth:300 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                              <div style={{ width:5, height:46, borderRadius:999, flexShrink:0, backgroundColor:P[task.priority]?.dot||'#94a3b8' }} />
                              <div style={{ minWidth:0 }}>
                                <p style={{ fontSize:15, fontWeight:600, margin:'0 0 3px', color:'var(--text-primary)', textDecoration:task.status===TASK_STATUS.DONE?'line-through':'none', opacity:task.status===TASK_STATUS.DONE?0.45:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:250 }}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:250 }}>
                                    {truncate(task.description, 55)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'18px 22px' }}><StatusBadge status={task.status} /></td>
                          <td style={{ padding:'18px 22px' }}><PriorityBadge priority={task.priority} /></td>
                          <td style={{ padding:'18px 22px', fontSize:14, fontWeight:500, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                            {task.dueDate ? formatDate(task.dueDate) : <span style={{ color:'var(--text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding:'18px 22px', fontSize:13, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                            {timeAgo(task.createdAt||task.created_at)}
                          </td>
                          {/* Actions — always visible, no hover hide */}
                          <td style={{ padding:'18px 22px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <button
                                onClick={() => handleEdit(task)}
                                className="btn-ghost"
                                style={{ padding:'8px 10px' }}
                                title="Edit"
                              >
                                <Pencil size={15}/>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(task)}
                                style={{ padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer', backgroundColor:'transparent', color:'#ef4444', transition:'background .15s', display:'flex', alignItems:'center' }}
                                onMouseEnter={e=>e.currentTarget.style.backgroundColor='var(--priority-high-bg)'}
                                onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}
                                title="Delete"
                              >
                                <Trash2 size={15}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top:0, behavior:'smooth' }) }} />
            </>
          )}
        </>
      )}

      <Modal isOpen={createModal.isOpen}  onClose={createModal.close}  title="Create New Task" size="md">
        <TaskForm onSubmit={handleCreate} onCancel={createModal.close} loading={formLoading} />
      </Modal>
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Task" size="md">
        {selectedTask && <TaskForm initial={selectedTask} onSubmit={handleUpdate} onCancel={editModal.close} loading={formLoading} />}
      </Modal>
      <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDeleteConfirm} loading={deleteLoading}
        title="Delete this task?" description={`"${selectedTask?.title}" will be permanently deleted.`} confirmLabel="Delete Task" />
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:999, fontSize:13, fontWeight:600, backgroundColor:'var(--accent-light)', color:'var(--accent-primary)', border:'1px solid var(--accent-muted)' }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:0, color:'inherit', opacity:.7 }}>
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  )
}
