<script>
  import { onMount, onDestroy } from 'svelte';

  export let padding = 50;
  export let disabled = false;
  export let magnetStrength = 10;
  export let activeTransition = 'transform 0.2s ease-out';
  export let inactiveTransition = 'transform 0.4s ease-in-out';

  let magnetEl;
  let isActive = false;
  let posX = 0;
  let posY = 0;

  function handleMouseMove(e) {
    if (disabled || !magnetEl) return;

    const rect = magnetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = Math.abs(centerX - e.clientX);
    const distY = Math.abs(centerY - e.clientY);

    if (distX < rect.width / 2 + padding && distY < rect.height / 2 + padding) {
      isActive = true;
      posX = (e.clientX - centerX) / magnetStrength;
      posY = (e.clientY - centerY) / magnetStrength;
    } else {
      isActive = false;
      posX = 0;
      posY = 0;
    }
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
  });

  onDestroy(() => {
    window.removeEventListener('mousemove', handleMouseMove);
  });

  $: transitionStyle = isActive ? activeTransition : inactiveTransition;
</script>

<div bind:this={magnetEl} class="magnet-wrapper" style="position: relative; display: inline-block;">
  <div
    class="magnet-inner"
    style="transform: translate3d({posX}px, {posY}px, 0); transition: {transitionStyle}; will-change: transform;"
  >
    <slot />
  </div>
</div>
