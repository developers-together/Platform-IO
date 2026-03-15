# Frontend Audit Report - 2026-03-15

## Scope

A full frontend quality and security pass was executed over `resources/js` and lockfile dependencies.

Checks run:

- `npm run lint`
- `npm run check`
- `npm run test`
- `npm audit --json`
- Targeted static scan for risky frontend patterns (`{@html}`, `innerHTML`, `eval`, `target="_blank"` safety)

## Findings and Fixes

### 1) High: vulnerable transitive dependencies

- Problem:
    - `flatted <3.4.0` (DoS recursion advisory)
    - `devalue <=5.6.3` (prototype pollution advisories)
- Fix:
    - Ran `npm audit fix` and updated lockfile.
- Result:
    - `npm audit --json` now reports `0` vulnerabilities.

### 2) Medium: URL validation could allow scheme-relative external URLs

- Problem:
    - `isSafeHttpUrl` accepted values starting with `/`, which included `//evil.example/...`.
- Fix:
    - Rejected scheme-relative URLs.
    - Rejected URLs with credentials (`user:pass@host`).
    - Added control-char rejection and stricter checks.
- Files:
    - `resources/js/lib/security.ts`
    - `resources/js/lib/__tests__/security.test.ts`

### 3) Medium: encoded traversal path handling

- Problem:
    - traversal checks only validated raw input path.
- Fix:
    - Added decoded-path traversal validation (reject `%2e%2e` variants) and control-char checks.
- Files:
    - `resources/js/lib/security.ts`
    - `resources/js/lib/__tests__/security.test.ts`

### 4) Medium: unsafe backend file entries could leak into UI list

- Problem:
    - unsafe/invalid backend paths were not fully filtered before mapping to entries.
- Fix:
    - `normalizeEntryPath` returns `null` for unsafe input and caller filters invalid rows.
    - Added strict guards for invalid upload filenames and folder names.
- Files:
    - `resources/js/lib/api/files.ts`
    - `resources/js/lib/api/__tests__/files.test.ts`

### 5) Low: external links with `target="_blank"` needed `rel` hardening

- Problem:
    - some links were missing `rel="noopener noreferrer"`.
- Fix:
    - Added `rel="noopener noreferrer"` where needed.
- Files:
    - `resources/js/pages/Welcome.svelte`

### 6) Reliability/Lint blockers in workspace pages

- Problem:
    - Svelte lint/type blockers (`Set`/`Date` mutable patterns and keyed each loops in prior pass).
- Fix:
    - Reworked affected state logic to lint-compliant patterns.
    - Fixed dashboard calendar day check after Set-to-array conversion.
- Files:
    - `resources/js/pages/workspace/Tasks.svelte`
    - `resources/js/pages/workspace/Calendar.svelte`
    - `resources/js/pages/Dashboard.svelte`

## Validation Results

- `npm run lint` -> pass
- `npm run check` -> pass
- `npm run test` -> pass (45 tests)
- `npm audit --json` -> pass (0 vulnerabilities)
- E2E/a11y/performance harness added via Playwright (`npm run test:e2e`, `npm run test:a11y`, `npm run test:perf`).

## Remaining Blockers / Environment Limits

- `npm run build` requires a configured Laravel runtime and `.env` setup to succeed (PHP is present, but build not executed in this audit run).
- E2E/perf runs require a live UI server (`npm run ui`) and valid auth credentials/cookies for authenticated routes.
- If Docker is missing, `npm run ui` and downstream E2E/perf checks will fail locally.
- Frontend compile/runtime in full Laravel context should be re-verified on a machine with PHP + Composer toolchain available.

## Follow-up Recommendations

1. Run `npm run quality:full` in a full Docker/Laravel runtime to exercise E2E + perf budgets.
2. Run `npm run build` in the full Laravel runtime to validate production artifact generation.
3. Capture backend verification sign-off using `docs/frontend/BACKEND_VERIFICATION_CHECKLIST.md`.
