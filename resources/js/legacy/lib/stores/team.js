import { writable } from 'svelte/store';
import { browser } from '@/legacy/app/environment';

const STORAGE_KEY = 'workspace.selected_team_id';

const readInitialTeamId = () => {
    if (!browser) {
        return null;
    }

    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const teamId = writable(readInitialTeamId());
export const selectedTeam = teamId;
export const teamName = writable('');
export const projectName = writable('');

if (browser) {
    teamId.subscribe((value) => {
        if (!value) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        localStorage.setItem(STORAGE_KEY, String(value));
    });
}
