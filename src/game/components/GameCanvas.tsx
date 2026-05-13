import { Canvas } from '@react-three/fiber'

import { World } from './World'

export function GameCanvas() {
  return (
    <section
      aria-label="Game canvas"
      className="game-shell"
      data-testid="game-shell"
    >
      <Canvas camera={{ position: [0, 6, 8], fov: 50 }}>
        <World />
      </Canvas>
    </section>
  )
}
