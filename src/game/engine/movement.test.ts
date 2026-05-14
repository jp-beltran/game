import {
  getAdjacentHexCoordinate,
  hexToWorldPosition,
  interpolatePosition,
} from './movement'

describe('getAdjacentHexCoordinate', () => {
  it('moves forward to the next axial row', () => {
    expect(getAdjacentHexCoordinate({ q: 0, r: 0 }, 'forward')).toEqual({ q: 0, r: -1 })
  })

  it('moves backward to the opposite axial row', () => {
    expect(getAdjacentHexCoordinate({ q: 0, r: 0 }, 'backward')).toEqual({ q: 0, r: 1 })
  })

  it('moves left to the previous axial column', () => {
    expect(getAdjacentHexCoordinate({ q: 0, r: 0 }, 'left')).toEqual({ q: -1, r: 0 })
  })

  it('moves right to the next axial column', () => {
    expect(getAdjacentHexCoordinate({ q: 0, r: 0 }, 'right')).toEqual({ q: 1, r: 0 })
  })

  it('does not mutate the original coordinate object', () => {
    const currentCoordinate = { q: 2, r: -1 }

    const result = getAdjacentHexCoordinate(currentCoordinate, 'forward')

    expect(result).not.toBe(currentCoordinate)
    expect(currentCoordinate).toEqual({ q: 2, r: -1 })
  })
})

describe('hexToWorldPosition', () => {
  it('keeps the origin hex centered at the world origin', () => {
    expect(hexToWorldPosition({ q: 0, r: 0 })).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('projects axial coordinates into pointy-top world coordinates', () => {
    const result = hexToWorldPosition({ q: 1, r: -1 })

    expect(result.x).toBeCloseTo(0.7794, 4)
    expect(result.z).toBeCloseTo(-1.35, 4)
  })
})

describe('interpolatePosition', () => {
  it('returns the start position at progress zero', () => {
    expect(
      interpolatePosition(
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: -2 },
        0,
      ),
    ).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('returns the end position at progress one', () => {
    expect(
      interpolatePosition(
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: -2 },
        1,
      ),
    ).toEqual({ x: 3, y: 0, z: -2 })
  })

  it('smoothly interpolates between two hex centers', () => {
    expect(
      interpolatePosition(
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: -2 },
        0.5,
      ),
    ).toEqual({ x: 1.5, y: 0, z: -1 })
  })
})
