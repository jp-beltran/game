import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App', () => {
  it('renders the game shell heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /third person rpg mvp/i }),
    ).toBeInTheDocument()
  })

  it('renders the game container', () => {
    render(<App />)

    expect(screen.getByTestId('game-shell')).toBeInTheDocument()
  })

  it('renders the admin button', () => {
    render(<App />)

    expect(
      screen.getByRole('button', {
        name: /admin/i,
      }),
    ).toBeInTheDocument()
  })
})
