import { expect, test } from '@playwright/test'

test('loads the app shell', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /third person rpg mvp/i }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /admin/i })).toBeVisible()
  await expect(page.getByTestId('game-shell')).toBeVisible()
  await expect(page.locator('[data-testid="game-shell"] canvas')).toBeVisible()
})

test('moves the player forward with W', async ({ page }) => {
  await page.goto('/')

  const positionDebug = page.getByTestId('player-position')

  await expect(positionDebug).toHaveText(/x: 0.00 \| y: 0.00 \| z: 0.00/)

  await page.keyboard.down('w')

  await expect(positionDebug).not.toHaveText(/x: 0.00 \| y: 0.00 \| z: 0.00/)

  await page.keyboard.up('w')
})
