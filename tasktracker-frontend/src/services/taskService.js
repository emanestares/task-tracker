import apiClient from '../api/client'
import { buildQueryString } from '../utils'

const TaskService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params)
    const { data } = await apiClient.get(`/api/tasks${qs}`)
    return data // expects array or { content, totalElements, ... }
  },

  async getById(id) {
    const { data } = await apiClient.get(`/api/tasks/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await apiClient.post('/api/tasks', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/api/tasks/${id}`, payload)
    return data
  },

  async delete(id) {
    await apiClient.delete(`/api/tasks/${id}`)
  },
}

export default TaskService
