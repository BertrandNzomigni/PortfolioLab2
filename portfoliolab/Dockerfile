# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base image shared by all stages
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma's schema engine (used by prisma migrate) needs OpenSSL to be detectable.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# deps: install all dependencies (dev deps are needed for prisma + next build)
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# builder: generate the Prisma client and build Next.js
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts reads DATABASE_URL; generate does not connect, so a
# placeholder is enough at build time. The real URL is given at runtime.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run build

# ---------------------------------------------------------------------------
# tools: one-off jobs (migrations, company seed, price import)
# ---------------------------------------------------------------------------
FROM builder AS tools
# tsx runs the TypeScript scripts and resolves the "@/..." tsconfig paths.
RUN npm install --no-save tsx@4
CMD ["npx", "prisma", "migrate", "deploy"]

# ---------------------------------------------------------------------------
# runner: minimal production image with the standalone Next.js server
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
