import { Button } from '../../shared/components/Button'
import type { ChatMessage, SubmitStatus } from '../types/admin'

type PromptConsoleProps = {
  input: string
  messages: ChatMessage[]
  status: SubmitStatus
  statusMessage: string
  pendingConfirmation: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export function PromptConsole({
  input,
  messages,
  status,
  statusMessage,
  pendingConfirmation,
  onInputChange,
  onSubmit,
}: PromptConsoleProps) {
  const isSubmitDisabled = input.trim().length === 0 || status === 'submitting'

  return (
    <section aria-label="Codex Chat" className="floating-chat">
      <div className="floating-chat-header">
        <div>
          <p className="floating-chat-eyebrow">Codex</p>
          <h2>Chat do jogo</h2>
        </div>
        <p className="prompt-status">Status: {status}</p>
      </div>

      <section aria-label="Mensagens do chat" className="chat-messages">
        {messages.length > 0 ? (
          messages.map((message) => (
            <article
              className={`chat-bubble chat-bubble-${message.author}`}
              key={message.id}
            >
              <p className="chat-author">
                {message.author === 'user' ? 'Você' : 'Codex'}
              </p>
              <p>{message.content}</p>
            </article>
          ))
        ) : (
          <p className="chat-empty">
            Descreva a próxima evolução do jogo e o Codex responde aqui.
          </p>
        )}
      </section>

      <div className="chat-composer">
        <label className="prompt-label" htmlFor="admin-prompt">
          Mensagem para o Codex
        </label>
        <textarea
          className="prompt-textarea"
          id="admin-prompt"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ex.: adicionar inventário, melhorar HUD, revisar save."
          rows={4}
          value={input}
        />

        <div className="prompt-actions">
          <Button disabled={isSubmitDisabled} onClick={onSubmit}>
            Enviar mensagem
          </Button>
          {pendingConfirmation ? (
            <p className="prompt-message">
              Há uma implementação pendente de confirmação.
            </p>
          ) : null}
        </div>
        {statusMessage ? <p className="prompt-message">{statusMessage}</p> : null}
      </div>
    </section>
  )
}
