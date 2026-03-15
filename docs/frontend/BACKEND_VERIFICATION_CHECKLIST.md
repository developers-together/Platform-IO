# Backend Verification Checklist (Frontend Migration Support)

This checklist is for backend team review while frontend migrates to Svelte without backend code changes.

## Purpose

- Confirm existing API contracts are stable for frontend migration.
- Surface backend/frontend contract mismatches early.
- Provide explicit cross-team sign-off for each migration wave.

## Scope Rule

- Frontend team will not change backend/database/AI code in this effort.
- Backend team verifies behavior and clarifies contract expectations as needed.

---

## 0) Fast Connectivity Commands (Run First)

Reference runbook:

- `docs/frontend/FRONTEND_BACKEND_CONNECTIVITY_RUNBOOK.md`

Required pre-checks:

- [ ] `npm run ui` started successfully.
- [ ] `npm run verify:contracts` completed successfully.
- [ ] `npm run verify:backend` completed with `FAIL=0`.
- [ ] `npm run verify:backend:full` completed with `FAIL=0`.
- [ ] Authenticated probe executed by backend representative.

Authenticated probe command template:

```bash
FRONTEND_SESSION_COOKIE='laravel_session=...; XSRF-TOKEN=...' npm run verify:backend -- --profile auth --include-write-probes
```

Recorded smoke summary:

- Date/time:
- Environment (`local` / `staging`):
- PASS count:
- INFO count:
- WARN count:
- FAIL count:
- Notes on warnings:

---

## 1) General Contract Checks

- [ ] Endpoint paths are accessible under expected prefixes.
- [ ] Authentication/session behavior is consistent for protected endpoints.
- [ ] HTTP status codes are consistent for success/validation/auth/authorization failures.
- [ ] Response payload shape is stable (required fields present and correctly typed).
- [ ] Pagination structure is consistent where used.
- [ ] Error responses are predictable enough for user-safe frontend handling.

Notes:

- Observed contract issues:
- Clarifications provided by backend:

---

## 2) Domain-by-Domain Verification

## Auth and User

- [ ] `POST /api/login` contract verified.
- [ ] `POST /api/register` contract verified.
- [ ] `GET /api/user/show` contract verified.
- [ ] `GET /api/user/teams` contract verified.
- [ ] `DELETE /api/user/delete` contract verified.

## Teams

- [ ] Team list/create/join/delete contracts verified.
- [ ] Team membership/permission assumptions confirmed.

## Tasks and Calendar

- [ ] Task index/store/update/delete contracts verified.
- [ ] Suggestion endpoint payload contract verified.
- [ ] Date/time field semantics (start/end/timezone assumptions) clarified.

## Chat

- [ ] Channel list/create/update/delete contracts verified.
- [ ] Message list/send/delete contracts verified.
- [ ] Reply/message-linking fields confirmed.
- [ ] Image upload/URL behavior verified.

## AI

- [ ] AI chat list/create/history contracts verified.
- [ ] Send/websearch response contracts verified.
- [ ] AI error and timeout semantics clarified.

## Files/Folders

- [ ] Folder index/store/delete contracts verified.
- [ ] File upload/download/delete contracts verified.
- [ ] File path conventions and edge-case behavior verified.

---

## 3) Security Verification Points

- [ ] Protected endpoints reject unauthenticated access as expected.
- [ ] Authorization boundaries are enforced consistently.
- [ ] Unsafe input does not return unsafe renderable payloads.
- [ ] Upload/download flows enforce expected restrictions.

Security notes from backend team:

---

## 4) Performance and Reliability Verification Points

- [ ] Heavy endpoints have acceptable response times for target frontend UX.
- [ ] Large payload behavior is stable and documented.
- [ ] Rate-limited endpoints are identified and documented.
- [ ] Intermittent failure behavior (timeouts, downstream AI issues) is documented.

Reliability notes from backend team:

---

## 5) Wave Sign-Off

## Wave A (Teams, Dashboard, Tasks, Calendar)

- Frontend representative:
- Backend representative:
- QA representative:
- Date:
- Status: `Pending / Approved / Blocked`
- Blocking items:

## Wave B (Chat, Files)

- Frontend representative:
- Backend representative:
- QA representative:
- Date:
- Status: `Pending / Approved / Blocked`
- Blocking items:

## Wave C (AI, Profile)

- Frontend representative:
- Backend representative:
- QA representative:
- Date:
- Status: `Pending / Approved / Blocked`
- Blocking items:

## Final Cutover Sign-Off

- Frontend lead:
- Backend lead:
- QA lead:
- Product owner:
- Date:
- Status: `Pending / Approved / Blocked`
- Final notes:

---

## 6) Escalation Protocol

If a blocking contract mismatch appears:

1. Frontend logs the mismatch with endpoint + sample payload + user impact.
2. Backend validates expected behavior and confirms whether issue is known.
3. Teams agree on either:
    - frontend-safe workaround without backend changes, or
    - backend-team follow-up ticket outside this frontend migration scope.
