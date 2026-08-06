# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo manifests
COPY package.json package-lock.json turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source
COPY packages/tsconfig/ ./packages/tsconfig/
COPY apps/web/ ./apps/web/

# Build Vite production bundle
RUN npm run -w web build

# ─── Stage 2: Nginx static server ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy compiled assets (the Cloudflare Vite plugin splits build output into
# dist/client — the SPA — and dist/<worker-name> — the Worker script this
# Nginx-based image doesn't use)
COPY --from=builder /app/apps/web/dist/client /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
