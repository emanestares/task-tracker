import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import TaskService from '../services/taskService'

// ── useDebounce ───────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ── useTasks ──────────────────────────────────────────────────────────────────
export function useTasks(initialParams = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await TaskService.getAll(params)
      // Handle both array and paginated response
      setTasks(Array.isArray(data) ? data : data.content ?? [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tasks.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const initialLoadId = setTimeout(() => {
      void fetchTasks()
    }, 0)

    return () => clearTimeout(initialLoadId)
  }, [fetchTasks])

  const createTask = useCallback(async (payload) => {
    const newTask = await TaskService.create(payload)
    setTasks((prev) => [newTask, ...prev])
    toast.success('Task created!')
    return newTask
  }, [])

  const updateTask = useCallback(async (id, payload) => {
    const updated = await TaskService.update(id, payload)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    toast.success('Task updated!')
    return updated
  }, [])

  const deleteTask = useCallback(async (id) => {
    await TaskService.delete(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast.success('Task deleted.')
  }, [])

  return {
    tasks,
    loading,
    error,
    params,
    setParams,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}

// ── useDisclosure (modal/dialog open state) ───────────────────────────────────
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, open, close, toggle }
}

// ── useClickOutside ───────────────────────────────────────────────────────────
export function useClickOutside(callback) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
  return ref
}
