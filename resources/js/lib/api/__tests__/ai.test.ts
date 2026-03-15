import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createAiChat,
    fetchAiHistory,
    sendAiPrompt,
    webSearchAi,
} from '@/lib/api/ai';

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

describe('fetchAiHistory', () => {
    it('maps backend history records to frontend shape', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse([
                {
                    id: 5,
                    prompt: 'Summarize this sprint',
                    response: 'Here is the summary',
                    user: { name: 'Adham' },
                    image_url: null,
                    created_at: '2026-03-15 12:00:00',
                },
            ]),
        );

        const result = await fetchAiHistory(5);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 5,
            prompt: 'Summarize this sprint',
            response: 'Here is the summary',
            userName: 'Adham',
        });
    });
});

describe('webSearchAi', () => {
    it('maps web search response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                id: 99,
                prompt: 'Search latest trends',
                response: 'Result payload',
                user_name: 'Adham',
            }),
        );

        const result = await webSearchAi(9, 'Search latest trends');

        expect(result).not.toBeNull();
        expect(result?.id).toBe(99);
        expect(result?.response).toBe('Result payload');
    });
});

describe('createAiChat', () => {
    it('maps created chat payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                id: 77,
                name: 'Architecture Review',
            }),
        );

        const chat = await createAiChat(2, 'Architecture Review');
        expect(chat).toEqual({ id: 77, name: 'Architecture Review' });
    });
});

describe('sendAiPrompt', () => {
    it('returns mapped AI history entry', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                id: 25,
                prompt: 'Summarize roadmap',
                response: 'Roadmap summary',
                user_name: 'Adham',
            }),
        );

        const response = await sendAiPrompt(11, 'Summarize roadmap');
        expect(response).not.toBeNull();
        expect(response?.prompt).toBe('Summarize roadmap');
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/ai_chats/11/send',
            expect.objectContaining({ method: 'POST' }),
        );
    });
});
