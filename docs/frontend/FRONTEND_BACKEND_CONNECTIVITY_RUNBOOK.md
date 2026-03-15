# Frontend-Backend Connectivity Runbook

This runbook helps frontend and backend engineers quickly verify that the Svelte frontend is wired correctly to backend routes before doing deeper manual testing.

## 1) Start the UI stack

```bash
npm run ui
```

Open `http://localhost` and make sure you can reach the app shell.

## 2) Quick route/connectivity smoke check (read-only)

Run a static contract check first:

```bash
npm run verify:contracts
```

Then run connectivity probes:

```bash
npm run verify:backend
```

Shortcut to run both read-only + write-validation probes:

```bash
npm run verify:runtime
```

This probes all key read endpoints used by frontend domains:

- Teams
- Tasks + suggestions
- Chat channels + messages
- Files folders + download
- AI chats + history

## 3) Full contract probe (includes write-validation endpoints)

```bash
npm run verify:backend:full
```

Important:

- This mode uses **validation-style payloads** intended to avoid real data mutations.
- It is safe for backend verification in dev/staging, but do not run against production without review.

## 4) Authenticated probe mode (recommended for backend engineers)

If you want to test as an authenticated app user, pass your session cookie string:

```bash
FRONTEND_SESSION_COOKIE='laravel_session=...; XSRF-TOKEN=...' npm run verify:backend -- --profile auth --include-write-probes
```

How to get cookie string:

- Login in browser.
- Open devtools -> Application/Storage -> Cookies.
- Copy `laravel_session` and `XSRF-TOKEN` as a semicolon-separated cookie header string.

## 5) How to read results

Each probe prints one of:

- `PASS`: expected successful response.
- `INFO`: protected/auth/CSRF endpoint behavior (for example `401`, `403`, `419`).
- `WARN`: possible contract issue (for example `404`, `405`, other 4xx).
- `FAIL`: network/transport issue or server `5xx`.

Recommended gate for backend test readiness:

- `FAIL = 0`
- No unexpected `WARN` on critical domain endpoints.

## 6) Useful options

```bash
# Show probes without sending requests
npm run verify:backend:dry

# Custom backend URL and timeout
node scripts/backend-smoke.mjs --base-url http://localhost:8080 --timeout-ms 15000
```

## 7) Backend-team sign-off workflow

1. Run `npm run verify:backend:full` in authenticated mode.
2. Run core manual flow in UI:
    - login -> team select/create -> dashboard
    - tasks create/update/complete
    - chat channel/message send/reply
    - files upload/download/delete
    - AI prompt + history refresh
3. Record findings in:
    - `docs/frontend/BACKEND_VERIFICATION_CHECKLIST.md`
4. Mark wave sign-off status.
