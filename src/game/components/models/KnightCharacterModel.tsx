import { GltfModel, preloadGltfModel } from './GltfModel'

export const KNIGHT_CHARACTER_MODEL_PATH =
  '/Knight Character Animated by Quaternius/OBJ/KnightCharacter.glb'

export function KnightCharacterModel() {
  return <GltfModel path={KNIGHT_CHARACTER_MODEL_PATH} />
}

preloadGltfModel(KNIGHT_CHARACTER_MODEL_PATH)
