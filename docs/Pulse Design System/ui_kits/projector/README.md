# Projector UI kit — Pulse

The big-screen "stage" shown in the room. Uses the `.pulse-stage` dark token
scope (teal-900 canvas, light text). `projector.jsx` cycles three scenes via
the dots at the bottom:

1. **Live poll** — oversized `PollResult` bars (`inverse`).
2. **Word cloud** — weighted words in the data palette.
3. **Leaderboard** — `LeaderboardRow` top of the room.

Persistent header: dark wordmark, animated **Live** badge, big **join code**,
and the participant count. Recreated from `apps/web/src/app/present/[code]` and
the projector components. Open `index.html`.
