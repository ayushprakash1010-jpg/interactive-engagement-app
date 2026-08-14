# Implementation Plan

## 1. Remove SESSION_SECRET Hardcoded Fallbacks
- **Action:** In `auth.module.ts` and `impersonation.strategy.ts`, replace the fallback `'fallback-dev-secret-do-not-use-in-prod'` with `configService.getOrThrow('SESSION_SECRET')`. 
- **Action:** Ensure `SESSION_SECRET: z.string().min(1)` is strictly required in `env.validation.ts` to fail fast if missing.

## 2. Secure OAuth State Handling
- **Action (Zoom):** In `zoom.controller.ts`, replace `const state = req.user.auth0Sub;` with a securely generated random state stored in Redis (with a TTL), mapping to `req.user.auth0Sub`, identical to how `TeamsService` handles it. Verify it on callback.
- **Action (Google Meet):** In `google-meet.service.ts`, implement the same Redis-backed state generation and verification, replacing the raw `auth0Sub` pass-through.
- **Note:** Google Slides and PowerPoint do not have OAuth callback flows, so state handling does not apply to them.

## 3. Secure Link-Meeting and Context-to-Event Endpoints
- **Vulnerability 1 (context-to-event):** `context-to-event` (Zoom, Teams, Meet) currently auto-creates events based on an unverified user ID from the query string (e.g. `zoomUserId`). This allows an attacker to forge event creation on behalf of any user, filling their account with garbage events.
- **Fix 1:** Remove the auto-creation logic entirely from `getOrCreateEventForMeeting` in `zoom.service.ts`, `teams.service.ts`, and `google-meet.service.ts`. Rename to `getEventForMeeting`. It should only act as a read-only lookup to find an existing event, throwing `NotFoundException` if none exists.
- **Vulnerability 2 (link-meeting):** `link-meeting` and `link-presentation` are unauthenticated `GET` requests. They currently *overwrite* the existing integration link for the event. A malicious participant can call this endpoint to link their own presentation to the host's event, erasing the host's link and breaking the host's auto-connect feature (destructive unauthorized mutation).
- **Fix 2:** Change all `link-meeting` and `link-presentation` endpoints to `POST` to prevent simple GET-based CSRF. Update the corresponding frontend `fetch` calls in `zoom-client.tsx`, `teams/page.tsx`, `meet/page.tsx`, `powerpoint/page.tsx`, and `google-slides/index.html` to use `POST`.
- **Fix 3:** Make the linking *non-destructive*. Instead of `event.integrations = event.integrations.filter(...)` to remove the old link, simply *append* the new link to the array (up to a small limit, e.g., 5 per provider, to prevent unbounded array growth). This ensures the host's link is never destroyed by a participant.

## 4. Unauthenticated Mutation Search
- **Action:** Scan for other endpoints using `GET` for mutations or lacking `@UseGuards(JwtAuthGuard)` where they modify data.

## 5. Verify /auth/socket-token
- **Action:** Confirm `AuthController.getSocketToken` is protected by `JwtAuthGuard` (it is) and verify it only issues tokens for the authenticated user.

## 6. Socket Token Hardening
- **Action:** Verify token expiration is short (it is 5m). Ensure `JwtStrategy` explicitly rejects tokens containing `type: 'socket-host'` so they cannot be used for REST API access.

## 7. Security Tests
- **Action:** Add explicit security tests verifying:
  - Participant -> host action rejection
  - Cross-event host access rejection
  - AnonId spoofing rejection
  - Invalid socket token rejection
  - Socket token issuance authorization

## 8. Run Tests
- **Action:** Run the full suite and report the new baseline count compared to the original 165.

## 9. Update Audit Doc
- **Action:** Mark findings as FIXED in `POST-HARDENING-AUDIT.md`.
