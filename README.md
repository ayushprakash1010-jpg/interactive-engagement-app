# Interactive Engagement Platform (IEP)

Real-time polling, Q&A, quiz, word cloud, and feedback platform for meetings, webinars,
classrooms, and corporate events (a Slido/Mentimeter-class product).

This is the **Phase 0 / Sprint 0** foundation: a Turborepo monorepo with both apps booting,
shared types, linting, Docker, and CI. Business features land in later sprints (see
[`project-plan/plan.md`](project-plan/plan.md)).

## Stack

- **apps/web** — Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **apps/api** — NestJS + Mongoose (MongoDB) + Socket.IO gateway with the Redis adapter
- **packages/types** — shared Zod schemas + inferred TypeScript types (`@iep/types`)
- **packages/config** — shared ESLint, Prettier, and tsconfig bases (`@iep/config`)
- Auth: **Auth0** (hosts only; wired from Sprint 1)

## Prerequisites

- Node.js 20+
- pnpm 10 (`corepack enable`)
- Docker (for the full local stack)

## Getting started

```bash
pnpm install

# copy env templates and adjust as needed
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# run both apps (web :3000, api :4000) — needs Mongo + Redis running
pnpm dev
```

`pnpm dev` expects MongoDB and Redis to be reachable. Start them (and the whole stack)
with Docker:

```bash
docker compose up
```

This brings up four services: `web`, `api`, `mongo`, and `redis`. The web app's home page
performs a server-side fetch of the API's `/health` endpoint and renders Mongo + Redis status.

## Scripts (run from the repo root, delegated via Turborepo)

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `pnpm dev`        | Run all apps in watch mode                   |
| `pnpm build`      | Build every workspace                        |
| `pnpm lint`       | Lint every workspace                         |
| `pnpm typecheck`  | Type-check every workspace                   |
| `pnpm test`       | Run unit tests                               |
| `pnpm format`     | Format with Prettier                         |

## Repository layout

```
apps/
  web/      # Next.js — host, participant, projector views
  api/      # NestJS — REST + Socket.IO gateway + business logic
packages/
  types/    # @iep/types — shared Zod schemas + TS types + socket contract
  config/   # @iep/config — eslint, prettier, tsconfig bases
docker-compose.yml
turbo.json
pnpm-workspace.yaml
```
