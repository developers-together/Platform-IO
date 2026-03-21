import { page as inertiaPage } from '@inertiajs/svelte';
import { derived } from 'svelte/store';

const baseOrigin = 'http://localhost';

const toUrl = (value: string | undefined): URL => {
    const raw = typeof value === 'string' && value.length > 0 ? value : '/';

    try {
        const origin =
            typeof window !== 'undefined' ? window.location.origin : baseOrigin;
        return new URL(raw, origin);
    } catch {
        return new URL('/', baseOrigin);
    }
};

export const page = derived(inertiaPage, ($page) => ({
    ...$page,
    url: toUrl(typeof $page.url === 'string' ? $page.url : '/'),
}));
