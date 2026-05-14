import type { PropsWithChildren } from 'react'
import { Canvas } from '@react-three/fiber'

import { usePlayerController } from '../hooks/usePlayerController'
import { World } from './World'

const SHOW_PLAYER_DEBUG = import.meta.env.DEV || import.meta.env.MODE === 'test'

export function GameCanvas({ children }: PropsWithChildren) {
  const controller = usePlayerController()

  return (
    <section
      aria-label="Game canvas"
      className="game-shell"
      data-testid="game-shell"
    >
      <Canvas camera={{ position: [5.8, 7.2, 6.4], fov: 42 }} shadows>
        <World
          playerMotion={controller.motion}
          onPlayerFrame={controller.update}
          playerPosition={controller.position}
        />
      </Canvas>
      {SHOW_PLAYER_DEBUG ? (
        <div className="player-position-debug" data-testid="player-position">
          x: {controller.position.x.toFixed(2)} | y: {controller.position.y.toFixed(2)} |
          {' '}z: {controller.position.z.toFixed(2)}
        </div>
      ) : null}
      {children}
    </section>
  )
}
