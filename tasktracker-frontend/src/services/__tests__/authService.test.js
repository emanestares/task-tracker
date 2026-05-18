import { vi, describe, it, expect, beforeEach } from 'vitest'
import AuthService from '../../services/authService'
import apiClient from '../../api/client'

vi.mock('../../api/client', () => ({ default: { post: vi.fn() } }))

describe('AuthService', () => {
  beforeEach(() => vi.resetAllMocks())

  it('login calls apiClient.post and returns data', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 't' } })
    const res = await AuthService.login({ username: 'a' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', { username: 'a' })
    expect(res).toEqual({ token: 't' })
  })

  it('register calls apiClient.post', async () => {
    apiClient.post.mockResolvedValue({ data: { ok: true } })
    const res = await AuthService.register({ username: 'b' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', { username: 'b' })
    expect(res).toEqual({ ok: true })
  })

  it('editProfile posts to edit endpoint', async () => {
    apiClient.post.mockResolvedValue({ data: { name: 'C' } })
    const res = await AuthService.editProfile({ name: 'C' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/edit', { name: 'C' })
    expect(res).toEqual({ name: 'C' })
  })
})
