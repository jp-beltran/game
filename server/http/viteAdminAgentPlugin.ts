import type { Plugin } from 'vite'

import { createCodexAgentAdapter } from '../agent/codexAgentAdapter'
import { createAdminAgentApiHandler } from './adminAgentApi'

export function viteAdminAgentPlugin(): Plugin {
  return {
    configureServer(server) {
      const handler = createAdminAgentApiHandler({
        adapter: createCodexAgentAdapter(),
      })

      server.middlewares.use((request, response, next) => {
        void handler(request, response, next)
      })
    },
    name: 'vite-admin-agent-plugin',
  }
}
