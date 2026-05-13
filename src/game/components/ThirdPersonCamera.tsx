import { useFrame, useThree } from '@react-three/fiber'

import type { Position3D } from '../types/game'

const CAMERA_HEIGHT = 4
const CAMERA_DISTANCE = 7

type ThirdPersonCameraProps = {
  target: Position3D
}

export function ThirdPersonCamera({ target }: ThirdPersonCameraProps) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.set(target.x, target.y + CAMERA_HEIGHT, target.z + CAMERA_DISTANCE)
    camera.lookAt(target.x, target.y, target.z)
  })

  return null
}
