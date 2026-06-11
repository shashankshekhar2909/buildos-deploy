# BuildOS Deploy

Self-hosted, AI-native deployment platform for Docker infrastructure. Deploy any GitHub repo with a build command — think Vercel/Railway/Coolify but fully on your own hardware.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Hetzner VPS                        │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌───────────────────┐  │
│  │ Next.js  │───▶│ FastAPI  │───▶│  Celery Worker    │  │
│  │  :3000   │    │  :8000   │    │  (build + deploy) │  │
│  └──────────┘    └──────────┘    └───────────────────┘  │
│       │               │                   │             │
│  ┌────▼───────────────▼───────────────────▼──────────┐  │
│  │         PostgreSQL   Redis   Docker Socket         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Traefik (reverse proxy + TLS termination)      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼ Cloudflare (DNS + DDoS protection)
```

**Stack:**
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | FastAPI, SQLModel, Alembic |
| Database | PostgreSQL 16 |
| Queue | Redis 7 + Celery |
| Runtime | Docker (build + container management) |
| Proxy | Traefik v3 (auto TLS via Let's Encrypt) |
| DNS | Cloudflare |
| Hosting | Hetzner Cloud |

---

## MVP Features

- **Auth** — GitHub OAuth, session management
- **Projects** — Connect any GitHub repo, configure branch / port / env vars / build command
- **Deployments** — Push to deploy: clone → docker build → docker run pipeline
- **Logs** — Build logs stored in DB; live container logs while running
- **Domains** — Add custom domains per project (Cloudflare DNS automation)
- **Controls** — Restart / Stop / Delete running containers

---

## Repository Structure

```
buildos-deploy/
├── apps/
│   └── web/                   # Next.js 14 frontend
│       ├── prisma/schema.prisma
│       └── src/
│           ├── app/           # App Router pages + API routes
│           ├── components/    # UI components
│           └── lib/           # auth, prisma, api-client
├── services/
│   └── api/                   # FastAPI backend
│       └── app/
│           ├── api/v1/        # REST endpoints
│           ├── core/          # config, db, redis
│           ├── models/        # SQLModel ORM models
│           ├── services/      # docker_service, github_service
│           └── workers/       # Celery deploy pipeline
├── packages/
│   └── types/                 # Shared TypeScript types
├── docker-compose.yml         # Full local stack
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker + Docker Compose

### 1. Clone & configure

```bash
git clone git@github.com:shashankshekhar2909/buildos-deploy.git
cd buildos-deploy
cp .env.example .env
```

Edit `.env` — at minimum set:
```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
```

Create a GitHub OAuth App at https://github.com/settings/developers:
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Install dependencies & migrate DB

```bash
pnpm install
cd apps/web
pnpm prisma migrate dev --name init
cd ../..
```

### 4. Run development servers

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs (DEBUG=true only)

### 5. Start Celery worker (separate terminal)

```bash
cd services/api
pip install uv && uv pip install --system -e .
celery -A app.workers.deploy_worker.celery_app worker --loglevel=info
```

---

## Full Stack with Docker Compose

Spin up everything (including web + api):

```bash
docker compose up --build
```

Services:
| Service | Port |
|---|---|
| Web (Next.js) | 3000 |
| API (FastAPI) | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Traefik dashboard | 8080 |

---

## Deployment

### Recommended: Hetzner Cloud VPS

**Why Hetzner:**
- CX21 (2 vCPU, 4GB RAM) = ~€4/mo — plenty for MVP
- Hetzner Volumes for DB persistence
- Same region as Cloudflare EU routing

**Setup on fresh Hetzner Ubuntu 22.04:**

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# 2. Clone repo
git clone git@github.com:shashankshekhar2909/buildos-deploy.git
cd buildos-deploy

# 3. Configure env for production
cp .env.example .env
# Edit .env — set real secrets, domain, Cloudflare token

# 4. Deploy
docker compose -f docker-compose.yml up -d --build
```

**Traefik TLS** — edit `docker-compose.yml` traefik command to add:
```yaml
- "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
- "--certificatesresolvers.letsencrypt.acme.storage=/certs/acme.json"
- "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
```

**Cloudflare:**
1. Add A record → your Hetzner VPS IP
2. Set SSL/TLS to Full (strict)
3. Add `CLOUDFLARE_API_TOKEN` to `.env` for automatic domain management

### CI/CD (optional)

Add to `.github/workflows/deploy.yml`:
```yaml
- name: Deploy to Hetzner
  run: |
    ssh ${{ secrets.SSH_USER }}@${{ secrets.SERVER_IP }} \
      "cd buildos-deploy && git pull && docker compose up -d --build"
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for session encryption |
| `NEXTAUTH_URL` | ✅ | Full URL of the web app |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth app client secret |
| `API_URL` | ✅ | URL of the FastAPI service |
| `API_SECRET_KEY` | ✅ | Used for webhook signature verification |
| `CLOUDFLARE_API_TOKEN` | ⬜ | For automatic DNS record creation |
| `CLOUDFLARE_ZONE_ID` | ⬜ | Cloudflare zone for your domain |
| `HETZNER_API_TOKEN` | ⬜ | For VPS provisioning via API |

---

## Roadmap

- [ ] Alembic migrations (replace `init_db`)
- [ ] Real-time log streaming via WebSocket
- [ ] GitHub webhook auto-setup on project create
- [ ] Cloudflare DNS automation on domain add
- [ ] Project environment variable encryption (KMS/Vault)
- [ ] Multi-user / team support
- [ ] Metrics dashboard (CPU/mem per container)
- [ ] AI-assisted Dockerfile generation

---

## License

MIT
