import { Button } from '../../shared/components/Button'
import type { PromptHistoryEntry, SubmitStatus } from '../types/admin'

type PromptConsoleProps = {
  prompt: string
  history: PromptHistoryEntry[]
  status: SubmitStatus
  statusMessage: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
}

export function PromptConsole({
  prompt,
  history,
  status,
  statusMessage,
  onPromptChange,
  onSubmit,
}: PromptConsoleProps) {
  const isSubmitDisabled = prompt.trim().length === 0 || status === 'submitting'

  return (
    <div className="prompt-console">
      <label className="prompt-label" htmlFor="admin-prompt">
        Prompt de desenvolvimento
      </label>
      <textarea
        className="prompt-textarea"
        id="admin-prompt"
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Descreva a próxima evolução do jogo."
        rows={6}
        value={prompt}
      />

      <div className="prompt-actions">
        <Button disabled={isSubmitDisabled} onClick={onSubmit}>
          Enviar prompt
        </Button>
        <p className="prompt-status">Status: {status}</p>
      </div>

      {statusMessage ? <p className="prompt-message">{statusMessage}</p> : null}

      <section aria-label="Histórico de prompts" className="prompt-history">
        <h3>Prompts enviados</h3>
        {history.length > 0 ? (
          <ul>
            {history.map((entry) => (
              <li key={entry.id}>{entry.prompt}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum prompt enviado ainda.</p>
        )}
      </section>
    </div>
  )
}
