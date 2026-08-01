# Career Covered - AI-Powered Cover Letter Generator

Career Covered helps you turn one cover letter into many. Give it a cover letter
you've already written and a job description, and it rewrites it to fit the new
role in seconds — same voice, new job. You can use it as a guest, or create a
free account to save your templates and keep a history of every letter you've
generated.

## Features

- **Works without an account.** Paste your template and a job description, hit
  generate, and download — no sign-up required.
- **Sign in with email or Google.** Creating an account lets you save templates
  and revisit past cover letters from any device.
- **Save unlimited templates.** Keep as many starting templates as you like,
  rename them, edit them, and delete the ones you don't need — including
  deleting several at once.
- **See every letter you've generated.** A history page lists your past cover
  letters so you don't have to dig through old downloads.
- **Minimal Changes mode.** Only swaps in the new company name, role, and a
  few key skills — everything else about your original letter stays the same.
- **Same-Language mode.** If your job description is in another language, the
  letter is written in that language instead of defaulting to English.
- **Word count control.** Tell it how long the letter should be and it sticks
  to that limit.
- **Market-specific tone.** Choose International, Sweden, or Bangladesh and
  the writing style adjusts to fit hiring norms in that market.
- **Bring your own API key (optional).** Use your own free Groq API key if you
  want, or just use the app's shared key — your key is never stored, only
  used for your request.
- **Dark mode**, a mobile-friendly layout, and an installable app (PWA) that
  works like a native app on your phone or laptop.
- **Download as PDF or Word**, named automatically after you.
- **FAQ page** for quick answers to common questions.

## Getting Started (Docker — recommended)

The easiest way to run the whole app — frontend, backend, and database — is
with a single Docker command:

```bash
docker compose --profile prod up --build -d
```

This starts everything you need: PostgreSQL, the API, and the web app, all
wired together. Just copy `.env.example` to `.env` first and fill in your Groq
API key (and Google OAuth credentials, if you want Google login):

```bash
cp .env.example .env
docker compose --profile prod up --build -d
```

Then open `http://localhost:5173`.

### Prerequisites
- Docker

---

## For Developers

The sections below cover the technical architecture, local (non-Docker)
development, and testing.

### Architecture

This is a **Turborepo monorepo** (npm workspaces):

```
apps/
  api/     NestJS backend — auth, templates, cover letters, AI proxy (Postgres via Prisma)
  web/     React 19 + Vite frontend, deployed as a Cloudflare Worker
packages/
  db/              Prisma schema + generated client, shared as @career-covered/db
  eslint-config/   Shared ESLint flat configs for the React app and the Nest API
  tsconfig/        Shared base TypeScript config
```

**Request flow:** the frontend calls its own origin (`/api/*`, `/auth/*`).
- In the Cloudflare-hosted build, a lightweight Worker (`apps/web/worker`)
  proxies `/api/generate` directly to Groq and forwards everything else
  (`/api/*`, `/auth/*`) to the NestJS API.
- In a self-hosted/Docker setup, Nginx/the dev server proxies straight to the
  NestJS API, which exposes the same routes (`AiController`, `AuthController`,
  `TemplateController`, `CoverLetterController`).

**Auth:** HTTP-only session cookies (opaque random tokens stored in Postgres),
bcrypt-hashed passwords, Google OAuth via `arctic` (PKCE flow). No JWTs.

**Data model (`packages/db/prisma/schema.prisma`):** `User`, `OAuthAccount`,
`Session`, `Template`, `CoverLetter` are active. `Resume` and `JobApplication`
exist in the schema for future phases but aren't wired into any endpoint yet.

### Technology Stack

- **Frontend:** React 19, TypeScript, Vite 7
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v7 (`HashRouter`, for environment-agnostic hosting)
- **Styling:** Tailwind CSS with dark mode
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL
- **Logging:** `nestjs-pino` (pretty in dev, structured JSON in prod)
- **API Docs:** Swagger/OpenAPI at `/docs`
- **AI Integration:** Groq Cloud API, proxied server-side
- **Testing:** Vitest, React Testing Library, Playwright, Jest
- **Build System:** Turborepo
- **Deployment:** Cloudflare Workers + Pages, or Docker Compose

### Local Development (without full Docker)

1. **Clone the repository and copy the env file:**
   ```bash
   git clone https://github.com/raadu/career-covered.git
   cd career-covered
   cp .env.example .env
   ```
2. **Start just Postgres/pgAdmin/MinIO** via Docker:
   ```bash
   npm run docker:up
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy --schema packages/db/prisma/schema.prisma
   ```
5. **Start the dev servers** (API + web, via Turborepo):
   ```bash
   npm run dev
   ```

The web app runs at `http://localhost:5173`, the API at `http://localhost:3000`
(Swagger docs at `http://localhost:3000/docs`).

### Testing and Quality Assurance

```bash
npm run test        # Vitest (web) + Jest (api), via Turborepo
npm run test:e2e    # Playwright end-to-end tests
npm run lint         # ESLint across all workspaces
npm run build        # Type-checks and builds all workspaces
```

### Security and Privacy

- Sessions use opaque, random tokens stored in Postgres — not JWTs.
- Passwords are hashed with bcrypt (12 rounds); OAuth-only accounts have no
  password on file.
- Your Groq API key (if you provide one) is used per-request only — it is
  never written to the database.
- Every template and cover letter is scoped to the owning user's ID at the
  database query level.

---
Built for professionals seeking an edge in their career journey.
