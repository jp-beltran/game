export type TileVisibility = 'visible' | 'hidden' | 'dimmed'

import type { GridMoveDirection, HexCoordinate } from '../types/game'

export type GetVisibleTilesParams = {
  playerCoordinate: HexCoordinate
  direction?: GridMoveDirection
  visionRange: number
  visionWidth?: number
}
