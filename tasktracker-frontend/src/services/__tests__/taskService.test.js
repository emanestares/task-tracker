import { vi, describe, it, expect, beforeEach } from 'vitest'
import TaskService from '../../services/taskService'
import apiClient from '../../api/client'

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('TaskService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('serializes payload and strips empty fields', async () => {
    const payload = { title: 'T', dueDate: '', priority: '', status: '' }
    apiClient.post.mockResolvedValue({ data: { id: 1, title: 'T' } })
    const res = await TaskService.create(payload)
    expect(apiClient.post).toHaveBeenCalled()
    expect(res).toHaveProperty('id', 1)
  })

  it('normalizes returned task from getById', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 2, due_date: '2025-12-31' } })
    const res = await TaskService.getById(2)
    expect(apiClient.get).toHaveBeenCalledWith('/api/tasks/2')
    expect(res).toHaveProperty('dueDate', '2025-12-31')
  })

  it('getAll returns array of normalized tasks', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 3, created_at: 'x' }] })
    const res = await TaskService.getAll()
    expect(Array.isArray(res)).toBe(true)
    expect(res[0]).toHaveProperty('createdAt', 'x')
  })

  it('update calls put and returns normalized', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 4, updated_at: 'y' } })
    const res = await TaskService.update(4, { title: 'u' })
    expect(apiClient.put).toHaveBeenCalledWith('/api/tasks/4', expect.any(Object))
    expect(res).toHaveProperty('updatedAt', 'y')
  })

  it('delete calls apiClient.delete', async () => {
    apiClient.delete.mockResolvedValue({})
    await TaskService.delete(5)
    expect(apiClient.delete).toHaveBeenCalledWith('/api/tasks/5')
  })
})
