import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../../context/useTheme', () => ({
  useTheme: () => ({ isDark: true, toggle: vi.fn() }),
}))
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Alice', username: 'alice' } }),
}))

import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders and shows initials and admin badge when provided', () => {
    const onMenuClick = vi.fn()
    const { container } = render(<Navbar onMenuClick={onMenuClick} isAdmin />)

    // title attribute should include the user name
    expect(container.querySelector('[title="Alice"]')).toBeInTheDocument()
    // dark mode button should show Light mode as title
    expect(screen.getByTitle('Light mode')).toBeInTheDocument()
  })

  it('renders dark/light toggle correctly when isDark is false', async () => {
    vi.resetModules()
    vi.doMock('../../context/useTheme', () => ({
      useTheme: () => ({ isDark: false, toggle: vi.fn() }),
    }))
    vi.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({ user: { name: 'Alice', username: 'alice' } }),
    }))
    const { default: Navbar2 } = await import('./Navbar')
    render(<Navbar2 onMenuClick={vi.fn()} />)
    expect(screen.getByTitle('Dark mode')).toBeInTheDocument()
  })
})
