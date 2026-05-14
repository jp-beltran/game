import { createServer } from 'node:http'

import {
  CODEX_AGENT_MAX_PROMPT_LENGTH,
  createAdminAgentApiHandler,
} from './adminAgentApi'

describe('admin agent API', () => {
  async function withTestServer(
    callback: (baseUrl: string) => Promise<void>,
  ): Promise<void> {
    const server = createServer(
      createAdminAgentApiHandler({
        adapter: {
          submitPrompt: vi.fn().mockResolvedValue({
            id: 'prompt-1',
            status: 'queued',
            message: 'Prompt recebido pelo backend local.',
          }),
        },
      }),
    )

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve())
    })

    const address = server.address()

    if (!address || typeof address === 'string') {
      server.close()
      throw new Error('Não foi possível obter a porta do servidor de teste.')
    }

    try {
      await callback(`http://127.0.0.1:${address.port}`)
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    }
  }

  it('rejects an empty prompt', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          prompt: '   ',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({
        message: expect.stringMatching(/prompt/i),
      })
    })
  })

  it('accepts a valid prompt payload', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          prompt: 'Adicionar sistema de missões.',
          context: {
            currentFeature: 'quests',
            filesHint: ['src/app/App.tsx'],
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(202)
    })
  })

  it('returns queued for a valid prompt', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          prompt: 'Adicionar sistema de inventário.',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      await expect(response.json()).resolves.toMatchObject({
        id: expect.any(String),
        message: 'Prompt recebido pelo backend local.',
        status: 'queued',
      })
    })
  })

  it('validates the maximum prompt size', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          prompt: 'x'.repeat(CODEX_AGENT_MAX_PROMPT_LENGTH + 1),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({
        message: expect.stringMatching(/limite|tamanho/i),
      })
    })
  })
})
