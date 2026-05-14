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
          sendMessage: vi.fn().mockResolvedValue({
            id: 'prompt-1',
            status: 'completed',
            message: 'Resposta final do agente.',
            pendingConfirmation: false,
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
          message: '   ',
          conversation: [],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({
        message: expect.stringMatching(/prompt|mensagem/i),
      })
    })
  })

  it('accepts a valid chat payload', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          message: 'Adicionar sistema de missões.',
          conversation: [{ content: 'Mensagem anterior' }],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(200)
    })
  })

  it('returns completed for a valid message', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          message: 'Adicionar sistema de inventário.',
          conversation: [],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      await expect(response.json()).resolves.toMatchObject({
        id: expect.any(String),
        message: 'Resposta final do agente.',
        pendingConfirmation: false,
        status: 'completed',
      })
    })
  })

  it('validates the maximum prompt size', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          message: 'x'.repeat(CODEX_AGENT_MAX_PROMPT_LENGTH + 1),
          conversation: [],
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

  it('rejects an invalid conversation payload', async () => {
    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/agent/prompts`, {
        body: JSON.stringify({
          message: 'Adicionar mapa.',
          conversation: [{ content: '' }],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({
        message: expect.stringMatching(/conversa|conversation|histórico/i),
      })
    })
  })
})
