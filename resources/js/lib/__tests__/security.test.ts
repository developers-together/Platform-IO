import { describe, expect, it } from 'vitest';
import {
    isSafeHttpUrl,
    isSafeWorkspacePath,
    joinWorkspacePath,
    normalizeWorkspacePath,
    sanitizeFilename,
    validateUploadFile,
} from '@/lib/security';

describe('security path utilities', () => {
    it('normalizes paths consistently', () => {
        expect(normalizeWorkspacePath('documents/reports')).toBe(
            '/documents/reports',
        );
        expect(normalizeWorkspacePath('/documents/reports/')).toBe(
            '/documents/reports',
        );
        expect(normalizeWorkspacePath('')).toBe('/');
    });

    it('rejects traversal paths', () => {
        expect(isSafeWorkspacePath('/safe/path')).toBe(true);
        expect(isSafeWorkspacePath('/safe/../evil')).toBe(false);
        expect(isSafeWorkspacePath('/safe/%2e%2e/evil')).toBe(false);
    });

    it('sanitizes filenames and joins with current path', () => {
        expect(sanitizeFilename('../../financials.xlsx')).toBe(
            'financials.xlsx',
        );
        expect(joinWorkspacePath('/docs', ' plan .txt')).toBe(
            '/docs/plan .txt',
        );
    });
});

describe('security url utilities', () => {
    it('accepts only safe schemes', () => {
        expect(isSafeHttpUrl('/storage/file.png')).toBe(true);
        expect(isSafeHttpUrl('https://example.com/file.png')).toBe(true);
        expect(isSafeHttpUrl('//evil.example/file.png')).toBe(false);
        expect(isSafeHttpUrl('https://user:pass@example.com/file.png')).toBe(
            false,
        );
        expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    });
});

describe('security upload guards', () => {
    it('validates max file size', () => {
        const file = new File(['a'.repeat(1024)], 'small.txt', {
            type: 'text/plain',
        });
        const oversized = new File(['a'.repeat(5)], 'big.txt', {
            type: 'text/plain',
        });

        expect(validateUploadFile(file, 2048)).toBeNull();
        expect(validateUploadFile(oversized, 2)).toContain('File is too large');
    });

    it('validates allowed mime prefixes', () => {
        const png = new File(['x'], 'image.png', { type: 'image/png' });
        const text = new File(['x'], 'notes.txt', { type: 'text/plain' });

        expect(validateUploadFile(png, 5000, ['image/'])).toBeNull();
        expect(validateUploadFile(text, 5000, ['image/'])).toBe(
            'File type is not allowed.',
        );
    });

    it('blocks explicit dangerous mime types', () => {
        const svg = new File(['<svg></svg>'], 'vector.svg', {
            type: 'image/svg+xml',
        });

        expect(
            validateUploadFile(svg, 5000, ['image/'], ['image/svg+xml']),
        ).toBe('This file type is blocked for security reasons.');
    });
});
