import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskForm from './TaskForm'

describe('TaskForm', () => {
  it('shows validation errors for empty title and due date', async () => {
    const user = userEvent.setup()
    const onSubmit = jestFn()
    const { container } = render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.click(screen.getByText('Create Task'))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Due date is required.')).toBeInTheDocument()
  })

  it('shows validation errors for long title and description', async () => {
    const user = userEvent.setup()
    const onSubmit = jestFn()
    render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />)

    const title = screen.getByPlaceholderText('e.g. Set up CI/CD pipeline')
    const desc = screen.getByPlaceholderText('Add more context about this task…')
    fireEvent.change(title, { target: { value: 'A'.repeat(121) } })
    fireEvent.change(desc, { target: { value: 'B'.repeat(501) } })
    await user.click(screen.getByText('Create Task'))

    expect(screen.getByText('Title must be under 120 characters.')).toBeInTheDocument()
    expect(screen.getByText('Description must be under 500 characters.')).toBeInTheDocument()
  })

  it('shows Update Task when initial has id', () => {
    const onSubmit = jestFn()
    render(<TaskForm initial={{ id: 9 }} onSubmit={onSubmit} onCancel={() => {}} />)
    expect(screen.getByText('Update Task')).toBeInTheDocument()
  })

  it('displays backend field errors when onSubmit rejects with fields', async () => {
    const user = userEvent.setup()
    const err = { response: { data: { fields: { title: 'Server title error' } } } }
    const onSubmit = vi.fn().mockRejectedValue(err)
    render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />)

    const title = screen.getByPlaceholderText('e.g. Set up CI/CD pipeline')
    const dateInput = document.querySelector('input[type="date"]')
    fireEvent.change(title, { target: { value: 'Valid Title' } })
    const today = new Date().toISOString().slice(0, 10)
    fireEvent.change(dateInput, { target: { value: today } })
    await user.click(screen.getByText('Create Task'))

    expect(await screen.findByText('Server title error')).toBeInTheDocument()
  })

  it('prevents past due dates', async () => {
    const user = userEvent.setup()
    const onSubmit = jestFn()
    const { container } = render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />)

    const title = screen.getByPlaceholderText('e.g. Set up CI/CD pipeline')
    const dateInput = container.querySelector('input[type="date"]')

    await user.type(title, 'Hello')
    const past = new Date()
    past.setDate(past.getDate() - 1)
    const pastStr = past.toISOString().slice(0, 10)
    await user.type(dateInput, pastStr)
    await user.click(screen.getByText('Create Task'))

    expect(screen.getByText('Due date cannot be before today.')).toBeInTheDocument()
  })

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = jestFn()
    const { container } = render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />)

    const title = screen.getByPlaceholderText('e.g. Set up CI/CD pipeline')
    const dateInput = container.querySelector('input[type="date"]')

    await user.type(title, 'Valid')
    const today = new Date().toISOString().slice(0, 10)
    await user.type(dateInput, today)
    await user.click(screen.getByText('Create Task'))

    expect(onSubmit._call).toHaveBeenCalled()
  })
})

function jestFn() {
  // small wrapper to provide jest-like api in vitest environment
  const fn = (...args) => fn._call(...args)
  fn._call = vi.fn()
  fn.mock = fn._call
  fn.mockResolvedValue = fn._call.mockResolvedValue.bind(fn._call)
  fn.mockRejectedValue = fn._call.mockRejectedValue.bind(fn._call)
  fn.toString = () => '_jestFn'
  return fn
}
