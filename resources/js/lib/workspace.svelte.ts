type WorkspaceState = {
    selectedTeamId: number | null;
};

const STORAGE_KEY = 'workspace.selected_team_id';

const state = $state<WorkspaceState>({
    selectedTeamId: null,
});

const parseTeamId = (value: string | null): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const workspaceState = () => state;

export const initializeWorkspaceTeam = (): number | null => {
    if (typeof window === 'undefined') return state.selectedTeamId;
    state.selectedTeamId = parseTeamId(localStorage.getItem(STORAGE_KEY));
    return state.selectedTeamId;
};

export const setWorkspaceTeam = (teamId: number | null): void => {
    state.selectedTeamId = teamId;
    if (typeof window === 'undefined') return;

    if (!teamId) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    localStorage.setItem(STORAGE_KEY, String(teamId));
};
