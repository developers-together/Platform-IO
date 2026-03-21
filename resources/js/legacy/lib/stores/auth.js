import { writable } from 'svelte/store';
import { browser } from '@/legacy/app/environment';

function safeJsonParse(key) {
    if (!browser) return null;

    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

export const token = writable(browser ? localStorage.getItem('token') : null);
export const user = writable(safeJsonParse('user'));

if (browser) {
    token.subscribe((value) =>
        value
            ? localStorage.setItem('token', value)
            : localStorage.removeItem('token'),
    );

    user.subscribe((value) =>
        value
            ? localStorage.setItem('user', JSON.stringify(value))
            : localStorage.removeItem('user'),
    );
}

export function logout() {
    token.set(null);
    user.set(null);

    if (browser) {
        localStorage.removeItem('workspace.selected_team_id');
    }
}
