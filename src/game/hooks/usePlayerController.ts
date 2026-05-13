import { useState } from 'react'

import { calculateNextPosition } from '../engine/movement'
import { useKeyboardMovement } from './useKeyboardMovement'
import type { Position3D } from '../types/game'

type PlayerControllerOptions = {
  initialPosition?: Position3D
  speed?: number
}

const DEFAULT_POSITION: Position3D = {
  x: 0,
  y: 0,
  z: 0,
}

const DEFAULT_SPEED = 4

export function usePlayerController(options: PlayerControllerOptions = {}) {
  const { initialPosition = DEFAULT_POSITION, speed = DEFAULT_SPEED } = options
  const input = useKeyboardMovement()
  const [position, setPosition] = useState<Position3D>(initialPosition)

  function update(delta: number) {
    setPosition((currentPosition) =>
      calculateNextPosition(currentPosition, input, delta, speed),
    )
  }

  return {
    position,
    input,
    update,
  }
}
