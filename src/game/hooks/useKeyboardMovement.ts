import { useEffect, useState } from 'react'

import { updateDirectionInput } from '../engine/input'
import type { DirectionInput } from '../types/game'

const INITIAL_INPUT: DirectionInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
}

export function useKeyboardMovement(): DirectionInput {
  const [input, setInput] = useState<DirectionInput>(INITIAL_INPUT)

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      setInput((currentInput) => updateDirectionInput(currentInput, event.key, true))
    }

    function handleKeyup(event: KeyboardEvent) {
      setInput((currentInput) => updateDirectionInput(currentInput, event.key, false))
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [])

  return input
}
