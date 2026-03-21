import { apiRequest } from '@/lib/api/client';

const normalizeEndpoint = (endpoint) => {
    if (typeof endpoint !== 'string' || endpoint.trim().length === 0) {
        throw new Error('API endpoint is required.');
    }

    const trimmed = endpoint.trim();
    if (trimmed.startsWith('/api/')) {
        return trimmed;
    }

    return `/api${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

export async function api(endpoint, options = {}) {
    return apiRequest(normalizeEndpoint(endpoint), {
        method: options.method || 'GET',
        body: options.body ?? null,
        headers: options.headers,
        timeoutMs: options.timeout,
    });
}
