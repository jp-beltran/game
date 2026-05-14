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
  beforeEach(() => {
    vi.mocked(codexAgentService.sendMessage).mockReset()
  })

  it('renders the game shell heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /third person rpg mvp/i }),
    ).toBeInTheDocument()
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

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Criar sistema de inventário.' },
    })

    expect(screen.getByLabelText(/mensagem para o codex/i)).toHaveValue(
      'Criar sistema de inventário.',
    )
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

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Implementar inventário simples.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expect(codexAgentService.sendMessage).toHaveBeenCalledWith({
        message: 'Implementar inventário simples.',
        conversation: [],
      })
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

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar quests.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Adicionar quests.')).toBeInTheDocument()
    expect(
      await screen.findByText(/comece por uma lista simples de itens no estado local/i),
    ).toBeInTheDocument()
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

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar crafting.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(screen.getByText(/status: submitting/i)).toBeInTheDocument()

    resolvePrompt?.({
      id: 'prompt-1',
      status: 'completed',
      message: 'Resposta temporária do agente.',
      pendingConfirmation: false,
    })

    await screen.findByText(/status: success/i)
  })

  it('shows success after a successful submission', async () => {
    vi.mocked(codexAgentService.sendMessage).mockResolvedValue({
      id: 'prompt-1',
      status: 'completed',
      message: 'Uma HUD mínima já resolve o próximo passo.',
      pendingConfirmation: false,
    })

    render(<App />)

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar HUD.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText(/status: success/i)).toBeInTheDocument()
  })

  it('uses the previous conversation when the user confirms a pending implementation', async () => {
    vi.mocked(codexAgentService.sendMessage)
      .mockResolvedValueOnce({
        id: 'prompt-1',
        status: 'completed',
        message:
          'Posso criar um sistema de save em arquivo local como próximo passo. Se quiser que eu implemente, responda com: sim, ok ou manda ver.',
        pendingConfirmation: true,
      })
      .mockResolvedValueOnce({
        id: 'prompt-2',
        status: 'completed',
        message: 'Implementei o save inicial.',
        pendingConfirmation: false,
      })

    render(<App />)

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar save game.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))
    await screen.findByText(/responda com: sim, ok ou manda ver/i)

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'ok' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() => {
      expect(codexAgentService.sendMessage).toHaveBeenLastCalledWith({
        message: 'ok',
        conversation: [
          { content: 'Adicionar save game.' },
          {
            content:
              'Posso criar um sistema de save em arquivo local como próximo passo. Se quiser que eu implemente, responda com: sim, ok ou manda ver.',
          },
        ],
      })
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

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar save game.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByLabelText(/mensagens do chat/i)).toHaveTextContent(
      /posso criar um sistema de save em arquivo local como próximo passo/i,
    )
  })

  it('shows error when the service fails', async () => {
    vi.mocked(codexAgentService.sendMessage).mockRejectedValue(
      new Error('Falha simulada do agente.'),
    )

    render(<App />)

    fireEvent.change(screen.getByLabelText(/mensagem para o codex/i), {
      target: { value: 'Adicionar save game.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText(/status: error/i)).toBeInTheDocument()
    expect(screen.getByText(/falha simulada do agente/i)).toBeInTheDocument()
  })
})
