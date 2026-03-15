import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/lib/api/client';

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json',
        },
    });

const textResponse = (body: string, status = 200) =>
    new Response(body, {
        status,
        headers: {
            'content-type': 'text/plain',
        },
    });

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete (globalThis as { document?: { cookie?: string } }).document;
});

describe('apiRequest', () => {
    it('parses json payload and sends defaults', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        const result = await apiRequest<{ ok: boolean }>('/api/test');

        expect(result.ok).toBe(true);
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/test',
            expect.objectContaining({
                method: 'GET',
                credentials: 'include',
            }),
        );
    });

    it('sends json body for non-form payloads', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await apiRequest('/api/test', {
            method: 'POST',
            body: { name: 'Platform-IO' },
        });

        const requestInit = fetchSpy.mock.calls[0][1];
        expect(requestInit?.method).toBe('POST');
        expect(requestInit?.body).toBe('{"name":"Platform-IO"}');
        expect((requestInit?.headers as Headers).get('content-type')).toContain(
            'application/json',
        );
    });

    it('parses plain text responses', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(textResponse('ok'));

        const result = await apiRequest<string>('/api/text');
        expect(result).toBe('ok');
    });

    it('returns null for no-content responses', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(null, { status: 204 }),
        );

        const result = await apiRequest<null>('/api/no-content');
        expect(result).toBeNull();
    });

    it('injects csrf token from cookie for write methods', async () => {
        (globalThis as { document?: { cookie?: string } }).document = {
            cookie: 'foo=bar; XSRF-TOKEN=test-token',
        };

        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await apiRequest('/api/write', {
            method: 'PATCH',
            body: { safe: true },
        });

        const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
        expect(headers.get('x-xsrf-token')).toBe('test-token');
    });

    it('throws normalized ApiRequestError on failure', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({ message: 'Invalid payload' }, 422),
        );

        await expect(
            apiRequest('/api/failure', {
                method: 'POST',
                body: { bad: true },
            }),
        ).rejects.toEqual(
            expect.objectContaining({
                name: 'ApiRequestError',
                message: 'Invalid payload',
                status: 422,
                payload: expect.any(Object),
            }),
        );
    });

    it('rejects unsafe API paths before request', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');

        await expect(apiRequest('https://evil.example/api')).rejects.toThrow(
            'Unsafe API path.',
        );
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('times out hanging requests', async () => {
        vi.useFakeTimers();

        vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
            const signal = init?.signal as AbortSignal | undefined;

            return new Promise((_resolve, reject) => {
                signal?.addEventListener(
                    'abort',
                    () => {
                        reject(
                            new DOMException(
                                'The operation was aborted.',
                                'AbortError',
                            ),
                        );
                    },
                    { once: true },
                );
            });
        });

        const request = apiRequest('/api/hanging', { timeoutMs: 5 });
        const assertion = expect(request).rejects.toThrow(
            'Request timed out after 5ms',
        );
        await vi.advanceTimersByTimeAsync(10);
        await assertion;
    });
});
