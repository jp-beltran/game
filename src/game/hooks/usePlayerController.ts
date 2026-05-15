import { useEffect, useRef, useState } from 'react'

import {
  getAdjacentHexCoordinate,
  hexToWorldPosition,
  interpolatePosition,
} from '../engine/movement'
import { getDirectionFromKey, shouldProcessMovementKey } from '../engine/input'
import { useKeyboardMovement } from './useKeyboardMovement'
import type {
  GridMoveDirection,
  HexCoordinate,
  PlayerMotion,
  Position3D,
} from '../types/game'

type PlayerControllerOptions = {
  initialHex?: HexCoordinate
  stepDuration?: number
}

type ActiveStep = {
  direction: GridMoveDirection
  elapsed: number
  fromHex: HexCoordinate
  fromPosition: Position3D
  toHex: HexCoordinate
  toPosition: Position3D
}

const DEFAULT_HEX: HexCoordinate = {
  q: 0,
  r: 0,
}

const DEFAULT_STEP_DURATION = 0.18

function getFacingAngle(fromPosition: Position3D, toPosition: Position3D) {
  return Math.atan2(toPosition.x - fromPosition.x, toPosition.z - fromPosition.z)
}

export function usePlayerController(options: PlayerControllerOptions = {}) {
  const {
    initialHex = DEFAULT_HEX,
    stepDuration = DEFAULT_STEP_DURATION,
  } = options
  const input = useKeyboardMovement()
  const initialPosition = hexToWorldPosition(initialHex)
  const [hex, setHex] = useState<HexCoordinate>({ ...initialHex })
  const [position, setPosition] = useState<Position3D>(initialPosition)
  const [motion, setMotion] = useState<PlayerMotion>({
    facingAngle: 0,
    facingDirection: 'forward',
    isMoving: false,
  })
  const hexRef = useRef<HexCoordinate>({ ...initialHex })
  const activeStepRef = useRef<ActiveStep | null>(null)
  const queuedDirectionsRef = useRef<GridMoveDirection[]>([])

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.repeat || !shouldProcessMovementKey(event)) {
        return
      }

      const direction = getDirectionFromKey(event.key)

      if (!direction) {
        return
      }

      queuedDirectionsRef.current.push(direction)
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  function setIdleMotion() {
    setMotion((currentMotion) => {
      if (!currentMotion.isMoving) {
        return currentMotion
      }

      return {
        ...currentMotion,
        isMoving: false,
      }
    })
  }

  function settleStep(step: ActiveStep) {
    activeStepRef.current = null
    hexRef.current = step.toHex
    setHex(step.toHex)
    setPosition(step.toPosition)
    setIdleMotion()
  }

  function advanceStep(step: ActiveStep, delta: number) {
    const elapsed = step.elapsed + delta
    const progress = Math.min(1, elapsed / stepDuration)

    if (progress >= 1) {
      settleStep(step)
      return
    }

    activeStepRef.current = {
      ...step,
      elapsed,
    }
    setPosition(interpolatePosition(step.fromPosition, step.toPosition, progress))
  }

  function startStep(direction: GridMoveDirection, delta: number) {
    const fromHex = hexRef.current
    const toHex = getAdjacentHexCoordinate(fromHex, direction)
    const fromPosition = hexToWorldPosition(fromHex)
    const toPosition = hexToWorldPosition(toHex)

    setMotion({
      facingAngle: getFacingAngle(fromPosition, toPosition),
      facingDirection: direction,
      isMoving: true,
    })

    const step: ActiveStep = {
      direction,
      elapsed: 0,
      fromHex,
      fromPosition,
      toHex,
      toPosition,
    }

    activeStepRef.current = step
    advanceStep(step, delta)
  }

  function update(delta: number) {
    const activeStep = activeStepRef.current

    if (activeStep) {
      advanceStep(activeStep, delta)
      return
    }

    const nextDirection = queuedDirectionsRef.current.shift() ?? null

    if (!nextDirection) {
      setIdleMotion()
      return
    }

    startStep(nextDirection, delta)
  }

  return {
    hex,
    position,
    input,
    motion,
    update,
  }
}
