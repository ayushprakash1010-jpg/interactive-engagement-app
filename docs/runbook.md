# Operations runbook

Operational reference for running IEP in production.

## Health & probes

| Endpoint | Purpose | Checks deps? | Use for |
|----------|---------|--------------|---------|
| `GET /live` | Liveness | No | Restart a wedged process (k8s/Fly livenessProbe). |
| `GET /ready` | Readiness | Yes (Mongo + Redis) | Gate load-balancer traffic (readinessProbe). |
| `GET /health` | Combined | Yes | Backward-compat; used by the web "/" page + docker-compose. |

Liveness intentionally does **not** touch dependencies, so a transient Mongo or
Redis blip won't cause the orchestrator to kill and restart the container.

## Logging

Structured JSON logs via `nestjs-pino` in production (pretty single-line in dev).
Every HTTP request gets an `x-request-id` (honored from the inbound header or
generated); it's echoed in the response header and attached to every log line
for that request. `Authorization`/`Cookie`/`Set-Cookie` are redacted. Health
probes are excluded from request logging to cut noise.

## Graceful shutdown

On `SIGTERM`/`SIGINT` (`enableShutdownHooks`), the gateway's
`onApplicationShutdown` handler:
1. clears all in-flight broadcast timers (poll, word cloud, quiz),
2. disconnects connected sockets, and
3. closes the Socket.IO server,

so rolling deploys drain cleanly. Fly is configured for `rolling` strategy; give
machines a grace period for sockets to migrate.

## Rate limiting

Redis-backed fixed-window limiter on the highest-volume participant actions
(`qa:ask`, `activity:respond`), keyed by both `anonId` and client IP (per-IP
ceiling is 5× to tolerate shared NATs / classrooms). Tune with `RATE_LIMIT_MAX`
/ `RATE_LIMIT_WINDOW`. The limiter **fails open** on Redis errors so a Redis
blip never blocks participation.

To clear a stuck limit for a participant:
```bash
redis-cli --scan --pattern 'ratelimit:*:anon:<anonId>' | xargs redis-cli del
```

## MongoDB Atlas — backup & restore

**Policy**
- Enable **Cloud Backup** with **Continuous Cloud Backup (PITR)** on the
  production cluster (M10+).
- Snapshot schedule: hourly (2-day retention), daily (7-day), weekly (4-week),
  monthly (12-month). Adjust to your compliance needs.
- PITR window: at least 72 hours.
- Restores are tested quarterly into a scratch cluster (see below).

**Restore (point-in-time)**
1. Atlas UI → cluster → **Backup** → **Restore** → choose a point in time.
2. Restore into a **new** cluster (never overwrite prod blindly).
3. Point a staging API at the restored cluster (`MONGODB_URI`) and verify.
4. If promoting the restore, update the prod `MONGODB_URI` secret and redeploy.

**Quarterly DR drill:** restore the latest snapshot to a scratch cluster, run
the post-deploy verification from [deployment.md](./deployment.md), record the
restore time.

## Common incidents

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `/ready` 503, `/live` 200 | Mongo or Redis unreachable | Check Atlas/Redis status; LB stops routing automatically until healthy. |
| Participants not receiving broadcasts across instances | Redis adapter pub/sub down | Verify `REDIS_URL`; check adapter connection logs; restart API. |
| Spikes of `iep:error` "too fast" | Rate limit hit (bot/abuse or limit too low) | Inspect by IP; raise `RATE_LIMIT_MAX` if legitimate. |
| PDF export fails | No Chromium on the image | Set `PUPPETEER_EXECUTABLE_PATH` or allow puppeteer's Chromium download. |
| 500s after deploy | Bad env/secret | Check structured error logs (status ≥ 500 are logged with stack + request id); roll back. |

## Scaling

The API is stateless across instances thanks to the Socket.IO Redis adapter.
Scale horizontally behind the load balancer; raise targets and record tuning in
`docs/scaling.md` (Sprint 8). Load-test procedure: [`load/README.md`](../load/README.md).
