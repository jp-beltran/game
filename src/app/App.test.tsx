import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { codexAgentService } from '../admin/services/codexAgentService'
import { App } from './App'

vi.mock('../game/components/GameCanvas', () => ({
  GameCanvas: () => <div data-testid="game-shell" />,
}))

vi.mock('../admin/services/codexAgentService', () => ({
  codexAgentService: {
    submitPrompt: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(codexAgentService.submitPrompt).mockReset()
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

  it('renders the admin button', () => {
    render(<App />)

    expect(
      screen.getByRole('button', {
        name: /admin/i,
      }),
    ).toBeInTheDocument()
  })

  it('opens the admin panel when clicking the admin button', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))

    expect(screen.getByRole('dialog', { name: /admin panel/i })).toBeInTheDocument()
  })

  it('closes the admin panel when clicking close', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.click(screen.getByRole('button', { name: /fechar painel admin/i }))

    expect(
      screen.queryByRole('dialog', { name: /admin panel/i }),
    ).not.toBeInTheDocument()
  })

  it('accepts typing in the prompt textarea', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Criar sistema de inventário.' },
    })

    expect(screen.getByLabelText(/prompt de desenvolvimento/i)).toHaveValue(
      'Criar sistema de inventário.',
    )
  })

  it('keeps the submit button disabled when the textarea is empty', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))

    expect(
      screen.getByRole('button', { name: /enviar prompt/i }),
    ).toBeDisabled()
  })

  it('calls the codex agent service when sending a prompt', async () => {
    vi.mocked(codexAgentService.submitPrompt).mockResolvedValue({
      id: 'prompt-1',
      status: 'queued',
      message: 'Prompt recebido pelo agente local.',
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Implementar inventário simples.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar prompt/i }))

    await waitFor(() => {
      expect(codexAgentService.submitPrompt).toHaveBeenCalledWith({
        prompt: 'Implementar inventário simples.',
      })
    })
  })

  it('shows the prompt in history after sending', async () => {
    vi.mocked(codexAgentService.submitPrompt).mockResolvedValue({
      id: 'prompt-1',
      status: 'queued',
      message: 'Prompt recebido pelo agente local.',
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Adicionar quests.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar prompt/i }))

    expect(await screen.findByText('Adicionar quests.')).toBeInTheDocument()
  })

  it('shows submitting while the request is in flight', async () => {
    let resolvePrompt: ((value: { id: string; status: 'queued'; message: string }) => void) |
      undefined

    vi.mocked(codexAgentService.submitPrompt).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrompt = resolve
        }),
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Adicionar crafting.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar prompt/i }))

    expect(screen.getByText(/status: submitting/i)).toBeInTheDocument()

    resolvePrompt?.({
      id: 'prompt-1',
      status: 'queued',
      message: 'Prompt recebido pelo agente local.',
    })

    await screen.findByText(/status: success/i)
  })

  it('shows success after a successful submission', async () => {
    vi.mocked(codexAgentService.submitPrompt).mockResolvedValue({
      id: 'prompt-1',
      status: 'queued',
      message: 'Prompt recebido pelo agente local.',
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Adicionar HUD.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar prompt/i }))

    expect(await screen.findByText(/status: success/i)).toBeInTheDocument()
  })

  it('shows error when the service fails', async () => {
    vi.mocked(codexAgentService.submitPrompt).mockRejectedValue(
      new Error('Falha simulada do agente.'),
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /admin/i }))
    fireEvent.change(screen.getByLabelText(/prompt de desenvolvimento/i), {
      target: { value: 'Adicionar save game.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar prompt/i }))

    expect(await screen.findByText(/status: error/i)).toBeInTheDocument()
    expect(screen.getByText(/falha simulada do agente/i)).toBeInTheDocument()
  })
})
