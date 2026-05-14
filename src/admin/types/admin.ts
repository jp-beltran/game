export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export type CodexExecutionMode = 'read-only' | 'workspace-write'

export type CodexConversationEntry = {
  content: string
}

export type CodexChatRequest = {
  message: string
  conversation: CodexConversationEntry[]
}

export type CodexChatResponse = {
  id: string
  status: 'completed' | 'failed'
  message: string
  pendingConfirmation: boolean
}

export type ChatMessage = {
  id: string
  content: string
  author: 'user' | 'assistant'
}
