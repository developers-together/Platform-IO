# Frontend Migration Docs (Platform-IO Remake)

This folder is the single source of truth for the frontend rewrite from the legacy React prototype to the Svelte + Inertia system on `platform-IO-remake`.

## Documents

- [FRONTEND_SYSTEM_MIGRATION_PLAN.md](./FRONTEND_SYSTEM_MIGRATION_PLAN.md)
    - Full implementation plan and delivery phases.
    - Security, usability, and performance-first standards.
    - Full frontend test strategy and release gates.
- [LEGACY_TO_SVELTE_MAPPING.md](./LEGACY_TO_SVELTE_MAPPING.md)
    - Legacy React page/component inventory.
    - Target Svelte route/component mapping.
    - API dependency mapping and migration wave assignment.
- [BACKEND_VERIFICATION_CHECKLIST.md](./BACKEND_VERIFICATION_CHECKLIST.md)
    - Backend-facing verification checklist.
    - Endpoint contract checks and sign-off fields.
    - Cross-team acceptance gates.
- [FRONTEND_BACKEND_CONNECTIVITY_RUNBOOK.md](./FRONTEND_BACKEND_CONNECTIVITY_RUNBOOK.md)
    - Command-driven connectivity checks between frontend and backend APIs.
    - Authenticated smoke-probe workflow for backend engineers.
    - Pass/fail interpretation and sign-off flow.
- [FRONTEND_AUDIT_2026-03-15.md](./FRONTEND_AUDIT_2026-03-15.md)
    - Security and reliability audit findings.
    - Concrete fixes completed in the frontend codebase.
    - Remaining environment limitations and follow-up actions.

## Audience

- Frontend engineers implementing the Svelte system.
- Backend engineers validating existing API contracts without backend changes.
- Product/design/QA owners reviewing quality gates and rollout readiness.

## Ground Rules

- Backend, DB, and AI service code are read-only for this migration effort.
- Frontend changes must remain compatible with existing backend contracts.
- No wave is complete without passing security, usability, and performance gates.
