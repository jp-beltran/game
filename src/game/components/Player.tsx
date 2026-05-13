import { useFrame } from '@react-three/fiber'

import type { Position3D } from '../types/game'

type PlayerProps = {
  position: Position3D
  onFrame: (delta: number) => void
}

export function Player({ position, onFrame }: PlayerProps) {
  useFrame((_, delta) => {
    onFrame(delta)
  })

  return (
    <group
      data-testid="player-model"
      position={[position.x, position.y, position.z]}
    >
      <mesh castShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.45, 1.1, 6, 12]} />
        <meshStandardMaterial color="#2f4858" />
      </mesh>
    </group>
  )
}
