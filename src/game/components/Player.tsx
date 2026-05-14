import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

import type { Position3D } from '../types/game'

type PlayerProps = {
  facingAngle: number
  isMoving: boolean
  position: Position3D
  onFrame: (delta: number) => void
}

type RotationAxis = {
  x: number
  y: number
  z: number
}

type PositionAxis = {
  x: number
  y: number
  z: number
}

type AnimatedNode = {
  position: PositionAxis
  rotation: RotationAxis
}

function normalizeAngle(angle: number) {
  let normalized = angle

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2
  }

  while (normalized < -Math.PI) {
    normalized += Math.PI * 2
  }

  return normalized
}

export function Player({
  facingAngle,
  isMoving,
  position,
  onFrame,
}: PlayerProps) {
  const rootRef = useRef<AnimatedNode | null>(null)
  const bodyRef = useRef<AnimatedNode | null>(null)
  const torsoRef = useRef<AnimatedNode | null>(null)
  const headRef = useRef<AnimatedNode | null>(null)
  const leftArmRef = useRef<AnimatedNode | null>(null)
  const rightArmRef = useRef<AnimatedNode | null>(null)
  const leftLegRef = useRef<AnimatedNode | null>(null)
  const rightLegRef = useRef<AnimatedNode | null>(null)
  const shieldRef = useRef<AnimatedNode | null>(null)

  useFrame((state, delta) => {
    onFrame(delta)

    const elapsed = state.clock.getElapsedTime()
    const root = rootRef.current
    const body = bodyRef.current
    const torso = torsoRef.current
    const head = headRef.current
    const leftArm = leftArmRef.current
    const rightArm = rightArmRef.current
    const leftLeg = leftLegRef.current
    const rightLeg = rightLegRef.current
    const shield = shieldRef.current

    if (
      !root ||
      !body ||
      !torso ||
      !head ||
      !leftArm ||
      !rightArm ||
      !leftLeg ||
      !rightLeg ||
      !shield
    ) {
      return
    }

    const rotationDelta = normalizeAngle(facingAngle - root.rotation.y)

    if (Math.abs(rotationDelta) > 0.001) {
      root.rotation.y += rotationDelta * Math.min(1, delta * 10)
    }

    if (isMoving) {
      const walkCycle = elapsed * 10
      const armSwing = Math.sin(walkCycle) * 0.55
      const legSwing = Math.sin(walkCycle) * 0.65
      const bodyBob = Math.sin(walkCycle * 2) * 0.05

      body.position.y = 0.9 + bodyBob
      torso.rotation.x = bodyBob * 0.35
      head.rotation.x = -bodyBob * 0.25
      leftArm.rotation.x = armSwing
      rightArm.rotation.x = -armSwing
      leftLeg.rotation.x = -legSwing
      rightLeg.rotation.x = legSwing
      shield.rotation.z = 0.18 + Math.sin(walkCycle) * 0.08
    } else {
      const idleCycle = elapsed * 2.4
      const idleLift = Math.sin(idleCycle) * 0.03
      const idleSway = Math.sin(idleCycle * 0.5) * 0.04

      body.position.y = 0.9 + idleLift
      torso.rotation.x = idleLift * 0.18
      torso.rotation.z = idleSway * 0.25
      head.rotation.x = -idleLift * 0.12
      leftArm.rotation.x = -0.08 + idleLift * 0.45
      rightArm.rotation.x = 0.08 - idleLift * 0.45
      leftLeg.rotation.x = 0
      rightLeg.rotation.x = 0
      shield.rotation.z = 0.18 + idleSway * 0.12
    }
  })

  return (
    <group
      name={isMoving ? 'player-model-walk' : 'player-model-idle'}
      position={[position.x, position.y, position.z]}
      ref={rootRef}
    >
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.34, 0.42, 0.36, 8]} />
        <meshStandardMaterial color="#6a594b" roughness={0.96} />
      </mesh>

      <group name="player-body" position={[0, 0.9, 0]} ref={bodyRef}>
        <group name="player-left-leg" position={[-0.18, -0.52, 0.02]} ref={leftLegRef}>
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[0.16, 0.58, 0.18]} />
            <meshStandardMaterial color="#4f535e" roughness={0.88} />
          </mesh>
          <mesh castShadow position={[0, -0.58, 0.08]}>
            <boxGeometry args={[0.18, 0.1, 0.32]} />
            <meshStandardMaterial color="#473d34" roughness={0.96} />
          </mesh>
        </group>

        <group name="player-right-leg" position={[0.18, -0.52, 0.02]} ref={rightLegRef}>
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[0.16, 0.58, 0.18]} />
            <meshStandardMaterial color="#4f535e" roughness={0.88} />
          </mesh>
          <mesh castShadow position={[0, -0.58, 0.08]}>
            <boxGeometry args={[0.18, 0.1, 0.32]} />
            <meshStandardMaterial color="#473d34" roughness={0.96} />
          </mesh>
        </group>

        <group name="player-torso" ref={torsoRef}>
          <mesh castShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[0.62, 0.84, 0.42]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.56} metalness={0.2} />
          </mesh>
          <mesh castShadow position={[0, 0.12, 0.24]}>
            <boxGeometry args={[0.36, 0.24, 0.08]} />
            <meshStandardMaterial color="#8b7d6b" roughness={0.88} />
          </mesh>
          <mesh castShadow position={[0, -0.18, 0.24]}>
            <boxGeometry args={[0.18, 0.28, 0.08]} />
            <meshStandardMaterial color="#6b5b4f" roughness={0.92} />
          </mesh>
        </group>

        <group name="player-left-arm" position={[-0.42, 0.14, 0]} ref={leftArmRef}>
          <mesh castShadow position={[0, -0.26, 0]}>
            <boxGeometry args={[0.14, 0.64, 0.14]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.62} metalness={0.16} />
          </mesh>
        </group>

        <group position={[0.46, 0.12, -0.02]} rotation={[0, 0, -0.45]} ref={rightArmRef}>
          <mesh castShadow position={[0, -0.28, 0]}>
            <boxGeometry args={[0.14, 0.68, 0.14]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.62} metalness={0.16} />
          </mesh>
          <mesh castShadow position={[0.02, -0.68, 0]}>
            <boxGeometry args={[0.08, 0.52, 0.08]} />
            <meshStandardMaterial color="#5b6068" roughness={0.62} metalness={0.16} />
          </mesh>
        </group>

        <group name="player-shield" position={[-0.54, 0.06, -0.04]} ref={shieldRef}>
          <mesh castShadow rotation={[0, 0, 0.18]}>
            <boxGeometry args={[0.16, 0.62, 0.5]} />
            <meshStandardMaterial color="#6b5b4f" roughness={0.94} />
          </mesh>
        </group>

        <group name="player-helmet" position={[0, 0.7, 0]} ref={headRef}>
          <mesh castShadow position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.24, 12, 12]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.48} metalness={0.24} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.18]}>
            <boxGeometry args={[0.28, 0.18, 0.08]} />
            <meshStandardMaterial color="#8d938e" roughness={0.66} metalness={0.12} />
          </mesh>
          <mesh castShadow position={[0, 0.28, -0.02]}>
            <coneGeometry args={[0.18, 0.24, 4]} />
            <meshStandardMaterial color="#7a7f88" roughness={0.6} metalness={0.18} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
