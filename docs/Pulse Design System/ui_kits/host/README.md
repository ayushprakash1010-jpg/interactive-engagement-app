# Host UI kit — Pulse

The host (organizer) workspace. A single interactive React app (`host.jsx`) that
composes Pulse design-system primitives from `_ds_bundle.js`.

## Screens / flow
- **Dashboard** — event list with status badges, join codes, headline stats.
- **AI Studio** — `AIComposer` → drafted agenda of activities (the "describe it, Pulse drafts it" flow). The future-ready centerpiece.
- **Builder + Run panel** — activity palette (`ActivityTile`); "Go live" swaps the builder for a live `RunPanel` showing `PollResult` bars + an `AISummaryCard` live read.
- **Analytics** — headline `Stat`s, poll breakdowns, quiz `LeaderboardRow`s, top `QuestionCard`s, and an AI executive summary.

Recreated from `apps/web/src/app/dashboard/*` and the poll/analytics components, restyled to the Pulse teal + warm-sand identity, with AI surfaces added per the "AI-enabled" brief.

## Run
Open `index.html`. Icons via Lucide CDN; primitives via the compiled bundle.
