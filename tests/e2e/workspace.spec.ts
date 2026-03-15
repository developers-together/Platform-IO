import { expect, test } from '@playwright/test';
import {
    authRequirementMessage,
    ensureAuthenticated,
    getAuthMode,
} from './utils/auth';

const authMode = getAuthMode();

const authenticatedRoutes = [
    { path: '/dashboard', testId: 'dashboard-page' },
    { path: '/workspace/teams', testId: 'teams-page' },
    { path: '/workspace/tasks', testId: 'tasks-page' },
    { path: '/workspace/calendar', testId: 'calendar-page' },
    { path: '/workspace/chat', testId: 'chat-page' },
    { path: '/workspace/files', testId: 'files-page' },
    { path: '/workspace/ai', testId: 'ai-page' },
    { path: '/settings/profile', testId: 'settings-profile-page' },
];

test.describe('unauthenticated guardrails', () => {
    test('dashboard redirects to login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.getByTestId('login-button')).toBeVisible();
    });

    test('workspace routes redirect to login', async ({ page }) => {
        await page.goto('/workspace/teams');
        await expect(page.getByTestId('login-button')).toBeVisible();
    });
});

test.describe('authenticated routes', () => {
    test.skip(authMode === 'none', authRequirementMessage);

    test('core workspace pages render', async ({ page, context }, testInfo) => {
        const baseURL =
            (testInfo.project.use.baseURL as string | undefined) ??
            'http://localhost';

        await ensureAuthenticated(page, context, baseURL);

        for (const route of authenticatedRoutes) {
            await page.goto(route.path);
            await expect(page.getByTestId(route.testId)).toBeVisible();
        }
    });
});
