import { GltfModel, preloadGltfModel } from './GltfModel'

export const HELMET1_MODEL_PATH = '/Knight Character Animated by Quaternius/OBJ/Helmet1.glb'

export function Helmet1Model() {
  return <GltfModel path={HELMET1_MODEL_PATH} />
}

preloadGltfModel(HELMET1_MODEL_PATH)
