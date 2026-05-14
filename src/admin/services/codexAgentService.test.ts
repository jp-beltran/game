import type { CodexPromptRequest } from '../types/admin'
import {
  CODEX_AGENT_PROMPT_ENDPOINT,
  createCodexAgentService,
} from './codexAgentService'

describe('codexAgentService', () => {
  it('returns a queued response for a submitted prompt in mock mode', async () => {
    const service = createCodexAgentService({
      mode: 'mock',
    })

    const response = await service.submitPrompt({
      prompt: 'Adicionar combate básico.',
    })

    expect(response.id).toEqual(expect.any(String))
    expect(response.status).toBe('queued')
    expect(response.message).toBe('Prompt recebido pelo agente local.')
  })

  it('calls the local endpoint with the expected payload in local mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'prompt-1',
          status: 'queued',
          message: 'Prompt recebido pelo backend local.',
        }),
        {
          status: 202,
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

    const payload: CodexPromptRequest = {
      prompt: 'Adicionar crafting.',
      context: {
        currentFeature: 'crafting',
        filesHint: ['src/game/components/GameCanvas.tsx'],
      },
    }

    await service.submitPrompt(payload)

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
      service.submitPrompt({
        prompt: '',
      }),
    ).rejects.toThrow('Prompt inválido.')
  })
})
