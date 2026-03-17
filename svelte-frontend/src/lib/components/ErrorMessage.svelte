<script>
  let { message = '' } = $props();
</script>

{#if message}
  <div class="error-message">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    <span>{message}</span>
  </div>
{/if}

<style>
  .error-message {
    background: #fff0f0;
    color: #dc2626;
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    animation: slideDown 0.3s ease;
    width: 100%;
    justify-content: center;
  }

  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
</style>
