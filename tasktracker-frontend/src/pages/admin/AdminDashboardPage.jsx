import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  ListChecks,
  CheckCircle2,
  Clock,
  Activity,
  Flame,
  ArrowRight,
  BarChart2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminService from '../../services/adminService';
import PageHeader from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/ui/index.jsx';
import { timeAgo, truncate } from '../../utils';
import { TASK_STATUS, ROUTES } from '../../constants';

/* ─── Donut Chart (SVG, matches user dashboard) ──────────────── */
function DonutChart({ segments, total, centerLabel, centerSub }) {
  const size = 148;
  const sw = 14;
  const gap = 2;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const gapAngle = total > 0 ? gap / circ : 0;
  const arcs = segments.reduce(
    (acc, seg) => {
      const pct = total > 0 ? seg.value / total : 0;
      const adjustedPct = Math.max(0, pct - gapAngle);
      const dash = adjustedPct * circ;
      const previous = acc.offset;
      acc.arcs.push({
        ...seg,
        dashArray: `${dash} ${circ - dash}`,
        dashOffset: -previous * circ,
      });
      acc.offset += pct;
      return acc;
    },
    { arcs: [], offset: 0 }
  ).arcs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            width: size,
            height: size,
          }}
        >
          <svg
            width={size}
            height={size}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth={sw}
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={sw}
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray .9s cubic-bezier(.4,0,.2,1)',
                }}
              />
            ))}
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1,
                color: 'var(--text-primary)',
                fontFamily: 'Inter Tight, Inter, sans-serif',
              }}
            >
              {centerLabel}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {centerSub}
            </span>
          </div>
        </div>
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div
                key={seg.label}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: seg.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    flex: 1,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {seg.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {seg.value}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 28,
                    textAlign: 'right',
                  }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <div
              key={seg.label}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: 'var(--border-secondary)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  backgroundColor: seg.color,
                  borderRadius: 999,
                  transition: 'width .9s cubic-bezier(.4,0,.2,1)',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Canvas Bar Chart ───────────────────────────────────────── */
