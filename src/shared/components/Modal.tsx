import type { PropsWithChildren, ReactNode } from 'react'

type ModalProps = PropsWithChildren<{
  isOpen: boolean
  title: ReactNode
  titleId: string
  onClose: () => void
}>

export function Modal({ children, isOpen, title, titleId, onClose }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-shell"
        role="dialog"
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            aria-label="Fechar painel Admin"
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
