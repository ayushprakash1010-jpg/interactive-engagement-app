# Security Hardening Log

## Phase 0: Host Socket Authorization

### Vulnerability Addressed
- The Socket.IO gateway (`RealtimeGateway`) was completely unprotected for host operations.
- `EVENT_OBSERVE` emitted by the host dashboard did not include any authentication token.
- Malicious clients could emit host-only events (e.g., `ACTIVITY_LAUNCH`, `ACTIVITY_CLOSE`, `QA_MODERATE`) with a valid `activityId` and the server would execute them.
- In participant handlers (e.g., `ACTIVITY_RESPOND`, `QA_ASK`), the server blindly trusted the `anonId` provided in the payload rather than validating it against the connection session, allowing anonymous participants to spoof other participants.

### Fix Implementation
- **API `AuthController`:** Added a new `GET /auth/socket-token` endpoint that issues a short-lived (5 min) JWT signed with the `SESSION_SECRET` specifically for socket host authorization.
- **`EVENT_OBSERVE` Payload:** Extended the `eventObserveSchema` to accept an optional `hostToken`.
- **Frontend Hook (`use-event-realtime.ts`):** Modified the observer `join()` function to fetch the short-lived `socket-token` from the API and pass it into the `EVENT_OBSERVE` payload. Gracefully falls back to unauthenticated observer (for projector views).
- **Gateway `handleEventObserve`:** Verifies the `hostToken` using `JwtService`. If valid, it binds the `hostId` to the socket state.
- **Gateway `assertIsHost`:** Added a private method that validates the socket is an observer, has a verified `hostId`, and that the `hostId` matches the event owner in the database. Added this check to all host-only handlers (`ACTIVITY_LAUNCH`, `ACTIVITY_CLOSE`, `QA_MODERATE`, `QA_REPLY`, `QUIZ_NEXT_QUESTION`, `SESSION_END`).
- **Participant `anonId` Spoofing:** Overrode the payload `anonId` with the session-bound `anonId` from the socket state in all participant handlers (`ACTIVITY_RESPOND`, `WORDCLOUD_SUBMIT`, `QUIZ_ANSWER`, `QA_ASK`, `QA_UPVOTE`, `REACTION_SEND`).

## Additional Fixes
- **`ActivityService.findOne`:** Added a `hostId` parameter and an ownership check to prevent IDOR on fetching activity details. The REST API `ActivityController` was updated to pass the `user._id` for this check.
- **Billing Mock Endpoint:** Gated `POST /billing/upgrade-mock` using `NODE_ENV === 'production'` to prevent fake billing upgrades in production.
- **Environment Validation:** Made `AUTH0_ISSUER_BASE_URL` and `AUTH0_AUDIENCE` strictly required in `env.validation.ts` since they are consumed by `JwtStrategy` unconditionally on startup.
