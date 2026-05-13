import type { CodexPromptRequest, CodexPromptResponse } from '../types/admin'

function createPromptId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-${Date.now()}`
}

export const codexAgentService = {
  async submitPrompt(
    _request: CodexPromptRequest,
  ): Promise<CodexPromptResponse> {
    return {
      id: createPromptId(),
      status: 'queued',
      message: 'Prompt recebido pelo agente local.',
    }
  },
}
