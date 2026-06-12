# Deployment Guide

Step-by-step instructions for deploying BuildOS to a fresh Linux server.
Written to be followed by a human or an AI agent.

---

## Prerequisites

The target server must have:

```bash
# Docker (includes docker compose v2)
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER   # re-login or: newgrp docker

# git (usually pre-installed)
git --version

# Verify docker works
docker run --rm hello-world
```

Minimum specs: 1 vCPU, 2 GB RAM, 20 GB disk. Tested on Ubuntu 22.04 / Debian 12.

---

## 1. Clone the repo

```bash
git clone https://github.com/shashankshekhar2909/buildos-deploy.git
cd buildos-deploy
```

---

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — two values are required:

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=<paste output here>

# Public URL where the app will be reached (no trailing slash)
# Examples:
#   http://192.168.0.122:3008          (LAN)
#   https://buildos.example.com        (custom domain)
NEXTAUTH_URL=http://<your-server-ip>:3008
```

That is the minimum. All other values have defaults in `docker-compose.yml`.

---

## 3. Build and start

```bash
docker compose up -d --build
```

This starts three services:
| Service | Port |
|---|---|
| `web` (Next.js app) | 3008 |
| `postgres` | 5432 |
| `redis` | 6381 → internal 6379 |

Build takes ~2–3 minutes on first run (compiles Next.js).

---

## 4. Run database migrations

Migrations must be run once (and after each update that changes the schema):

```bash
docker compose exec web sh -c \
  "DATABASE_URL=\$DATABASE_URL npx prisma migrate deploy --schema=apps/web/prisma/schema.prisma"
```

Expected output ends with: `All migrations have been successfully applied.`

---

## 5. Seed initial admin user

```bash
docker compose exec web sh -c \
  "DATABASE_URL=\$DATABASE_URL node -e \"
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function seed() {
  const hash = await bcrypt.hash('buildos123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@buildos.local' },
    update: {},
    create: { email: 'admin@buildos.local', name: 'Admin', password: hash }
  });
  console.log('Seeded:', user.email);
  await prisma.\$disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
\""
```

Default credentials: `admin@buildos.local` / `buildos123`
**Change the password immediately in Settings → Security.**

---

## 6. Verify

```bash
# All three containers should be Up
docker compose ps

# Tail logs
docker compose logs web -f

# Smoke test (should return HTML)
curl -s http://localhost:3008 | grep -c "BuildOS"
```

Open `http://<server-ip>:3008` in a browser and log in.

---

## Updating to a new version

```bash
cd buildos-deploy
git pull
docker compose up -d --build

# Run migrations if schema changed
docker compose exec web sh -c \
  "DATABASE_URL=\$DATABASE_URL npx prisma migrate deploy --schema=apps/web/prisma/schema.prisma"
```

---

## Production hardening (optional)

### Firewall — expose only port 3008

```bash
ufw allow 22/tcp
ufw allow 3008/tcp
ufw enable
```

### Reverse proxy with Nginx + TLS

Install certbot and nginx, then:

```nginx
server {
    listen 80;
    server_name buildos.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name buildos.example.com;

    ssl_certificate     /etc/letsencrypt/live/buildos.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/buildos.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Required for SSE (deployment log streaming)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }
}
```

Update `.env`:
```env
NEXTAUTH_URL=https://buildos.example.com
```

Then restart: `docker compose up -d`

### GitHub Actions CI/CD

`.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd buildos-deploy
            git pull
            docker compose up -d --build
            docker compose exec -T web sh -c \
              "DATABASE_URL=\$DATABASE_URL npx prisma migrate deploy \
               --schema=apps/web/prisma/schema.prisma"
```

---

## Development (local, no Docker for the app)

```bash
# Start only infrastructure
docker compose up postgres redis -d

# Create apps/web/.env.local
cat > apps/web/.env.local <<EOF
DATABASE_URL=postgresql://buildos:buildos@localhost:5432/buildos
REDIS_URL=redis://localhost:6381
NEXTAUTH_URL=http://localhost:3008
NEXTAUTH_SECRET=dev-secret-not-for-production
EOF

# Install deps + migrate
pnpm install
cd apps/web && npx prisma migrate dev && cd ../..

# Run dev server (hot reload, bound to 0.0.0.0 for LAN access)
pnpm dev
# → http://localhost:3008  or  http://<lan-ip>:3008
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `NEXTAUTH_SECRET is required` on startup | Set `NEXTAUTH_SECRET` in `.env` |
| Login loop / CSRF error | `NEXTAUTH_URL` must match the URL you're visiting exactly |
| `connect ECONNREFUSED 5432` | Postgres not healthy yet — wait 10s and retry, or `docker compose logs postgres` |
| Deploy fails: `docker: permission denied` | Add user to docker group: `usermod -aG docker $USER` and re-login |
| Deploy fails: `port already allocated` | BuildOS auto-picks a free port (10000-60000) — if still failing, a stale container exists; run `docker ps` to find and remove it |
| SSE logs not streaming behind Nginx | Ensure `proxy_buffering off` and `proxy_read_timeout 3600s` in nginx config |
