---
name: pulse-design
description: Use this skill to generate well-branded interfaces and assets for Pulse — the design system for a real-time audience-engagement platform (live polls, Q&A, quizzes, word clouds, feedback) with AI-enabled features. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping and production.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create
static HTML files for the user to view. If working on production code, you can copy assets and read
the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production
code, depending on the need.

## Map of this skill
- `readme.md` — full brand guide: content fundamentals, visual foundations, iconography, caveats.
- `styles.css` — single entry point; link this one file to get every token + webfont.
- `tokens/` — colors, typography, fonts, spacing, elevation (radii/borders/shadows), motion, base.
- `components/` — React primitives: `core/` (Button, Input, Card, Badge, …), `activity/`
  (PollResult, JoinCode, LiveDot, LeaderboardRow, …), `ai/` (AIComposer, AISummaryCard, AIBadge, …).
- `ui_kits/` — full-screen recreations: `marketing/`, `host/`, `participant/`, `projector/`.
- `guidelines/` — foundation specimen cards.
- `assets/` — logomark + wordmarks (light & dark). Copy these; never redraw the logo.

## Working rules
- Reference **semantic tokens** (`--brand`, `--surface-card`, `--text-muted`, `--ai`), not raw scales.
- Teal is the brand; **iris is reserved for AI surfaces only**; warm sand is the canvas.
- Big-screen / projector context = add class `.pulse-stage` for the dark teal scope.
- Type: Space Grotesk (display), Hanken Grotesk (body), JetBrains Mono (codes/figures).
- Icons: **Lucide** (outline), loaded from CDN. No emoji, no hand-drawn icon SVGs.
- Copy: sentence case, second person ("you/your audience"), benefit-first, no emoji.
- Motion is calm, not bouncy; always honor `prefers-reduced-motion`.
- For prototypes, load components via the compiled bundle:
  `<script src="…/_ds_bundle.js"></script>` then `const { Button } = window.PulseDesignSystem_424f5e`.
