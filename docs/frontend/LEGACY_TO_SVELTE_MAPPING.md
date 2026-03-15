# Legacy React -> Svelte Mapping

This document maps the legacy React V1 frontend to the target Svelte + Inertia frontend implementation.

## Status Legend

- `Planned`: not started in Svelte.
- `In Progress`: actively being migrated.
- `Ready`: implemented and accepted.

---

## A) Legacy Screen to Target Route Mapping

| Legacy React Screen | Legacy File | Target Svelte Route/Page | Migration Wave | Status |
|---|---|---|---|---|
| Landing | `landing.jsx` | `Welcome.svelte` public intro route | Foundation | Ready |
| Login | `Login.jsx` | `auth/Login.svelte` | Foundation | Ready |
| Register | `Register.jsx` | `auth/Register.svelte` | Foundation | Ready |
| Teams | `Teams.jsx` | new app route `/workspace/teams` | Wave A | Ready |
| Dashboard | `Dashboard.jsx` | new app route `/dashboard` | Wave A | Ready |
| Tasks | `Taskspage.jsx` | new app route `/workspace/tasks` | Wave A | Ready |
| Calendar | `CalendarPage.jsx` | new app route `/workspace/calendar` | Wave A | Ready |
| Chat | `ChatPage.jsx` | new app route `/workspace/chat` | Wave B | Ready |
| File System | `File.jsx` | new app route `/workspace/files` | Wave B | Ready |
| AI Assistant | `AI.jsx` | new app route `/workspace/ai` | Wave C | Ready |
| Profile | `Profile.jsx` | `settings/Profile.svelte` | Wave C | Ready |

---

## B) Shared Legacy Components -> Target Shared Modules

| Legacy Component | Role in Legacy | Target Svelte Equivalent |
|---|---|---|
| `Sidebar.jsx` | feature navigation | app shell sidebar/navigation module |
| `Avatar.jsx` | avatar URL utility rendering | reusable avatar component in design system |
| `ShinyText.jsx`, `SplitText.jsx`, `Magnet.jsx` | marketing/animation utilities | optional motion utilities under design system |
| `AppLayout.jsx` | old dashboard mock layout | not migrated as-is (replace with current app layout system) |

---

## C) API Dependency Mapping (Frontend Consumption)

These endpoints are already used by legacy frontend and must be consumed as-is by new frontend unless clarified by backend team.

## Auth + User

- `POST /api/login`
- `POST /api/register`
- `GET /api/user/show`
- `GET /api/user/teams`
- `DELETE /api/user/delete`

## Teams

- `GET /api/user/teams`
- `POST /api/team/create`
- `POST /api/team/joinTeam`
- `DELETE /api/team/{id}/delete`

## Tasks/Calendar/Dashboard

- `GET /api/tasks/{team}/index`
- `POST /api/tasks/{team}/store`
- `PUT /api/tasks/{task}/update`
- `DELETE /api/tasks/{task}/delete`
- `GET /api/tasks/{team}/suggestions`

## Chat

- `GET /api/chats/{team}/index`
- `POST /api/chats/{team}/store`
- `GET /api/chats/{chat}/getMessages`
- `POST /api/chats/{chat}/sendMessages`
- `POST /api/chats/{chat}/ask`
- `PUT /api/chats/{chat}`
- `DELETE /api/chats/{chat}`
- `DELETE /api/chats/{message}/deleteMessage`

## AI Assistant

- `GET /api/ai_chats/{team}/index`
- `POST /api/ai_chats/{team}/store`
- `GET /api/ai_chats/{chat}/history`
- `POST /api/ai_chats/{chat}/send`
- `POST /api/ai_chats/{chat}/websearch`
- `DELETE /api/ai_chats/{chat}`
- `POST /api/files/{team}/aicreate`

## Files/Folders

- `GET /api/folders/{team}/index`
- `POST /api/folders/{team}/store`
- `DELETE /api/folders/{team}/delete`
- `POST /api/files/{team}/store`
- `GET /api/files/{team}/download`
- `DELETE /api/files/{team}/delete`

---

## D) Migration Priority and Risk Notes

## Highest Priority (Wave A)

- Teams, Dashboard, Tasks, Calendar.
- Reason: these features establish daily work loop and team context.

## Medium/High Priority (Wave B)

- Chat and Files.
- Reason: high complexity and async failure risks (messages/media/file operations).

## Medium Priority (Wave C)

- AI and Profile.
- Reason: important but can be stabilized after collaboration core is migrated.

## Notable Legacy Risks to Remove During Migration

- String-based page switching instead of route navigation.
- Hardcoded backend host assumptions.
- Legacy localStorage token-centric auth behavior.
- Inconsistent error/loading UX between pages.

---

## E) Sign-Off Tracking

| Area | Frontend Lead | Backend Verifier | QA | Status | Notes |
|---|---|---|---|---|---|
| Wave A | TBD | TBD | TBD | Planned | |
| Wave B | TBD | TBD | TBD | Planned | |
| Wave C | TBD | TBD | TBD | Planned | |
| Final Cutover | TBD | TBD | TBD | Planned | |
