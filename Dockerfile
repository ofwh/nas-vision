# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --store-dir=/pnpm/store --frozen-lockfile --ignore-scripts \
    && pnpm rebuild @parcel/watcher @swc/core esbuild

FROM deps AS builder
COPY . .
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p data && pnpm build

FROM node:24-bookworm-slim AS migrate-deps
WORKDIR /migrate
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY docker/package.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --cache=/root/.npm --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=/app/data/data.db

RUN mkdir -p /app/data /app/public/static/uploads /app/.next/cache \
    && chown -R node:node /app/data /app/public/static/uploads /app/.next/cache

COPY --from=migrate-deps --chown=node:node /migrate /migrate
COPY --chown=node:node drizzle /migrate/drizzle
COPY --chown=node:node drizzle.config.ts /migrate/drizzle.config.ts
COPY --chown=node:node lib/db/schema /migrate/lib/db/schema
COPY --chown=node:node --chmod=755 docker/entrypoint.sh /migrate/entrypoint.sh

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3000
ENTRYPOINT ["/migrate/entrypoint.sh"]
CMD ["node", "server.js"]
