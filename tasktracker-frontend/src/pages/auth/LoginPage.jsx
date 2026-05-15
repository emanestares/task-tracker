import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ShieldOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { Spinner } from '../../components/ui/index.jsx'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [inactiveError, setInactiveError] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setInactiveError(false)
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    if (!form.password) errs.password = 'Password is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await login(form)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (
        msg.toLowerCase().includes('inactive') ||
        msg.toLowerCase().includes('disabled') ||
        err.response?.status === 403
      ) {
        setInactiveError(true)
      }
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 leading-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'Inter Tight, Inter, sans-serif', letterSpacing: '-0.03em' }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sign in to continue to your workspace
        </p>
      </div>

      {inactiveError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <ShieldOff size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Account inactive</p>
            <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
              Your account has been deactivated. Please contact an administrator to restore access.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label">Username</label>
          <input
            type="text"
            className={`input-field ${errors.username ? 'error' : ''}`}
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            autoComplete="username"
            autoFocus
          />
          {errors.username && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.username}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Password</label>
            <button type="button" className="text-xs font-semibold hover:underline" style={{ color: 'var(--accent-primary)' }}>
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input-field pr-11 ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-gray-100"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary w-full mt-2 py-2.5" disabled={loading}>
          {loading ? <Spinner size={16} /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: '1px solid var(--border-primary)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            New to TaskFlow?
          </span>
        </div>
      </div>

      <Link
        to={ROUTES.REGISTER}
        className="btn-secondary w-full justify-center py-2.5"
      >
        Create an account
      </Link>
    </div>
  )
}
