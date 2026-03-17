import { get } from 'svelte/store';
import { token } from '$lib/stores/auth.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const REQUEST_TIMEOUT_MS = 30000; // 30s timeout

/**
 * Centralized API client wrapping fetch with auth token.
 * @param {string} endpoint - API path without /api prefix (e.g. '/user/show')
 * @param {object} options  - { method, body, headers, timeout }
 * @returns {Promise<any>}  parsed JSON response
 */
export async function api(endpoint, options = {}) {
  const t = get(token);
  const isFormData = options.body instanceof FormData;

  // Abort controller for request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout || REQUEST_TIMEOUT_MS
  );

  try {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      method: options.method || 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options.headers,
      },
      body: isFormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (res.status === 401) {
      // Token expired or invalid — clear auth state before redirecting
      const { logout } = await import('$lib/stores/auth.js');
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      // Sanitize server error messages — don't leak internals to user
      const message =
        error.message || error.error || `Request failed (${res.status})`;
      throw new Error(message);
    }

    // Handle 204 No Content or empty body
    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      // Response was not JSON
      return text;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
