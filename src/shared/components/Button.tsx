import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export function Button({ children, type = 'button', ...props }: ButtonProps) {
  return (
    <button {...props} className={`button ${props.className ?? ''}`.trim()} type={type}>
      {children}
    </button>
  )
}
