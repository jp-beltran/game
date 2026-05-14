import { render } from '@testing-library/react'

import { Player } from './Player'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

describe('Player', () => {
  it('renders the player body with the updated color', () => {
    const { container } = render(
      <Player
        position={{ x: 0, y: 0, z: 0 }}
        onFrame={vi.fn()}
      />,
    )

    expect(
      container.querySelector('meshstandardmaterial'),
    ).toHaveAttribute('color', '#90a955')
  })
})
