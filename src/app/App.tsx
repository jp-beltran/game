import { AdminPanel } from '../admin/components/AdminPanel'
import { GameCanvas } from '../game/components/GameCanvas'

export function App() {
  return (
    <GameCanvas>
      <AdminPanel />
    </GameCanvas>
  )
}

export default App
