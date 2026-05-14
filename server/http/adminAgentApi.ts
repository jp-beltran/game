import type { IncomingMessage, ServerResponse } from 'node:http'

import type { CodexAgentAdapter } from '../agent/codexAgentAdapter'
import {
  CODEX_AGENT_MAX_PROMPT_LENGTH,
  CODEX_AGENT_PROMPT_ENDPOINT,
} from '../../src/admin/config/codexAgent'
import type { CodexPromptRequest } from '../../src/admin/types/admin'

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
  payload: ErrorBody | Awaited<ReturnType<CodexAgentAdapter['submitPrompt']>>,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(
  request: IncomingMessage,
): Promise<unknown> {
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

function isValidContext(context: unknown): boolean {
  if (context === undefined) {
    return true
  }

  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return false
  }

  const typedContext = context as CodexPromptRequest['context']

  if (
    typedContext?.currentFeature !== undefined &&
    typeof typedContext.currentFeature !== 'string'
  ) {
    return false
  }

  if (typedContext?.filesHint === undefined) {
    return true
  }

  return typedContext.filesHint.every(
    (fileHint) => typeof fileHint === 'string' && fileHint.trim().length > 0,
  )
}

function validatePromptRequest(payload: unknown): ErrorBody | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      message: 'Payload inválido para envio do prompt.',
    }
  }

  const request = payload as CodexPromptRequest

  if (typeof request.prompt !== 'string' || request.prompt.trim().length === 0) {
    return {
      message: 'Prompt obrigatório e não pode estar vazio.',
    }
  }

  if (request.prompt.length > CODEX_AGENT_MAX_PROMPT_LENGTH) {
    return {
      message: `Prompt excede o limite de ${CODEX_AGENT_MAX_PROMPT_LENGTH} caracteres.`,
    }
  }

  if (!isValidContext(request.context)) {
    return {
      message: 'Contexto inválido para envio do prompt.',
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
      const validationError = validatePromptRequest(body)

      if (validationError) {
        sendJson(response, 400, validationError)
        return
      }

      const result = await adapter.submitPrompt(body as CodexPromptRequest)
      sendJson(response, 202, result)
    } catch (_error) {
      sendJson(response, 400, {
        message: 'Não foi possível processar o payload do prompt.',
      })
    }
  }
}

export {
  CODEX_AGENT_MAX_PROMPT_LENGTH,
  CODEX_AGENT_PROMPT_ENDPOINT,
}
