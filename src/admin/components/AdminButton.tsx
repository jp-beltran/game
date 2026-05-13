import { Button } from '../../shared/components/Button'

type AdminButtonProps = {
  onClick?: () => void
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <Button className="admin-button" onClick={onClick}>
      Admin
    </Button>
  )
}
