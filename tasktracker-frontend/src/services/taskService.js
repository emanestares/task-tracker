import apiClient from '../api/client'
import { buildQueryString } from '../utils'

/**
 * Normalize a raw task object from the API.
 *
 * The backend returns dueDate as a plain ISO date string ("2025-12-31")
 * because the DB column is DATE and the entity uses LocalDate.
 * We keep it as-is — the frontend already stores dueDate as "yyyy-MM-dd"
 * in forms, and formatDate() handles both plain dates and datetimes.
 */
function normalizeTask(task) {
  if (!task) return task
  return {
    ...task,
    // Ensure consistent camelCase field names regardless of backend version
    createdAt: task.createdAt ?? task.created_at ?? null,
    updatedAt: task.updatedAt ?? task.updated_at ?? null,
    dueDate:   task.dueDate   ?? task.due_date   ?? null,
    // Default optional fields so the UI never has to null-check
    status:    task.status   ?? 'TODO',
    priority:  task.priority ?? null,
    completed: task.completed ?? false,
  }
}

const TaskService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params)
    const { data } = await apiClient.get(`/api/tasks${qs}`)
    const tasks = Array.isArray(data) ? data : (data.content ?? [])
    return tasks.map(normalizeTask)
  },

  async getById(id) {
    const { data } = await apiClient.get(`/api/tasks/${id}`)
    return normalizeTask(data)
  },

  async create(payload) {
    const { data } = await apiClient.post('/api/tasks', serializePayload(payload))
    return normalizeTask(data)
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/api/tasks/${id}`, serializePayload(payload))
    return normalizeTask(data)
  },

  async delete(id) {
    await apiClient.delete(`/api/tasks/${id}`)
  },
}

/**
 * Prepare a task payload for the API.
 * - Strips undefined/null-ish fields that the backend doesn't accept
 * - dueDate stays as "yyyy-MM-dd" string — Jackson deserializes LocalDate from that
 */
function serializePayload(payload) {
  const out = { ...payload }

  // Remove empty dueDate so the column stays NULL rather than erroring
  if (!out.dueDate) delete out.dueDate

  // Remove empty optional strings
  if (!out.priority) delete out.priority
  if (!out.status)   delete out.status

  return out
}

export default TaskService