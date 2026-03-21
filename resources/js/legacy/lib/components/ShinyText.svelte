<svelte:options runes={false} />

<script>
  export let text = '';
  export let speed = 5;
  export let disabled = false;
</script>

<span
  class="shiny-text"
  class:disabled
  style="animation-duration: {speed}s"
>
  {text}
</span>

<style>
  .shiny-text {
    color: rgba(255, 255, 255, 0.2);
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.6) 40%,
      rgba(255, 255, 255, 0.8) 50%,
      rgba(255, 255, 255, 1) 60%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    display: inline-block;
    animation: shine 5s linear infinite;
  }

  .shiny-text.disabled {
    animation: none;
  }

  @keyframes shine {
    0% { background-position: 100%; }
    100% { background-position: -100%; }
  }
</style>
