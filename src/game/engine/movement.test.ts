import { calculateNextPosition } from './movement'
import type { DirectionInput, Position3D } from '../types/game'

const origin: Position3D = { x: 0, y: 0, z: 0 }

function createInput(overrides: Partial<DirectionInput> = {}): DirectionInput {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    ...overrides,
  }
}

describe('calculateNextPosition', () => {
  it('returns the same position when no direction is active', () => {
    const result = calculateNextPosition(origin, createInput(), 1, 4)

    expect(result).toEqual(origin)
  })

  it('moves forward relative to the camera', () => {
    const result = calculateNextPosition(origin, createInput({ forward: true }), 1, 4)

    expect(result).toEqual({ x: 0, y: 0, z: -4 })
  })

  it('moves backward on the opposite z direction', () => {
    const result = calculateNextPosition(origin, createInput({ backward: true }), 1, 4)

    expect(result).toEqual({ x: 0, y: 0, z: 4 })
  })

  it('moves left on the x axis', () => {
    const result = calculateNextPosition(origin, createInput({ left: true }), 1, 4)

    expect(result).toEqual({ x: -4, y: 0, z: 0 })
  })

  it('moves right on the opposite x direction', () => {
    const result = calculateNextPosition(origin, createInput({ right: true }), 1, 4)

    expect(result).toEqual({ x: 4, y: 0, z: 0 })
  })

  it('normalizes diagonal movement', () => {
    const result = calculateNextPosition(
      origin,
      createInput({ forward: true, left: true }),
      1,
      4,
    )

    expect(result.x).toBeCloseTo(-2.828427, 5)
    expect(result.z).toBeCloseTo(-2.828427, 5)
  })

  it('respects delta', () => {
    const result = calculateNextPosition(origin, createInput({ forward: true }), 0.5, 4)

    expect(result).toEqual({ x: 0, y: 0, z: -2 })
  })

  it('respects speed', () => {
    const result = calculateNextPosition(origin, createInput({ forward: true }), 1, 7.5)

    expect(result).toEqual({ x: 0, y: 0, z: -7.5 })
  })

  it('does not mutate the original position object', () => {
    const currentPosition: Position3D = { x: 1, y: 2, z: 3 }

    const result = calculateNextPosition(
      currentPosition,
      createInput({ forward: true }),
      1,
      4,
    )

    expect(result).not.toBe(currentPosition)
    expect(currentPosition).toEqual({ x: 1, y: 2, z: 3 })
  })

  it('cancels opposite directions pressed at the same time', () => {
    const result = calculateNextPosition(
      origin,
      createInput({
        forward: true,
        backward: true,
        left: true,
        right: true,
      }),
      1,
      4,
    )

    expect(result).toEqual(origin)
  })
})
