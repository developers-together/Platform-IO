import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
    authRequirementMessage,
    ensureAuthenticated,
    getAuthMode,
} from './utils/auth';

const authMode = getAuthMode();
const strictMode = process.env.E2E_A11Y_STRICT === 'true';

const expectNoA11yViolations = async (page: Page) => {
    const results = await new AxeBuilder({ page }).analyze();
    const violations = strictMode
        ? results.violations
        : results.violations.filter(
              (violation) =>
                  violation.impact === 'critical' ||
                  violation.impact === 'serious',
          );

    expect(violations).toEqual([]);
};

test.describe('public accessibility checks', () => {
    test('welcome page has no critical/serious violations', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('welcome-page')).toBeVisible();
        await expectNoA11yViolations(page);
    });

    test('login page has no critical/serious violations', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-button')).toBeVisible();
        await expectNoA11yViolations(page);
    });
});

test.describe('authenticated accessibility checks', () => {
    test.skip(authMode === 'none', authRequirementMessage);

    test('dashboard has no critical/serious violations', async ({
        page,
        context,
    }, testInfo) => {
        const baseURL =
            (testInfo.project.use.baseURL as string | undefined) ??
            'http://localhost';

        await ensureAuthenticated(page, context, baseURL);
        await page.goto('/dashboard');
        await expect(page.getByTestId('dashboard-page')).toBeVisible();
        await expectNoA11yViolations(page);
    });
});
