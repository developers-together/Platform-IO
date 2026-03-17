<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sidebarOpen } from '$lib/stores/ui.js';
  import { onMount, onDestroy } from 'svelte';

  const topMenu = [
    { icon: 'menu', label: 'Menu', href: null },
    { icon: 'home', label: 'Dashboard', href: '/dashboard' },
    { icon: 'message-square', label: 'Chat', href: '/chat' },
    { icon: 'check-square', label: 'Tasks', href: '/tasks' },
    { icon: 'calendar', label: 'Calendar', href: '/calendar' },
    { icon: 'folder', label: 'Shared File System', href: '/files' },
    { icon: 'fan', label: 'AI', href: '/ai' },
  ];

  const bottomMenu = [
    { icon: 'user', label: 'Profile', href: '/profile' },
  ];

  let aiRotation = 0;
  let aiHovered = false;
  let animationFrame;
  let prevTime = null;

  function animate(time) {
    if (prevTime === null) prevTime = time;
    const delta = time - prevTime;
    prevTime = time;

    const isAIPage = $page.url.pathname === '/ai';
    let speed;
    if (isAIPage) {
      speed = aiHovered ? 360 / 1250 : 360 / 2500;
    } else {
      speed = aiHovered ? 360 / 5000 : 360 / 10000;
    }

    aiRotation = (aiRotation + speed * delta) % 360;
    animationFrame = requestAnimationFrame(animate);
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  function handleNav(item) {
    if (item.label === 'Menu') {
      $sidebarOpen = !$sidebarOpen;
    } else if (item.href) {
      goto(item.href);
    }
  }

  function isActive(href) {
    return $page.url.pathname === href;
  }

  // SVG icon paths (feather icons)
  const icons = {
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    fan: '<path d="M258.6 0c-1.7 0-3.4.1-5.1.5C168 17 115.6 102.3 130.5 189.3c2.9 17 8.4 32.9 15.9 47.4L32 224l-2.6 0C13.2 224 0 237.2 0 253.4c0 1.7.1 3.4.5 5.1C17 344 102.3 396.4 189.3 381.5c17-2.9 32.9-8.4 47.4-15.9L224 480l0 2.6c0 16.2 13.2 29.4 29.4 29.4 1.7 0 3.4-.1 5.1-.5C344 495 396.4 409.7 381.5 322.7c-2.9-17-8.4-32.9-15.9-47.4L480 288l2.6 0c16.2 0 29.4-13.2 29.4-29.4 0-1.7-.1-3.4-.5-5.1C495 168 409.7 115.6 322.7 130.5c-17 2.9-32.9 8.4-47.4 15.9L288 32l0-2.6C288 13.2 274.8 0 258.6 0zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  };
</script>

<div class="sidebar" class:open={$sidebarOpen} class:closed={!$sidebarOpen}>
  <div class="menu-section top-menu">
    {#each topMenu as item}
      <div
        class="sidebar-item"
        class:active={isActive(item.href)}
        class:ai={item.label === 'AI'}
        role="button"
        tabindex="0"
        on:click={() => handleNav(item)}
        on:mouseenter={() => { if (item.label === 'AI') aiHovered = true; }}
        on:mouseleave={() => { if (item.label === 'AI') aiHovered = false; }}
        on:keydown={(e) => { if (e.key === 'Enter') handleNav(item); }}
      >
        <span
          class="icon"
          style={item.label === 'AI' ? `transform: rotate(${aiRotation}deg)` : ''}
        >
          {#if item.icon === 'fan'}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
              {@html icons.fan}
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {@html icons[item.icon]}
            </svg>
          {/if}
        </span>
        {#if $sidebarOpen}
          <span class="label" class:ai-label={item.label === 'AI'}>{item.label}</span>
        {/if}
      </div>
    {/each}
  </div>
  <div class="menu-section bottom-menu">
    {#each bottomMenu as item}
      <div
        class="sidebar-item"
        class:active={isActive(item.href)}
        role="button"
        tabindex="0"
        on:click={() => handleNav(item)}
        on:keydown={(e) => { if (e.key === 'Enter') handleNav(item); }}
      >
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {@html icons[item.icon]}
          </svg>
        </span>
        {#if $sidebarOpen}
          <span class="label">{item.label}</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  /* Sidebar container — exact match to React */
  .sidebar {
    text-align: center;
    height: 100vh;
    background: var(--sidebar-bg, linear-gradient(135deg, #2b5ce7, #0052d4));
    color: #fff;
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background-image: url('/bg.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    z-index: var(--z-sidebar, 100);
    position: fixed;
    left: 0;
    top: 0;
  }

  .sidebar.open { width: var(--sidebar-width-open, 240px); }
  .sidebar.closed { width: var(--sidebar-width-closed, 70px); }

  /* Menu sections */
  .menu-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
    text-align: center;
  }
  .menu-section.bottom-menu {
    margin-top: auto;
    margin-bottom: 10px;
  }

  /* Sidebar items — exact React CSS */
  .sidebar-item {
    display: flex;
    padding: 12px 16px;
    margin: 4px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    align-items: center;
    justify-content: baseline;
    gap: 10px;
    text-align: center;
    white-space: nowrap;
  }

  .sidebar-item:hover {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(2.5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .sidebar-item.active {
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(10px);
  }

  /* AI item specifics */
  .sidebar-item.ai :global(.icon svg path) {
    fill: #8e44ad !important;
    stroke: #fff !important;
    stroke-width: 0.5px !important;
    stroke-linejoin: round !important;
    stroke-linecap: round !important;
    paint-order: fill stroke !important;
    vector-effect: non-scaling-stroke;
  }

  .sidebar-item.ai:hover :global(.icon svg) {
    transform: scale(1.1);
  }
  .sidebar-item.ai:hover .label {
    transform: scale(1.1);
  }

  /* Icon container */
  .icon {
    font-size: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    transform-origin: center;
    min-width: 24px;
  }

  /* Label text */
  .label {
    font-size: 1rem;
    font-weight: 500;
    align-self: center;
    text-align: center;
  }
  .ai-label {
    font-style: normal;
    font-weight: 700;
    font-size: 1.1rem;
  }

  /* Mobile: sidebar overlay */
  @media (max-width: 768px) {
    .sidebar.open {
      width: 220px;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
    }
  }
</style>
