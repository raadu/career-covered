# CLAUDE.md

This file guides Claude Code when working in this repository.

## Project Overview

**Career Covered** is an AI-powered cover letter generator. A user provides an existing
cover letter (as a "template") and a target job description; the app calls an LLM
(Groq Cloud API) to adapt the template to the job while preserving the user's voice,
then lets them export the result as PDF/Word.

The product has evolved from a purely static, client-side SPA into a full-stack
monorepo with persistent accounts, saved templates, and generation history. Core
business rules (word limits, "minimal changes" mode, "same language" mode,
market-specific tone guidelines) live in the prompt-building logic — they are
the product's differentiation, not incidental code.

## Monorepo Structure

Turborepo + npm workspaces.

```
apps/
  api/            NestJS backend — auth, AI proxy, templates, cover letters
  web/            React (Vite) frontend + Cloudflare Worker for deployment
packages/
  db/             Prisma client + schema, re-exported as @career-covered/db
  eslint-config/  Shared flat ESLint configs (react.js, nest.js)
  tsconfig/       Shared base tsconfig
```

Root `package.json` only orchestrates Turbo tasks (`dev`, `build`, `lint`, `test`,
`test:e2e`) and Docker Compose shortcuts. Each app/package has its own scripts.

## Tech Stack

**Frontend (`apps/web`)**
- React 19 + TypeScript, built with Vite 7
- Redux Toolkit for state (`store/`); RTK Query (`apiSlice.ts`) for the Groq-proxy call
- React Router v7 via `HashRouter` (kept for environment-agnostic static hosting)
- Tailwind CSS (with class-based dark mode) + `clsx` + `tailwind-merge`
- `react-hot-toast` for toasts, `react-helmet-async` for SEO/meta tags
- `jspdf` / `docx` / `file-saver` for exporting generated letters
- Deployed as a Cloudflare Worker (`worker/src/index.ts`) that serves static
  assets, proxies `/api/generate` straight to Groq, and proxies other
  `/api/*` and `/auth/*` calls to the NestJS backend
- Testing: Vitest + React Testing Library (unit/component), Playwright (e2e)

**Backend (`apps/api`)**
- NestJS 11, modular structure: `auth/`, `ai/`, `template/`, `cover-letter/`, `prisma/`
- Auth: HTTP-only session cookies (random token stored in Postgres via Prisma),
  bcrypt for passwords, `arctic` for Google OAuth (PKCE flow). No JWTs.
- `nestjs-pino` for structured logging (pretty in dev, JSON in prod)
- `class-validator` / `class-transformer` DTOs, global `ValidationPipe`
  (`whitelist`, `forbidNonWhitelisted`, `transform`)
- Swagger docs served at `/docs`
- Testing: Jest (unit `*.spec.ts` colocated with source, e2e under `test/`)

**Database (`packages/db`)**
- PostgreSQL via Prisma. Schema at `packages/db/prisma/schema.prisma`.
- Active models: `User`, `OAuthAccount`, `Session`, `Template`, `CoverLetter`.
- `Resume` and `JobApplication` models exist in the schema but are **deferred** —
  not wired into any API endpoint yet. Don't build features against them without
  checking with the user first; they may change shape before use.

**Infra**
- `docker-compose.yml` runs Postgres, pgAdmin, MinIO (S3-compatible, for future
  resume storage), and prod/dev profiles for the API and web containers.
- Single root `.env` is shared across the whole monorepo (see `.env.example`).

## Architecture Notes

- **Auth flow**: session cookie (`session`) is validated on every request by
  `AuthGuard` (global-ish via `@Public()` opt-out decorator), which loads the
  user and attaches it to `request.user`. Controllers read it via the
  `@CurrentUser()` decorator.
- **Generation flow**: the frontend builds the full prompt client-side
  (`utils/promptUtils.ts` + `utils/marketPrompts.ts`), then either calls the
  Cloudflare Worker's `/api/generate` (which proxies straight to Groq using the
  user's own key or the owner's fallback key) — the NestJS `AiService` mirrors
  this same proxy behavior for the non-Cloudflare deployment path. Saving the
  generated letter is a separate, explicit call to `POST /api/cover-letters` —
  generation and persistence are intentionally decoupled (see commit
  `d054676` — a duplicate-save bug came from conflating the two).
- **Ownership checks**: `TemplateService` / `CoverLetterService` scope every
  read/write by `userId` and use `findOne` (which 404s if not owned) before
  any update/delete — follow this pattern for any new user-owned resource.
- **Client-side persistence**: unauthenticated state (draft template, API key,
  customization toggles) lives in `localStorage`/`sessionStorage` with a
  `cl_` prefix; authenticated data (templates, cover letters) lives in
  Postgres and is fetched via thunks in `coverLetterSlice.ts`. Don't mix the
  two — logging out clears the `cl_*` keys tied to server data
  (see the `auth/logoutUser/fulfilled` case in `coverLetterSlice.ts`).

