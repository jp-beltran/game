import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import { viteAdminAgentPlugin } from './server/http/viteAdminAgentPlugin'

export default defineConfig({
  plugins: [react(), viteAdminAgentPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**'],
  },
})
