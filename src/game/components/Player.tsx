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
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.48, 8]} />
        <meshStandardMaterial color="#5c4b42" roughness={0.95} />
      </mesh>

      <mesh castShadow data-testid="player-torso" position={[0, 0.82, 0]}>
        <boxGeometry args={[0.72, 0.92, 0.4]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.58} metalness={0.18} />
      </mesh>

      <mesh castShadow data-testid="player-helmet" position={[0, 1.52, 0]}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.24} />
      </mesh>

      <mesh castShadow position={[0, 1.25, 0.18]}>
        <boxGeometry args={[0.38, 0.18, 0.08]} />
        <meshStandardMaterial color="#8b7d6b" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[-0.24, 0.82, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.62} metalness={0.16} />
      </mesh>

      <mesh castShadow position={[0.24, 0.82, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.62} metalness={0.16} />
      </mesh>

      <mesh castShadow position={[-0.16, 0.12, 0]}>
        <boxGeometry args={[0.18, 0.52, 0.18]} />
        <meshStandardMaterial color="#4f535e" roughness={0.88} />
      </mesh>

      <mesh castShadow position={[0.16, 0.12, 0]}>
        <boxGeometry args={[0.18, 0.52, 0.18]} />
        <meshStandardMaterial color="#4f535e" roughness={0.88} />
      </mesh>

      <mesh castShadow data-testid="player-shield" position={[-0.46, 0.9, -0.06]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.16, 0.62, 0.5]} />
        <meshStandardMaterial color="#6b5b4f" roughness={0.94} />
      </mesh>

      <mesh castShadow position={[0.44, 0.88, -0.02]} rotation={[0, 0, -0.75]}>
        <boxGeometry args={[0.1, 0.72, 0.1]} />
        <meshStandardMaterial color="#5b6068" roughness={0.62} metalness={0.16} />
      </mesh>
    </group>
  )
}
