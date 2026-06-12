# BuildOS

Self-hosted deployment platform. Connect any Git repo → builds Docker image → runs container. Think Coolify/Railway on your own hardware.

## Stack

| Layer | Technology |
|---|---|
| App | Next.js 14 (App Router + API routes) |
| Auth | NextAuth v4 (credentials) |
| Database | PostgreSQL 16 + Prisma 5 |
| Queue | Redis 7 (reserved for jobs) |
| Deploy engine | Node.js `child_process` → git clone → docker build → docker run |
| Log streaming | Server-Sent Events (SSE) |
| Runtime | Docker (host socket mounted) |

## Quick start (Docker Compose)

```bash
git clone git@github.com:shashankshekhar2909/buildos-deploy.git
cd buildos-deploy
cp .env.example .env          # edit: set NEXTAUTH_SECRET + NEXTAUTH_URL
docker compose up -d --build
```

Runs migrations automatically on first boot (see `DEPLOY.md`).

App available at `http://<host>:3008`.

Default login created by seed: `admin@buildos.local` / `buildos123`

## Development

```bash
# Prerequisites: Node 20, pnpm 9, Docker, PostgreSQL 16 on :5432, Redis on :6381

pnpm install
cp apps/web/.env.local.example apps/web/.env.local   # or see DEPLOY.md dev section
cd apps/web && npx prisma migrate dev
pnpm dev   # starts on :3008, bound to 0.0.0.0
```

## Deploying to a VPS

See [DEPLOY.md](./DEPLOY.md) for complete step-by-step instructions (written for both humans and AI agents).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | ✅ | Random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Full public URL, e.g. `http://1.2.3.4:3008` |
| `DATABASE_URL` | auto | Set by compose; override for external DB |
| `REDIS_URL` | auto | Set by compose; override for external Redis |

## Features

- Create projects from any Git URL (HTTPS, SSH, `owner/repo` shorthand)
- Single-`Dockerfile` apps: auto-selects a free host port, maps to container port
- `docker-compose.yml` apps: runs `docker compose up --build -d` — full multi-container support
- Real-time build logs via SSE
- Environment variables per project (persisted in DB)
- GitHub PAT injection for private repos
- Deploy / Restart / Stop controls
- Project deletion with confirmation
- Password change + account settings

## Roadmap

- [ ] GitHub webhook auto-deploy on push
- [ ] Cloudflare DNS automation on domain add
- [ ] Metrics dashboard (CPU/mem per container)
- [ ] AI-assisted Dockerfile generation
- [ ] Team / multi-user support
