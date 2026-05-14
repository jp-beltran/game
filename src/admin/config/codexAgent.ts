export const CODEX_AGENT_PROMPT_ENDPOINT = '/api/admin/agent/prompts'
export const CODEX_AGENT_MAX_PROMPT_LENGTH = 4000

export type CodexAgentMode = 'local'

export function resolveCodexAgentMode(
  _value: string | undefined,
): CodexAgentMode {
  return 'local'
}
