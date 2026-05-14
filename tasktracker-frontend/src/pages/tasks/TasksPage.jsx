import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Calendar, List, BarChart2, Search, X, SlidersHorizontal, ArrowUp, ArrowDown } from 'lucide-react'
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
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:999, fontSize:13, fontWeight:700, backgroundColor:cfg.bg, color:cfg.dot, border:`1.5px solid ${cfg.border}` }}>
      <span style={{ width:8, height:8, borderRadius:'50%', backgroundColor:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   CHART VIEW — Pie chart + Bar chart using Canvas
══════════════════════════════════════════════════════════════ */
function ChartView({ tasks }) {
  const pieRef = useRef(null)
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

  /* ── Pie Chart ── */
  useEffect(() => {
    const canvas = pieRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const size = canvas.clientWidth
    canvas.width  = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2, cy = size / 2
    const R = size * 0.36, r = size * 0.2

    const slices = [
      { label: 'To Do',       value: stats.byStatus.TODO,        color: '#94a3b8' },
      { label: 'In Progress', value: stats.byStatus.IN_PROGRESS, color: '#3b82f6' },
      { label: 'Done',        value: stats.byStatus.DONE,        color: '#10b981' },
      { label: 'Cancelled',   value: stats.byStatus.CANCELLED,   color: '#f43f5e' },
    ].filter(s => s.value > 0)

    const total = slices.reduce((s, sl) => s + sl.value, 0)
    if (total === 0) {
      ctx.fillStyle = '#94a3b820'
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.font = `600 ${size * 0.07}px Inter, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('No tasks', cx, cy)
      return
    }

    let angle = -Math.PI / 2
    slices.forEach(sl => {
      const sweep = (sl.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, R, angle, angle + sweep)
      ctx.closePath()
      ctx.fillStyle = sl.color
      ctx.fill()
      ctx.strokeStyle = 'var(--bg-card, #fff)'
      ctx.lineWidth = 3
      ctx.stroke()
      angle += sweep
    })

    // Donut hole
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = 'var(--bg-card, #ffffff)'
    ctx.fill()

    // Center text
    ctx.fillStyle = '#0f172a'
    ctx.font = `800 ${size * 0.11}px Inter, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(total, cx, cy - size * 0.04)
    ctx.font = `500 ${size * 0.065}px Inter, sans-serif`
    ctx.fillStyle = '#64748b'
    ctx.fillText('tasks', cx, cy + size * 0.06)
  }, [stats])

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

    const padL = 40, padR = 20, padT = 20, padB = 50
    const chartW = W - padL - padR
    const chartH = H - padT - padB

    const groups  = stats.byPriority
    const maxVal  = Math.max(...groups.map(g => g.total), 1)
    const groupW  = chartW / groups.length
    const barW    = groupW * 0.22
    const gap     = barW * 0.35
    const subColors = ['#94a3b8','#3b82f6','#10b981']
    const subKeys   = ['todo','inProgress','done']

    // Y gridlines
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const y = padT + chartH - (i / steps) * chartH
      const val = Math.round((i / steps) * maxVal)
      ctx.beginPath()
      ctx.strokeStyle = '#e2e8f020'
      ctx.lineWidth = 1
      ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke()
      ctx.fillStyle = '#94a3b8'
      ctx.font = `500 11px Inter, sans-serif`
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
      ctx.fillText(val, padL - 6, y)
    }

    // Bars
    groups.forEach((g, gi) => {
      const groupX = padL + gi * groupW + groupW / 2
      const startX = groupX - (3 * barW + 2 * gap) / 2

      subKeys.forEach((key, ki) => {
        const val = g[key]
        const barH = val > 0 ? Math.max((val / maxVal) * chartH, 4) : 0
        const x = startX + ki * (barW + gap)
        const y = padT + chartH - barH

        // Rounded top bar
        const rad = Math.min(barW / 2, 6)
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
        ctx.globalAlpha = 0.88
        ctx.fill()
        ctx.globalAlpha = 1

        // Value on top
        if (val > 0) {
          ctx.fillStyle = subColors[ki]
          ctx.font = `700 11px Inter, sans-serif`
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
          ctx.fillText(val, x + barW / 2, y - 3)
        }
      })

      // X label
      ctx.fillStyle = '#64748b'
      ctx.font = `600 13px Inter, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(g.label, groupX, padT + chartH + 10)
    })
  }, [stats])

  const statusLegend = [
    { label:'To Do',       color:'#94a3b8', val: stats.byStatus.TODO },
    { label:'In Progress', color:'#3b82f6', val: stats.byStatus.IN_PROGRESS },
    { label:'Done',        color:'#10b981', val: stats.byStatus.DONE },
    { label:'Cancelled',   color:'#f43f5e', val: stats.byStatus.CANCELLED },
  ]
  const barLegend = [
    { label:'To Do',       color:'#94a3b8' },
    { label:'In Progress', color:'#3b82f6' },
    { label:'Done',        color:'#10b981' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Row: Pie + summary stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Pie */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', margin:'0 0 4px' }}>Task Status</h3>
          <p style={{ fontSize:13, color:'var(--text-muted)', margin:'0 0 20px' }}>Distribution by current status</p>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <canvas ref={pieRef} style={{ width:180, height:180, flexShrink:0 }} />
            <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
              {statusLegend.map(({ label, color, val }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:11, height:11, borderRadius:3, backgroundColor:color, flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:60, height:6, borderRadius:999, backgroundColor:color+'20', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${stats.total > 0 ? (val/stats.total)*100 : 0}%`, backgroundColor:color, borderRadius:999 }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', minWidth:20, textAlign:'right' }}>{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary numbers */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[
            { label:'Total Tasks',    val:stats.total,                        color:'#3b82f6', sub:'all tasks' },
            { label:'Completed',      val:stats.byStatus.DONE,                color:'#10b981', sub:`${stats.total>0?Math.round((stats.byStatus.DONE/stats.total)*100):0}% done` },
            { label:'In Progress',    val:stats.byStatus.IN_PROGRESS,         color:'#f59e0b', sub:'active now' },
            { label:'High Priority',  val:stats.byPriority[0]?.total ?? 0,   color:'#ef4444', sub:`${stats.byPriority[0]?.done ?? 0} done` },
          ].map(({ label, val, color, sub }) => (
            <div key={label} className="card" style={{ padding:20, textAlign:'center' }}>
              <p style={{ fontSize:36, fontWeight:800, color, lineHeight:1, margin:'0 0 4px' }}>{val}</p>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', margin:'0 0 2px' }}>{label}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', margin:'0 0 4px' }}>Tasks by Priority</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>Breakdown of To Do / In Progress / Done per priority level</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
            {barLegend.map(({ label, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:10, height:10, borderRadius:3, backgroundColor:color }} />
                <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <canvas ref={barRef} style={{ width:'100%', height:220 }} />
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

          <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-muted)' }}>Sort</span>

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
