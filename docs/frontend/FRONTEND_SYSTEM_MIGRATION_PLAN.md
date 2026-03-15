# Frontend System Migration Plan

## 1) Project Context and Purpose

## What Platform-IO is

Platform-IO started as a hackathon prototype focused on AI-assisted team collaboration: teams, tasks, chat, AI assistant, shared files, and profile management.

## History Summary

- Legacy system: React + Vite frontend with manual page switching and direct axios calls to backend APIs.
- Current remake branch: Laravel + Inertia + Svelte foundation already exists, but business feature parity with the legacy frontend is incomplete.
- Migration objective: deliver a complete, production-grade Svelte frontend while reusing already written backend APIs and avoiding backend code changes.

## Product Intent (Target)

Build a reliable team collaboration frontend that is:

- Secure by default.
- Fast and stable under real usage.
- Usable and accessible for daily team workflows.

---

## 2) Constraints and Non-Negotiables

- Frontend-only implementation scope.
- No backend/database/AI code modifications.
- Compatibility with existing API contracts.
- Session/cookie-based auth model via existing Laravel/Fortify/Inertia stack.
- Phased rollout (no big-bang cutover).
- Security, usability, and performance are mandatory acceptance gates.

---

## 3) Target Frontend Architecture

## App Layers

- Inertia route/page layer for navigable screens.
- Shared app shell layer (layout, nav, team context, global loading/errors).
- Domain service layer (typed API clients + response guards + mappers).
- Feature modules (Teams, Dashboard, Tasks, Calendar, Chat, Files, AI, Profile).
- Shared design system layer (tokens, primitives, interaction conventions).

## Data and Error Handling

- Centralized API client with:
    - credentials-based requests.
    - CSRF-safe behavior.
    - consistent error normalization.
- Frontend response guards for all critical endpoints.
- Consistent UI error patterns: inline validation, recoverable empty/error states, retry actions where safe.

## Navigation Model

- Route-driven navigation (no string-based page state switching).
- Deep-linkable pages for all major domains.
- Guarded authenticated routes and graceful session-expired handling.

---

## 4) Delivery Plan (Phased)

## Phase 0: Foundations and Contract Baseline

Deliverables:

- API contract matrix from existing endpoints and payloads.
- Legacy-to-target mapping baseline.
- Shared frontend docs structure.
- Frontend coding standards and quality gates finalized.

Exit criteria:

- Every migrated feature has documented endpoint dependencies.
- Risk register started (contract ambiguities, UX debt, perf hotspots).

## Phase 1: Core Platform Infrastructure

Deliverables:

- Shared API layer and typed domain models.
- Session-auth integration patterns.
- Common app shell and route skeleton.
- Standardized loading/error/empty state components.

Exit criteria:

- New pages can be built without endpoint duplication.
- Auth/session failure behavior is consistent.

## Phase 2: Wave A (Core Productivity)

Features:

- Teams
- Dashboard
- Tasks
- Calendar

Deliverables:

- Functional parity + redesigned UX in these domains.
- Contract-safe payload mapping to existing backend responses.
- E2E coverage for core user path: login -> team -> dashboard -> tasks/calendar.

Exit criteria:

- Core collaboration flow is stable and test-gated.

## Phase 3: Wave B (Collaboration)

Features:

- Chat (channels/messages/replies/image upload/ask AI-in-chat)
- Files (browse/upload/download/delete/folders)

Deliverables:

- Rebuilt collaboration surfaces in Svelte.
- Strong error/latency handling for heavy flows.
- Security checks for user content rendering and file actions.

Exit criteria:

- Chat/files workflows are production-ready under reliability gates.

## Phase 4: Wave C (AI + Profile)

Features:

- AI Assistant page
- Profile/account settings integration

Deliverables:

- AI flows migrated with robust failure UX and safe rendering.
- Profile/account operations integrated into the new app shell.

Exit criteria:

- Full legacy feature set covered in Svelte.

## Phase 5: Final Hardening and Cutover

Deliverables:

- Full regression pass across all domains.
- Performance budgets enforced.
- Security and accessibility sweep complete.
- Team sign-offs recorded.

Exit criteria:

- Release checklist passes and handoff docs are complete.

## Current Implementation Snapshot (March 15, 2026)

- Wave A, B, and C workspace pages are now implemented in Svelte:
    - Teams
    - Dashboard
    - Tasks
    - Calendar
    - Chat
    - Files
    - AI Assistant
- React parity additions delivered in this pass:
    - Dashboard cards aligned with legacy behavior (tasks, recent chat, AI suggestions, calendar, upcoming events).
    - Tasks page supports inline editing, expanded details, starring, completion toggles, and guarded deletion.
    - Calendar page restored to timed weekly grid with current-time marker and interactive day/event hovers.
    - AI page supports create-file and edit-file action modes.
    - Chat and AI history now use progressive windowing (show-recent-by-default with “show earlier” toggle) to reduce render cost on long histories.
- Security hardening additions in frontend:
    - Unsafe attachment URLs are blocked in chat and AI history rendering.
    - Workspace file paths are validated and unsafe traversal paths are rejected before API calls.
- Automated frontend validation currently includes:
    - `npm run check` (Svelte + TS diagnostics)
    - `npm run test` with 8 test files / 45 tests focused on API contracts and security helpers.
    - `npm run test:e2e` for Playwright coverage of public routes and authenticated workspace pages (auth-enabled when env vars are provided).
    - `npm run test:a11y` for axe-core accessibility checks (critical/serious by default; strict mode via `E2E_A11Y_STRICT=true`).
    - `npm run test:perf` for LCP/INP/CLS budget checks via in-browser PerformanceObserver (requires `E2E_PERF=true`).
    - `npm run verify:contracts` for static frontend API method/path to backend route verification.
    - `npm run verify:backend` and `npm run verify:backend:full` for backend connectivity smoke verification.
