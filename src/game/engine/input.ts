import type { DirectionInput } from '../types/game'

const KEY_TO_DIRECTION: Record<string, keyof DirectionInput> = {
  w: 'forward',
  ArrowUp: 'forward',
  s: 'backward',
  ArrowDown: 'backward',
  a: 'left',
  ArrowLeft: 'left',
  d: 'right',
  ArrowRight: 'right',
}

function normalizeKey(key: string) {
  return key.length === 1 ? key.toLowerCase() : key
}

export function getDirectionFromKey(key: string): keyof DirectionInput | null {
  return KEY_TO_DIRECTION[normalizeKey(key)] ?? null
}

export function updateDirectionInput(
  currentInput: DirectionInput,
  key: string,
  isPressed: boolean,
): DirectionInput {
  const direction = getDirectionFromKey(key)

  if (!direction || currentInput[direction] === isPressed) {
    return currentInput
  }

  return {
    ...currentInput,
    [direction]: isPressed,
  }
}
