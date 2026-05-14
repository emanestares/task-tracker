export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1
          className="text-2xl font-bold leading-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'Inter Tight, Inter, sans-serif', letterSpacing: '-0.025em' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
