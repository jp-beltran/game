import { AdminPanel } from '../admin/components/AdminPanel'
import { GameCanvas } from '../game/components/GameCanvas'

export function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Stage 1</p>
          <h1>Third Person RPG MVP</h1>
          <p className="app-copy">
            Base inicial do jogo com cena 3D simples e um chat flutuante para
            conversar com o Codex durante a partida.
          </p>
        </div>
      </header>

      <GameCanvas>
        <AdminPanel />
      </GameCanvas>
    </main>
  )
}

export default App
