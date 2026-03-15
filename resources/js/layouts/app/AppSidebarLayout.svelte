<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import type { Snippet } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';
    import AppContent from '@/components/AppContent.svelte';
    import AppShell from '@/components/AppShell.svelte';
    import AppSidebar from '@/components/AppSidebar.svelte';
    import AppSidebarHeader from '@/components/AppSidebarHeader.svelte';
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

<AppShell variant="sidebar">
    <AppSidebar />
    <AppContent variant="sidebar" class="overflow-x-hidden">
        <AppSidebarHeader {breadcrumbs} />
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
