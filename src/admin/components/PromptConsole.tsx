import { Square, Loader2 } from 'lucide-react'
import { Button } from '../../shared/components/Button'
import type { ChatMessage, SubmitStatus } from '../types/admin'

type PromptConsoleProps = {
  input: string
  messages: ChatMessage[]
  status: SubmitStatus
  statusMessage: string
  thinkingMessage: ChatMessage | null
  onInputChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function PromptConsole({
  input,
  messages,
  status,
  statusMessage,
  thinkingMessage,
  onInputChange,
  onCancel,
  onSubmit,
}: PromptConsoleProps) {
  const isSubmitDisabled = input.trim().length === 0
  const renderedMessages = thinkingMessage
    ? [...messages, thinkingMessage]
    : messages
  const isSubmitting = status === 'submitting'
  const transcript = [
    ...renderedMessages.map((message) => {
      const author = message.author === 'user' ? 'Você' : 'Codex'
      return `${author}: ${message.content}`
    }),
    ...(statusMessage ? [`Sistema: ${statusMessage}`] : []),
  ].join('\n\n')
  const promptPrefix = transcript ? `${transcript}\n\nPrompt:\n` : ''
  const textareaValue = `${promptPrefix}${input}`

  function handleTextareaChange(nextValue: string) {
    if (!promptPrefix) {
      onInputChange(nextValue)
      return
    }

    if (nextValue.startsWith(promptPrefix)) {
      onInputChange(nextValue.slice(promptPrefix.length))
      return
    }

    const nextPromptIndex = nextValue.lastIndexOf('\n\nPrompt:\n')

    if (nextPromptIndex >= 0) {
      onInputChange(nextValue.slice(nextPromptIndex + '\n\nPrompt:\n'.length))
      return
    }

    onInputChange(input)
  }

  return (
    <section aria-label="Codex Chat" className="floating-chat">

      <textarea
        aria-label="Prompt do chat"
        className="prompt-textarea"
        id="admin-prompt"
        onChange={(event) => handleTextareaChange(event.target.value)}
        placeholder="Ex.: adicionar inventário, melhorar HUD, revisar save."
        rows={14}
        spellCheck={false}
        value={textareaValue}
      />

        <Button
          disabled={!isSubmitting && isSubmitDisabled}
          onClick={isSubmitting ? onCancel : onSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="icon-spin" size={15} color="#ffff" />
          ) : (
            <Square size={15} color="#ffff" />
          )}
        </Button>
    </section>
  )
}
