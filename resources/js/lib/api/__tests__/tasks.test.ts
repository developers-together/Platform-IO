import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createTask,
    fetchTaskSuggestions,
    fetchTeamTasks,
    updateTask,
} from '@/lib/api/tasks';

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

describe('fetchTeamTasks', () => {
    it('maps nested task payload to TaskSummary entries', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                data: [
                    {
                        id: 10,
                        title: 'Build API layer',
                        description: 'Create typed clients',
                        completed: 0,
                        stared: 1,
                        start: '2026-03-15 09:00:00',
                        end: '2026-03-16 09:00:00',
                        created_at: '2026-03-15 08:30:00',
                    },
                ],
            }),
        );

        const result = await fetchTeamTasks(7);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 10,
            title: 'Build API layer',
            completed: false,
            starred: true,
            endAt: '2026-03-16 09:00:00',
        });
    });
});

describe('fetchTaskSuggestions', () => {
    it('maps suggestion endpoint payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                data: [
                    {
                        id: 1,
                        title: 'Split chat service',
                        description: 'Move upload logic to isolated module',
                    },
                    {
                        id: 2,
                        title: 'Add task rate limiting',
                    },
                ],
            }),
        );

        const result = await fetchTaskSuggestions(7);

        expect(result).toEqual([
            {
                id: 1,
                title: 'Split chat service',
                description: 'Move upload logic to isolated module',
            },
            {
                id: 2,
                title: 'Add task rate limiting',
                description: '',
            },
        ]);
    });
});

describe('createTask', () => {
    it('posts expected payload and maps response', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse(
                {
                    id: 11,
                    title: 'Ship migration',
                    description: '',
                    completed: false,
                    stared: false,
                    start: '2026-03-15 10:00:00',
                    end: null,
                    created_at: '2026-03-15 10:00:00',
                },
                201,
            ),
        );

        const task = await createTask(3, {
            title: 'Ship migration',
            description: '',
            end: null,
        });

        expect(task?.id).toBe(11);
        expect(task?.title).toBe('Ship migration');

        const requestInit = fetchSpy.mock.calls[0][1];
        expect(requestInit?.method).toBe('POST');
        expect(String(requestInit?.body)).toContain('"category":"General"');
    });
});

describe('updateTask', () => {
    it('returns mapped task after update', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                id: 12,
                title: 'Refine UX',
                description: 'Updated',
                completed: true,
                stared: false,
                start: '2026-03-15 11:00:00',
                end: '2026-03-16 13:00:00',
                created_at: '2026-03-15 09:00:00',
            }),
        );

        const updated = await updateTask(12, {
            title: 'Refine UX',
            description: 'Updated',
            completed: true,
            stared: false,
            start: '2026-03-15 11:00:00',
            end: '2026-03-16 13:00:00',
            category: 'General',
        });

        expect(updated).not.toBeNull();
        expect(updated?.completed).toBe(true);
        expect(updated?.description).toBe('Updated');
    });
});
