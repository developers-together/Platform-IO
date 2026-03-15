type ApiRequestInput = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown> | FormData | null;
    headers?: HeadersInit;
    timeoutMs?: number;
    signal?: AbortSignal;
};

const DEFAULT_API_TIMEOUT_MS = 45_000;

const hasControlChars = (value: string): boolean => {
    for (const char of value) {
        const code = char.charCodeAt(0);
        if (code <= 31 || code === 127) {
            return true;
        }
    }

    return false;
};

const isSafeApiPath = (path: string): boolean => {
    const trimmed = path.trim();
    if (!trimmed) {
        return false;
    }

    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
        return false;
    }

    if (hasControlChars(trimmed)) {
        return false;
    }

    try {
        const decoded = decodeURIComponent(trimmed);
        if (decoded.startsWith('//') || hasControlChars(decoded)) {
            return false;
        }
    } catch {
        return false;
    }

    return true;
};

export class ApiRequestError extends Error {
    readonly status: number;
    readonly payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.payload = payload;
    }
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefix = `${name}=`;
    const value = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix));

    if (!value) {
        return null;
    }

    return decodeURIComponent(value.slice(prefix.length));
}

async function parseResponsePayload(response: Response): Promise<unknown> {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function normalizeErrorMessage(
    payload: unknown,
    fallbackStatus: number,
): string {
    if (typeof payload === 'string' && payload.trim().length > 0) {
        return payload;
    }

    if (payload && typeof payload === 'object') {
        const maybePayload = payload as Record<string, unknown>;
        if (
            typeof maybePayload.message === 'string' &&
            maybePayload.message.trim().length > 0
        ) {
            return maybePayload.message;
        }
    }

    return `Request failed with status ${fallbackStatus}`;
}

export async function apiRequest<T>(
    path: string,
    input: ApiRequestInput = {},
): Promise<T> {
    const safePath = path.trim();
    if (!isSafeApiPath(safePath)) {
        throw new Error('Unsafe API path.');
    }

    const method = input.method ?? 'GET';
    const headers = new Headers(input.headers ?? {});
    const timeoutMs =
        typeof input.timeoutMs === 'number'
            ? Math.max(0, input.timeoutMs)
            : DEFAULT_API_TIMEOUT_MS;

    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    let body: BodyInit | undefined;
    if (input.body instanceof FormData) {
        body = input.body;
    } else if (input.body) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(input.body);
    }

    if (method !== 'GET') {
        const token = readCookie('XSRF-TOKEN');
        if (token) {
            headers.set('X-XSRF-TOKEN', token);
        }
    }

    let requestSignal: AbortSignal | undefined = input.signal;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;
    let linkedAbortListener: (() => void) | null = null;
    const timeoutController =
        typeof AbortController !== 'undefined' ? new AbortController() : null;

    if (timeoutController) {
        requestSignal = timeoutController.signal;

        if (input.signal) {
            if (input.signal.aborted) {
                timeoutController.abort(input.signal.reason);
            } else {
                linkedAbortListener = () => {
                    timeoutController.abort(input.signal?.reason);
                };
                input.signal.addEventListener('abort', linkedAbortListener, {
                    once: true,
                });
            }
        }

        if (timeoutMs > 0) {
            timeoutId = setTimeout(() => {
                timedOut = true;
                timeoutController.abort();
            }, timeoutMs);
        }
    }

    let response: Response;
    try {
        response = await fetch(safePath, {
            method,
            body,
            headers,
            credentials: 'include',
            signal: requestSignal,
        });
    } catch (err) {
        if (timedOut) {
            throw new Error(`Request timed out after ${timeoutMs}ms`);
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error('Request was cancelled.');
        }

        throw err;
    } finally {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        if (input.signal && linkedAbortListener) {
            input.signal.removeEventListener('abort', linkedAbortListener);
        }
    }

    const payload = await parseResponsePayload(response);
    if (!response.ok) {
        throw new ApiRequestError(
            normalizeErrorMessage(payload, response.status),
            response.status,
            payload,
        );
    }

    return payload as T;
}
