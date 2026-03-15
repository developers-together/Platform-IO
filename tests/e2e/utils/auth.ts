import type { BrowserContext, Page } from '@playwright/test';

export type AuthMode = 'none' | 'cookie' | 'credentials';

const getEnvValue = (key: string): string | undefined => {
    const value = process.env[key];
    return value?.trim() ? value.trim() : undefined;
};

export const getAuthMode = (): AuthMode => {
    if (getEnvValue('E2E_SESSION_COOKIE')) {
        return 'cookie';
    }

    if (getEnvValue('E2E_USER_EMAIL') && getEnvValue('E2E_USER_PASSWORD')) {
        return 'credentials';
    }

    return 'none';
};

export const authRequirementMessage =
    'Set E2E_SESSION_COOKIE or E2E_USER_EMAIL/E2E_USER_PASSWORD to enable authenticated E2E checks.';

const parseCookieHeader = (cookieHeader: string): Array<{
    name: string;
    value: string;
}> =>
    cookieHeader
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [name, ...rest] = part.split('=');
            return {
                name,
                value: rest.join('='),
            };
        })
        .filter((cookie) => cookie.name && cookie.value);

export const applySessionCookie = async (
    context: BrowserContext,
    baseURL: string,
    cookieHeader: string,
) => {
    const url = new URL(baseURL);
    const domain = url.hostname;
    const secure = url.protocol === 'https:';
    const cookies = parseCookieHeader(cookieHeader).map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain,
        path: '/',
        httpOnly: false,
        secure,
        sameSite: 'Lax' as const,
    }));

    if (cookies.length === 0) {
        throw new Error('E2E_SESSION_COOKIE provided, but no cookies were parsed.');
    }

    await context.addCookies(cookies);
};

export const loginWithCredentials = async (
    page: Page,
    email: string,
    password: string,
) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByTestId('login-button').click();
    await page.waitForLoadState('networkidle');
};

export const ensureAuthenticated = async (
    page: Page,
    context: BrowserContext,
    baseURL: string,
): Promise<AuthMode> => {
    const authMode = getAuthMode();

    if (authMode === 'cookie') {
        const cookieHeader = getEnvValue('E2E_SESSION_COOKIE');
        if (!cookieHeader) {
            throw new Error('E2E_SESSION_COOKIE is required for cookie auth.');
        }
        await applySessionCookie(context, baseURL, cookieHeader);
        return authMode;
    }

    if (authMode === 'credentials') {
        const email = getEnvValue('E2E_USER_EMAIL');
        const password = getEnvValue('E2E_USER_PASSWORD');
        if (!email || !password) {
            throw new Error('E2E_USER_EMAIL and E2E_USER_PASSWORD are required.');
        }
        await loginWithCredentials(page, email, password);
        return authMode;
    }

    throw new Error(authRequirementMessage);
};
