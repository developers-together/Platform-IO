import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createAiGeneratedFile,
    editAiGeneratedFile,
    listWorkspaceEntries,
    createFolder,
    uploadFile,
} from '@/lib/api/files';

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

describe('listWorkspaceEntries', () => {
    it('filters to direct children in root path', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                directory: ['design', 'docs', 'docs/specs'],
                files: [
                    { path: 'README.md', type: 'md' },
                    { path: 'docs/specs.txt', type: 'txt' },
                ],
            }),
        );

        const entries = await listWorkspaceEntries(1, '/');

        expect(entries.map((entry) => `${entry.type}:${entry.path}`)).toEqual([
            'folder:/design',
            'folder:/docs',
            'file:/README.md',
        ]);
    });

    it('filters to direct children in nested path', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                directory: ['design', 'docs', 'docs/specs'],
                files: [
                    { path: 'README.md', type: 'md' },
                    { path: 'docs/specs.txt', type: 'txt' },
                ],
            }),
        );

        const entries = await listWorkspaceEntries(1, '/docs');

        expect(entries.map((entry) => `${entry.type}:${entry.path}`)).toEqual([
            'folder:/docs/specs',
            'file:/docs/specs.txt',
        ]);
    });

    it('drops unsafe backend entries', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({
                directory: ['docs', 'docs/../secret'],
                files: [
                    { path: 'safe.txt', type: 'txt' },
                    { path: '../leak.txt', type: 'txt' },
                ],
            }),
        );

        const entries = await listWorkspaceEntries(1, '/');

        expect(entries.map((entry) => entry.path)).toEqual([
            '/docs',
            '/safe.txt',
        ]);
    });
});

describe('uploadFile', () => {
    it('returns a normalized file entry', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({ path: 'storage/teams/1/notes.txt' }, 201),
        );

        const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
        const entry = await uploadFile(1, file, '/docs');

        expect(entry.path).toBe('/docs/notes.txt');
        expect(entry.name).toBe('notes.txt');
        expect(entry.type).toBe('file');
        expect(entry.extension).toBe('txt');
    });

    it('rejects invalid filename before upload request', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        const file = new File(['hello'], '....', { type: 'text/plain' });

        await expect(uploadFile(1, file, '/docs')).rejects.toThrow(
            'Filename is invalid.',
        );
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});

describe('createFolder', () => {
    it('rejects invalid folder names before request', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await expect(createFolder(1, '....', '/')).rejects.toThrow(
            'Folder name is invalid.',
        );
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});

describe('AI file helpers', () => {
    it('returns filename from AI create endpoint', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            jsonResponse({ filename: 'report.md' }, 201),
        );

        const filename = await createAiGeneratedFile(
            1,
            'create weekly report',
            '/docs',
        );

        expect(filename).toBe('report.md');
    });

    it('calls edit endpoint with safe path', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await editAiGeneratedFile(5, '/docs/spec.md', 'improve intro');

        const request = fetchSpy.mock.calls[0];
        expect(request[0]).toBe('/api/files/5/aiedit');
        expect(String(request[1]?.body)).toContain('"path":"/docs/spec.md"');
    });

    it('rejects unsafe traversal path before request', async () => {
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(jsonResponse({ ok: true }));

        await expect(
            editAiGeneratedFile(5, '/docs/../secret.md', 'edit this'),
        ).rejects.toThrow('Unsafe workspace path.');

        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
