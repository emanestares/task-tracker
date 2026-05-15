import apiClient from '../api/client'

const CACHE_TTL_MS = 15000
const adminCache = new Map()

function getCacheEntry(key) {
  return adminCache.get(key)
}

async function fetchWithCache(key, fetcher, forceRefresh = false) {
  const cached = getCacheEntry(key)
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS

  if (!forceRefresh && isFresh && Object.prototype.hasOwnProperty.call(cached, 'data')) {
    return cached.data
  }

  if (!forceRefresh && cached?.promise) {
    return cached.promise
  }

  const promise = (async () => {
    const data = await fetcher()
    adminCache.set(key, { data, timestamp: Date.now() })
    return data
  })()

  adminCache.set(key, { ...cached, promise })
  return promise
}

function invalidateAdminCache(...keys) {
  if (!keys.length) {
    adminCache.clear()
    return
  }

  keys.forEach((key) => adminCache.delete(key))
}

function getCachedValue(key) {
  return adminCache.get(key)?.data ?? null
}

const AdminService = {
  getCachedUsers() {
    return getCachedValue('users')
  },

  getCachedTasks() {
    return getCachedValue('tasks')
  },

  getCachedStats() {
    return getCachedValue('stats')
  },

  async getAllUsers(options = {}) {
    return fetchWithCache('users', async () => {
      const { data } = await apiClient.get('/api/admin/users')
      return data
    }, options.forceRefresh)
  },

  async getAllTasks(options = {}) {
    return fetchWithCache('tasks', async () => {
      const { data } = await apiClient.get('/api/admin/tasks')
      return data
    }, options.forceRefresh)
  },

  async deleteUser(id) {
    await apiClient.delete(`/api/admin/users/${id}`)
    invalidateAdminCache('users', 'tasks', 'stats')
  },

  async getStats(options = {}) {
    return fetchWithCache('stats', async () => {
      const { data } = await apiClient.get('/api/admin/stats')
      return data
    }, options.forceRefresh)
  },

  invalidateCache(...keys) {
    invalidateAdminCache(...keys)
  },
}

export default AdminService
