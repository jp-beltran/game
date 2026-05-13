import { Player } from './Player'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import type { Position3D } from '../types/game'

type WorldProps = {
  playerPosition: Position3D
  onPlayerFrame: (delta: number) => void
}

export function World({ playerPosition, onPlayerFrame }: WorldProps) {
  return (
    <>
      <color attach="background" args={['#d6e4f0']} />
      <ambientLight intensity={0.7} />
      <directionalLight castShadow intensity={1.2} position={[6, 10, 4]} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#7ca982" />
      </mesh>
      <Player onFrame={onPlayerFrame} position={playerPosition} />
      <ThirdPersonCamera target={playerPosition} />
    </>
  )
}
