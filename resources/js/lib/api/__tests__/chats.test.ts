import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    askChatAi,
    createChat,
    fetchChatMessages,
    sendChatMessage,
} from '@/lib/api/chats';

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

describe('fetchChatMessages', () => {
    it('normalizes paginated payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                data: [
                    {
                        id: 10,
                        chat_id: 2,
                        user_id: 1,
                        user_name: 'Adham',
                        message: 'Hello',
                        image_url: null,
                        replyTo: null,
                        created_at: '2026-03-15 10:00:00',
                        isAi: false,
                    },
                ],
            }),
        );

        const result = await fetchChatMessages(2);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 10,
            userName: 'Adham',
            message: 'Hello',
            isAi: false,
        });
    });
});

describe('askChatAi', () => {
    it('returns the first AI message in response payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                messages: [
                    {
                        id: 20,
                        message: 'user prompt',
                        isAi: false,
                    },
                    {
                        id: 21,
                        user_name: 'Gemini',
                        message: 'AI response',
                        isAi: true,
                    },
                ],
            }),
        );

        const result = await askChatAi(3, 'What is new?');

        expect(result).not.toBeNull();
        expect(result?.id).toBe(21);
        expect(result?.isAi).toBe(true);
        expect(result?.message).toBe('AI response');
    });
});

describe('createChat', () => {
    it('maps created channel', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({ id: 44, name: 'engineering' }),
        );

        const channel = await createChat(5, 'engineering');
        expect(channel).toEqual({ id: 44, name: 'engineering' });
    });
});

describe('sendChatMessage', () => {
    it('maps sent message payload', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                message: {
                    id: 88,
                    chat_id: 7,
                    user_id: 2,
                    user_name: 'Adham',
                    message: 'Hello from test',
                    image_url: null,
                    replyTo: null,
                    created_at: '2026-03-15 10:00:00',
                    isAi: false,
                },
            }),
        );

        const result = await sendChatMessage(7, {
            message: 'Hello from test',
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(88);
        expect(result?.message).toBe('Hello from test');
    });
});
