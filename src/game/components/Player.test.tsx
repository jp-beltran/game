import { render } from '@testing-library/react'

import { Player } from './Player'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

describe('Player', () => {
  it('renders a minimalist knight silhouette instead of a single capsule', () => {
    render(
      <Player
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(document.querySelector('[data-testid="player-model"]')).toBeInTheDocument()
    expect(document.querySelector('[data-testid="player-torso"]')).toBeInTheDocument()
    expect(document.querySelector('[data-testid="player-helmet"]')).toBeInTheDocument()
    expect(document.querySelector('[data-testid="player-shield"]')).toBeInTheDocument()
  })

  it('uses a muted steel palette for the main armor pieces', () => {
    const { container } = render(
      <Player
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(
      container.querySelector('meshstandardmaterial[color="#c0c0c0"]'),
    ).toBeInTheDocument()
  })
})
