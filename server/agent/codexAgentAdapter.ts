import type { CodexPromptRequest, CodexPromptResponse } from '../../src/admin/types/admin'

function createPromptId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-${Date.now()}`
}

export type CodexAgentAdapter = {
  submitPrompt: (
    request: CodexPromptRequest,
  ) => Promise<CodexPromptResponse>
}

export function createCodexAgentAdapter(): CodexAgentAdapter {
  return {
    async submitPrompt(_request) {
      // Future API credentials must live only in this controlled backend layer.
      // Putting credentials in the browser would expose them to every user via
      // the client bundle, devtools, or network inspection.
      //
      // Browsers also must not execute shell commands. If this adapter ever
      // talks to Codex CLI or another local agent, command execution has to stay
      // in a trusted backend/runtime with an allowlist, structured logs, and
      // explicit human confirmation before any impactful action.
      //
      // The same rule applies to file changes: the frontend can request intent,
      // but any real code modification must pass through a controlled
      // environment where access, logging, and review are enforced.
      return {
        id: createPromptId(),
        status: 'queued',
        message: 'Prompt recebido pelo backend local.',
      }
    },
  }
}
