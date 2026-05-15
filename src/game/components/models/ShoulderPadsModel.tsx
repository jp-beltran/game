import { GltfModel, preloadGltfModel } from './GltfModel'

export const SHOULDER_PADS_MODEL_PATH =
  '/Knight Character Animated by Quaternius/OBJ/ShoulderPads.glb'

export function ShoulderPadsModel() {
  return <GltfModel path={SHOULDER_PADS_MODEL_PATH} />
}

preloadGltfModel(SHOULDER_PADS_MODEL_PATH)
