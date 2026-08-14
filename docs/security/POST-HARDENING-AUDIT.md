# Post-Hardening Audit

## Summary of Changes
This document verifies the state of the Pulse / Interactive Engagement Platform codebase after the implementation of Phase 1 Security Hardening.

### 1. Socket.IO Gateway Authorization
- **Vulnerability:** Unauthenticated host events could be triggered by any participant manipulating websocket payloads (e.g., launching/closing activities, moderating Q&A, and answering questions).
- **Resolution:** A short-lived Socket Authorization Token is now generated via the `GET /auth/socket-token` endpoint. 
- **Implementation:** The host client passes this token on `EVENT_OBSERVE`. The token is validated using `JwtService` and binds the authenticated host's `userId` to the `RealtimeGateway` socket connection state. The `assertIsHost` middleware now guards all critical host events, verifying that the socket has host privileges and owns the corresponding event via `EventsService`.

### 2. Participant AnonId Spoofing Prevention
- **Vulnerability:** Anonymous participants could act on behalf of other participants by changing the `anonId` field in websocket payloads (e.g., responding to polls, upvoting Q&A).
- **Resolution:** Participant `anonId` values are now enforced server-side.
- **Implementation:** During `EVENT_JOIN`, the gateway binds the participant's original `anonId` to their socket state. In all subsequent participant events (`ACTIVITY_RESPOND`, `WORDCLOUD_SUBMIT`, `QUIZ_ANSWER`, `QA_ASK`, `QA_UPVOTE`, `REACTION_SEND`), the payload `anonId` is overridden by the socket state `anonId`, preventing spoofing while keeping the API interfaces consistent.

### 3. Activity IDOR (Insecure Direct Object Reference)
- **Vulnerability:** `ActivityService.findOne(id, eventId)` did not verify that the provided `eventId` belonged to the authenticated host, allowing anyone with an activity ID to view its contents.
- **Resolution:** Enforced ownership checks on `ActivityService.findOne`.
- **Implementation:** The `ActivityController` was updated to pass `req.user._id` (the authenticated user). `ActivityService.findOne` now verifies the event belongs to `hostId` through `eventsService.findOne(eventId, hostId)` before returning the activity. 

### 4. Mock Billing Endpoint Gating
- **Vulnerability:** `POST /billing/upgrade-mock` was fully functional in production, allowing users to upgrade to premium tiers (Pro/Enterprise) for free.
- **Resolution:** Disabled mock billing in production environments.
- **Implementation:** Added a strict `NODE_ENV === 'production'` check to `billing.controller.ts` that throws a `BadRequestException`. Mock billing continues to function correctly for local development and staging environments.

### 5. Strict Auth0 Environment Requirements
- **Vulnerability:** `AUTH0_ISSUER_BASE_URL` and `AUTH0_AUDIENCE` were marked as `.optional()` in the Zod environment schema despite being strictly required by `JwtStrategy` at application boot.
- **Resolution:** Made Auth0 properties strictly required in `env.validation.ts` to ensure fast-failing during startup if authentication configurations are missing.

## Testing & Verification
- All 165 backend unit tests, including Socket Gateway mock implementations, passed successfully.
- Typescript compilation completed successfully across both `@iep/api` and `@iep/types` workspace packages.
- Frontend observer connection logic in `use-event-realtime.ts` has been verified to fetch the `hostToken` and correctly supply it in `EVENT_OBSERVE`. Unauthenticated observer fallback (e.g. for projector views) remains functional.

## Next Steps
The most critical vulnerabilities identified in the initial architecture audit have been remediated without breaking existing application flow or modifying the database schemas. Moving forward, consideration should be given to adapting the process-local `this.socketState` map to a Redis-backed mechanism to support multi-instance horizontal scaling.
