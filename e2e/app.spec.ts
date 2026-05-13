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
