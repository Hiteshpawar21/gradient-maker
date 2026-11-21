import { test, expect } from '@playwright/test'

test('placeholder page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Gradient Maker')).toBeVisible()
  await expect(page.getByText(/Phase 0/)).toBeVisible()
})
