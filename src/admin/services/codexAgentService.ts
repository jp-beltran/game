import {
  CODEX_AGENT_PROMPT_ENDPOINT as CODEX_AGENT_PROMPT_ENDPOINT_VALUE,
  resolveCodexAgentMode,
} from '../config/codexAgent'
import type { CodexPromptRequest, CodexPromptResponse } from '../types/admin'

function createPromptId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-${Date.now()}`
}

export const CODEX_AGENT_PROMPT_ENDPOINT = CODEX_AGENT_PROMPT_ENDPOINT_VALUE

type CodexAgentServiceOptions = {
  fetchFn?: typeof fetch
  mode?: 'mock' | 'local'
}

async function submitPromptWithMock(): Promise<CodexPromptResponse> {
  return {
    id: createPromptId(),
    status: 'queued',
    message: 'Prompt recebido pelo agente local.',
  }
}

async function submitPromptWithLocalBackend(
  request: CodexPromptRequest,
  fetchFn: typeof fetch,
): Promise<CodexPromptResponse> {
  const response = await fetchFn(CODEX_AGENT_PROMPT_ENDPOINT_VALUE, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const responseBody = (await response.json().catch(() => null)) as
    | { message?: string }
    | CodexPromptResponse
    | null

  if (!response.ok) {
    throw new Error(responseBody?.message ?? 'Falha ao enviar prompt.')
  }

  return responseBody as CodexPromptResponse
}

export function createCodexAgentService({
  fetchFn = fetch,
  mode = resolveCodexAgentMode(import.meta.env.VITE_CODEX_AGENT_MODE),
}: CodexAgentServiceOptions = {}) {
  return {
    async submitPrompt(request: CodexPromptRequest): Promise<CodexPromptResponse> {
      if (mode === 'local') {
        return submitPromptWithLocalBackend(request, fetchFn)
      }

      return submitPromptWithMock()
    },
  }
}

export const codexAgentService = createCodexAgentService()
