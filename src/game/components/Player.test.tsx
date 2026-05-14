import { render } from '@testing-library/react'

import { Player } from './Player'

const {
  mockAnimations,
  mockClonedScene,
  mockScene,
  skeletonCloneMock,
  useAnimationsMock,
  useGLTFMock,
} = vi.hoisted(() => {
  const mockAnimations = [{ duration: 1.2, name: 'Idle' }]
  const mockScene = { name: 'KnightScene' }
  const mockClonedScene = { name: 'KnightSceneClone' }
  const gltfMock = vi.fn(() => ({
    animations: mockAnimations,
    scene: mockScene,
  }))

  gltfMock.preload = vi.fn()

  return {
    mockAnimations,
    mockClonedScene,
    mockScene,
    skeletonCloneMock: vi.fn(() => mockClonedScene),
    useAnimationsMock: vi.fn(() => ({
      actions: {},
    })),
    useGLTFMock: gltfMock,
  }
})

type MockAction = {
  fadeIn: ReturnType<typeof vi.fn>
  fadeOut: ReturnType<typeof vi.fn>
  play: ReturnType<typeof vi.fn>
  reset: ReturnType<typeof vi.fn>
}

let mockActions: Record<string, MockAction> = {}

useAnimationsMock.mockImplementation(() => ({
  actions: mockActions,
}))

vi.mock('@react-three/drei', () => ({
  useAnimations: (...args: unknown[]) => useAnimationsMock(...args),
  useGLTF: useGLTFMock,
}))

vi.mock('three-stdlib', () => ({
  SkeletonUtils: {
    clone: (...args: unknown[]) => skeletonCloneMock(...args),
  },
}))

function createMockAction(): MockAction {
  const action = {
    fadeIn: vi.fn(),
    fadeOut: vi.fn(),
    play: vi.fn(),
    reset: vi.fn(),
  }

  action.reset.mockReturnValue(action)
  action.fadeIn.mockReturnValue(action)
  action.play.mockReturnValue(action)

  return action
}

describe('Player', () => {
  beforeEach(() => {
    mockActions = {}
    useGLTFMock.mockClear()
    useGLTFMock.preload.mockClear()
    useAnimationsMock.mockClear()
    skeletonCloneMock.mockClear()
  })

  it('loads the Quaternius knight asset from the public path', () => {
    const { container } = render(<Player position={[0, 0, 0]} />)

    expect(container.querySelector('group[name="player-model"]')).toBeInTheDocument()
    expect(container.querySelector('primitive')).toBeInTheDocument()
    expect(useGLTFMock).toHaveBeenCalledWith(
      '/Knight Character Animated by Quaternius/OBJ/KnightCharacter.glb',
    )
    expect(skeletonCloneMock).toHaveBeenCalledWith(mockScene)
  })

  it('plays the idle fallback animation when no explicit animation is requested', () => {
    const idleAction = createMockAction()
    mockActions = {
      Idle: idleAction,
    }

    const view = render(<Player />)

    expect(idleAction.reset).toHaveBeenCalledTimes(1)
    expect(idleAction.fadeIn).toHaveBeenCalledWith(0.2)
    expect(idleAction.play).toHaveBeenCalledTimes(1)

    view.unmount()

    expect(idleAction.fadeOut).toHaveBeenCalledWith(0.2)
  })

  it('plays the requested animation when the action exists', () => {
    const idleAction = createMockAction()
    const walkAction = createMockAction()
    mockActions = {
      Idle: idleAction,
      Walk: walkAction,
    }

    render(<Player animationName="Walk" />)

    expect(walkAction.reset).toHaveBeenCalledTimes(1)
    expect(walkAction.fadeIn).toHaveBeenCalledWith(0.2)
    expect(walkAction.play).toHaveBeenCalledTimes(1)
    expect(idleAction.reset).not.toHaveBeenCalled()
  })

  it('renders safely without trying to play a missing animation', () => {
    render(<Player animationName="Walk" />)

    expect(useAnimationsMock).toHaveBeenCalledWith(mockAnimations, expect.any(Object))
  })
})
