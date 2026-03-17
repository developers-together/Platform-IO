import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const teamId = writable(browser ? localStorage.getItem('teamId') : null);
export const selectedTeam = teamId; // alias used by Dashboard & Teams
export const teamName = writable('');
export const projectName = writable('');

if (browser) {
  teamId.subscribe((v) =>
    v ? localStorage.setItem('teamId', v) : localStorage.removeItem('teamId')
  );
}
