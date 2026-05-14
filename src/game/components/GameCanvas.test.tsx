import { render, screen } from '@testing-library/react'

import { GameCanvas } from './GameCanvas'

vi.mock('@react-three/fiber', async () => {
  const actual =
    await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber')

  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="r3f-canvas">{children}</div>
    ),
    useFrame: vi.fn(),
    useThree: () => ({
      camera: {
        position: {
          set: vi.fn(),
        },
        lookAt: vi.fn(),
      },
    }),
  }
})

describe('GameCanvas', () => {
  it('renders the game shell', () => {
    render(<GameCanvas />)

    expect(screen.getByTestId('game-shell')).toBeInTheDocument()
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('renders the player placeholder', () => {
    const { container } = render(<GameCanvas />)

    expect(container.querySelector('group[name="player-model-idle"]')).toBeInTheDocument()
  })

  it('renders a hex-tile world around the player', () => {
    const { container } = render(<GameCanvas />)

    expect(container.querySelector('mesh[name="hex-tile-0-0"]')).toBeInTheDocument()
    expect(container.querySelector('mesh[name="hex-tile-1--1"]')).toBeInTheDocument()
    expect(container.querySelectorAll('mesh[data-biome]').length).toBeGreaterThan(12)
  })

  it('shows the player position debug in test environment', () => {
    render(<GameCanvas />)

    expect(screen.getByTestId('player-position')).toBeInTheDocument()
  })

  it('shows the initial player position', () => {
    render(<GameCanvas />)

    expect(screen.getByTestId('player-position')).toHaveTextContent(
      'x: 0.00 | y: 0.00 | z: 0.00',
    )
  })
})
