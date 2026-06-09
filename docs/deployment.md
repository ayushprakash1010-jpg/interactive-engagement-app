# Deployment

How the Interactive Engagement Platform (IEP) ships to production.

## Topology

| Surface | Platform | Why |
|---------|----------|-----|
| `apps/web` (Next.js) | **Vercel** | First-class Next.js hosting, global CDN, preview deploys per PR. |
| `apps/api` (NestJS + Socket.IO) | **Fly.io** (or Render) | Long-running, stateful container holding persistent WebSocket connections — **not** serverless. |
| MongoDB | **MongoDB Atlas** | Managed, automated backups (see [runbook](./runbook.md)). |
| Redis | **Fly Redis / Render Key-Value / Upstash** | Socket.IO adapter, live counters, rate limiting. |
| Auth | **Auth0** | Hosts only; participants stay anonymous. |

The API must run as a persistent process (Socket.IO fan-out needs a long-lived
stateful server). Do not deploy it to a serverless platform.

## Environment variables

### `apps/api` (see `apps/api/.env.example`)
| Var | Required | Notes |
|-----|----------|-------|
| `PORT` | no | Defaults to 4000. |
| `NODE_ENV` | yes | `production` in prod (enables JSON logs, raises log level). |
| `MONGODB_URI` | yes | Atlas SRV connection string. |
| `REDIS_URL` | yes | Managed Redis URL. |
| `WEB_ORIGIN` | yes | The web origin, e.g. `https://app.example.com` (CORS lockdown). |
| `AUTH0_ISSUER_BASE_URL` | yes | `https://<tenant>.auth0.com/`. |
| `AUTH0_AUDIENCE` | yes | API identifier in Auth0. |
| `RATE_LIMIT_WINDOW` | no | Seconds; default 60. |
| `RATE_LIMIT_MAX` | no | Per-anon actions per window; default 100 (per-IP is 5×). |
| `PUPPETEER_EXECUTABLE_PATH` | no | Only on slim images lacking puppeteer's bundled Chromium (for PDF export). |

### `apps/web` (see `apps/web/.env.example`)
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_APP_URL`, and the
Auth0 SDK vars (`AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`,
`AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`).

## CI/CD

- **CI** (`.github/workflows/ci.yml`): on every PR — install → lint → typecheck → test → build.
- **CD** (`.github/workflows/deploy.yml`):
  - Push to `main` → re-runs the quality gate, then deploys to **staging**.
  - Manual `workflow_dispatch` (environment = `production`) → promotes to prod.
    The `production` GitHub Environment should require reviewers, so promotion is
    gated by approval.

Required GitHub secrets (set per environment): `FLY_API_TOKEN`, `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## API deploy — Fly.io

Config: `apps/api/fly.toml` (rolling deploys, `/ready` + `/live` health checks,
sockets kept alive — no idle stop).

```bash
# one-time
fly launch --no-deploy --copy-config --name iep-api
fly secrets set MONGODB_URI=... REDIS_URL=... \
  AUTH0_ISSUER_BASE_URL=... AUTH0_AUDIENCE=... WEB_ORIGIN=https://app.example.com

# deploy (also run by CD)
cd apps/api && fly deploy --remote-only
```

Alternative: `render.yaml` at the repo root provisions the API + Redis on Render.

## Web deploy — Vercel

- Set the Vercel project **Root Directory** to `apps/web`.
- `apps/web/vercel.json` pins the monorepo-aware build/install commands and adds
  baseline security headers.
- Configure the env vars above in the Vercel project (Production + Preview).

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

## Post-deploy verification

1. `curl https://<api>/live` → `{"status":"ok",...}`
2. `curl https://<api>/ready` → `200` with mongo + redis up.
3. Open the web app, sign in as a host, create an event, join from a second
   device, launch a poll, confirm the vote appears live (< 1s).
4. End the session and confirm the analytics report + CSV/PDF export.

Run the load tests against staging before raising traffic — see
[`load/README.md`](../load/README.md).

## Local parity

`docker compose up` brings up web, api, mongo, and redis with one command using
the same images that deploy to prod.
