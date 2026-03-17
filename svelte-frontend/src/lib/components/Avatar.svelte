<script>
  export let name = '';
  export let size = 128;
  export let background = '';
  export let color = '';
  export let rounded = true;
  export let bold = true;
  export let className = '';
  // Also accept an `options` prop for Teams page compat
  export let options = null;

  function getAvatarUrl(n, opts = {}) {
    const params = new URLSearchParams();
    params.set('name', n || 'U');
    if (opts.size) params.set('size', String(opts.size));
    if (opts.background) params.set('background', opts.background);
    if (opts.color) params.set('color', opts.color);
    if (opts.rounded !== false) params.set('rounded', 'true');
    if (opts.bold !== false) params.set('bold', 'true');
    return `https://ui-avatars.com/api/?${params.toString()}`;
  }

  $: mergedOpts = options
    ? { size: options.size || size, background: options.background || background, color: options.color || color, rounded: options.rounded ?? rounded, bold: options.bold ?? bold }
    : { size, background, color, rounded, bold };

  $: avatarUrl = getAvatarUrl(name, mergedOpts);
  $: displaySize = options?.size || size;
</script>

<img
  src={avatarUrl}
  alt={name || 'avatar'}
  class="avatar {className}"
  style="width: {displaySize}px; height: {displaySize}px"
  loading="lazy"
/>

<style>
  .avatar {
    border-radius: 50%;
    object-fit: cover;
  }
</style>
