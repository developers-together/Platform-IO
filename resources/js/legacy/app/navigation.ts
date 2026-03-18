import { router } from '@inertiajs/svelte';

export async function goto(href: string): Promise<void> {
    router.visit(href);
}
