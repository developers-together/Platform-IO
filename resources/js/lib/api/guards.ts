export type JsonObject = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonObject {
    return Boolean(value) && typeof value === 'object';
}

export function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

export function toBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    if (typeof value === 'string') {
        const lowered = value.toLowerCase().trim();
        if (lowered === 'true' || lowered === '1') return true;
        if (lowered === 'false' || lowered === '0') return false;
    }

    return fallback;
}

export function toStringValue(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
        return value;
    }

    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value);
}

export function toNullableString(value: unknown): string | null {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? value : null;
    }

    return null;
}
