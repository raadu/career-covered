# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests and turbo config
COPY package.json package-lock.json turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/api/package.json ./apps/api/

# Install all dependencies (including devDeps for building)
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN npm run -w @career-covered/db db:generate

# Build the NestJS app
RUN npm run -w @career-covered/api build

# Prune dev dependencies
RUN npm prune --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy pruned node_modules and compiled output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
