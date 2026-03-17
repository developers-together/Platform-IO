<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { sidebarOpen } from '$lib/stores/ui.js';
  import { token } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Auth guard — redirect to login if no token
  onMount(() => {
    const unsubscribe = token.subscribe((t) => {
      if (!t) goto('/login');
    });
    return unsubscribe;
  });
</script>

<div class="app-layout">
  <Sidebar />
  <main
    class="content"
    style="margin-left: {$sidebarOpen ? 'var(--sidebar-width-open, 240px)' : 'var(--sidebar-width-closed, 70px)'}"
  >
    <slot />
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
