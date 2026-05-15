import { render } from '@testing-library/react'

import { Player } from './Player'

const {
  mockAnimations,
  mockClonedScene,
  mockClonedHelmetScene,
  mockHelmetScene,
  mockClonedShoulderPadsScene,
  mockShoulderPadsScene,
  mockClonedSwordScene,
  mockSwordScene,
  mockScene,
  skeletonCloneMock,
  useAnimationsMock,
  useGLTFMock,
} = vi.hoisted(() => {
  const mockAnimations = [{ duration: 1.2, name: 'Idle' }]
  const mockScene = { name: 'KnightScene' }
  const mockClonedScene = { name: 'KnightSceneClone' }
  const mockHelmetScene = { name: 'HelmetScene' }
  const mockClonedHelmetScene = { name: 'HelmetSceneClone' }
  const mockShoulderPadsScene = { name: 'ShoulderPadsScene' }
  const mockClonedShoulderPadsScene = { name: 'ShoulderPadsSceneClone' }
  const mockSwordScene = { name: 'SwordScene' }
  const mockClonedSwordScene = { name: 'SwordSceneClone' }
  const gltfMock = vi.fn((path: string) => {
    if (path.includes('Helmet1.glb')) {
      return {
        animations: [],
        scene: mockHelmetScene,
      }
    }

    if (path.includes('ShoulderPads.glb')) {
      return {
        animations: [],
        scene: mockShoulderPadsScene,
      }
    }

    if (path.includes('Sword.glb')) {
      return {
        animations: [],
        scene: mockSwordScene,
      }
    }

    return {
      animations: mockAnimations,
      scene: mockScene,
    }
  })

  gltfMock.preload = vi.fn()

  return {
    mockAnimations,
    mockClonedScene,
    mockClonedHelmetScene,
    mockHelmetScene,
    mockClonedShoulderPadsScene,
    mockShoulderPadsScene,
    mockClonedSwordScene,
    mockSwordScene,
    mockScene,
    skeletonCloneMock: vi.fn((scene: unknown) =>
      scene === mockHelmetScene
        ? mockClonedHelmetScene
        : scene === mockShoulderPadsScene
          ? mockClonedShoulderPadsScene
          : scene === mockSwordScene
            ? mockClonedSwordScene
            : mockClonedScene,
    ),
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
    expect(container.querySelectorAll('primitive')).toHaveLength(4)
    expect(useGLTFMock).toHaveBeenCalledWith(
      '/Knight Character Animated by Quaternius/OBJ/KnightCharacter.glb',
    )
    expect(useGLTFMock).toHaveBeenCalledWith(
      '/Knight Character Animated by Quaternius/OBJ/Helmet1.glb',
    )
    expect(useGLTFMock).toHaveBeenCalledWith(
      '/Knight Character Animated by Quaternius/OBJ/ShoulderPads.glb',
    )
    expect(useGLTFMock).toHaveBeenCalledWith(
      '/Knight Character Animated by Quaternius/OBJ/Sword.glb',
    )
    expect(skeletonCloneMock).toHaveBeenCalledWith(mockScene)
    expect(skeletonCloneMock).toHaveBeenCalledWith(mockHelmetScene)
    expect(skeletonCloneMock).toHaveBeenCalledWith(mockShoulderPadsScene)
    expect(skeletonCloneMock).toHaveBeenCalledWith(mockSwordScene)
  })

  it('renders the armor pieces and sword in dedicated anchor groups', () => {
    const { container } = render(<Player />)
    const helmetAnchor = container.querySelector(
      'group[name="player-model"] > group[name="player-helmet-anchor"]',
    )
    const shoulderPadsAnchor = container.querySelector(
      'group[name="player-model"] > group[name="player-shoulder-pads-anchor"]',
    )
    const swordAnchor = container.querySelector(
      'group[name="player-model"] > group[name="player-sword-anchor"]',
    )

    expect(helmetAnchor).toBeInTheDocument()
    expect(helmetAnchor).toHaveAttribute('position', '0,5,-0.1')
    expect(shoulderPadsAnchor).toBeInTheDocument()
    expect(shoulderPadsAnchor).toHaveAttribute('position', '0,3.4,0')
    expect(swordAnchor).toBeInTheDocument()
    expect(swordAnchor).toHaveAttribute('position', '1.55,2.15,0.1')
    expect(swordAnchor).toHaveAttribute('rotation', '-0.25,-2,-1.0471975511965976')
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
