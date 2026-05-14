import { expect, test } from '@playwright/test'

test('loads the app shell', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /third person rpg mvp/i }),
  ).toBeVisible()
  await expect(page.getByRole('region', { name: /codex chat/i })).toBeVisible()
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

test('shows the floating chat and submits a message', async ({ page }) => {
  await page.route('**/api/admin/agent/prompts', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'prompt-1',
        status: 'completed',
        message: 'Crafting inicial recebido pelo backend local.',
        pendingConfirmation: false,
      }),
    })
  })

  await page.goto('/')

  await page.getByLabel(/mensagem para o codex/i).fill('Adicionar crafting.')
  await page.getByRole('button', { name: /enviar mensagem/i }).click()

  await expect(page.getByText(/status: success/i)).toBeVisible()
  await expect(page.getByLabel(/mensagens do chat/i)).toContainText(
    /crafting inicial recebido pelo backend local/i,
  )
  await expect(page.getByLabel(/mensagens do chat/i)).toContainText(
    'Adicionar crafting.',
  )
})
