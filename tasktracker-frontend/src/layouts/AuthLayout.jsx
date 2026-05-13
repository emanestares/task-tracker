import { Outlet, Link } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow blob */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-primary), transparent)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-primary)' }}>
              <CheckSquare size={16} strokeWidth={2.5} color="#0f0e0c" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-sidebar)', fontFamily: 'Syne, sans-serif' }}>
              TaskFlow
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            {[
              { label: 'Track tasks in real time', done: true },
              { label: 'Role-based team access', done: true },
              { label: 'Clean, fast dashboard', done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-primary)' }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#0f0e0c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-sidebar-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 pl-4" style={{ borderColor: 'var(--accent-primary)' }}>
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-sidebar-muted)' }}>
              "The best task management tool our team has used. Clean, fast, and intuitive."
            </p>
            <cite className="mt-2 text-xs font-semibold block" style={{ color: 'var(--accent-primary)' }}>
              — Capstone Demo User
            </cite>
          </blockquote>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'var(--text-sidebar-muted)' }}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-primary)' }}>
              <CheckSquare size={16} strokeWidth={2.5} color="#0f0e0c" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
              TaskFlow
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
