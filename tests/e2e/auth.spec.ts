import { expect, test } from '@playwright/test';

test.describe('public auth routes', () => {
    test('login page renders', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-button')).toBeVisible();
    });

    test('register page renders', async ({ page }) => {
        await page.goto('/register');
        await expect(page.getByTestId('register-user-button')).toBeVisible();
    });
});
