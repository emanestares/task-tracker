import { render, screen } from '@testing-library/react'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Test Title" subtitle="A subtitle" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('A subtitle')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<PageHeader title="T" action={<button>Click</button>} />)
    expect(screen.getByText('Click')).toBeInTheDocument()
  })
})
