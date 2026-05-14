export const CODEX_AGENT_PROMPT_ENDPOINT = '/api/admin/agent/prompts'
export const CODEX_AGENT_MAX_PROMPT_LENGTH = 4000

export type CodexAgentMode = 'mock' | 'local'

export function resolveCodexAgentMode(
  value: string | undefined,
): CodexAgentMode {
  return value === 'local' ? 'local' : 'mock'
}
