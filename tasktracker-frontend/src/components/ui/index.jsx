// ── Skeleton ──────────────────────────────────────────────────────────────────
export default function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <Icon size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, trend, trendLabel, loading, color = 'var(--accent-primary)' }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}>
          {Icon && <Icon size={18} style={{ color }} />}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-24 rounded-lg" />
          <div className="skeleton h-3.5 w-16 rounded-md" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
            {value ?? '—'}
          </p>
          {trendLabel && (
            <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : ''}`}
              style={!trend ? { color: 'var(--text-muted)' } : {}}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {trendLabel}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    TODO: { label: 'To Do', cls: 'badge-todo' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-inprogress' },
    DONE: { label: 'Done', cls: 'badge-done' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled' },
  }
  const { label, cls } = map[status] || { label: status, cls: 'badge-todo' }
  return (
    <span className={`badge ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'currentColor' }} />
      {label}
    </span>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <PaginationBtn onClick={() => onChange(page - 1)} disabled={page === 1} label="←" />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PaginationBtn
          key={p}
          onClick={() => onChange(p)}
          active={p === page}
          label={String(p)}
        />
      ))}
      <PaginationBtn onClick={() => onChange(page + 1)} disabled={page === totalPages} label="→" />
    </div>
  )
}

function PaginationBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${active ? '' : 'hover:opacity-80'}`}
      style={{
        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
        color: active ? '#0f0e0c' : 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div
      className="rounded-full border-2 animate-spin flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderColor: 'var(--border-secondary)',
        borderTopColor: 'var(--accent-primary)',
      }}
    />
  )
}
