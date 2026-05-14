import { useFrame, useThree } from '@react-three/fiber'

import type { Position3D } from '../types/game'

const CAMERA_HEIGHT = 7.2
const CAMERA_DISTANCE = 6.4
const CAMERA_SIDE_OFFSET = 5.8
const CAMERA_LOOK_HEIGHT = 0.9
const CAMERA_FOLLOW_SPEED = 4.5

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha
}

type ThirdPersonCameraProps = {
  target: Position3D
}

export function ThirdPersonCamera({ target }: ThirdPersonCameraProps) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const smoothing = 1 - Math.exp(-delta * CAMERA_FOLLOW_SPEED)
    const nextX = target.x + CAMERA_SIDE_OFFSET
    const nextY = target.y + CAMERA_HEIGHT
    const nextZ = target.z + CAMERA_DISTANCE

    camera.position.set(
      lerp(camera.position.x, nextX, smoothing),
      lerp(camera.position.y, nextY, smoothing),
      lerp(camera.position.z, nextZ, smoothing),
    )
    camera.lookAt(target.x, target.y + CAMERA_LOOK_HEIGHT, target.z)
  })

  return null
}
