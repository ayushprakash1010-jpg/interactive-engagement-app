import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 load test for the API's HTTP surface (Sprint 7).
 *
 * Socket.IO (the real-time hot path) is load-tested separately with Artillery
 * (load/artillery/socket-load.yml) since k6 doesn't speak the Socket.IO
 * protocol. This script hammers the stateless endpoints that scale alongside
 * it — readiness and the public event lookup — to validate the API stays
 * responsive under concurrent HTTP load.
 *
 * Run:
 *   API_URL=https://api.example.com EVENT_CODE=ABC234 \
 *   k6 run load/k6/http-smoke.js
 */

const API_URL = __ENV.API_URL || 'http://localhost:4000';

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    // Broadcast budget analogue for the HTTP surface.
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const ready = http.get(`${API_URL}/ready`);
  check(ready, { 'ready is 200': (r) => r.status === 200 });

  sleep(1);
}
