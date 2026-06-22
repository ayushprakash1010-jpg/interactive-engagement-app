# Participant UI kit — Pulse

The phone experience for the audience. Interactive flow in `participant.jsx`:

**Join code → name → live poll vote → results → Q&A** (ask + upvote).

Recreated from `apps/web/src/app/join/*`, `event/[code]`, and `qa-tab.tsx`, in a
phone frame, restyled to Pulse and composing `Input` (code mode), `PollResult`,
`QuestionCard`, `Badge`, `Button`. 44px+ touch targets throughout; "AI sorted"
labels the Q&A ranking. Open `index.html` and tap through.
