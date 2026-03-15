import { expect, test } from '@playwright/test';
import {
    authRequirementMessage,
    ensureAuthenticated,
    getAuthMode,
} from './utils/auth';

const authMode = getAuthMode();
const perfEnabled = process.env.E2E_PERF === 'true';

const perfSkipMessage =
    'Set E2E_PERF=true to run performance budgets (requires a running UI server).';

const perfBudgets = {
    lcp: 2500,
    inp: 200,
    cls: 0.1,
};

const attachPerfObservers = () => {
    const metrics = {
        lcp: 0,
        cls: 0,
        inp: 0,
    };

    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    metrics.lcp = Math.max(metrics.lcp, entry.startTime);
                }
            });
            lcpObserver.observe({
                type: 'largest-contentful-paint',
                buffered: true,
            });
        } catch {
            // Ignore unsupported LCP observer.
        }

        try {
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const shift = entry as PerformanceEntry & {
                        value?: number;
                        hadRecentInput?: boolean;
                    };
                    if (!shift.hadRecentInput && typeof shift.value === 'number') {
                        metrics.cls += shift.value;
                    }
                }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
            // Ignore unsupported CLS observer.
        }

        try {
            const inpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const eventEntry = entry as PerformanceEntry & {
                        duration?: number;
                    };
                    if (typeof eventEntry.duration === 'number') {
                        metrics.inp = Math.max(metrics.inp, eventEntry.duration);
                    }
                }
            });
            inpObserver.observe({
                type: 'event',
                buffered: true,
                durationThreshold: 40,
            });
        } catch {
            // Ignore unsupported INP observer.
        }
    }

    (window as typeof window & { __perfMetrics?: typeof metrics }).__perfMetrics =
        metrics;
};

test.describe('performance budgets', () => {
    test.skip(!perfEnabled, perfSkipMessage);

    test('welcome page meets budgets', async ({ page }) => {
        await page.addInitScript(attachPerfObservers);
        await page.goto('/');
        await page.click('body');
        await page.waitForTimeout(1000);

        const metrics = await page.evaluate(
            () =>
                (window as typeof window & {
                    __perfMetrics?: { lcp: number; cls: number; inp: number };
                }).__perfMetrics ?? { lcp: 0, cls: 0, inp: 0 },
        );

        expect(metrics.lcp).toBeGreaterThan(0);
        expect(metrics.lcp).toBeLessThanOrEqual(perfBudgets.lcp);
        expect(metrics.cls).toBeLessThanOrEqual(perfBudgets.cls);
        expect(metrics.inp).toBeLessThanOrEqual(perfBudgets.inp);
    });

    test.describe('authenticated budgets', () => {
        test.skip(authMode === 'none', authRequirementMessage);

        test('dashboard meets budgets', async ({
            page,
            context,
        }, testInfo) => {
            const baseURL =
                (testInfo.project.use.baseURL as string | undefined) ??
                'http://localhost';

            await page.addInitScript(attachPerfObservers);
            await ensureAuthenticated(page, context, baseURL);
            await page.goto('/dashboard');
            await page.click('body');
            await page.waitForTimeout(1000);

            const metrics = await page.evaluate(
                () =>
                    (window as typeof window & {
                        __perfMetrics?: {
                            lcp: number;
                            cls: number;
                            inp: number;
                        };
                    }).__perfMetrics ?? { lcp: 0, cls: 0, inp: 0 },
            );

            expect(metrics.lcp).toBeGreaterThan(0);
            expect(metrics.lcp).toBeLessThanOrEqual(perfBudgets.lcp);
            expect(metrics.cls).toBeLessThanOrEqual(perfBudgets.cls);
            expect(metrics.inp).toBeLessThanOrEqual(perfBudgets.inp);
        });
    });
});