## Guiding Principles for Changes

0. **Always run this project through Docker — never run services individually
   on the host.** Don't start the API with `nest start`/`npm run dev` in
   `apps/api`, and don't start the frontend with `vite`/`npm run dev` in
   `apps/web`, directly on the host. The whole stack (Postgres + API + web)
   must come up through a single `docker compose` invocation. See
   **Running the Project** below for the exact commands.
1. **Follow the existing tech stack — don't introduce alternatives.** Use NestJS
   idioms (modules/controllers/services/DTOs) on the backend and Redux
   Toolkit + RTK Query on the frontend. Don't add a new state manager, ORM,
   HTTP client, CSS framework, or backend framework alongside the existing
   ones. If the current stack is genuinely insufficient for a task, surface
   that tradeoff to the user instead of silently adding a dependency.
2. **Always look for a chance to improve coding style/quality** in code you
   touch — but scope it to what you're already editing (see below), not a
   drive-by rewrite of unrelated files.
3. **Match the surrounding file's conventions** (naming, structure, comment
   density) over the rules below when they conflict — consistency within a
   file beats a global rule.
4. **Ask before guessing.** If a requirement, data shape, security tradeoff,
   or design choice is ambiguous, stop and ask the user rather than picking
   an assumption and running with it. This applies especially to anything
   touching auth, payments-adjacent data, or schema changes.

## Coding Style

The user's standing requirements for every change in this repo, on top of
what's enforced by config:

- **Clean code.** No dead code, no premature abstraction, no leftover debug
  logging/comments. Small, single-purpose functions over long ones.
- **Type everything properly.** Don't reach for `any` as a shortcut — define
  or import a real type/interface. `@typescript-eslint/no-explicit-any` is
  turned off for the API (see below) so ESLint won't catch a lazy `any`;
  that's tolerance for Prisma/DTO edge cases, not permission to skip typing.
- **Keep React components small.** If a component's JSX or logic is doing
  more than one clear thing, split it into subcomponents/hooks — follow the
  existing `TemplatesView/`, `PreviousCoverLettersView/` pattern (an
  `index.tsx` plus small named files) rather than growing one file.
