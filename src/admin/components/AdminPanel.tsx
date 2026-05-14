import { useRef, useState } from 'react'

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
  const activeRequestControllerRef = useRef<AbortController | null>(null)

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
    const abortController = new AbortController()

    activeRequestControllerRef.current = abortController

    try {
      const response: CodexChatResponse = await codexAgentService.sendMessage(
        {
          message: normalizedMessage,
          conversation,
        },
        {
          signal: abortController.signal,
        },
      )

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: response.id,
          author: 'assistant',
          content: response.message,
        },
      ])
      setStatus('success')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('idle')
        setStatusMessage('')
        return
      }

      setStatus('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Falha ao enviar mensagem.',
      )
    } finally {
      if (activeRequestControllerRef.current === abortController) {
        activeRequestControllerRef.current = null
      }
    }
  }

  function handleCancel() {
    activeRequestControllerRef.current?.abort()
  }

  const thinkingMessage: ChatMessage | null =
    status === 'submitting'
      ? {
          id: 'assistant-thinking',
          author: 'assistant',
          content: 'Estou analisando o jogo e implementando isso agora.',
          transient: true,
        }
      : null

  return (
    <PromptConsole
      input={input}
      messages={messages}
      onInputChange={setInput}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      status={status}
      statusMessage={statusMessage}
      thinkingMessage={thinkingMessage}
    />
  )
}
