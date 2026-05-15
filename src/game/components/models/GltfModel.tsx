import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

import type { Object3D } from 'three'

export type GltfModelProps = {
  path: string
}

export function GltfModel({ path }: GltfModelProps) {
  const { scene } = useGLTF(path)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene) as Object3D, [scene])

  return <primitive castShadow object={clonedScene} receiveShadow />
}

export function preloadGltfModel(path: string) {
  useGLTF.preload(path)
}