- **Run Prettier before considering a file finished.** `apps/api` has
  `npm run format` (`.prettierrc`: single quotes, trailing commas). `apps/web`
  currently has **no** Prettier config or script — if you're formatting web
  files, ask the user whether to add one (don't invent a config unilaterally)
  rather than guessing at formatting rules.
- **Follow industry-standard conventions** for the framework you're in:
  official NestJS style (modules/controllers/services/DTOs, dependency
  injection, guards/interceptors over ad-hoc middleware) on the backend;
  standard React/Hooks rules (no conditional hooks, exhaustive deps, one
  component's concerns per file) on the frontend.

Enforced by config (don't fight these):
- Single quotes, trailing commas everywhere (Prettier, `apps/api/.prettierrc`)
- ESLint flat config per app (`packages/eslint-config/{react,nest}.js`) built
  on `typescript-eslint` recommended rules
- Strict TypeScript (`packages/tsconfig/base.json`): `strict: true`
- API: `@typescript-eslint/no-explicit-any` is off at the lint level — still
  avoid `any` per the rule above; prefer typed `db.*` types (from
  `@career-covered/db`) wherever practical
- API: `no-floating-promises` and `no-unsafe-argument` are `warn`, not
  `error` — still try not to introduce new ones

Observed conventions worth keeping consistent:
- **NestJS modules**: one module per domain (`auth`, `ai`, `template`,
  `cover-letter`), each with `*.controller.ts`, `*.service.ts`,
  `dto/*.dto.ts`. Services take a single `Prisma`/`Config` service via
  constructor injection; controllers stay thin (validation + delegation only).
- **Prisma access**: only through `PrismaService`, only from within a
  service — controllers never import `PrismaService` or `@career-covered/db`
  client operations directly.
- **React components**: function components with named default exports,
  colocated by feature under `components/` or `views/`; larger views are
  split into a folder with an `index.tsx` plus small subcomponents (see
  `TemplatesView/`, `PreviousCoverLettersView/`). Prefer this split over one
  large file once a view grows past a couple of concerns.
- **Redux slices**: one slice per domain in `store/`, async server calls as
  `createAsyncThunk`, local-only UI state as plain reducers. Side effects on
  success (toasts, `localStorage` writes) belong in `extraReducers`, not in
  components.
- **Path aliases**: frontend imports use bare specifiers (`components/...`,
  `store/...`, `utils/...`) via Vite/TS path aliases — don't switch to
  relative `../../` imports in files that already use aliases.
- **Comments**: sparse; used mainly to explain *why* (e.g. lazy OAuth init,
  decoupled save-vs-generate), not to restate what a line does. Section
  banner comments (`// ─── Name ───`) are used in a few larger files to
  delimit logical groups — match this only if the surrounding file already
  does.

## Testing Requirements

- **Every function/module gets a unit test.** When you write or meaningfully
  change a function (a Nest service method, a Redux reducer/thunk, a utility
  in `utils/`, a hook), add or update its test in the same session — don't
  defer test-writing to "later."
- **Add tests incrementally, every session** — not just a final pass before
  a PR. If you touch a file with an existing `*.spec.ts` / `*.test.tsx`
  sibling, extend that file; if one doesn't exist yet for code you're adding,
  create it (Jest for `apps/api`, Vitest + React Testing Library for
  `apps/web`, Playwright only for true end-to-end flows).
- Run the affected workspace's test command before reporting the task done
  (`npm run test`, or the scoped `apps/api`/`apps/web` script).

## Security Requirements

Treat every change as a chance to check for, not just avoid introducing,
these classes of issue:

- **Injection.** All DB access goes through Prisma (`PrismaService`), which
  parameterizes queries — never build raw SQL by string concatenation, and
  never add a `$queryRawUnsafe`/`$executeRawUnsafe` call with untrusted input.
- **XSS.** User-supplied text (templates, job descriptions, custom prompts)
  flows into the DOM and into generated documents — sanitize on the way in
  (see `apps/web/src/utils/sanitizeUtils.ts`, DOMPurify) and never
  `dangerouslySetInnerHTML` unsanitized content.
- **Brute force / credential stuffing.** `auth.controller.ts`'s
  `login`/`register` endpoints currently have **no rate limiting or
  lockout** — if you touch auth, flag this gap to the user rather than
  assuming it's handled, and consider it in scope for any auth-adjacent work.
- **AuthZ / IDOR.** Every user-owned resource (templates, cover letters, and
  anything added later) must be scoped by `userId` at the query level and
  checked with a `findOne`-then-404 pattern before mutation — copy the
  existing `TemplateService`/`CoverLetterService` pattern exactly.
- **Secrets.** Never log, echo, or persist a Groq API key, session token, or
  OAuth secret. The `.env` file is the only place credentials belong;
  `userApiKey` is used per-request and must never be written to the DB.
- **CSRF.** Session cookies are `SameSite=Lax`, `httpOnly`; state-changing
  requests rely on that plus CORS being locked to `WEB_URL` — don't loosen
  `enableCors`/cookie flags without calling out the tradeoff.
- When genuinely unsure whether something is a real risk here or overkill
  for this app's threat model, ask the user (see Guiding Principle 4) instead
  of either skipping it or over-engineering a defense.

## Running the Project (Docker Only)

**Always use Docker to run the app's infra locally — API, web, and Postgres
all come up together with one command.** Never run `nest start`/`npm run dev`
inside `apps/api`, or `vite`/`npm run dev` inside `apps/web`, directly on the
host. Never run just one service by hand while leaving the others out of
Docker.

```bash
# Hot-reload local development (mounts source, watches for changes)
docker compose --profile dev up --build -d

# Production-like build (what the README tells end users to run)
docker compose --profile prod up --build -d

# Tear down
docker compose down
```

The `npm run docker:up` / `docker:build` scripts in the root `package.json`
call plain `docker compose up [--build] -d` **without** a `--profile` flag —
that only starts Postgres/pgAdmin/MinIO, not the API or web containers. Prefer
the explicit `--profile dev`/`--profile prod` commands above so the full stack
actually comes up.

## Other Commands

These don't start the long-running infra, so they're fine to run directly on
the host:

```bash
npm run build       # turbo build — type-checks and builds all workspaces
npm run lint        # turbo lint
npm run test        # turbo test (vitest + jest)
npm run test:e2e    # turbo test:e2e (playwright) — requires the Docker stack to be up
```

Per-app equivalents exist in `apps/api/package.json` and `apps/web/package.json`
(e.g. `npm run test:cov` for Jest coverage in the API).

## Before Considering a Task Done

- Run the relevant workspace's `lint` and `test` before reporting success.
- New/changed functions have unit tests, and no `any` slipped in without a
  real reason.
- Any new or grown React component is still doing one clear thing — split it
  if not.
- Formatted with Prettier (`apps/api`: `npm run format`; `apps/web`: ask the
  user first, per Coding Style above).
- Reviewed against the Security Requirements list above for anything you
  touched.
- For frontend UI changes, bring the stack up with
  `docker compose --profile dev up --build -d` and check the change in a
  browser — type checks don't prove a feature works.
- New user-owned data must be scoped by `userId` end-to-end (Prisma query +
  DTO), matching the existing `Template`/`CoverLetter` pattern.
- If anything above was ambiguous, you asked the user instead of guessing.
