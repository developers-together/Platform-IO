import { apiRequest } from '@/lib/api/client';
import { isRecord, toStringValue } from '@/lib/api/guards';
import {
    isSafeWorkspacePath,
    joinWorkspacePath,
    normalizeWorkspacePath,
    sanitizeFilename,
} from '@/lib/security';
import type { WorkspaceEntry } from '@/types/domain';

type FolderIndexFile = {
    path: string;
    type?: string;
};

type FolderIndexPayload = {
    directory: string[];
    files: FolderIndexFile[];
};

function normalizeEntryPath(path: string): string | null {
    const trimmed = path.trim().replace(/^\/+/, '');
    const normalized = normalizeWorkspacePath(`/${trimmed}`);
    return isSafeWorkspacePath(normalized) ? normalized : null;
}

function requireSafePath(path: string): string {
    const normalized = normalizeWorkspacePath(path);
    if (!isSafeWorkspacePath(normalized)) {
        throw new Error('Unsafe workspace path.');
    }

    return normalized;
}

function isDirectChild(parentPath: string, entryPath: string): boolean {
    const normalizedParent = normalizeWorkspacePath(parentPath);
    const normalizedEntry = normalizeWorkspacePath(entryPath);

    if (normalizedParent === '/') {
        return !normalizedEntry.slice(1).includes('/');
    }

    const prefix = `${normalizedParent}/`;
    if (!normalizedEntry.startsWith(prefix)) {
        return false;
    }

    return !normalizedEntry.slice(prefix.length).includes('/');
}

function toFolderEntry(normalized: string): WorkspaceEntry {
    return {
        path: normalized,
        name: normalized.split('/').pop() ?? normalized,
        type: 'folder',
        extension: null,
    };
}

function toFileEntry(
    normalized: string,
    value: FolderIndexFile,
): WorkspaceEntry {
    const extension = value.type
        ? value.type.toLowerCase()
        : (normalized.split('.').pop() ?? '').toLowerCase();

    return {
        path: normalized,
        name: normalized.split('/').pop() ?? normalized,
        type: 'file',
        extension: extension || null,
    };
}

function extractFolderIndex(payload: unknown): FolderIndexPayload {
    if (!isRecord(payload)) {
        return { directory: [], files: [] };
    }

    const directory = Array.isArray(payload.directory)
        ? payload.directory
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
        : [];

    const files = Array.isArray(payload.files)
        ? payload.files.flatMap((item) => {
              if (!isRecord(item) || typeof item.path !== 'string') {
                  return [];
              }

              return [
                  {
                      path: item.path,
                      type:
                          typeof item.type === 'string' ? item.type : undefined,
                  } as FolderIndexFile,
              ];
          })
        : [];

    return { directory, files };
}

export async function listWorkspaceEntries(
    teamId: number,
    currentPath: string,
): Promise<WorkspaceEntry[]> {
    const response = await apiRequest<unknown>(`/api/folders/${teamId}/index`);
    const payload = extractFolderIndex(response);
    const normalizedPath = requireSafePath(currentPath);

    const folders = payload.directory
        .map((path) => normalizeEntryPath(path))
        .filter((path): path is string => path !== null)
        .filter((path) => isDirectChild(normalizedPath, path))
        .map((path) => toFolderEntry(path));

    const files = payload.files
        .flatMap((file) => {
            const normalized = normalizeEntryPath(file.path);
            if (!normalized) {
                return [];
            }

            return [{ path: normalized, original: file }];
        })
        .filter((file) => isDirectChild(normalizedPath, file.path))
        .map((file) => toFileEntry(file.path, file.original));

    return [...folders, ...files].sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });
}

export async function createFolder(
    teamId: number,
    folderName: string,
    currentPath: string,
): Promise<void> {
    const safeName = sanitizeFilename(folderName);
    if (!safeName) {
        throw new Error('Folder name is invalid.');
    }

    await apiRequest<unknown>(`/api/folders/${teamId}/store`, {
        method: 'POST',
        body: {
            name: safeName,
            path: requireSafePath(currentPath),
        },
    });
}

export async function deleteFolder(
    teamId: number,
    path: string,
): Promise<void> {
    await apiRequest<unknown>(`/api/folders/${teamId}/delete`, {
        method: 'DELETE',
        body: {
            path: requireSafePath(path),
        },
    });
}

export async function uploadFile(
    teamId: number,
    file: File,
    currentPath: string,
): Promise<WorkspaceEntry> {
    const safeName = sanitizeFilename(file.name);
    if (!safeName) {
        throw new Error('Filename is invalid.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', requireSafePath(currentPath));
    formData.append('name', safeName);

    await apiRequest<unknown>(`/api/files/${teamId}/store`, {
        method: 'POST',
        body: formData,
    });

    const entryPath = joinWorkspacePath(currentPath, safeName);
    const extension = safeName.includes('.')
        ? (safeName.split('.').pop()?.toLowerCase() ?? null)
        : null;

    return {
        path: entryPath,
        name: safeName,
        type: 'file',
        extension,
    };
}

export async function deleteFile(teamId: number, path: string): Promise<void> {
    await apiRequest<unknown>(`/api/files/${teamId}/delete`, {
        method: 'DELETE',
        body: {
            path: requireSafePath(path),
        },
    });
}

export async function downloadFile(
    teamId: number,
    path: string,
): Promise<{ blob: Blob; filename: string }> {
    const safePath = requireSafePath(path);
    const response = await fetch(
        `/api/files/${teamId}/download?path=${encodeURIComponent(safePath)}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/octet-stream',
                'X-Requested-With': 'XMLHttpRequest',
            },
        },
    );

    if (!response.ok) {
        const message = `Download failed with status ${response.status}`;
        throw new Error(message);
    }

    const blob = await response.blob();
    const header = response.headers.get('content-disposition') ?? '';
    const defaultName = safePath.split('/').pop() ?? 'download';

    const filenameMatch = header.match(/filename="?([^";]+)"?/i);
    const filename = filenameMatch?.[1]
        ? toStringValue(filenameMatch[1], defaultName)
        : defaultName;

    return { blob, filename };
}

export async function createAiGeneratedFile(
    teamId: number,
    prompt: string,
    path = '/',
): Promise<string | null> {
    const response = await apiRequest<unknown>(
        `/api/files/${teamId}/aicreate`,
        {
            method: 'POST',
            body: {
                path: requireSafePath(path),
                prompt,
            },
        },
    );

    if (!isRecord(response)) {
        return null;
    }

    if (typeof response.filename === 'string') {
        return response.filename;
    }

    return null;
}

export async function editAiGeneratedFile(
    teamId: number,
    path: string,
    prompt: string,
): Promise<void> {
    await apiRequest<unknown>(`/api/files/${teamId}/aiedit`, {
        method: 'PUT',
        body: {
            path: requireSafePath(path),
            prompt,
        },
    });
}
