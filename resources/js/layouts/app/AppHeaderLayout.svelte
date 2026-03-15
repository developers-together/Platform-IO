<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import type { Snippet } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';
    import AppContent from '@/components/AppContent.svelte';
    import AppHeader from '@/components/AppHeader.svelte';
    import AppShell from '@/components/AppShell.svelte';
    import type { BreadcrumbItem } from '@/types';

    let {
        breadcrumbs = [],
        children,
    }: {
        breadcrumbs?: BreadcrumbItem[];
        children?: Snippet;
    } = $props();

    const routeKey = $derived(`${$page.component}:${$page.url}`);
</script>

<AppShell variant="header" class="flex-col">
    <AppHeader {breadcrumbs} />
    <AppContent variant="header">
        {#key routeKey}
            <div
                class="fx-route-panel"
                in:fly={{
                    y: 18,
                    opacity: 0.35,
                    duration: 280,
                    easing: cubicOut,
                }}
                out:fade={{ duration: 130 }}
            >
                {@render children?.()}
            </div>
        {/key}
    </AppContent>
</AppShell>