- PHP is available in this environment; `npm run build` should now be runnable, but still requires a configured Laravel runtime and `.env` setup to succeed.

## Implementation Status (March 15, 2026)

- Phase 0: Complete (docs, mapping, contract baseline).
- Phase 1: Complete (shared API layer, layout, error/loading patterns).
- Phase 2: Complete (Teams, Dashboard, Tasks, Calendar).
- Phase 3: Complete (Chat, Files).
- Phase 4: Complete (AI, Profile).
- Phase 5: Implementation complete; pending environment verification + team sign-offs.

---

## 5) Security Hardening Plan (Frontend)

Security controls to add/standardize from phase 1 onward:

- Strict handling of user-generated or AI-generated content before rendering.
- Safer external link handling and unsafe URL rejection.
- Safe file upload UX constraints (type/size checks, clear error states).
- Auth/session guardrails for unauthorized/expired states.
- No sensitive token storage in localStorage/sessionStorage for auth.
- Frontend dependency vulnerability checks in CI.
- Route and action-level permission-aware UX (hide/disable actions not permitted).

Security acceptance criteria:

- No critical/high frontend security findings.
- All injection/sanitization tests pass.
- Session-expiry and auth-failure flows are deterministic and user-safe.

---

## 6) Usability and Accessibility Plan

Usability goals:

- Reduce cognitive load with consistent interactions across domains.
- Fast, predictable feedback on async actions.
- Clear empty/error guidance and recoverability.
- Team onboarding micro-journey polish:
    - During create/join team steps, transition each step with slide-down + fade-out to make the “connecting you to your team” flow explicit.
    - Scope is intentionally limited to team create/join flow, not global page transitions.

Accessibility goals:

- Keyboard operability for all major features.
- Focus management for dialogs/menus/forms.
- Semantic structure and ARIA usage for assistive tech.
- Color contrast and visual-state clarity.

Acceptance criteria:

- Automated a11y checks pass on core routes.
- Manual keyboard path verification passes for all critical workflows.

---

## 7) Performance Hardening Plan

Performance actions:

- Route-level code splitting for heavy modules (AI/chat/files).
- Progressive loading for large histories (chat + AI windowing with optional “show earlier”).
- Image/media optimization and lazy-loading strategy.
- Prevent avoidable rerenders and layout shifts.

Performance budgets (targets):

- LCP <= 2.5s (p75)
- INP <= 200ms (p75)
- CLS <= 0.10 (p75)
- Controlled JS payload growth by feature wave

Acceptance criteria:

- Budget checks pass in CI for critical routes.
- No major interaction regressions between waves.

---

## 8) Full Test Suite Plan

## Static and Type Safety

- Type checks on Svelte/TS models.
- Lint + formatting gates.
- Contract/schema guard tests.

## Unit and Component Tests

- Shared primitives and state utilities.
- Domain mappers and validators.
- Feature component behaviors and edge cases.
    - Implemented in `resources/js/lib/**/__tests__` using Vitest.

## Integration Tests

- API service layer tests with mocked backend responses.
- Error normalization and fallback behaviors.
- Contract mismatch handling tests.
    - Implemented alongside API client tests in `resources/js/lib/api/__tests__`.

## E2E Tests

Coverage across all primary journeys:

- Authentication and session behavior.
- Team selection and workspace entry.
- Dashboard and tasks lifecycle.
- Calendar interactions.
- Chat create/send/reply/delete/image flow.
- Files upload/download/delete/folder flow.
- AI assistant key workflows.
- Profile/account workflows.
    - Implemented via Playwright in `tests/e2e` with optional auth (`E2E_USER_EMAIL` / `E2E_USER_PASSWORD` or `E2E_SESSION_COOKIE`).
    - Default runs validate route guards and page-level smoke coverage; full data mutation flows require a seeded backend environment.

## Accessibility Tests

- Automated accessibility scan for core pages.
- Keyboard navigation and focus-trap tests.
    - Implemented via axe-core Playwright tests in `tests/e2e/a11y.spec.ts` (critical/serious by default; strict mode opt-in).

## Performance Tests

- Route-level performance checks and bundle budget checks.
- Critical interaction latency checks on heavy pages.
    - Implemented via Playwright PerformanceObserver checks in `tests/e2e/perf.spec.ts` (budgets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.10).

Release gate:

- No feature wave can be marked complete unless all required test layers pass.
    - Full suite shortcut: `npm run quality:full` (requires a running UI stack for E2E/perf).

---

## 9) Cross-Team Workflow and Sign-Off

## Frontend Team Responsibilities

- Implement all Svelte pages and client-side hardening.
- Maintain migration docs and test evidence by wave.
- Log backend contract issues without changing backend code.

## Backend Team Responsibilities

- Validate existing API behavior against frontend expectations.
- Confirm contract assumptions or provide clarifications.
- Sign off on checklist per wave.

## Sign-Off Required Before Final Cutover

- Frontend lead sign-off.
- Backend verification sign-off.
- QA sign-off (functional + a11y + performance).

---

## 10) Definition of Done (Final)

The migration is done when:

- All legacy functional domains are available in Svelte.
- Security, usability, and performance gates pass globally.
- Documentation pack is complete and accepted by frontend + backend teams.
- Production readiness checklist is fully approved.
