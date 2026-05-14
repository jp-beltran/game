import type { CodexChatRequest } from '../types/admin'
import {
  CODEX_AGENT_PROMPT_ENDPOINT,
  createCodexAgentService,
} from './codexAgentService'

describe('codexAgentService', () => {
  it('uses the local endpoint by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'prompt-1',
          status: 'completed',
          message: 'Adicionar combate básico.',
          pendingConfirmation: false,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )

    const service = createCodexAgentService({
      fetchFn: fetchMock,
    })

    const payload: CodexChatRequest = {
      message: 'Adicionar combate básico.',
      conversation: [],
    }

    const response = await service.sendMessage(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      CODEX_AGENT_PROMPT_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify(payload),
        method: 'POST',
      }),
    )
    expect(response).toMatchObject({
      id: 'prompt-1',
      status: 'completed',
      message: 'Adicionar combate básico.',
      pendingConfirmation: false,
    })
  })

  it('calls the local endpoint with the expected payload in local mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'prompt-1',
          status: 'completed',
          message: 'Implemente um crafting simples com inventário.',
          pendingConfirmation: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )

    const service = createCodexAgentService({
      fetchFn: fetchMock,
      mode: 'local',
    })

    const payload: CodexChatRequest = {
      message: 'Adicionar crafting.',
      conversation: [{ content: 'Mensagem anterior' }],
    }

    await service.sendMessage(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      CODEX_AGENT_PROMPT_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )
  })

  it('throws the backend message when the local endpoint returns an error', async () => {
    const service = createCodexAgentService({
      fetchFn: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Prompt inválido.',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
      mode: 'local',
    })

    await expect(
      service.sendMessage({
        message: '',
        conversation: [],
      }),
    ).rejects.toThrow('Prompt inválido.')
  })
})
