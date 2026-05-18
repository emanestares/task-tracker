import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Bob', username: 'bob', email: 'b@x.com' },
    logout: vi.fn(),
  }),
}))

import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('renders navigation links and user footer', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <Sidebar open={false} onClose={onClose} isAdmin={false} />
      </MemoryRouter>
    )

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('My Tasks').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
  })

  it('renders admin navigation and mobile drawer when open and isAdmin', () => {
    const logout = vi.fn()
    vi.resetModules()
    vi.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({ user: { name: 'Bob', username: 'bob', email: 'b@x.com' }, logout }),
    }))
    // dynamic import to pick up new mock
    return import('./Sidebar').then(({ default: Sidebar2 }) => {
      const { container } = render(
        <MemoryRouter>
          <Sidebar2 open={true} onClose={vi.fn()} isAdmin={true} />
        </MemoryRouter>
      )

      expect(screen.getAllByText('Administration').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Users').length).toBeGreaterThan(0)
      // mobile drawer should have transform: translateX(0)
      const mobile = container.querySelector('aside[style*="translateX(0)"]')
      expect(mobile).toBeTruthy()
      // sign out button calls logout
      const signOut = screen.getAllByText('Sign out')[0]
      signOut && signOut.click()
      expect(logout).toHaveBeenCalled()
    })
  })
})
