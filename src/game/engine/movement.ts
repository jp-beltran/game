import type {
  GridMoveDirection,
  HexCoordinate,
  Position3D,
} from '../types/game'

export const HEX_TILE_RADIUS = 0.9
export const HEX_TILE_HEIGHT = 0.84

const HEX_DIRECTION_VECTORS: Record<GridMoveDirection, HexCoordinate> = {
  forward: { q: 0, r: -1 },
  backward: { q: 0, r: 1 },
  left: { q: -1, r: 0 },
  right: { q: 1, r: 0 },
}

export function getAdjacentHexCoordinate(
  currentCoordinate: HexCoordinate,
  direction: GridMoveDirection,
): HexCoordinate {
  const offset = HEX_DIRECTION_VECTORS[direction]

  return {
    q: currentCoordinate.q + offset.q,
    r: currentCoordinate.r + offset.r,
  }
}

export function hexToWorldPosition(coordinate: HexCoordinate): Position3D {
  return {
    x: HEX_TILE_RADIUS * Math.sqrt(3) * (coordinate.q + coordinate.r / 2),
    y: 0,
    z: HEX_TILE_RADIUS * 1.5 * coordinate.r,
  }
}

export function interpolatePosition(
  start: Position3D,
  end: Position3D,
  progress: number,
): Position3D {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
    z: start.z + (end.z - start.z) * progress,
  }
}
