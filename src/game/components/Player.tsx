import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

import type { Group, Object3D } from 'three'

const PLAYER_MODEL_PATH = '/Knight Character Animated by Quaternius/OBJ/KnightCharacter.glb'
const DEFAULT_POSITION: [number, number, number] = [0, 0, 0]
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0]
const DEFAULT_SCALE = 0.3
const IDLE_ANIMATION_CANDIDATES = ['Idle', 'idle', 'CharacterArmature|Idle', 'Armature|Idle']

export type PlayerProps = {
  animationName?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

function resolveAnimationName(
  actions: Partial<Record<string, unknown>>,
  animationName?: string,
) {
  if (animationName && actions[animationName]) {
    return animationName
  }

  return IDLE_ANIMATION_CANDIDATES.find((candidate) => actions[candidate]) ?? null
}

export function Player({
  animationName,
  position = DEFAULT_POSITION,
  rotation = DEFAULT_ROTATION,
  scale = DEFAULT_SCALE,
}: PlayerProps) {
  const groupRef = useRef<Group>(null)
  const { animations, scene } = useGLTF(PLAYER_MODEL_PATH)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene) as Object3D, [scene])
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    const selectedAnimation = resolveAnimationName(actions, animationName)

    if (!selectedAnimation) {
      return
    }

    const action = actions[selectedAnimation]

    if (!action) {
      return
    }

    action.reset().fadeIn(0.2).play()

    return () => {
      action.fadeOut(0.2)
    }
  }, [actions, animationName])

  return (
    <group
      name="player-model"
      position={position}
      ref={groupRef}
      rotation={rotation}
      scale={scale}
    >
      {/*
        Ajuste `scale` e `rotation` no uso do componente se o cavaleiro aparecer
        grande, pequeno ou desalinhado em relacao ao tabuleiro/camera.
      */}
      <primitive castShadow object={clonedScene} receiveShadow />
    </group>
  )
}

useGLTF.preload(PLAYER_MODEL_PATH)
