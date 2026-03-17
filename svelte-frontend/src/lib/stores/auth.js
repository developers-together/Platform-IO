import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Safe JSON parse — prevents app crash if localStorage contains
 * corrupted data (e.g. from a different app version or manual editing).
 */
function safeJsonParse(key) {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupted data — remove it
    localStorage.removeItem(key);
    return null;
  }
}

export const token = writable(browser ? localStorage.getItem('token') : null);
export const user = writable(safeJsonParse('user'));

if (browser) {
  token.subscribe((v) =>
    v ? localStorage.setItem('token', v) : localStorage.removeItem('token')
  );
  user.subscribe((v) =>
    v
      ? localStorage.setItem('user', JSON.stringify(v))
      : localStorage.removeItem('user')
  );
}

export function logout() {
  token.set(null);
  user.set(null);
  if (browser) {
    localStorage.removeItem('teamId');
  }
}
