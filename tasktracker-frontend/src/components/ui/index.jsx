// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background:
              'linear-gradient(135deg, var(--accent-light), var(--accent-muted))',
            border: '1px solid var(--accent-muted)',
          }}
        >
          <Icon size={22} style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}
      <h3
        className="text-sm font-bold mb-1.5"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-xs max-w-xs leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  color = 'var(--accent-primary)',
  trend,
}) {
  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{
            backgroundColor: color + '18',
            border: `1px solid ${color}30`,
          }}
        >
          {Icon && <Icon size={16} style={{ color }} />}
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: trend >= 0 ? '#ecfdf5' : '#fef2f2',
              color: trend >= 0 ? '#059669' : '#ef4444',
            }}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="skeleton h-8 w-16 rounded-lg mb-1" />
      ) : (
        <p
          className="text-3xl font-bold leading-none mb-1"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Inter Tight, Inter, sans-serif',
          }}
        >
          {value ?? '—'}
        </p>
      )}
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    TODO: { label: 'To Do', cls: 'badge-todo', dot: '#99990e' },
    IN_PROGRESS: {
      label: 'In Progress',
      cls: 'badge-inprogress',
      dot: '#2563eb',
    },
    DONE: { label: 'Done', cls: 'badge-done', dot: '#10b981' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled', dot: '#ef4444' },
  };
  const { label, cls, dot } = map[status] || {
    label: status,
    cls: 'badge-todo',
    dot: '#94a3b8',
  };
  return (
    <span className={`badge ${cls}`}>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
      />
      {label}
    </span>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <PBtn
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        label="←"
      />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PBtn
          key={p}
          onClick={() => onChange(p)}
          active={p === page}
          label={String(p)}
        />
      ))}
      <PBtn
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        label="→"
      />
    </div>
  );
}
function PBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: active
          ? 'linear-gradient(135deg,#2563eb,#1d4ed8)'
          : 'var(--bg-secondary)',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: active ? 'none' : '1px solid var(--border-primary)',
        boxShadow: active
          ? '0 2px 8px rgba(37,99,235,0.3)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return (
    <div
      className="rounded-full border-2 animate-spin flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderColor: 'rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
      }}
    />
  );
}

export default function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}
