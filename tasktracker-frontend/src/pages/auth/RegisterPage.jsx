import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { Spinner } from '../../components/ui/index.jsx';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const errs = {};

    const name = form.name.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!name) {
      errs.name = 'Full name is required.';
    }

    if (!username) {
      errs.username = 'Username is required.';
    } else if (username.length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    } else if (/\s/.test(username)) {
      errs.username = 'Username cannot contain spaces.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errs.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      errs.email = 'Enter a valid email address (no spaces allowed).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      await register(payload);
    } catch {
      /* handled by context */
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Create account
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Get started with TaskFlow today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            className={`input-field ${errors.name ? 'error' : ''}`}
            placeholder="Juan dela Cruz"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            autoComplete="name"
            autoFocus
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Username + Email row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              className={`input-field ${errors.username ? 'error' : ''}`}
              placeholder="juandc"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className={`input-field ${errors.email ? 'error' : ''}`}
              placeholder="juan@email.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPwd ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-6"
          disabled={loading}
        >
          {loading ? <Spinner size={16} /> : <UserPlus size={16} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p
        className="text-center text-sm mt-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold hover:underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
