import type { CodexChatRequest, CodexChatResponse } from '../../src/admin/types/admin'
import { createCodexCliRunner, type CodexCliRunner } from './codexCliRunner'
import {
  createGameProjectContextBuilder,
  type GameProjectContextBuilder,
} from './gameProjectContext'

function createPromptId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-${Date.now()}`
}

export type CodexAgentAdapter = {
  sendMessage: (
    request: CodexChatRequest,
    options?: { signal?: AbortSignal },
  ) => Promise<CodexChatResponse>
}

type CreateCodexAgentAdapterOptions = {
  projectContextBuilder?: GameProjectContextBuilder
  runner?: CodexCliRunner
  timeoutMs?: number
  workspaceRoot?: string
}

function buildConversationSummary(conversation: CodexChatRequest['conversation']): string {
  if (conversation.length === 0) {
    return 'Histórico recente: vazio.'
  }

  return [
    'Histórico recente:',
    ...conversation.map((entry, index) => {
      const label = index % 2 === 0 ? 'Mensagem' : 'Resposta'
      return `${label} ${index + 1}: ${entry.content}`
    }),
  ].join('\n')
}

function buildAgentPrompt(
  request: CodexChatRequest,
  projectContext: string,
): string {
  return [
    'Você é o agente local do jogo respondendo a um chat flutuante dentro do projeto.',
    'Use o contexto automatico abaixo antes de decidir onde mexer.',
    'Priorize src/game para interpretar pedidos sobre mapa, personagem, animacoes, camera, input e mundo.',
    'Se houver mais de um alvo plausivel, escolha o mais provavel, implemente e explicite a suposicao na resposta.',
    'Se o pedido nao fechar no jogo, expanda para o resto do repositorio.',
    'Voce tem autonomia para editar o workspace diretamente quando o pedido indicar mudanca no codigo ou no jogo.',
    'Se o usuario estiver apenas fazendo uma pergunta, responda normalmente, mas com base no contexto encontrado.',
    '',
    projectContext,
    '',
    buildConversationSummary(request.conversation),
    '',
    'Nova mensagem do usuário:',
    request.message,
  ].join('\n')
}

export function createCodexAgentAdapter({
  projectContextBuilder = createGameProjectContextBuilder(),
  runner = createCodexCliRunner(),
  timeoutMs = Number(process.env.CODEX_AGENT_TIMEOUT_MS ?? 120000),
  workspaceRoot = process.cwd(),
}: CreateCodexAgentAdapterOptions = {}): CodexAgentAdapter {
  return {
    async sendMessage(request, options = {}) {
      const projectContext = await projectContextBuilder.build({
        message: request.message,
        workspaceRoot,
      })

      const response = await runner.run({
        executionMode: 'workspace-write',
        prompt: buildAgentPrompt(request, projectContext),
        signal: options.signal,
        timeoutMs,
        workspaceRoot,
      })

      return {
        id: createPromptId(),
        status: 'completed',
        message: response,
        pendingConfirmation: false,
      }
    },
  }
}
