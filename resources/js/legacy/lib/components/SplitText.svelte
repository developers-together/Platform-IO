<svelte:options runes={false} />

<script>
  import { onMount } from 'svelte';

  export let text = '';
  export let className = '';
  export let delay = 100;

  let letters = [];
  let visible = false;
  let containerEl;

  // Split text into words, then each word into letters
  $: {
    const words = text.split(' ');
    letters = [];
    let globalIndex = 0;
    words.forEach((word, wi) => {
      word.split('').forEach((char) => {
        letters.push({ char, index: globalIndex, wordIndex: wi });
        globalIndex++;
      });
      // Add space after each word except last
      if (wi < words.length - 1) {
        letters.push({ char: '\u00A0', index: globalIndex, wordIndex: wi, isSpace: true });
        globalIndex++;
      }
    });
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );
    observer.observe(containerEl);
    return () => observer.disconnect();
  });
</script>

<p bind:this={containerEl} class="split-parent {className}" style="text-align: center; display: inline; white-space: normal; word-wrap: break-word;">
  {#each letters as letter (letter.index)}
    <span
      class="split-letter"
      class:visible
      style="animation-delay: {letter.index * delay}ms;"
    >{letter.char}</span>
  {/each}
</p>

<style>
  .split-parent {
    overflow: hidden;
  }

  .split-letter {
    display: inline-block;
    opacity: 0;
    transform: translate3d(0, 50px, 0);
    will-change: transform, opacity;
  }

  .split-letter.visible {
    animation: splitReveal 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  }

  @keyframes splitReveal {
    from {
      opacity: 0;
      transform: translate3d(0, 50px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
