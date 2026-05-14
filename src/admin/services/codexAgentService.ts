import { CODEX_AGENT_PROMPT_ENDPOINT as CODEX_AGENT_PROMPT_ENDPOINT_VALUE } from '../config/codexAgent'
import type { CodexChatRequest, CodexChatResponse } from '../types/admin'

export const CODEX_AGENT_PROMPT_ENDPOINT = CODEX_AGENT_PROMPT_ENDPOINT_VALUE

type CodexAgentServiceOptions = {
  fetchFn?: typeof fetch
}

type SendMessageOptions = {
  signal?: AbortSignal
}

async function sendMessageWithLocalBackend(
  request: CodexChatRequest,
  options: SendMessageOptions,
  fetchFn: typeof fetch,
): Promise<CodexChatResponse> {
  const response = await fetchFn(CODEX_AGENT_PROMPT_ENDPOINT_VALUE, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal: options.signal,
  })
  const responseBody = (await response.json().catch(() => null)) as
    | { message?: string }
    | CodexChatResponse
    | null

  if (!response.ok) {
    throw new Error(responseBody?.message ?? 'Falha ao enviar mensagem.')
  }

  return responseBody as CodexChatResponse
}

export function createCodexAgentService({
  fetchFn = fetch,
}: CodexAgentServiceOptions = {}) {
  return {
    async sendMessage(
      request: CodexChatRequest,
      options: SendMessageOptions = {},
    ): Promise<CodexChatResponse> {
      return sendMessageWithLocalBackend(request, options, fetchFn)
    },
  }
}

export const codexAgentService = createCodexAgentService()
