/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthService from '../services/authService'
import { TOKEN_KEY, USER_KEY, ROUTES } from '../constants'
import { isTokenExpired, decodeJwt } from '../utils'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken && isTokenExpired(storedToken)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return null
    }

    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getInitialToken() {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  if (storedToken && isTokenExpired(storedToken)) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }

  return storedToken
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => getInitialUser())
  const [token, setToken] = useState(() => getInitialToken())
  const [loading, setLoading] = useState(false)
  const [initializing] = useState(false)

  const saveSession = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
  }, [])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const data = await AuthService.login(credentials)
      // Support both { token, user } and flat JWT response
      const jwt = data.token || data.accessToken
      const userData = data.user || decodeJwt(jwt) || {}
      saveSession(jwt, userData)
      toast.success(`Welcome back, ${userData.name || userData.username || 'User'}!`)

      const role = userData.role || userData.roles?.[0]
      navigate(role === 'ADMIN' ? ROUTES.ADMIN : ROUTES.DASHBOARD)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      const isInactive =
        msg.toLowerCase().includes('inactive') ||
        msg.toLowerCase().includes('disabled') ||
        err.response?.status === 403
      if (!isInactive) {
        toast.error(msg || 'Invalid Username or Password. Please try again.')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate, saveSession])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      await AuthService.register(payload)
      toast.success('Account created! Please log in.')
      navigate(ROUTES.LOGIN)
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const updateProfile = useCallback(async (payload) => {
    setLoading(true)
    try {
      const data = await AuthService.editProfile(payload)
      const updated = { ...user, ...data }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      setUser(updated)
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
      }
      toast.success('Profile updated successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const logout = useCallback((showToast = true) => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    if (showToast) toast.success('Logged out successfully.')
    navigate(ROUTES.LOGIN)
  }, [navigate])

  const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes('ADMIN')
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      initializing,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
