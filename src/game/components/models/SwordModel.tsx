import { GltfModel, preloadGltfModel } from './GltfModel'

export const SWORD_MODEL_PATH = '/Knight Character Animated by Quaternius/OBJ/Sword.glb'

export function SwordModel() {
  return <GltfModel path={SWORD_MODEL_PATH} />
}

preloadGltfModel(SWORD_MODEL_PATH)
