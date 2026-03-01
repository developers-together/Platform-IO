# Platform-IO — Developer Guide

A Nextcloud-style collaboration platform built with **Laravel 12**, **Svelte** (via Inertia.js), and **Python AI services**, all orchestrated with **Docker Compose**.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|-------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ | [Windows](https://docs.docker.com/desktop/setup/install/windows-install/) · [macOS](https://docs.docker.com/desktop/setup/install/mac-install/) · [Linux](https://docs.docker.com/desktop/setup/install/linux/) |
| Git | 2.x | [Windows](https://git-scm.com/download/win) · [macOS](https://git-scm.com/download/mac) · [Linux](https://git-scm.com/download/linux) |

> [!NOTE]
> You do **not** need PHP, Composer, Node.js, or Python installed on your machine — everything runs inside Docker. All commands inside the containers are **identical on Windows, macOS, and Linux**.

---

## Quick Start

### Linux / macOS

```bash
# 1. Clone the repo
git clone <repo-url> && cd Platform-IO

# 2. Copy environment templates
cp .env.example .env
cp .env.docker.example .env.docker

# 3. Build and start all services
docker compose -f compose.dev.yaml up --build -d

# 4. Enter the workspace container
docker compose -f compose.dev.yaml exec workspace bash

# Inside the container (same on all platforms):
composer install
php artisan key:generate
npm install
php artisan migrate
npm run dev
```

### Windows (PowerShell)

```powershell
# 1. Clone the repo
git clone <repo-url>; cd Platform-IO

# 2. Copy environment templates
copy .env.example .env
copy .env.docker.example .env.docker

# 3. Build and start all services
docker compose -f compose.dev.yaml up --build -d

# 4. Enter the workspace container
docker compose -f compose.dev.yaml exec workspace bash

# Inside the container (same on all platforms):
composer install
php artisan key:generate
npm install
php artisan migrate
npm run dev
```

> [!TIP]
> **Windows users:** Make sure Docker Desktop is set to use **WSL 2** backend (Settings → General → "Use the WSL 2 based engine"). This gives much better performance than Hyper-V.

Open **http://localhost** in your browser.

---

## Environment Files

There are **two separate `.env` files** — don't mix them up:

| File | Used by | DB Host | Redis Host |
|------|---------|---------|------------|
| `.env` | Local `php artisan serve` (no Docker) | `127.0.0.1` | `127.0.0.1` |
| `.env.docker` | Docker containers (loaded via `env_file:`) | `mysql` | `redis` |

Both have committed templates (`.env.example` and `.env.docker.example`).

> [!IMPORTANT]
> After running `php artisan key:generate` inside the workspace container, **copy the `APP_KEY=` value from `.env` into `.env.docker`** so both files have the same key. Then restart the containers: `docker compose -f compose.dev.yaml restart`.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│  Docker Compose (compose.dev.yaml)                                │
│                                                                   │
│  ┌─────────┐   ┌─────────┐   ┌───────────┐   ┌──────────┐       │
│  │  nginx   │──▶│ php-fpm │──▶│   mysql   │   │  redis   │       │
│  │  :80     │   │  :9000  │   │   :3306   │   │  :6379   │       │
│  └─────────┘   └─────────┘   └───────────┘   └──────────┘       │
│                                                     │             │
│  ┌───────────┐  ┌───────────┐  ┌──────────────┐    │             │
│  │ workspace │  │  reverb   │  │  python_ai   │◀───┘             │
│  │ (CLI/npm) │  │  :8080    │  │ (AI worker)  │                  │
│  │  :5173    │  └───────────┘  └──────────────┘                  │
│  └───────────┘                                                   │
└───────────────────────────────────────────────────────────────────┘
```

| Service | Purpose |
|---------|---------|
| **web** (nginx) | Reverse proxy, serves static files, routes PHP to php-fpm |
| **php-fpm** | Runs Laravel (PHP 8.4, Xdebug enabled) |
| **workspace** | Interactive CLI — run `artisan`, `composer`, `npm` commands here |
| **mysql** | MySQL 8.0 database |
| **redis** | Cache, queues, sessions, and Reverb pub/sub |
| **reverb** | Laravel Reverb WebSocket server for real-time features |
| **python_ai** | Python AI worker — reads jobs from Redis |

---

## Common Commands

All commands assume you are in the project root.

### Docker

```bash
# Start everything
docker compose -f compose.dev.yaml up --build -d

# Stop everything
docker compose -f compose.dev.yaml down

# Stop and wipe database volumes (fresh start)
docker compose -f compose.dev.yaml down -v

# View logs
docker compose -f compose.dev.yaml logs -f          # all services
docker compose -f compose.dev.yaml logs -f php-fpm   # single service

# Enter the workspace container
docker compose -f compose.dev.yaml exec workspace bash
```

### Inside the Workspace Container

```bash
# Laravel
php artisan migrate              # run migrations
php artisan migrate:fresh --seed # reset DB + seed
php artisan tinker               # REPL
php artisan queue:work           # process queue jobs

# Composer
composer install
composer update

# Frontend (Svelte / Vite)
npm install
npm run dev                      # dev server with HMR on :5173
npm run build                    # production build
```

### Database

Connect to MySQL from your host machine:

```
Host:     127.0.0.1
Port:     3306
Database: platformio
Username: laravel
Password: secret
```

Or from inside any container, use the service name:

```bash
mysql -h mysql -u laravel -psecret platformio
```

---

## Project Structure

```
Platform-IO/
├── app/                    # Laravel application code
│   ├── Http/Controllers/   # API controllers
│   ├── Models/             # Eloquent models (Team, User, File, etc.)
│   └── Policies/           # Authorization policies
├── config/                 # Laravel config files
├── database/
│   ├── migrations/         # DB schema migrations
│   └── seeders/            # Test data seeders
├── docker/
│   ├── common/php-fpm/     # Shared PHP-FPM Dockerfile (dev + prod)
│   ├── development/        # Dev-only Dockerfiles & configs
│   └── production/         # Production Dockerfiles & configs
├── python_services/        # Python AI services
│   ├── ai_worker.py        # AI job processor (reads from Redis)
│   ├── requirements.txt    # Python dependencies
│   └── dockerfile          # Python container image
├── resources/              # Svelte frontend (Inertia.js)
├── routes/
│   ├── api.php             # REST API routes (Sanctum-protected)
│   └── web.php             # Web routes (Inertia pages)
├── storage/                # File uploads, logs, cache
├── compose.dev.yaml        # Docker Compose for development
├── compose.prod.yaml       # Docker Compose for production
├── .env                    # Local (non-Docker) env vars
├── .env.docker             # Docker container env vars
└── dockerfile              # Root Dockerfile (standalone build)
```

---

## WebDAV (SabreDAV)

File storage uses **SabreDAV** for per-team WebDAV directories. The infrastructure is ready:

- Nginx forwards `/dav/*` requests to PHP-FPM
- PHP upload limits are set to **512 MB**
- Env vars: `WEBDAV_BASE_URI`, `WEBDAV_STORAGE_PATH`, `WEBDAV_LOCKS_PATH`

Team files are stored at: `storage/app/public/teams/{team_id}/`

---

## Debugging with Xdebug

Xdebug is **enabled by default** in development. Configure your IDE:

| Setting | Value |
|---------|-------|
| IDE Key | `DOCKER` |
| Port | `9003` (Xdebug 3 default) |
| Path mapping | `/var/www` → your local project root |

To disable Xdebug, set `XDEBUG_ENABLED=false` in the build args and rebuild.

---

## Production

```bash
docker compose -f compose.prod.yaml up --build -d
```

Key differences from dev:
- No Xdebug, no workspace container
- PHP opcache enabled, configs cached
- `restart: unless-stopped` on all services
- Health checks on MySQL, Redis, and PHP-FPM
