import { TASK_STATUS } from '../constants'

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Plain date strings like "2025-12-31" (from Java LocalDate) are parsed as
  // UTC midnight by new Date(), which can shift the displayed day in negative
  // UTC-offset timezones. Appending T00:00 forces local-time interpretation.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? dateStr + 'T00:00'
    : dateStr
  return new Date(normalized).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date string to relative time (e.g. "2 days ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

/**
 * Get Tailwind badge class for a task status
 */
export function getStatusBadgeClass(status) {
  const map = {
    [TASK_STATUS.TODO]: 'badge badge-todo',
    [TASK_STATUS.IN_PROGRESS]: 'badge badge-inprogress',
    [TASK_STATUS.DONE]: 'badge badge-done',
    [TASK_STATUS.CANCELLED]: 'badge badge-cancelled',
  }
  return map[status] || 'badge badge-todo'
}

/**
 * Get dot color for status indicator
 */
export function getStatusDotColor(status) {
  const map = {
    [TASK_STATUS.TODO]: '#6b7280',
    [TASK_STATUS.IN_PROGRESS]: '#3b82f6',
    [TASK_STATUS.DONE]: '#10b981',
    [TASK_STATUS.CANCELLED]: '#ef4444',
  }
  return map[status] || '#6b7280'
}

/**
 * Truncate a string to a given length
 */
export function truncate(str, length = 60) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '…' : str
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Get initials from a name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Decode JWT payload (no verification, display only)
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

/**
 * Build query string from an object
 */
export function buildQueryString(params = {}) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  if (!filtered.length) return ''
  return '?' + new URLSearchParams(Object.fromEntries(filtered)).toString()
}

/**
 * Capitalize first letter
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Group an array of objects by a key
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key]
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}