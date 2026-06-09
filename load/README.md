# Load testing

Sprint 7 load tests validate the MVP target: **1,000 concurrent participants in
one event** with **p95 broadcast latency < 1s**.

The real-time path uses Socket.IO, which k6 can't speak natively, so it's tested
with **Artillery** (Socket.IO engine). The stateless HTTP surface is tested with
**k6**.

## 1. Socket.IO — the real-time hot path (Artillery)

```bash
npm i -g artillery artillery-engine-socketio-v3
ulimit -n 65535   # 1000+ concurrent sockets need a raised fd limit

# Create a live event + a poll first, then export its code + active activity id:
export SOCKET_URL="https://api.staging.example.com"
export EVENT_CODE="ABC234"
export ACTIVITY_ID="<live poll activity id>"

artillery run load/artillery/socket-load.yml
```

Pass criteria: the run's `ensure` block fails the process if **p95 > 1000ms** or
the **error rate > 1%**.

## 2. HTTP surface (k6)

```bash
# macOS: brew install k6
API_URL="https://api.staging.example.com" k6 run load/k6/http-smoke.js
```

Thresholds: `http_req_duration p95 < 1000ms`, `http_req_failed < 1%`.

## Notes

- Run against **staging**, not production.
- Scale the API to the instance count you intend to ship; the Socket.IO Redis
  adapter fans broadcasts across instances (verified further in Sprint 8).
- Record results and tuning in `docs/scaling.md` as targets are raised.
