import { useState } from 'react'

import { AdminButton } from '../admin/components/AdminButton'
import { AdminPanel } from '../admin/components/AdminPanel'
import { GameCanvas } from '../game/components/GameCanvas'

export function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Stage 1</p>
          <h1>Third Person RPG MVP</h1>
          <p className="app-copy">
            Base inicial do jogo com cena 3D simples e entrada para o painel
            administrativo.
          </p>
        </div>
        <AdminButton onClick={() => setIsAdminOpen(true)} />
      </header>

      <GameCanvas />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </main>
  )
}

export default App
