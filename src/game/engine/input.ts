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

function isEditableElement(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  )
}

export function getDirectionFromKey(key: string): keyof DirectionInput | null {
  return KEY_TO_DIRECTION[normalizeKey(key)] ?? null
}

export function shouldProcessMovementKey(event: KeyboardEvent) {
  const direction = getDirectionFromKey(event.key)

  if (!direction) {
    return false
  }

  if (event.type === 'keydown' && isEditableElement(event.target)) {
    return false
  }

  return true
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