function BarChart({ data, maxVal, colors }) {
  const ref = useRef(null);

  const draw = () => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const padL = 36,
      padR = 16,
      padT = 16,
      padB = 44;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const max = maxVal || Math.max(...data.map((d) => d.value), 1);
    const steps = 4;

    // Grid lines + Y labels
    for (let i = 0; i <= steps; i++) {
      const y = padT + chartH - (i / steps) * chartH;
      const v = Math.round((i / steps) * max);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148,163,184,0.15)';
      ctx.lineWidth = 1;
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(v, padL - 5, y);
    }

    // Bars
    const barW = Math.min((chartW / data.length) * 0.52, 52);
    data.forEach((d, i) => {
      const x = padL + (i + 0.5) * (chartW / data.length) - barW / 2;
      const barH =
        max > 0 ? Math.max((d.value / max) * chartH, d.value > 0 ? 4 : 0) : 0;
      const y = padT + chartH - barH;
      const rad = Math.min(barW / 2, 7);
      const color = Array.isArray(colors) ? colors[i % colors.length] : colors;

      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + barW - rad, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + rad);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      // X label
      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Wrap long labels
      const words = d.label.split(' ');
      if (words.length > 1 && d.label.length > 9) {
        ctx.fillText(words[0], x + barW / 2, padT + chartH + 8);
        ctx.fillText(
          words.slice(1).join(' '),
          x + barW / 2,
          padT + chartH + 20
        );
      } else {
        ctx.fillText(d.label, x + barW / 2, padT + chartH + 8);
      }
    });
  };

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [data, maxVal, colors]);

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ─── Stat Card (matches user dashboard style) ───────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  gradient,
  iconColor,
  border,
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: 18,
        background: gradient,
        border: `1px solid ${border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform .2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = 'translateY(-2px)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Icon size={16} style={{ color: iconColor }} strokeWidth={2} />
        <span style={{ fontSize: 12, fontWeight: 600, color: iconColor }}>
          {label}
        </span>
      </div>
      {loading ? (
        <div
          className="skeleton"
          style={{ height: 36, width: 56, borderRadius: 8 }}
        />
      ) : (
        <p
          style={{
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1,
            color: '#0f172a',
            fontFamily: 'Inter Tight, Inter, sans-serif',
            margin: 0,
          }}
        >
          {value ?? '—'}
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const cachedUsers = AdminService.getCachedUsers() || [];
  const cachedTasks = AdminService.getCachedTasks() || [];

  const [stats, setStats] = useState(() => ({
    totalUsers: cachedUsers.length,
    totalTasks: cachedTasks.length,
    doneTasks: cachedTasks.filter((t) => t.status === TASK_STATUS.DONE).length,
    inProgressTasks: cachedTasks.filter(
      (t) => t.status === TASK_STATUS.IN_PROGRESS
    ).length,
    todoTasks: cachedTasks.filter((t) => t.status === TASK_STATUS.TODO).length,
    cancelledTasks: cachedTasks.filter(
      (t) => t.status === TASK_STATUS.CANCELLED
    ).length,
    highPriority: cachedTasks.filter(
      (t) => t.priority === 'HIGH' && t.status !== TASK_STATUS.DONE
    ).length,
  }));
  const [allTasks, setAllTasks] = useState(() => cachedTasks);
  const [allUsers, setAllUsers] = useState(() => cachedUsers);
  const [recentTasks, setRecentTasks] = useState(() => cachedTasks.slice(0, 8));
  const [loading, setLoading] = useState(
    () => !(cachedUsers.length || cachedTasks.length)
  );

  const loadDashboard = async (forceRefresh = false) => {
    const hasCachedData = !!(
      AdminService.getCachedUsers() || AdminService.getCachedTasks()
    );
    try {
      const [usersRaw, tasksRaw] = await Promise.all([
        AdminService.getAllUsers({ forceRefresh }),
        AdminService.getAllTasks({ forceRefresh }),
      ]);
      const tasks = Array.isArray(tasksRaw)
        ? tasksRaw
        : (tasksRaw?.content ?? []);
      const users = Array.isArray(usersRaw) ? usersRaw : [];

      setAllTasks(tasks);
      setAllUsers(users);
      setStats({
        totalUsers: users.length,
        totalTasks: tasks.length,
        doneTasks: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
        inProgressTasks: tasks.filter(
          (t) => t.status === TASK_STATUS.IN_PROGRESS
        ).length,
        todoTasks: tasks.filter((t) => t.status === TASK_STATUS.TODO).length,
        cancelledTasks: tasks.filter((t) => t.status === TASK_STATUS.CANCELLED)
          .length,
        highPriority: tasks.filter(
          (t) => t.priority === 'HIGH' && t.status !== TASK_STATUS.DONE
        ).length,
      });
      setRecentTasks(tasks.slice(0, 8));
    } catch {
      setStats({
        totalUsers: 0,
        totalTasks: 0,
        doneTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        cancelledTasks: 0,
        highPriority: 0,
      });
      setRecentTasks([]);
    } finally {
      if (!hasCachedData) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initialLoadId = setTimeout(() => {
      void loadDashboard();
    }, 0);

    const intervalId = setInterval(() => {
      void loadDashboard();
    }, 15000);

    return () => {
      clearTimeout(initialLoadId);
      clearInterval(intervalId);
    };
  }, []);

  /* Per-user task breakdown for bar chart */
  const userTaskData = useMemo(() => {
    if (!allUsers.length || !allTasks.length) return [];
    return allUsers
      .map((u) => ({
        label: (u.name || u.username || 'User').split(' ')[0],
        value: allTasks.filter((t) => t.userId === u.id || t.user?.id === u.id)
          .length,
        color: '#3b82f6',
      }))
      .filter((u) => u.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allUsers, allTasks]);

  /* Task status bar data */
  const statusBarData = useMemo(
    () => [
      { label: 'To Do', value: stats?.todoTasks ?? 0, color: '#e9e918' },
      {
        label: 'In Progress',
        value: stats?.inProgressTasks ?? 0,
        color: '#3b82f6',
      },
      { label: 'Done', value: stats?.doneTasks ?? 0, color: '#10b981' },
      {
        label: 'Cancelled',
        value: stats?.cancelledTasks ?? 0,
        color: '#f43f5e',
      },
    ],
    [stats]
  );

  const completionPct =
    stats?.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  const statusDonutSegs = [
    { label: 'Done', value: stats?.doneTasks ?? 0, color: '#10b981' },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks ?? 0,
      color: '#3b82f6',
    },
    { label: 'To Do', value: stats?.todoTasks ?? 0, color: '#e9e918' },
    { label: 'Cancelled', value: stats?.cancelledTasks ?? 0, color: '#f43f5e' },
  ];

  const STAT_CARDS = [
    {
      label: 'Total Users',
      value: stats?.totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg,#faf5ff,#ede9fe)',
      iconColor: '#7c3aed',
      border: '#ddd6fe',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks,
      icon: ListChecks,
      gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
      iconColor: '#2563eb',
      border: '#bfdbfe',
    },
    {
      label: 'Completed',
      value: stats?.doneTasks,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
      iconColor: '#10b981',
      border: '#a7f3d0',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks,
      icon: Clock,
      gradient: 'linear-gradient(135deg,#fff7ed,#fed7aa)',
      iconColor: '#ea580c',
      border: '#fdba74',
    },
  ];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      className="animate-fade-in"
    >
      <PageHeader
        title="Admin Overview"
        subtitle="System-wide analytics, task health, and recent activity."
        action={
          <Link
            to={ROUTES.ADMIN_TASKS}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 4px rgba(37,99,235,.3)',
            }}
          >
            <BarChart2 size={15} /> View All Tasks
          </Link>
        }
      />

      {/* ── Stat cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 16,
        }}
      >
        {STAT_CARDS.map((c) => (
          <StatCard key={c.label} loading={loading} {...c} />
        ))}
      </div>

      {/* ── Row: Status donut + Task status bar chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20, minHeight: 340 }}>
        {/* Donut */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Task Completion
            </h2>
            {!loading && stats?.totalTasks > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  border: '1px solid #a7f3d0',
                }}
              >
                {stats.doneTasks} done
              </span>
            )}
          </div>
          {loading ? (
            <div style={{ display: 'flex', gap: 24 }}>
              <div
                className="skeleton"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  paddingTop: 8,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 14, borderRadius: 8 }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <DonutChart
              segments={statusDonutSegs}
              total={stats?.totalTasks ?? 0}
              centerLabel={`${completionPct}%`}
              centerSub="complete"
            />
          )}
        </div>

        {/* Status bar chart */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Tasks by Status
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {[
                { l: 'To Do', color: '#e9e918' },
                { l: 'In Progress', color: '#3b82f6' },
                { l: 'Done', color: '#10b981' },
                { l: 'Cancelled', color: '#f43f5e' },
              ].map(({ l, color }) => (
                <div
                  key={l}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 2,
                      backgroundColor: color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <div
              className="skeleton"
              style={{ flex: 1, minHeight: 180, borderRadius: 12 }}
            />
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <BarChart
                data={statusBarData}
                colors={statusBarData.map((d) => d.color)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Row: Per-user chart + High priority tasks ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, minHeight: 380 }}>
        {/* Per-user task bar */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              flexShrink: 0,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 2px',
                }}
              >
                Tasks per User
              </h2>
              <p
                style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}
              >
                Top contributors by task count
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN_USERS}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent-primary)',
                textDecoration: 'none',
              }}
            >
              All users <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div
              className="skeleton"
              style={{ flex: 1, minHeight: 180, borderRadius: 12 }}
            />
          ) : userTaskData.length === 0 ? (
            <div
              style={{
                flex: 1,
                minHeight: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No user data available
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <BarChart
                data={userTaskData}
                colors={[
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#a855f7',
                  '#ec4899',
                  '#f43f5e',
                  '#f59e0b',
                  '#10b981',
                ]}
              />
            </div>
          )}
        </div>

        {/* High priority alert */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="#ef4444" />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                High Priority
              </h2>
            </div>
            <Link
              to={ROUTES.ADMIN_TASKS}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent-primary)',
                textDecoration: 'none',
              }}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 52, borderRadius: 12 }}
                />
              ))}
            </div>
          ) : allTasks.filter(
              (t) => t.priority === 'HIGH' && t.status !== TASK_STATUS.DONE
            ).length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <CheckCircle2
                size={28}
                style={{ color: '#10b981', margin: '0 auto 10px' }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                No high priority tasks!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allTasks
                .filter(
                  (t) => t.priority === 'HIGH' && t.status !== TASK_STATUS.DONE
                )
                .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--priority-high-bg)',
                      border: '1px solid var(--priority-high-border)',
                      boxShadow: '0 1px 3px rgba(239,68,68,0.08)',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        flexShrink: 0,
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {truncate(task.title, 32)}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          margin: 0,
                        }}
                      >
                        {task.user?.name ||
                          task.user?.username ||
                          'Unknown user'}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
            </div>
          )}

          {/* Quick stats */}
          {!loading && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid var(--border-primary)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {[
                {
                  label: 'High Priority',
                  value: stats?.highPriority ?? 0,
                  color: '#ef4444',
                },
                {
                  label: 'Completion',
                  value: `${completionPct}%`,
                  color: '#10b981',
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    textAlign: 'center',
                    padding: '10px 8px',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color,
                      lineHeight: 1,
                      margin: '0 0 3px',
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent tasks table ── */}
      <div className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                border: '1px solid #bfdbfe',
              }}
            >
              <Activity size={15} color="#2563eb" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Recent Activity
              </h2>
              <p
                style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}
              >
                Latest tasks across all users
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.ADMIN_TASKS}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--accent-primary)',
              textDecoration: 'none',
            }}
          >
            All tasks <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 44, borderRadius: 10 }}
              />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <p
            style={{
              fontSize: 14,
              textAlign: 'center',
              padding: '32px 0',
              color: 'var(--text-muted)',
            }}
          >
            No tasks found in the system.
          </p>
        ) : (
          <div
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: 560,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderBottom: '2px solid var(--border-primary)',
                    }}
                  >
                    {[
                      'Task',
                      'Assigned To',
                      'Status',
                      'Priority',
                      'Created',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 20px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.07em',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => {
                    const pColor =
                      task.priority === 'HIGH'
                        ? '#ef4444'
                        : task.priority === 'MEDIUM'
                          ? '#f59e0b'
                          : '#10b981';
                    const pLabel = task.priority
                      ? task.priority[0] + task.priority.slice(1).toLowerCase()
                      : '—';
                    return (
                      <tr key={task.id} className="table-row">
                        <td style={{ padding: '16px 20px', maxWidth: 260 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 38,
                                borderRadius: 999,
                                flexShrink: 0,
                                backgroundColor: pColor,
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  margin: '0 0 2px',
                                  color: 'var(--text-primary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 220,
                                  textDecoration:
                                    task.status === TASK_STATUS.DONE
                                      ? 'line-through'
                                      : 'none',
                                  opacity:
                                    task.status === TASK_STATUS.DONE ? 0.5 : 1,
                                }}
                              >
                                {truncate(task.title, 40)}
                              </p>
                              {task.description && (
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                    margin: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 220,
                                  }}
                                >
                                  {truncate(task.description, 45)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-light)',
                                border: '1px solid var(--accent-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'var(--accent-primary)',
                                }}
                              >
                                {(task.user?.name ||
                                  task.user?.username ||
                                  'U')[0].toUpperCase()}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {task.user?.name ||
                                task.user?.username ||
                                `User ${task.userId}` ||
                                '—'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <StatusBadge status={task.status} />
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              color: pColor,
                              backgroundColor: pColor + '15',
                              border: `1.5px solid ${pColor}30`,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: pColor,
                              }}
                            />
                            {pLabel}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '16px 20px',
                            fontSize: 13,
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {timeAgo(task.createdAt || task.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}