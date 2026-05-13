export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export type CodexPromptRequest = {
  prompt: string
  context?: {
    currentFeature?: string
    filesHint?: string[]
  }
}

export type CodexPromptResponse = {
  id: string
  status: 'queued' | 'completed' | 'failed'
  message: string
}

export type PromptHistoryEntry = {
  id: string
  prompt: string
}
