import type { IncomingMessage, ServerResponse } from 'node:http'

import type { CodexAgentAdapter } from '../agent/codexAgentAdapter'
import {
  CODEX_AGENT_MAX_PROMPT_LENGTH,
  CODEX_AGENT_PROMPT_ENDPOINT,
} from '../../src/admin/config/codexAgent'
import type { CodexChatRequest } from '../../src/admin/types/admin'

type NextFunction = () => void

type CreateAdminAgentApiHandlerOptions = {
  adapter: CodexAgentAdapter
}

type ErrorBody = {
  message: string
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: ErrorBody | Awaited<ReturnType<CodexAgentAdapter['sendMessage']>>,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = []

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const body = Buffer.concat(chunks).toString('utf8')

  return JSON.parse(body) as unknown
}

function isValidConversation(conversation: unknown): boolean {
  if (!Array.isArray(conversation)) {
    return false
  }

  return conversation.every((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return false
    }

    const typedEntry = entry as CodexChatRequest['conversation'][number]

    return (
      typeof typedEntry.content === 'string' &&
      typedEntry.content.trim().length > 0
    )
  })
}

function validateChatRequest(payload: unknown): ErrorBody | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      message: 'Payload inválido para envio da mensagem.',
    }
  }

  const request = payload as CodexChatRequest

  if (typeof request.message !== 'string' || request.message.trim().length === 0) {
    return {
      message: 'Mensagem obrigatória e não pode estar vazia.',
    }
  }

  if (request.message.length > CODEX_AGENT_MAX_PROMPT_LENGTH) {
    return {
      message: `Mensagem excede o limite de ${CODEX_AGENT_MAX_PROMPT_LENGTH} caracteres.`,
    }
  }

  if (!isValidConversation(request.conversation)) {
    return {
      message: 'Histórico da conversa inválido para envio da mensagem.',
    }
  }

  return null
}

export function createAdminAgentApiHandler({
  adapter,
}: CreateAdminAgentApiHandlerOptions) {
  return async function adminAgentApiHandler(
    request: IncomingMessage,
    response: ServerResponse,
    next?: NextFunction,
  ) {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')

    if (requestUrl.pathname !== CODEX_AGENT_PROMPT_ENDPOINT) {
      next?.()
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, {
        message: 'Método não suportado para este endpoint.',
      })
      return
    }

    try {
      const body = await readJsonBody(request)
      const validationError = validateChatRequest(body)

      if (validationError) {
        sendJson(response, 400, validationError)
        return
      }

      const result = await adapter.sendMessage(body as CodexChatRequest)
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 500, {
        message:
          error instanceof Error
            ? error.message
            : 'Falha ao executar o Codex CLI local.',
      })
    }
  }
}

export {
  CODEX_AGENT_MAX_PROMPT_LENGTH,
  CODEX_AGENT_PROMPT_ENDPOINT,
}
