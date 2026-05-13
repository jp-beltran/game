import type { DirectionInput, Position3D } from '../types/game'

function resolveAxis(negativeDirection: boolean, positiveDirection: boolean) {
  return Number(negativeDirection) - Number(positiveDirection)
}

export function calculateNextPosition(
  currentPosition: Position3D,
  input: DirectionInput,
  delta: number,
  speed: number,
): Position3D {
  const horizontal = resolveAxis(input.left, input.right)
  const depth = resolveAxis(input.forward, input.backward)

  if (horizontal === 0 && depth === 0) {
    return { ...currentPosition }
  }

  const magnitude = Math.hypot(horizontal, depth)
  const distance = delta * speed

  return {
    x: currentPosition.x + (horizontal / magnitude) * distance,
    y: currentPosition.y,
    z: currentPosition.z + (depth / magnitude) * distance,
  }
}
