<script>
  let { size = 20 } = $props();
</script>

<span class="spinner" style="width: {size}px; height: {size}px"></span>

<style>
  .spinner {
    display: inline-block;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
