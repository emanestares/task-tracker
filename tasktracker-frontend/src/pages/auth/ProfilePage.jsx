import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import { getInitials } from '../../utils'
import { Spinner } from '../../components/ui/index.jsx'
import { Eye, EyeOff, User, Lock, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  })
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [pwdErrors, setPwdErrors] = useState({})
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })

  const setP = (k, v) => {
    setProfileForm((f) => ({ ...f, [k]: v }))
    setProfileErrors((e) => ({ ...e, [k]: undefined }))
  }
  const setPwd = (k, v) => {
    setPwdForm((f) => ({ ...f, [k]: v }))
    setPwdErrors((e) => ({ ...e, [k]: undefined }))
  }

  const togglePwd = (key) => {
    setShowPwd((state) => ({ ...state, [key]: !state[key] }))
  }

  const validateProfile = () => {
    const errs = {}
    if (!profileForm.name.trim()) errs.name = 'Name is required.'
    if (!profileForm.username.trim()) {
        errs.username = 'Username is required.'
      }
    if (!profileForm.email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errs.email = 'Enter a valid email.'
    }
    return errs
  }

  const validatePwd = () => {
    const errs = {}
    if (!pwdForm.currentPassword) errs.currentPassword = 'Current password is required.'
    if (!pwdForm.newPassword) errs.newPassword = 'New password is required.'
    if (pwdForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters.'
    if (pwdForm.newPassword !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()

    const errs = validateProfile()
    if (Object.keys(errs).length) {
      setProfileErrors(errs)
      return
    }

    try {
      await updateProfile(profileForm)
      setProfileErrors({})
    } catch (err) {
      if (err.fields) {
        setProfileErrors(err.fields)
      }
    }
  }

  const handlePwdSave = async (e) => {
    e.preventDefault()

    const errs = validatePwd()
    if (Object.keys(errs).length) {
      setPwdErrors(errs)
      return
    }

    try {
      await updateProfile({
        password: pwdForm.newPassword,
        currentPassword: pwdForm.currentPassword
      })

      setPwdForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setPwdErrors({})
    } catch (err) {
      if (err.fields) {
        setPwdErrors(err.fields)
      }
    }
  }

  const initials = getInitials(user?.name || user?.username || 'U')

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile Settings" subtitle="Manage your account information" />

      {/* Avatar card */}
      <div className="card flex items-center gap-5 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#0f0e0c', fontFamily: 'Syne, sans-serif' }}
        >
          {initials}
        </div>
        <div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {user?.name || user?.username}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck size={13} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>
              {user?.role || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className={`input-field ${profileErrors.name ? 'error' : ''}`}
              value={profileForm.name} onChange={(e) => setP('name', e.target.value)} />
            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className={`input-field ${profileErrors.username ? 'error' : ''}`}
                value={profileForm.username}
                onChange={(e) => setP('username', e.target.value)}
              />
              {profileErrors.username && (
                <p className="text-xs text-red-500 mt-1">
                  {profileErrors.username}
                </p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className={`input-field ${profileErrors.email ? 'error' : ''}`}
                value={profileForm.email} onChange={(e) => setP('email', e.target.value)} />
              {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner size={15} /> : null}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
        </div>
        <form onSubmit={handlePwdSave} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input type={showPwd.current ? 'text' : 'password'} className={`input-field pr-10 ${pwdErrors.currentPassword ? 'error' : ''}`}
                placeholder="••••••••" value={pwdForm.currentPassword}
                onChange={(e) => setPwd('currentPassword', e.target.value)} />
              <button
                type="button"
                onClick={() => togglePwd('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPwd.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwdErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwdErrors.currentPassword}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input type={showPwd.next ? 'text' : 'password'} className={`input-field pr-10 ${pwdErrors.newPassword ? 'error' : ''}`}
                  placeholder="Min 6 chars" value={pwdForm.newPassword}
                  onChange={(e) => setPwd('newPassword', e.target.value)} />
                <button
                  type="button"
                  onClick={() => togglePwd('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPwd.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwdErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwdErrors.newPassword}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input type={showPwd.confirm ? 'text' : 'password'} className={`input-field pr-10 ${pwdErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat password" value={pwdForm.confirmPassword}
                  onChange={(e) => setPwd('confirmPassword', e.target.value)} />
                <button
                  type="button"
                  onClick={() => togglePwd('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwdErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwdErrors.confirmPassword}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner size={15} /> : null}
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
