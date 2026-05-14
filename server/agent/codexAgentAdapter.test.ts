import { createCodexAgentAdapter } from './codexAgentAdapter'

describe('codexAgentAdapter', () => {
  it('maps a normal chat request into a completed response', async () => {
    const runner = {
      run: vi.fn().mockResolvedValue('Analise o inventário antes de editar arquivos.'),
    }

    const adapter = createCodexAgentAdapter({
      runner,
      workspaceRoot: '/tmp/game',
    })

    const response = await adapter.sendMessage({
      message: 'Como devo começar o inventário?',
      conversation: [{ content: 'Quero adicionar um inventário.' }],
    })

    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        executionMode: 'read-only',
        prompt: expect.stringContaining('Como devo começar o inventário?'),
      }),
    )
    expect(response).toMatchObject({
      message: 'Analise o inventário antes de editar arquivos.',
      pendingConfirmation: false,
      status: 'completed',
    })
  })

  it('switches to workspace-write when the user confirms a pending implementation', async () => {
    const runner = {
      run: vi.fn().mockResolvedValue('Implementei o crafting inicial no projeto.'),
    }

    const adapter = createCodexAgentAdapter({
      runner,
      workspaceRoot: '/tmp/game',
    })

    await adapter.sendMessage({
      message: 'ok',
      conversation: [
        { content: 'Quero crafting.' },
        {
          content:
            'Posso implementar isso. Se quiser que eu implemente, responda com: sim, ok ou manda ver.',
        },
      ],
    })

    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        executionMode: 'workspace-write',
      }),
    )
  })

  it('surfaces runner failures with a backend-friendly error', async () => {
    const adapter = createCodexAgentAdapter({
      runner: {
        run: vi.fn().mockRejectedValue(new Error('Codex CLI indisponível.')),
      },
      workspaceRoot: '/tmp/game',
    })

    await expect(
      adapter.sendMessage({
        message: 'Adicionar HUD.',
        conversation: [],
      }),
    ).rejects.toThrow('Codex CLI indisponível.')
  })

  it('marks the response as pending confirmation when the assistant asks for authorization', async () => {
    const adapter = createCodexAgentAdapter({
      runner: {
        run: vi.fn().mockResolvedValue(
          'Posso implementar isso. Se quiser que eu implemente, responda com: sim, ok ou manda ver.',
        ),
      },
      workspaceRoot: '/tmp/game',
    })

    const response = await adapter.sendMessage({
      message: 'Quero inventário.',
      conversation: [],
    })

    expect(response.pendingConfirmation).toBe(true)
  })
})
