<script lang="ts">
    import type { Snippet } from 'svelte';
    import LegacySidebar from '@/legacy/lib/components/Sidebar.svelte';
    import { sidebarOpen } from '@/legacy/lib/stores/ui.js';
    import type { BreadcrumbItem } from '@/types';

    let {
        breadcrumbs = [],
        children,
    }: {
        breadcrumbs?: BreadcrumbItem[];
        children?: Snippet;
    } = $props();
</script>

<div class="app-layout">
    <LegacySidebar />
    <main
        class="content"
        style:margin-left={$sidebarOpen
            ? 'var(--sidebar-width-open, 240px)'
            : 'var(--sidebar-width-closed, 70px)'}
    >
        {@render children?.()}
    </main>
</div>

<style>
    .app-layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        transition: margin-left 0.3s;
    }

    @media (max-width: 768px) {
        .content {
            margin-left: var(--sidebar-width-closed, 70px) !important;
        }
    }
</style>
