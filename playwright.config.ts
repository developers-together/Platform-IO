import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost';

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: 'output/playwright',
    timeout: 30000,
    expect: {
        timeout: 10000,
    },
    reporter: [['list']],
    workers: 1,
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        testIdAttribute: 'data-test',
    },
});
