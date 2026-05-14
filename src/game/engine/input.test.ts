import { act, renderHook } from '@testing-library/react'

import { getDirectionFromKey, updateDirectionInput } from './input'
import { useKeyboardMovement } from '../hooks/useKeyboardMovement'
import { usePlayerController } from '../hooks/usePlayerController'
import type { DirectionInput } from '../types/game'

function createInput(overrides: Partial<DirectionInput> = {}): DirectionInput {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    ...overrides,
  }
}

describe('getDirectionFromKey', () => {
  it('maps w to forward', () => {
    expect(getDirectionFromKey('w')).toBe('forward')
  })

  it('maps ArrowUp to forward', () => {
    expect(getDirectionFromKey('ArrowUp')).toBe('forward')
  })

  it('maps s to backward', () => {
    expect(getDirectionFromKey('s')).toBe('backward')
  })

  it('maps a to left', () => {
    expect(getDirectionFromKey('a')).toBe('left')
  })

  it('maps d to right', () => {
    expect(getDirectionFromKey('d')).toBe('right')
  })

  it('ignores unknown keys', () => {
    expect(getDirectionFromKey('Enter')).toBeNull()
  })
})

describe('updateDirectionInput', () => {
  it('marks direction as true on keydown', () => {
    const result = updateDirectionInput(createInput(), 'w', true)

    expect(result).toEqual(createInput({ forward: true }))
  })

  it('marks direction as false on keyup', () => {
    const result = updateDirectionInput(
      createInput({ forward: true }),
      'w',
      false,
    )

    expect(result).toEqual(createInput())
  })

  it('does not mutate the previous input object', () => {
    const currentInput = createInput()

    const result = updateDirectionInput(currentInput, 'w', true)

    expect(result).not.toBe(currentInput)
    expect(currentInput).toEqual(createInput())
  })
})

describe('useKeyboardMovement', () => {
  it('updates state from keyboard events and ignores unknown keys', () => {
    const { result } = renderHook(() => useKeyboardMovement())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
    })

    expect(result.current.forward).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current).toEqual(createInput({ forward: true }))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }))
    })

    expect(result.current).toEqual(createInput())
  })

  it('ignores movement keys while typing in an editable field', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const { result, unmount } = renderHook(() => useKeyboardMovement())

    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          key: 'w',
        }),
      )
    })

    expect(result.current).toEqual(createInput())

    unmount()
    textarea.remove()
  })

  it('registers and cleans up keyboard listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyboardMovement())

    const keydownCall = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'keydown',
    )
    const keyupCall = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'keyup',
    )

    unmount()

    expect(keydownCall?.[1]).toEqual(expect.any(Function))
    expect(keyupCall?.[1]).toEqual(expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', keydownCall?.[1])
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', keyupCall?.[1])

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})

describe('usePlayerController', () => {
  it('keeps the initial position and exposes input', () => {
    const { result } = renderHook(() =>
      usePlayerController({
        initialPosition: { x: 1, y: 2, z: 3 },
        speed: 6,
      }),
    )

    expect(result.current.position).toEqual({ x: 1, y: 2, z: 3 })
    expect(result.current.input).toEqual(createInput())
  })

  it('advances the player position using keyboard input and delta', () => {
    const { result } = renderHook(() => usePlayerController())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
    })

    act(() => {
      result.current.update(0.5)
    })

    expect(result.current.input).toEqual(createInput({ forward: true }))
    expect(result.current.position).toEqual({ x: 0, y: 0, z: -2 })
  })
})
