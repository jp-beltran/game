import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import type { Group, AnimationAction } from 'three'

import { Helmet1Model } from './models/Helmet1Model'
import { ShoulderPadsModel } from './models/ShoulderPadsModel'
import { SwordModel } from './models/SwordModel'

const PLAYER_MODEL_PATH = "/Knight Character Animated by Quaternius/knight_animated.glb"

const IDLE_ANIMATION_NAMES = [
  "Idle",
  "idle",
  "Idle_Loop",
  "CharacterArmature|Idle",
  "Armature|Idle",
  "A_TPose",
]

const WALK_ANIMATION_NAMES = [
  "Walk",
  "walk",
  "Walk_Loop",
  "Walking",
  "Run",
  "run",
  "Run_swordRight",
  "Jog_Fwd_Loop",
  "CharacterArmature|Walk",
  "Armature|Walk",
]

const DEFAULT_POSITION: [number, number, number] = [0, 0, 0]
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0]
const DEFAULT_SCALE = 0.3

// Accessory Constants
const HELMET_HEAD_POSITION: [number, number, number] = [0, 5, -0.1]
const HELMET_HEAD_ROTATION: [number, number, number] = [0, 0, 0]
const HELMET_HEAD_SCALE = 1

const SHOULDER_PADS_POSITION: [number, number, number] = [0, 3.8, -.2]
const SHOULDER_PADS_ROTATION: [number, number, number] = [0, 0, 0]
const SHOULDER_PADS_SCALE = 1.1

const SWORD_HAND_POSITION: [number, number, number] = [0.85, 1.35, -0.2]
const SWORD_HAND_ROTATION: [number, number, number] = [-0.50, -2, -Math.PI / 4]
const SWORD_HAND_SCALE = 1

export type PlayerProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  isMoving?: boolean
}

export function Player({
  position = DEFAULT_POSITION,
  rotation = DEFAULT_ROTATION,
  scale = DEFAULT_SCALE,
  isMoving = false,
}: PlayerProps) {
  const groupRef = useRef<Group>(null)
  
  const { scene, animations } = useGLTF(PLAYER_MODEL_PATH)
  const clone = useMemo(() => {
    return SkeletonUtils.clone(scene) as Group
  }, [scene])
  
  const { actions } = useAnimations(animations, groupRef)

  const availableAnimationNames = useMemo(() => {
    return animations.map((animation) => animation.name)
  }, [animations])

  const currentActionRef = useRef<AnimationAction | null>(null)

  useEffect(() => {
    let selectedAnimationName: string | undefined

    if (isMoving) {
      selectedAnimationName = WALK_ANIMATION_NAMES.find(name => availableAnimationNames.includes(name))
      if (!selectedAnimationName) {
        console.warn("[Player] Walk animation not found, falling back to first available.")
        selectedAnimationName = availableAnimationNames[0]
      }
    } else {
      selectedAnimationName = IDLE_ANIMATION_NAMES.find(name => availableAnimationNames.includes(name))
      if (!selectedAnimationName) {
        selectedAnimationName = availableAnimationNames[0]
      }
    }

    if (import.meta.env.DEV) {
      console.log(`[Player] Available animations:`, availableAnimationNames)
      console.log(`[Player] Selected animation:`, selectedAnimationName)
    }

    if (selectedAnimationName && actions[selectedAnimationName]) {
      const nextAction = actions[selectedAnimationName]
      if (nextAction) {
        if (currentActionRef.current && currentActionRef.current !== nextAction) {
          currentActionRef.current.fadeOut(0.2)
        }
        
        nextAction.reset().fadeIn(0.2).play()
        currentActionRef.current = nextAction
      }
    }
  }, [actions, availableAnimationNames, isMoving])

  useEffect(() => {
    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.2)
      }
    }
  }, [])

  return (
    <group
      name="player-model-wrapper"
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    >
      <primitive object={clone} />

      {/* Armor and Accessories */}
      <group
        name="player-helmet-anchor"
        position={HELMET_HEAD_POSITION}
        rotation={HELMET_HEAD_ROTATION}
        scale={HELMET_HEAD_SCALE}
      >
        <Helmet1Model />
      </group>

      <group
        name="player-shoulder-pads-anchor"
        position={SHOULDER_PADS_POSITION}
        rotation={SHOULDER_PADS_ROTATION}
        scale={SHOULDER_PADS_SCALE}
      >
        <ShoulderPadsModel />
      </group>

      <group
        name="player-sword-anchor"
        position={SWORD_HAND_POSITION}
        rotation={SWORD_HAND_ROTATION}
        scale={SWORD_HAND_SCALE}
      >
        <SwordModel />
      </group>
    </group>
  )
}

useGLTF.preload(PLAYER_MODEL_PATH)
