import { render } from '@testing-library/react'

import { Player } from './Player'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

describe('Player', () => {
  it('renders a minimalist knight silhouette instead of a single capsule', () => {
    const { container } = render(
      <Player
        facingAngle={0}
        isMoving={false}
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(container.querySelector('group[name="player-model-idle"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-body"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-torso"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-helmet"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-shield"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-left-arm"]')).toBeInTheDocument()
    expect(container.querySelector('group[name="player-right-leg"]')).toBeInTheDocument()
  })

  it('uses a muted steel palette for the main armor pieces', () => {
    const { container } = render(
      <Player
        facingAngle={0}
        isMoving={false}
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(
      container.querySelector('meshstandardmaterial[color="#c0c0c0"]'),
    ).toBeInTheDocument()
  })

  it('marks the player as idle when there is no movement input', () => {
    const { container } = render(
      <Player
        facingAngle={0}
        isMoving={false}
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(container.querySelector('group[name="player-model-idle"]')).toBeInTheDocument()
  })

  it('marks the player as walking when there is movement input', () => {
    const { container } = render(
      <Player
        facingAngle={Math.PI / 3}
        isMoving
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(container.querySelector('group[name="player-model-walk"]')).toBeInTheDocument()
  })

  it('falls back to idle when direction is omitted', () => {
    const { container } = render(
      <Player
        facingAngle={0}
        isMoving={false}
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(container.querySelector('group[name="player-model-idle"]')).toBeInTheDocument()
  })
})
