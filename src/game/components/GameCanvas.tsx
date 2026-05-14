import type { PropsWithChildren } from 'react'
import { Canvas } from '@react-three/fiber'

import { usePlayerController } from '../hooks/usePlayerController'
import { World } from './World'


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
      {children}
    </section>
  )
}
