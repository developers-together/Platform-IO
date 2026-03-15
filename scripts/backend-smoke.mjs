#!/usr/bin/env node

const argv = process.argv.slice(2);

const hasFlag = (flag) => argv.includes(flag);

const readArg = (flag, fallback = '') => {
    const index = argv.indexOf(flag);
    if (index === -1) {
        return fallback;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
        return fallback;
    }

    return value;
};

const toNumberOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baseUrl = (
    readArg('--base-url', process.env.BACKEND_BASE_URL || 'http://localhost') ||
    'http://localhost'
).replace(/\/+$/, '');

const profile =
    readArg('--profile', process.env.BACKEND_PROFILE || 'unauth') || 'unauth';
const includeWriteProbes = hasFlag('--include-write-probes');
const strict = hasFlag('--strict');
const dryRun = hasFlag('--dry-run');
const timeoutMs = toNumberOr(
    readArg(
        '--timeout-ms',
        process.env.BACKEND_PROBE_TIMEOUT_MS ||
            process.env.BACKEND_PROBE_TIMEOUT ||
            '10000',
    ),
    10_000,
);

const cookieHeader =
    readArg('--cookie', process.env.FRONTEND_SESSION_COOKIE || '') || '';

const teamId = toNumberOr(
    readArg('--team-id', process.env.BACKEND_PROBE_TEAM_ID || '1'),
    1,
);
const chatId = toNumberOr(
    readArg('--chat-id', process.env.BACKEND_PROBE_CHAT_ID || '1'),
    1,
);
const taskId = toNumberOr(
    readArg('--task-id', process.env.BACKEND_PROBE_TASK_ID || '1'),
    1,
);

const parseCookieValue = (cookie, name) => {
    if (!cookie || !name) {
        return null;
    }

    const token = cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    if (!token) {
        return null;
    }

    return decodeURIComponent(token.slice(name.length + 1));
};

const xsrfToken = parseCookieValue(cookieHeader, 'XSRF-TOKEN');

const makeProbe = (name, method, path, body = null, bodyType = 'json') => ({
    name,
    method,
    path,
    body,
    bodyType,
});

const readOnlyProbes = [
    makeProbe('teams.index', 'GET', '/api/user/teams'),
    makeProbe('tasks.index', 'GET', `/api/tasks/${teamId}/index`),
    makeProbe('tasks.suggestions', 'GET', `/api/tasks/${teamId}/suggestions`),
    makeProbe('chat.channels', 'GET', `/api/chats/${teamId}/index`),
    makeProbe('chat.messages', 'GET', `/api/chats/${chatId}/getMessages`),
    makeProbe('files.folders.index', 'GET', `/api/folders/${teamId}/index`),
    makeProbe(
        'files.download',
        'GET',
        `/api/files/${teamId}/download?path=%2F__smoke__.txt`,
    ),
    makeProbe('ai.chats.index', 'GET', `/api/ai_chats/${teamId}/index`),
    makeProbe('ai.history', 'GET', `/api/ai_chats/${chatId}/history`),
];

const writeValidationProbes = [
    makeProbe('teams.create.validate', 'POST', '/api/team/create', {}),
    makeProbe('teams.join.validate', 'POST', '/api/team/joinTeam', {}),
    makeProbe(
        'tasks.create.validate',
        'POST',
        `/api/tasks/${teamId}/store`,
        {},
    ),
    makeProbe(
        'tasks.update.validate',
        'PUT',
        `/api/tasks/${taskId}/update`,
        {},
    ),
    makeProbe('chat.create.validate', 'POST', `/api/chats/${teamId}/store`, {}),
    makeProbe('chat.ask.validate', 'POST', `/api/chats/${chatId}/ask`, {}),
    makeProbe(
        'chat.send.validate',
        'POST',
        `/api/chats/${chatId}/sendMessages`,
        {},
        'form',
    ),
    makeProbe(
        'ai.create.validate',
        'POST',
        `/api/ai_chats/${teamId}/store`,
        {},
    ),
    makeProbe(
        'ai.send.validate',
        'POST',
        `/api/ai_chats/${chatId}/send`,
        {},
        'form',
    ),
    makeProbe(
        'ai.websearch.validate',
        'POST',
        `/api/ai_chats/${chatId}/websearch`,
        {},
    ),
    makeProbe(
        'files.folder.create.validate',
        'POST',
        `/api/folders/${teamId}/store`,
        {},
    ),
    makeProbe(
        'files.aicreate.validate',
        'POST',
        `/api/files/${teamId}/aicreate`,
        {},
    ),
    makeProbe(
        'files.aiedit.validate',
        'PUT',
        `/api/files/${teamId}/aiedit`,
        {},
    ),
    makeProbe(
        'files.upload.validate',
        'POST',
        `/api/files/${teamId}/store`,
        {},
        'form',
    ),
];

