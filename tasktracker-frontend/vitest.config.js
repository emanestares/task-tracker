import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'src/components/common/PageHeader.jsx',
        'src/components/forms/TaskForm.jsx',
        'src/components/layout/Navbar.jsx',
        'src/components/layout/Sidebar.jsx',
        'src/services/taskService.js',
        'src/services/authService.js',
        'src/constants/index.js',
      ],
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  },
})
