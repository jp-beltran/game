import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { codexAgentService } from '../admin/services/codexAgentService'
import { App } from './App'

vi.mock('../game/components/GameCanvas', () => ({
  GameCanvas: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="game-shell">{children}</div>
  ),
}))

vi.mock('../admin/services/codexAgentService', () => ({
  codexAgentService: {
    sendMessage: vi.fn(),
  },
}))

describe('App', () => {
  function getChatTextarea() {
    return screen.getByRole('textbox', { name: /prompt do chat/i })
  }

  function typeInChatTextarea(value: string) {
    fireEvent.change(getChatTextarea(), {
      target: { value },
    })
  }

  function appendToChatTextarea(value: string) {
    typeInChatTextarea(`${getChatTextarea().value}${value}`)
  }

  function expectChatValueToContain(value: string) {
    expect(getChatTextarea().value).toContain(value)
  }

  beforeEach(() => {
    vi.mocked(codexAgentService.sendMessage).mockReset()
  })

  it('does not render the old page header layout', () => {
    render(<App />)

    expect(
      screen.queryByRole('heading', { name: /third person rpg mvp/i }),
    ).not.toBeInTheDocument()
  })

  it('renders the game container', () => {
    render(<App />)

    expect(screen.getByTestId('game-shell')).toBeInTheDocument()
  })

  it('renders the floating chat panel', () => {
    render(<App />)

    expect(
      screen.getByRole('region', {
        name: /codex chat/i,
      }),
    ).toBeInTheDocument()
  })

  it('does not render the old modal dialog', () => {
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('accepts typing in the chat textarea', () => {
    render(<App />)

    typeInChatTextarea('Criar sistema de inventário.')

    expect(getChatTextarea()).toHaveValue('Criar sistema de inventário.')
  })

  it('keeps the submit button disabled when the textarea is empty', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: /enviar mensagem/i }),
    ).toBeDisabled()
  })

  it('calls the codex agent service when sending a message', async () => {
    vi.mocked(codexAgentService.sendMessage).mockResolvedValue({
      id: 'prompt-1',
      status: 'completed',
      message: 'Use um inventário em memória para o MVP.',
      pendingConfirmation: false,
    })

    render(<App />)

    typeInChatTextarea('Implementar inventário simples.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expect(codexAgentService.sendMessage).toHaveBeenCalledWith(
        {
          message: 'Implementar inventário simples.',
          conversation: [],
        },
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })
  })

  it('shows the conversation in a continuous chat flow after sending', async () => {
    vi.mocked(codexAgentService.sendMessage).mockResolvedValue({
      id: 'prompt-1',
      status: 'completed',
      message: 'Comece por uma lista simples de itens no estado local.',
      pendingConfirmation: false,
    })

    render(<App />)

    typeInChatTextarea('Adicionar quests.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expectChatValueToContain('Você: Adicionar quests.')
    })
    expectChatValueToContain(
      'Codex: Comece por uma lista simples de itens no estado local.',
    )
  })

  it('shows submitting while the request is in flight', async () => {
    let resolvePrompt:
      | ((
          value: {
            id: string
            status: 'completed'
            message: string
            pendingConfirmation: boolean
          },
        ) => void)
      undefined

    vi.mocked(codexAgentService.sendMessage).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrompt = resolve
        }),
    )

    render(<App />)

    typeInChatTextarea('Adicionar crafting.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(
      screen.getByRole('button', { name: /cancelar/i }),
    ).toBeInTheDocument()
    expectChatValueToContain(
      'Codex: Estou analisando o jogo e implementando isso agora.',
    )

    resolvePrompt?.({
      id: 'prompt-1',
      status: 'completed',
      message: 'Resposta temporária do agente.',
      pendingConfirmation: false,
    })

    await waitFor(() => {
      expect(getChatTextarea().value).not.toContain(
        'Codex: Estou analisando o jogo e implementando isso agora.',
      )
    })
  })

  it('cancels the in-flight request from the same action button', async () => {
    vi.mocked(codexAgentService.sendMessage).mockImplementation(
      (_request, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )

    render(<App />)

    typeInChatTextarea('Adicionar crafting.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeDisabled()
    })
    expectChatValueToContain('Você: Adicionar crafting.')
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
  })

  it('shows success after a successful submission', async () => {
    vi.mocked(codexAgentService.sendMessage).mockResolvedValue({
      id: 'prompt-1',
      status: 'completed',
      message: 'Uma HUD mínima já resolve o próximo passo.',
      pendingConfirmation: false,
    })

    render(<App />)

    typeInChatTextarea('Adicionar HUD.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expectChatValueToContain('Codex: Uma HUD mínima já resolve o próximo passo.')
    })
  })

  it('uses the previous conversation on a normal follow-up message', async () => {
    vi.mocked(codexAgentService.sendMessage)
      .mockResolvedValueOnce({
        id: 'prompt-1',
        status: 'completed',
        message: 'Implementei o save inicial.',
        pendingConfirmation: false,
      })
      .mockResolvedValueOnce({
        id: 'prompt-2',
        status: 'completed',
        message: 'Ajustei o feedback visual do save.',
        pendingConfirmation: false,
      })

    render(<App />)

    typeInChatTextarea('Adicionar save game.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))
    await waitFor(() => {
      expectChatValueToContain('Codex: Implementei o save inicial.')
    })

    appendToChatTextarea('Ajuste também o feedback visual.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expect(codexAgentService.sendMessage).toHaveBeenLastCalledWith(
        {
          message: 'Ajuste também o feedback visual.',
          conversation: [
            { content: 'Adicionar save game.' },
            { content: 'Implementei o save inicial.' },
          ],
        },
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })
  })

  it('shows the assistant message after a successful submission', async () => {
    vi.mocked(codexAgentService.sendMessage).mockResolvedValue({
      id: 'prompt-1',
      status: 'completed',
      message: 'Posso criar um sistema de save em arquivo local como próximo passo.',
      pendingConfirmation: false,
    })

    render(<App />)

    typeInChatTextarea('Adicionar save game.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expectChatValueToContain(
        'Codex: Posso criar um sistema de save em arquivo local como próximo passo.',
      )
    })
  })

  it('shows error when the service fails', async () => {
    vi.mocked(codexAgentService.sendMessage).mockRejectedValue(
      new Error('Falha simulada do agente.'),
    )

    render(<App />)

    typeInChatTextarea('Adicionar save game.')
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expectChatValueToContain('Sistema: Falha simulada do agente.')
    })
  })
})
