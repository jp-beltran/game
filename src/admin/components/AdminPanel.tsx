import { useState } from 'react'

import { PromptConsole } from './PromptConsole'
import { codexAgentService } from '../services/codexAgentService'
import type {
  ChatMessage,
  CodexChatResponse,
  SubmitStatus,
} from '../types/admin'

function createMessageId(prefix: ChatMessage['author']) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}`
}

export function AdminPanel() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  async function handleSubmit() {
    const normalizedMessage = input.trim()

    if (!normalizedMessage) {
      return
    }

    const conversation = messages.map(({ content }) => ({ content }))
    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      author: 'user',
      content: normalizedMessage,
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInput('')
    setStatus('submitting')
    setStatusMessage('')

    try {
      const response: CodexChatResponse = await codexAgentService.sendMessage({
        message: normalizedMessage,
        conversation,
      })

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: response.id,
          author: 'assistant',
          content: response.message,
        },
      ])
      setStatus('success')
      setPendingConfirmation(response.pendingConfirmation)
    } catch (error) {
      setStatus('error')
      setPendingConfirmation(false)
      setStatusMessage(
        error instanceof Error ? error.message : 'Falha ao enviar mensagem.',
      )
    }
  }

  return (
    <PromptConsole
      input={input}
      messages={messages}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      pendingConfirmation={pendingConfirmation}
      status={status}
      statusMessage={statusMessage}
    />
  )
}
