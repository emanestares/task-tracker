import { Outlet } from 'react-router-dom'
import { Zap, CheckCircle2, BarChart3, Users } from 'lucide-react'

const features = [
  { icon: CheckCircle2, title: 'Smart Task Management', desc: 'Organize, prioritize and track every task with ease.' },
  { icon: BarChart3, title: 'Progress Insights', desc: 'Visual dashboards to keep your team on track.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Role-based access for seamless teamwork.' },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)',
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
          >
            <Zap size={18} strokeWidth={2.5} color="#fff" />
          </div>
          <span className="font-bold text-xl text-white" style={{ fontFamily: 'Inter Tight, Inter, sans-serif', letterSpacing: '-0.03em' }}>
            TaskFlow
          </span>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Inter Tight, Inter, sans-serif', letterSpacing: '-0.03em' }}>
              Ship faster,<br />stay organized.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              The modern task tracker built for teams that move fast.
            </p>
          </div>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.4)' }}
              >
                <Icon size={14} color="#93c5fd" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
            >
              <Zap size={16} strokeWidth={2.5} color="#fff" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Inter Tight, Inter, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              TaskFlow
            </span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
