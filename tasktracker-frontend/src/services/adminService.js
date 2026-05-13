import apiClient from '../api/client'

const AdminService = {
  async getAllUsers() {
    const { data } = await apiClient.get('/api/admin/users')
    return data
  },

  async getAllTasks() {
    const { data } = await apiClient.get('/api/admin/tasks')
    return data
  },

  async deleteUser(id) {
    await apiClient.delete(`/api/admin/users/${id}`)
  },

  async getStats() {
    const { data } = await apiClient.get('/api/admin/stats')
    return data
  },
}

export default AdminService
