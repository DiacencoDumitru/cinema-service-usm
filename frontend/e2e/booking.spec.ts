import { test, expect } from '@playwright/test';

test.describe('booking flow', () => {
  test.skip(!process.env.E2E_FULL_STACK, 'Set E2E_FULL_STACK=1 with backend running');

  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
