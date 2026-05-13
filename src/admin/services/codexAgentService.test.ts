import { codexAgentService } from './codexAgentService'

describe('codexAgentService', () => {
  it('returns a queued response for a submitted prompt', async () => {
    const response = await codexAgentService.submitPrompt({
      prompt: 'Adicionar combate básico.',
    })

    expect(response.id).toEqual(expect.any(String))
    expect(response.status).toBe('queued')
    expect(response.message).toBe('Prompt recebido pelo agente local.')
  })
})
