// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {Icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <Icon size={18} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, loading, color = 'var(--accent-primary)' }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {Icon && <Icon size={13} style={{ color }} />}
      </div>
      {loading ? (
        <div className="skeleton h-7 w-12 rounded" />
      ) : (
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
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
      <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: 'currentColor' }} />
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
        <PaginationBtn key={p} onClick={() => onChange(p)} active={p === page} label={String(p)} />
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
      className="w-7 h-7 rounded-md text-xs font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
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

export default function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />
}
