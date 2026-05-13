import { useState } from 'react'

import { Modal } from '../../shared/components/Modal'
import { PromptConsole } from './PromptConsole'
import { codexAgentService } from '../services/codexAgentService'
import type {
  CodexPromptResponse,
  PromptHistoryEntry,
  SubmitStatus,
} from '../types/admin'

type AdminPanelProps = {
  isOpen: boolean
  onClose: () => void
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState<PromptHistoryEntry[]>([])
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  async function handleSubmit() {
    const normalizedPrompt = prompt.trim()

    if (!normalizedPrompt) {
      return
    }

    setStatus('submitting')
    setStatusMessage('')

    try {
      const response: CodexPromptResponse = await codexAgentService.submitPrompt({
        prompt: normalizedPrompt,
      })

      setHistory((currentHistory) => [
        { id: response.id, prompt: normalizedPrompt },
        ...currentHistory,
      ])
      setStatus('success')
      setStatusMessage(response.message)
      setPrompt('')
    } catch (error) {
      setStatus('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Falha ao enviar prompt.',
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Panel"
      titleId="admin-panel-title"
    >
      <PromptConsole
        history={history}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
        prompt={prompt}
        status={status}
        statusMessage={statusMessage}
      />
    </Modal>
  )
}
