import type { GetVisibleTilesParams } from './types'
import type { HexCoordinate } from '../types/game'

export function getHexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function getTileKey(q: number, r: number): string {
  return `${q}:${r}`
}

export function getVisibleTiles({
  playerCoordinate,
  visionRange,
}: GetVisibleTilesParams): Set<string> {
  const visible = new Set<string>()
  const radius = visionRange
  
  for (let q = -radius; q <= radius; q++) {
    const minR = Math.max(-radius, -q - radius)
    const maxR = Math.min(radius, -q + radius)
    for (let r = minR; r <= maxR; r++) {
      const target = {
        q: playerCoordinate.q + q,
        r: playerCoordinate.r + r,
      }
      
      const dist = getHexDistance(playerCoordinate, target)

      if (dist <= visionRange) {
        visible.add(getTileKey(target.q, target.r))
      }
    }
  }

  return visible
}
