import { createCodexAgentAdapter } from './codexAgentAdapter'

describe('codexAgentAdapter', () => {
  it('maps a normal chat request into a completed response', async () => {
    const runner = {
      run: vi.fn().mockResolvedValue('Analise o inventário antes de editar arquivos.'),
    }
    const projectContextBuilder = {
      build: vi.fn().mockResolvedValue(
        ['Area prioritaria: src/game', '- src/game/components/Player.tsx'].join('\n'),
      ),
    }

    const adapter = createCodexAgentAdapter({
      projectContextBuilder,
      runner,
      workspaceRoot: '/tmp/game',
    })

    const response = await adapter.sendMessage({
      message: 'Como devo começar o inventário?',
      conversation: [{ content: 'Quero adicionar um inventário.' }],
    })

    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        executionMode: 'workspace-write',
        prompt: expect.stringContaining('Como devo começar o inventário?'),
      }),
    )
    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Area prioritaria: src/game'),
      }),
    )
    expect(response).toMatchObject({
      message: 'Analise o inventário antes de editar arquivos.',
      pendingConfirmation: false,
      status: 'completed',
    })
  })

  it('forwards the abort signal to the runner', async () => {
    const runner = {
      run: vi.fn().mockResolvedValue('Implementei o mapa.'),
    }
    const projectContextBuilder = {
      build: vi.fn().mockResolvedValue('Area prioritaria: src/game'),
    }
    const abortController = new AbortController()
    const adapter = createCodexAgentAdapter({
      projectContextBuilder,
      runner,
      workspaceRoot: '/tmp/game',
    })

    await adapter.sendMessage(
      {
        message: 'Ajuste o mapa.',
        conversation: [],
      },
      {
        signal: abortController.signal,
      },
    )

    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        signal: abortController.signal,
      }),
    )
  })

  it('keeps workspace-write even when the user sends a plain follow-up message', async () => {
    const runner = {
      run: vi.fn().mockResolvedValue('Implementei o crafting inicial no projeto.'),
    }
    const projectContextBuilder = {
      build: vi.fn().mockResolvedValue('Area prioritaria: src/game'),
    }

    const adapter = createCodexAgentAdapter({
      projectContextBuilder,
      runner,
      workspaceRoot: '/tmp/game',
    })

    await adapter.sendMessage({
      message: 'ajuste tambem o feedback visual',
      conversation: [
        { content: 'Quero crafting.' },
        { content: 'Implementei o crafting inicial no projeto.' },
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

  it('does not mark the response as pending confirmation anymore', async () => {
    const adapter = createCodexAgentAdapter({
      projectContextBuilder: {
        build: vi.fn().mockResolvedValue('Area prioritaria: src/game'),
      },
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

    expect(response.pendingConfirmation).toBe(false)
  })
})
