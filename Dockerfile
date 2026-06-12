FROM node:20-alpine AS base
RUN npm install -g pnpm@9.0.0

# ── deps: install all workspace dependencies ──────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# ── builder: compile Next.js app ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma generate needs DATABASE_URL at build time only for type generation
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm --filter @buildos/web run build

# ── runner: minimal production image ─────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3008
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN apk add --no-cache git docker-cli

# Next.js standalone output preserves workspace path: apps/web/server.js
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3008

CMD ["node", "apps/web/server.js"]
