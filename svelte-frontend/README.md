# Platform-IO — Svelte Frontend (Inertia Convention)

Svelte pages structured following Laravel Inertia naming conventions, migrated from the React frontend.

## Directory Structure

```
svelte-frontend/
├── src/
│   ├── app.css                         # Global design tokens & reset
│   ├── app.html                        # HTML shell (favicon, security meta)
│   │
│   ├── Pages/                          # ← Inertia page components
│   │   ├── Welcome.svelte              # Landing page (/)
│   │   ├── Auth/
│   │   │   ├── Login.svelte            # Login page (/login)
│   │   │   └── Register.svelte         # Register page (/register)
│   │   ├── Teams.svelte                # Team selection (/teams)
│   │   ├── Dashboard.svelte            # Main dashboard (/dashboard)
│   │   ├── Tasks.svelte                # Task management (/tasks)
│   │   ├── Chat.svelte                 # Team chat (/chat)
│   │   ├── Calendar.svelte             # Calendar view (/calendar)
│   │   ├── Files.svelte                # Shared file system (/files)
│   │   ├── AI.svelte                   # AI assistant (/ai)
│   │   └── Profile.svelte              # User profile (/profile)
│   │
│   ├── Layouts/                        # ← Inertia layout components
│   │   ├── GuestLayout.svelte          # Public pages (landing, auth)
│   │   └── AuthenticatedLayout.svelte  # Protected pages (sidebar + content)
│   │
│   └── lib/                            # Shared utilities
│       ├── api/client.js               # Fetch wrapper with auth token
│       ├── stores/
│       │   ├── auth.js                 # token, user (localStorage-persisted)
│       │   ├── team.js                 # selectedTeam / teamId
│       │   └── ui.js                   # sidebarOpen, theme
│       └── components/                 # Reusable UI components
│           ├── Avatar.svelte           # UI Avatars integration
│           ├── Magnet.svelte           # Magnetic cursor effect
│           ├── ShinyText.svelte        # Shimmer text animation
│           ├── Sidebar.svelte          # Navigation sidebar
│           ├── Spinner.svelte          # Loading spinner
│           └── SplitText.svelte        # Character reveal animation
│
├── static/                             # Static assets
│   ├── bg.png, landing.png             # Background images
│   ├── WelcomeBack.png                 # Login page background
│   ├── WelcomeOnboard.png              # Register page background
│   ├── favicon.svg                     # Purple fan icon (#8e44ad)
│   └── robots.txt
│
├── package.json                        # Dependencies
├── svelte.config.js                    # Svelte compiler config
├── vite.config.js                      # Vite + API proxy
└── .npmrc                              # pnpm config
```

## SvelteKit → Inertia File Mapping

| SvelteKit Route | Inertia Page | URL |
|---|---|---|
| `routes/+page.svelte` | `Pages/Welcome.svelte` | `/` |
| `routes/login/+page.svelte` | `Pages/Auth/Login.svelte` | `/login` |
| `routes/register/+page.svelte` | `Pages/Auth/Register.svelte` | `/register` |
| `routes/teams/+page.svelte` | `Pages/Teams.svelte` | `/teams` |
| `routes/(app)/dashboard/+page.svelte` | `Pages/Dashboard.svelte` | `/dashboard` |
| `routes/(app)/tasks/+page.svelte` | `Pages/Tasks.svelte` | `/tasks` |
| `routes/(app)/chat/+page.svelte` | `Pages/Chat.svelte` | `/chat` |
| `routes/(app)/calendar/+page.svelte` | `Pages/Calendar.svelte` | `/calendar` |
| `routes/(app)/files/+page.svelte` | `Pages/Files.svelte` | `/files` |
| `routes/(app)/ai/+page.svelte` | `Pages/AI.svelte` | `/ai` |
| `routes/(app)/profile/+page.svelte` | `Pages/Profile.svelte` | `/profile` |
| `routes/+layout.svelte` | `Layouts/GuestLayout.svelte` | — |
| `routes/(app)/+layout.svelte` | `Layouts/AuthenticatedLayout.svelte` | — |

## Migration Notes

> [!IMPORTANT]
> The pages still contain SvelteKit-specific imports (`$app/navigation`, `$app/stores`, `$app/environment`).
> These must be replaced with Inertia equivalents when integrating with Laravel:
> - `goto('/path')` → `router.visit('/path')` (from `@inertiajs/svelte`)
> - `$page.url.pathname` → `$page.url` (from Inertia's `$page` store)
> - `import { browser }` → `typeof window !== 'undefined'`
> - `<svelte:head>` → `<Head>` (from `@inertiajs/svelte`)

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | Svelte 5 |
| Styling | Vanilla CSS (scoped + global `app.css`) |
| Font | Poppins (Google Fonts) |
| Backend Integration | Laravel Inertia (target) |
| API Client | Custom fetch wrapper with auth token |

## Environment

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (install with `pnpm install --ignore-workspace`)
