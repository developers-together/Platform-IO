<svelte:options runes={false} />

<script>
  import { onMount } from 'svelte';
  import ShinyText from '@/legacy/lib/components/ShinyText.svelte';
  import SplitText from '@/legacy/lib/components/SplitText.svelte';
  import Magnet from '@/legacy/lib/components/Magnet.svelte';
  import AppHead from '@/components/AppHead.svelte';

  let showOverlay = true;
  let fadingOut = false;
  let timer;

  // Keep a single clear entry point into the auth flow.
  // If the visitor is already authenticated, Laravel guest middleware
  // will redirect /login back to /dashboard automatically.
  const ctaPath = '/login';
  const ctaLabel = 'Use the Platform';

  onMount(() => {
    timer = setTimeout(() => {
      fadingOut = true;
      setTimeout(() => {
        showOverlay = false;
      }, 1000);
    }, 1600);

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        fadingOut = true;
        setTimeout(() => { showOverlay = false; }, 1000);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<AppHead title="Platform-IO" />

<div class="start5">
  {#if showOverlay}
    <div class="overlay" class:fade-out={fadingOut}>
      <div class="overlay-content">
        <SplitText
          text="Hello, and Welcome to Platform-IO"
          className="overlay-split-text"
          delay={150}
        />
      </div>
    </div>
  {/if}
  <div class="starter-page5">
    <div class="starter-content5">
      <h1>Platform-IO</h1>
      <p>
        Where Ideas Sync, Teams Thrive, and Work Comes Alive <br />
      </p>
      <p>Your All-in-One Hub for Smarter Collaboration!</p>
      <Magnet
        padding={10000}
        disabled={false}
        magnetStrength={20}
        activeTransition="transform 0.2s ease-out"
        inactiveTransition="transform 0.4s ease-in-out"
      >
        <a href={ctaPath} class="btn-custom5">
          <ShinyText text={ctaLabel} speed={3} />
        </a>
      </Magnet>
    </div>
  </div>
</div>

<style>
  .start5 {
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    background: url('/landing.png') center center no-repeat;
    background-size: cover;
    display: flex;
    align-items: center;
  }

  .starter-page5 {
    display: flex;
    justify-content: end;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .starter-content5 {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 400px;
    position: relative;
    margin-right: 5%;
  }

  .starter-content5 h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .starter-content5 p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .btn-custom5 {
    color: #fff;
    background: #2b5ce7;
    padding: 14px 34px;
    letter-spacing: 1px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 25px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(0, 82, 212, 0.4);
    text-decoration: none;
    display: inline-block;
  }

  .btn-custom5:hover,
  .btn-custom5:focus {
    transform: scale(1.1);
    background: #0041ac;
    box-shadow: 0px 0px 20px rgba(0, 81, 212, 0.8);
  }

  .btn-custom5:active {
    transform: scale(0.9);
  }

  /* ===== Overlay Styles ===== */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 1s ease-in-out;
    z-index: 10000;
    /* Keep CTA usable even while intro overlay is visible. */
    pointer-events: none;
  }

  .overlay.fade-out {
    opacity: 0;
    pointer-events: none;
  }

  .overlay-content {
    padding: 2rem;
    text-align: center;
  }

  :global(.overlay-split-text) {
    font-size: 2rem;
    font-weight: 600;
    color: #fff;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    :global(.overlay-split-text) {
      font-size: 1.4rem;
    }
    .starter-content5 {
      width: 90%;
      margin-right: auto;
      margin-left: auto;
    }
    .starter-page5 {
      justify-content: center;
    }
    .starter-content5 h1 {
      font-size: 2rem;
    }
    .starter-content5 p {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    :global(.overlay-split-text) {
      font-size: 1.1rem;
    }
    .starter-content5 h1 {
      font-size: 1.6rem;
    }
    .starter-content5 p {
      font-size: 0.85rem;
    }
    .btn-custom5 {
      padding: 12px 24px;
      font-size: 13px;
    }
  }
</style>
