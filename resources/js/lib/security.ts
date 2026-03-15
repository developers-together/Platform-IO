const TRAVERSAL_PATTERN = /(^|\/)\.\.(\/|$)/;
const MULTI_SLASH_PATTERN = /\/{2,}/g;

const isControlCode = (code: number): boolean => code <= 31 || code === 127;

const hasControlChars = (value: string): boolean => {
    for (const char of value) {
        if (isControlCode(char.charCodeAt(0))) {
            return true;
        }
    }

    return false;
};

const stripControlChars = (value: string): string =>
    Array.from(value)
        .filter((char) => !isControlCode(char.charCodeAt(0)))
        .join('');

export const MAX_CHAT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_FILE_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export function normalizeWorkspacePath(input: string): string {
    const trimmed = input.trim();
    if (!trimmed || trimmed === '/') {
        return '/';
    }

    const normalized = trimmed
        .replace(/\\/g, '/')
        .replace(MULTI_SLASH_PATTERN, '/');
    const withLeadingSlash = normalized.startsWith('/')
        ? normalized
        : `/${normalized}`;

    return withLeadingSlash.endsWith('/') && withLeadingSlash !== '/'
        ? withLeadingSlash.slice(0, -1)
        : withLeadingSlash;
}

export function isSafeWorkspacePath(path: string): boolean {
    const normalized = normalizeWorkspacePath(path);

    if (hasControlChars(normalized)) {
        return false;
    }

    if (TRAVERSAL_PATTERN.test(normalized)) {
        return false;
    }

    // Reject encoded traversal attempts such as %2e%2e after decoding.
    try {
        const decoded = decodeURIComponent(normalized);
        if (TRAVERSAL_PATTERN.test(decoded) || hasControlChars(decoded)) {
            return false;
        }
    } catch {
        return false;
    }

    return true;
}

export function joinWorkspacePath(basePath: string, name: string): string {
    const safeBase = normalizeWorkspacePath(basePath);
    const safeName = sanitizeFilename(name);

    if (!safeName) {
        return safeBase;
    }

    return safeBase === '/' ? `/${safeName}` : `${safeBase}/${safeName}`;
}

export function sanitizeFilename(input: string): string {
    const cleaned = stripControlChars(input)
        .replace(/[\\/]/g, '')
        .replace(/[<>:"|?*]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\.\.+/g, '.')
        .replace(/^\.+/, '')
        .trim();

    return cleaned;
}

export function isSafeHttpUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed || hasControlChars(trimmed)) {
        return false;
    }

    if (trimmed.startsWith('/')) {
        // Reject scheme-relative URLs such as //evil.example.
        if (trimmed.startsWith('//')) {
            return false;
        }

        return true;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.username || parsed.password) {
            return false;
        }

        return (
            (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
            parsed.hostname.length > 0
        );
    } catch {
        return false;
    }
}

export function validateUploadFile(
    file: File,
    maxBytes: number,
    allowedMimePrefixes: string[] = [],
    blockedMimeTypes: string[] = [],
): string | null {
    if (file.size > maxBytes) {
        return `File is too large. Max size is ${Math.floor(maxBytes / (1024 * 1024))}MB.`;
    }

    if (allowedMimePrefixes.length === 0) {
        return null;
    }

    const isAllowed = allowedMimePrefixes.some((prefix) =>
        file.type.startsWith(prefix),
    );

    if (!isAllowed) {
        return 'File type is not allowed.';
    }

    const normalizedType = file.type.trim().toLowerCase();
    const blockedTypeSet = new Set(
        blockedMimeTypes.map((type) => type.trim().toLowerCase()),
    );
    if (normalizedType && blockedTypeSet.has(normalizedType)) {
        return 'This file type is blocked for security reasons.';
    }

    return null;
}
