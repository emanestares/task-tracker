import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants'
import { Spinner } from '../../components/ui/index.jsx'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username or email is required.'
    if (!form.password) errs.password = 'Password is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await login(form)
    } catch { /* handled by context */ }
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in to your TaskFlow account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Username</label>
          <input
            type="text"
            className={`input-field ${errors.username ? 'error' : ''}`}
            placeholder="john@example.com"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            autoComplete="username"
            autoFocus
          />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Password</label>
            <button type="button" className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent-primary)' }}>
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
          {loading ? <Spinner size={16} /> : <LogIn size={16} />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold hover:underline"
          style={{ color: 'var(--accent-primary)' }}>
          Create one
        </Link>
      </p>
    </div>
  )
}
