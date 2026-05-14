import type { CodexChatRequest, CodexChatResponse } from '../../src/admin/types/admin'
import { createCodexCliRunner, type CodexCliRunner } from './codexCliRunner'

function createPromptId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-${Date.now()}`
}

const CONFIRMATION_INSTRUCTION =
  'Se quiser que eu implemente, responda com: sim, ok ou manda ver.'

export type CodexAgentAdapter = {
  sendMessage: (
    request: CodexChatRequest,
  ) => Promise<CodexChatResponse>
}

type CreateCodexAgentAdapterOptions = {
  runner?: CodexCliRunner
  timeoutMs?: number
  workspaceRoot?: string
}

function isAffirmativeMessage(message: string): boolean {
  const normalizedMessage = message.trim().toLowerCase()

  return ['sim', 'ok', 'manda ver'].includes(normalizedMessage)
}

function hasPendingImplementation(conversation: CodexChatRequest['conversation']): boolean {
  const lastMessage = conversation.at(-1)?.content ?? ''

  return lastMessage.toLowerCase().includes(CONFIRMATION_INSTRUCTION.toLowerCase())
}

function shouldExecuteImplementation(request: CodexChatRequest): boolean {
  return isAffirmativeMessage(request.message) && hasPendingImplementation(request.conversation)
}

function shouldAwaitConfirmation(response: string): boolean {
  return response.toLowerCase().includes(CONFIRMATION_INSTRUCTION.toLowerCase())
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
  executionMode: 'read-only' | 'workspace-write',
): string {
  const modeInstruction =
    executionMode === 'workspace-write'
      ? 'O usuário acabou de autorizar explicitamente a implementação. Execute a mudança necessária no workspace e responda com o resultado.'
      : [
          'Converse normalmente como um assistente técnico.',
          'Se a melhor resposta exigir implementação, não implemente ainda.',
          `Explique brevemente e termine exatamente com esta frase: ${CONFIRMATION_INSTRUCTION}`,
        ].join(' ')

  return [
    'Você está respondendo a uma conversa enviada por um chat flutuante local.',
    modeInstruction,
    buildConversationSummary(request.conversation),
    '',
    'Nova mensagem do usuário:',
    request.message,
  ].join('\n')
}

export function createCodexAgentAdapter({
  runner = createCodexCliRunner(),
  timeoutMs = Number(process.env.CODEX_AGENT_TIMEOUT_MS ?? 120000),
  workspaceRoot = process.cwd(),
}: CreateCodexAgentAdapterOptions = {}): CodexAgentAdapter {
  return {
    async sendMessage(request) {
      const executionMode = shouldExecuteImplementation(request)
        ? 'workspace-write'
        : 'read-only'

      const response = await runner.run({
        executionMode,
        prompt: buildAgentPrompt(request, executionMode),
        timeoutMs,
        workspaceRoot,
      })

      return {
        id: createPromptId(),
        status: 'completed',
        message: response,
        pendingConfirmation: shouldAwaitConfirmation(response),
      }
    },
  }
}
