import { Player } from './Player'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import type { Position3D } from '../types/game'

type WorldProps = {
  playerPosition: Position3D
  onPlayerFrame: (delta: number) => void
}

function House({
  baseColor,
  position,
  roofColor,
  testId,
}: {
  baseColor: string
  position: [number, number, number]
  roofColor: string
  testId?: string
}) {
  return (
    <group data-testid={testId} position={position}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.9, 1.8, 1.7]} />
        <meshStandardMaterial color={baseColor} roughness={0.96} />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.5, 1.2, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.72, 0.72, 0.86]}>
        <boxGeometry args={[0.38, 0.82, 0.08]} />
        <meshStandardMaterial color="#5c4737" roughness={0.94} />
      </mesh>
    </group>
  )
}

function BorderWall({
  position,
  size,
  testId,
}: {
  position: [number, number, number]
  size: [number, number, number]
  testId?: string
}) {
  return (
    <mesh castShadow data-testid={testId} position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#948e89" roughness={0.96} />
    </mesh>
  )
}

function Fence({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[-0.45, 0.34, 0]}>
        <boxGeometry args={[0.12, 0.68, 0.12]} />
        <meshStandardMaterial color="#6b5b4f" roughness={0.96} />
      </mesh>
      <mesh castShadow position={[0.45, 0.34, 0]}>
        <boxGeometry args={[0.12, 0.68, 0.12]} />
        <meshStandardMaterial color="#6b5b4f" roughness={0.96} />
      </mesh>
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[1.05, 0.1, 0.08]} />
        <meshStandardMaterial color="#776657" roughness={0.98} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.05, 0.1, 0.08]} />
        <meshStandardMaterial color="#776657" roughness={0.98} />
      </mesh>
    </group>
  )
}

export function World({ playerPosition, onPlayerFrame }: WorldProps) {
  return (
    <>
      <color attach="background" args={['#7ba4b8']} />
      <fog attach="fog" args={['#7ba4b8', 10, 26]} />
      <ambientLight intensity={0.88} color="#f4ead7" />
      <hemisphereLight args={['#dfeaf0', '#7b735f', 0.58]} />
      <directionalLight
        castShadow
        color="#fff5de"
        intensity={1.55}
        position={[8, 12, 6]}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      <mesh position={[0, -0.95, 0]} receiveShadow>
        <cylinderGeometry args={[8.8, 9.4, 1.2, 24]} />
        <meshStandardMaterial color="#7e8661" roughness={0.98} />
      </mesh>

      <mesh
        data-testid="world-plaza"
        position={[0, -0.24, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[4.8, 24]} />
        <meshStandardMaterial color="#8a9a5b" roughness={1} />
      </mesh>

      <mesh position={[0, -0.18, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 6.8, 24]} />
        <meshStandardMaterial color="#76814f" roughness={1} />
      </mesh>

      <BorderWall position={[0, -0.18, -5.2]} size={[9.4, 0.72, 0.82]} testId="world-border-north" />
      <BorderWall position={[0, -0.18, 5.2]} size={[9.4, 0.72, 0.82]} />
      <BorderWall position={[-5.2, -0.18, 0]} size={[0.82, 0.72, 9.4]} />
      <BorderWall position={[5.2, -0.18, 0]} size={[0.82, 0.72, 9.4]} />

      <House
        baseColor="#948e89"
        position={[-3.25, -0.12, -2.9]}
        roofColor="#6b5b4f"
        testId="world-house-west"
      />
      <House
        baseColor="#8f897e"
        position={[3.35, -0.12, -2.35]}
        roofColor="#786354"
      />
      <House
        baseColor="#a09588"
        position={[2.85, -0.12, 3.1]}
        roofColor="#65564b"
      />

      <Fence position={[-1.7, -0.24, 4.45]} />
      <Fence position={[0, -0.24, 4.45]} />
      <Fence position={[1.7, -0.24, 4.45]} />
      <Fence position={[-4.2, -0.24, 1.2]} rotation={[0, Math.PI / 2, 0]} />
      <Fence position={[4.2, -0.24, 1.8]} rotation={[0, Math.PI / 2, 0]} />

      <mesh castShadow position={[-0.6, -0.02, -0.8]}>
        <cylinderGeometry args={[0.42, 0.56, 0.44, 8]} />
        <meshStandardMaterial color="#857b6d" roughness={0.96} />
      </mesh>
      <mesh castShadow position={[-0.6, 0.42, -0.8]}>
        <boxGeometry args={[0.16, 0.58, 0.16]} />
        <meshStandardMaterial color="#6a5848" roughness={0.94} />
      </mesh>

      <Player onFrame={onPlayerFrame} position={playerPosition} />
      <ThirdPersonCamera target={playerPosition} />
    </>
  )
}
