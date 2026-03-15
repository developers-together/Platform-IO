import { apiRequest } from '@/lib/api/client';
import {
    isRecord,
    toNullableString,
    toNumber,
    toStringValue,
} from '@/lib/api/guards';
import type { TeamSummary } from '@/types/domain';

function toTeamSummary(value: unknown): TeamSummary | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = toNumber(value.id);
    if (!id) {
        return null;
    }

    return {
        id,
        name: toStringValue(value.name, 'Untitled Team'),
        projectName: toStringValue(value.projectname ?? value.projectName, ''),
        description: toStringValue(value.description, ''),
        code: toNullableString(value.code),
    };
}

function extractTeams(payload: unknown): TeamSummary[] {
    if (Array.isArray(payload)) {
        return payload
            .map((item) => toTeamSummary(item))
            .filter((item): item is TeamSummary => item !== null);
    }

    if (!isRecord(payload)) {
        return [];
    }

    if (Array.isArray(payload.data)) {
        return payload.data
            .map((item) => toTeamSummary(item))
            .filter((item): item is TeamSummary => item !== null);
    }

    if (isRecord(payload.props) && Array.isArray(payload.props.teams)) {
        return payload.props.teams
            .map((item) => toTeamSummary(item))
            .filter((item): item is TeamSummary => item !== null);
    }

    if (Array.isArray(payload.teams)) {
        return payload.teams
            .map((item) => toTeamSummary(item))
            .filter((item): item is TeamSummary => item !== null);
    }

    return [];
}

export async function fetchUserTeams(): Promise<TeamSummary[]> {
    const response = await apiRequest<unknown>('/api/user/teams');
    return extractTeams(response);
}

export async function createTeam(payload: {
    name: string;
    projectname: string;
    description: string;
    contacts?: string[];
}): Promise<TeamSummary | null> {
    const response = await apiRequest<unknown>('/api/team/create', {
        method: 'POST',
        body: {
            ...payload,
            contacts: payload.contacts ?? [],
        },
    });

    if (isRecord(response) && isRecord(response.props) && response.props.team) {
        return toTeamSummary(response.props.team);
    }

    return toTeamSummary(response);
}

export async function joinTeam(code: string): Promise<void> {
    await apiRequest<unknown>('/api/team/joinTeam', {
        method: 'POST',
        body: {
            code,
        },
    });
}

export async function deleteTeam(teamId: number): Promise<void> {
    await apiRequest<unknown>(`/api/team/${teamId}/delete`, {
        method: 'DELETE',
    });
}
