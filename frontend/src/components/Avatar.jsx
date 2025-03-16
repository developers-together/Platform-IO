// resources/js/components/Avatar.jsx

/**
 * Returns a UI Avatars API URL based on the provided name and options.
 * @param {string} name - The full name.
 * @param {object} options - Optional settings.
 * @returns {string}
 */
function getAvatarUrl(name, options = {}) {
  const params = new URLSearchParams();
  params.set("name", name);

  if (options.size) params.set("size", options.size);
  if (options.background) params.set("background", options.background);
  if (options.color) params.set("color", options.color);
  if (options.length) params.set("length", options.length);
  if (options.fontSize) params.set("font-size", options.fontSize);
  if (options.rounded) params.set("rounded", "true");
  if (options.bold) params.set("bold", "true");
  if (options.uppercase !== undefined)
    params.set("uppercase", options.uppercase ? "true" : "false");
  if (options.format) params.set("format", options.format);

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export default function Avatar({ name, options, className, style, alt }) {
  const avatarUrl = getAvatarUrl(name, options);
  return (
    <img
      src={avatarUrl}
      alt={alt || name}
      className={className}
      style={style}
    />
  );
}
