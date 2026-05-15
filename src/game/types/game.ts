export type Position3D = {
  x: number
  y: number
  z: number
}

export type DirectionInput = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export type GridMoveDirection = keyof DirectionInput

export type HexCoordinate = {
  q: number
  r: number
}

export type PlayerMotion = {
  facingAngle: number
  facingDirection: GridMoveDirection
  isMoving: boolean
}