const probes = includeWriteProbes
    ? [...readOnlyProbes, ...writeValidationProbes]
    : readOnlyProbes;

const checkBaseReachable = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => {
            controller.abort();
        },
        Math.min(timeoutMs, 5_000),
    );

    try {
        await fetch(baseUrl, {
            method: 'GET',
            signal: controller.signal,
        });

        return true;
    } catch (error) {
        const message =
            error instanceof Error
                ? error.name === 'AbortError'
                    ? `Timeout after ${Math.min(timeoutMs, 5_000)}ms`
                    : error.message
                : 'Unknown network error';

        console.log(
            `\nFAIL | Backend base URL is not reachable (${baseUrl}): ${message}`,
        );
        console.log(
            'Hint | Start the stack first (for example: npm run ui) and rerun the probe.',
        );
        return false;
    } finally {
        clearTimeout(timeout);
    }
};

const classify = (status) => {
    if (status >= 500) {
        return { level: 'FAIL', reason: 'Server error (5xx)' };
    }

    if (status === 404) {
        return { level: 'WARN', reason: 'Route/resource not found (404)' };
    }

    if (status === 401 || status === 403 || status === 419) {
        return {
            level: 'INFO',
            reason: 'Protected endpoint / auth or CSRF expected',
        };
    }

    if (status === 405) {
        return { level: 'WARN', reason: 'Method not allowed (405)' };
    }

    if (status >= 400) {
        return { level: 'WARN', reason: 'Validation/client error (4xx)' };
    }

    return { level: 'PASS', reason: 'Endpoint responded successfully' };
};

const runProbe = async (probe) => {
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    if (cookieHeader) {
        headers.set('Cookie', cookieHeader);
    }

    let body = undefined;
    if (probe.method !== 'GET') {
        if (probe.bodyType === 'form') {
            const formData = new FormData();
            if (
                probe.path.includes('/files/') ||
                probe.path.includes('/folders/')
            ) {
                formData.append('path', '/');
            }
            body = formData;
        } else {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(probe.body ?? {});
        }

        if (xsrfToken) {
            headers.set('X-XSRF-TOKEN', xsrfToken);
        }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        const response = await fetch(`${baseUrl}${probe.path}`, {
            method: probe.method,
            headers,
            body,
            signal: controller.signal,
        });

        const classification = classify(response.status);

        return {
            ...probe,
            status: response.status,
            statusText: response.statusText,
            ...classification,
            error: null,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.name === 'AbortError'
                    ? `Timeout after ${timeoutMs}ms`
                    : error.message
                : 'Unknown network error';

        return {
            ...probe,
            status: null,
            statusText: '',
            level: 'FAIL',
            reason: 'Network/transport failure',
            error: message,
        };
    } finally {
        clearTimeout(timeout);
    }
};

const renderLine = (result) => {
    const statusPart = result.status
        ? `${result.status} ${result.statusText}`.trim()
        : 'NO_RESPONSE';

    const detail = result.error
        ? `${result.reason}: ${result.error}`
        : result.reason;

    return `${result.level.padEnd(4)} | ${result.method.padEnd(6)} ${result.path.padEnd(46)} | ${statusPart.padEnd(18)} | ${detail}`;
};

const main = async () => {
    console.log('Frontend-Backend Connectivity Smoke Probe');
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Profile: ${profile}`);
    console.log(
        `Probe count: ${probes.length} (${includeWriteProbes ? 'read + write validation probes' : 'read-only probes'})`,
    );
    console.log(`Timeout per request: ${timeoutMs}ms`);

    if (profile === 'auth' && !cookieHeader) {
        console.log(
            'WARN | No session cookie provided. Auth profile works best with FRONTEND_SESSION_COOKIE set.',
        );
    }

    if (dryRun) {
        console.log('\nDry run probes:');
        for (const probe of probes) {
            console.log(`- ${probe.method} ${probe.path} (${probe.name})`);
        }
        process.exit(0);
    }

    const reachable = await checkBaseReachable();
    if (!reachable) {
        process.exit(1);
    }

    console.log('\nResults:');

    const results = [];
    for (const probe of probes) {
        // Tiny spacing to keep logs readable while preserving request order.
        await sleep(40);
        const result = await runProbe(probe);
        results.push(result);
        console.log(renderLine(result));
    }

    const summary = {
        pass: results.filter((item) => item.level === 'PASS').length,
        info: results.filter((item) => item.level === 'INFO').length,
        warn: results.filter((item) => item.level === 'WARN').length,
        fail: results.filter((item) => item.level === 'FAIL').length,
    };

    console.log('\nSummary:');
    console.log(
        `PASS=${summary.pass} INFO=${summary.info} WARN=${summary.warn} FAIL=${summary.fail}`,
    );

    if (summary.fail > 0 || (strict && summary.warn > 0)) {
        process.exit(1);
    }

    process.exit(0);
};

await main();
