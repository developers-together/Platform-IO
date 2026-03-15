import { describe, expect, it } from 'vitest';
import {
    isRecord,
    toBoolean,
    toNullableString,
    toNumber,
    toStringValue,
} from '@/lib/api/guards';

describe('api guard utilities', () => {
    it('checks records', () => {
        expect(isRecord({ name: 'ok' })).toBe(true);
        expect(isRecord(null)).toBe(false);
        expect(isRecord(5)).toBe(false);
    });

    it('parses numbers', () => {
        expect(toNumber(5)).toBe(5);
        expect(toNumber('12')).toBe(12);
        expect(toNumber('abc')).toBeNull();
        expect(toNumber('')).toBeNull();
    });

    it('parses booleans with fallback', () => {
        expect(toBoolean(true)).toBe(true);
        expect(toBoolean('1')).toBe(true);
        expect(toBoolean('false')).toBe(false);
        expect(toBoolean('unknown', true)).toBe(true);
    });

    it('normalizes strings', () => {
        expect(toStringValue('test')).toBe('test');
        expect(toStringValue(123)).toBe('123');
        expect(toStringValue(undefined, 'fallback')).toBe('fallback');
    });

    it('returns nullable strings only when non-empty', () => {
        expect(toNullableString('team-code')).toBe('team-code');
        expect(toNullableString('   ')).toBeNull();
        expect(toNullableString(null)).toBeNull();
    });
});
