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
    render(<GameCanvas />)

    expect(screen.getByTestId('player-model')).toBeInTheDocument()
  })

  it('renders the diorama landmarks around the player', () => {
    render(<GameCanvas />)

    expect(screen.getByTestId('world-plaza')).toBeInTheDocument()
    expect(screen.getByTestId('world-house-west')).toBeInTheDocument()
    expect(screen.getByTestId('world-border-north')).toBeInTheDocument()
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
