import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { EmptyState } from './index.jsx';

/**
 * columns: [{ key, label, render?, sortable?, width? }]
 * data: array of row objects
 */
export default function DataTable({
  columns,
  data,
  loading,
  emptyTitle = 'No data yet',
  emptyDescription,
  sortKey,
  sortDir,
  onSort,
  rowKey = 'id',
}) {
  if (loading) return <TableSkeleton columns={columns} />;

  if (!data?.length) {
    return (
      <div className="py-16">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl"
      style={{ border: '1px solid var(--border-primary)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-primary)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                style={{ color: 'var(--text-secondary)', width: col.width }}
              >
                {col.sortable ? (
                  <button
                    className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                    onClick={() => onSort?.(col.key)}
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[rowKey]} className="table-row">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown size={13} className="opacity-40" />;
  return dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
}

function TableSkeleton({ columns }) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: '1px solid var(--border-primary)' }}
    >
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex gap-6">
          {columns.map((col) => (
            <div key={col.key} className="skeleton h-4 w-20 rounded-md" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 flex gap-6"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          {columns.map((col, j) => (
            <div
              key={col.key}
              className="skeleton h-4 rounded-md"
              style={{ width: `${[80, 60, 50, 70, 55][j % 5]}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
