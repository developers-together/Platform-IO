import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createTeam,
    fetchUserTeams,
    joinTeam,
    deleteTeam,
} from '@/lib/api/teams';

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json',
        },
    });

afterEach(() => {
    vi.restoreAllMocks();
});

describe('fetchUserTeams', () => {
    it('maps array response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse([
                {
                    id: 1,
                    name: 'Platform Team',
                    projectname: 'Platform-IO',
                    description: 'Core team',
                    code: 'ABC123',
                },
            ]),
        );

        const teams = await fetchUserTeams();
        expect(teams).toEqual([
            {
                id: 1,
                name: 'Platform Team',
                projectName: 'Platform-IO',
                description: 'Core team',
                code: 'ABC123',
            },
        ]);
    });

    it('maps inertia-style payload fallback', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                props: {
                    teams: [
                        {
                            id: 2,
                            name: 'Ops',
                            projectName: 'Operations',
                            description: '',
                        },
                    ],
                },
            }),
        );

        const teams = await fetchUserTeams();
        expect(teams[0]?.projectName).toBe('Operations');
    });
});

describe('createTeam', () => {
    it('returns team from props.team payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                props: {
                    team: {
                        id: 9,
                        name: 'Frontend Guild',
                        projectname: 'Remake',
                        description: 'Build migration',
                        code: 'QWE123',
                    },
                },
            }),
        );

        const team = await createTeam({
            name: 'Frontend Guild',
            projectname: 'Remake',
            description: 'Build migration',
        });

        expect(team).toMatchObject({
            id: 9,
            name: 'Frontend Guild',
            projectName: 'Remake',
        });
    });
});

describe('joinTeam / deleteTeam', () => {
    it('calls correct endpoints and methods', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }))
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await joinTeam('ABC123');
        await deleteTeam(12);

        expect(fetchSpy).toHaveBeenNthCalledWith(
            1,
            '/api/team/joinTeam',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(fetchSpy).toHaveBeenNthCalledWith(
            2,
            '/api/team/12/delete',
            expect.objectContaining({ method: 'DELETE' }),
        );
    });
});
