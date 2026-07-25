import { expect, test } from '@playwright/test';

test('homepage renders hero and primary CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText("We'll solve it");
  await expect(page.getByRole('link', { name: /Get a Custom Solution/i }).first()).toBeVisible();
});

test('navigating to login from navbar works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Log in' }).first().click();
  await expect(page).toHaveURL(/\/login/);
});
