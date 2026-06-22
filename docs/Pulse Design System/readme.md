# Pulse Design System

**Pulse** is the forward-looking design system for an **Interactive Engagement Platform** —
a real-time polling, Q&A, quiz, word-cloud, and feedback product for meetings, webinars,
classrooms, and corporate events (a Slido / Mentimeter-class tool). Audiences join a live
session from any phone with a code or QR — no app, no login — and a host drives polls,
questions, and quizzes that sync to the room and the big screen in under a second.

This system takes the product's existing surfaces and gives them a **distinct brand and an
AI-enabled, future-ready layer** the codebase only gestured at. Where the shipped app is a
stock shadcn/ui slate theme, Pulse commits to a real identity — **teal + warm sand** — and
adds first-class **AI surfaces** (draft-an-agenda composer, live answer summaries, theme
clustering) as one coherent feature, marked everywhere by a single **iris** accent.

---

## Sources

This system was authored from a real codebase (read-only, mounted locally):

- **`interactive-engagement-app/`** — Turborepo monorepo.
  - `apps/web` — **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**. The four product
    surfaces live here: marketing landing (`src/app/page.tsx`), host dashboard
    (`src/app/dashboard/*`), participant join (`src/app/join`, `src/app/event/[code]`),
    and projector/present (`src/app/present/[code]`). Activity UIs under
    `src/components/poll`, `src/components/questions`, `src/components/wordcloud`,
    `src/components/projector`. Primitives under `src/components/ui` (shadcn).
  - `apps/api` — NestJS + Mongoose + Socket.IO gateway (Redis adapter).
  - `packages/types` — shared Zod schemas + socket contract.
  - Icons: **lucide-react**. Auth: **Auth0** (hosts only). Participants are anonymous.

> **What was inherited vs. invented.** The shipped `globals.css` is the default shadcn slate
> palette with no custom fonts and no brand. Several live-activity components, however, reached
> for undeclared variables (`--color-primary:#01696f` teal, `--color-surface:#f9f8f5` warm sand,
> chart hues including `#7a39bb` iris). Pulse **promotes that latent warm-teal system to the real
> brand** and resolves the two competing palettes into one. The name "Pulse", the AI feature set,
> and the typeface choices are new — see Caveats.

---

## Content fundamentals

How Pulse writes. Drawn from the marketing and product copy in `apps/web`.

- **Voice: confident, plain, benefit-first.** Lead with what the user gets, not the feature.
  Headlines are short declaratives — *"Turn any audience into a conversation," "Live in three
  steps," "Everything you need to engage live."*
- **Person.** Address the user as **you / your audience**; the product is **Pulse** (third person,
  never "we" in UI). *"Your audience just needs a code."*
- **Casing.** **Sentence case everywhere** — headlines, buttons, nav, section titles. The only
  uppercase is the eyebrow/label treatment (tracked-out, small) and the **join code**. Never
  Title Case buttons.
- **Punctuation & rhythm.** Em-dashes for asides (*"join with a code or QR — no app, no login"*).
  Ampersands in feature names (*"Q&A," "Analytics & reports"*). Contractions are fine
  (*"it's free," "Let's talk"*). Sentences are short; fragments are allowed in support copy.
- **Numbers & proof.** Concrete, scannable stats over adjectives: *"<1s broadcast latency,"
  "5,000+ live participants," "No login."* Use tabular figures (`--font-mono` / `.pulse-num`)
  for any live-updating count so digits don't jitter.
- **CTAs.** Verb-first and low-friction: *"Start here — it's free," "Share the code," "Go live,"
  "Start free trial."* Reassure right under the primary CTA (*"No credit card required."*).
- **AI copy.** Frame AI as a fast first draft the host owns, never magic or autonomous:
  *"Describe your session, Pulse drafts it," "Summarized from 142 open responses."* Always show
  provenance (how many responses, what it read). Avoid hype words ("revolutionary," "magical").
- **No emoji** in product or marketing copy. Status is shown with the live dot, badges, and icons —
  not emoji.
- **Vibe:** energetic but trustworthy; a tool for a live room, so urgency ("live," "now," "in the
  room") balanced with calm reliability ("<1s," "synced," "no friction").

---

## Visual foundations

- **Color.** Brand is **teal** (`--brand: #01696f`) on a **warm sand** canvas (`--surface-canvas:
  #f5f3ee`) with warm-charcoal ink (`--text-primary: #23211d`) — paper-and-ink, never cold gray.
  **Iris** (`#7a39bb`) is reserved exclusively for **AI** surfaces so AI reads as one feature.
  A categorical **data palette** (`--data-1…8`) drives poll bars and charts. Semantic hues:
  green success / live, gold warning, red error, blue info. Full scales + semantic aliases in
  `tokens/colors.css`; **reference the semantic aliases** (`--brand`, `--surface-card`,
  `--text-muted`), not raw scales.
- **Dark "stage" scope.** The projector/big-screen surface is a dark teal scope — add class
  **`.pulse-stage`** to a full-bleed region and the surface/text/border tokens re-map to a
  `teal-900` canvas with light text. This is the only dark context; the rest of the product is light.
- **Type.** Three families: **Space Grotesk** (display/headlines — techy-but-warm geometric
  grotesk), **Hanken Grotesk** (UI + body — friendly humanist grotesk), **JetBrains Mono**
  (join codes, tabular figures). Scale runs `--text-2xs` (11) → `--text-7xl` (128, the projector
  join code). Headlines are bold, tight tracking (`--tracking-tight`), balanced wrap. Eyebrows are
  uppercase, tracked `--tracking-wider`, teal. Join codes use `--tracking-code` (0.3em) monospace.
- **Spacing.** 4px base grid (`--space-*`). Section rhythm `--section-y` (96px). Container
  ladder sm→xl for phone column → marketing width.
- **Radii.** App baseline **8px** (`--radius-md`) for cards; 6px controls; 12–16px panels/feature
  cards; 24px marketing hero blocks; `--radius-full` for pills, avatars, badges, the live dot.
- **Elevation.** Shadows are **warm-tinted** (`rgba(35,33,29,…)`), never pure black, so cards sit
  naturally on sand. Five steps `--shadow-xs…xl`. Special **glows** (`--glow-brand`, `--glow-ai`,
  `--glow-live`) are 4px ring auras for emphasis moments only — use sparingly.
- **Borders.** 1px default (`--border-default: #ddd8cf` warm), 2px for strong/selected. Cards are
  border + soft shadow on white; selected/active states use `--brand-subtle` tinted fills.
- **Backgrounds.** Solid warm sand; no busy textures. The one gradient permitted is **`--ai-gradient`**
  (iris→teal) on AI hero moments, plus a subtle `from-brand/10` wash behind marketing heroes. The
  big screen is solid dark teal. No photographic imagery in the system — content is the audience's
  data.
- **Motion** (`tokens/motion.css`). Responsive and **calm, never bouncy**. Durations
  `--dur-fast` (140) for hover/press → `--dur-slower` (700) for count-ups and big-screen reveals.
  Easing `--ease-standard` for most UI, `--ease-out` for enters. Named keyframes: **`pulse-live`**
  (the on-air dot), **`pulse-shimmer`** (AI "thinking" sheen), **`pulse-grow`** (result bars growing
  in). `--ease-spring` overshoot is rare. **All motion respects `prefers-reduced-motion`** (durations
  collapse to 0).
- **Hover / press.** Hover darkens brand by one step (`--brand-hover`); subtle surfaces shift to
  `--surface-offset`. Press darkens again (`--brand-active`) — color shift, not scale-jump. Focus is
  a **3px teal ring** (`--ring-focus`, `--ring-width`) offset 2px, on `:focus-visible` only.
- **Transparency / blur.** Used lightly — tinted subtle fills (`--brand-subtle`, `--ai-subtle`),
  translucent overlays for dialogs. No heavy glassmorphism.

---

## Iconography

- **System: [Lucide](https://lucide.dev)** — the icon set the real codebase already uses
  (`lucide-react` throughout `apps/web`). Outline style, ~1.75–2px stroke, rounded joins; pairs
  naturally with the grotesk type. UI kits and cards load it from the Lucide CDN
  (`lucide@latest`) and render with `data-lucide` / `lucide.createIcons()`.
- **Sizing.** 16px inline with text, 20px default UI, 24px+ for feature/marketing tiles. Icons take
  `currentColor` — tint with text/brand tokens, never bake in a color.
- **Common glyphs** (from the product): `bar-chart-3` polls, `messages-square` Q&A, `trophy`
  quiz/leaderboard, `cloud` word cloud, `star` feedback, `line-chart` analytics, `qr-code` join,
  `users` participants, `zap` create, `sparkles` **AI**. AI always pairs with the `sparkles` glyph
  in iris.
- **No emoji and no hand-drawn SVG** as iconography. The animated **live dot** is a CSS element
  (`pulse-live` keyframe), not an icon.
- **Brand marks.** `assets/pulse-logomark.svg` (mark), `assets/pulse-wordmark.svg` (light bg),
  `assets/pulse-wordmark-dark.svg` (dark / `.pulse-stage`). Copy them out for any artifact — never
  redraw the logo.

---

## Index — what's in this system

### Foundations
- **`styles.css`** (root) — the single entry point consumers link. `@import`s only; reaches every
  token + font file.
- **`tokens/`** — `colors.css`, `typography.css`, `fonts.css`, `spacing.css`, `elevation.css`
  (radii/borders/shadows), `motion.css`, `base.css` (element resets binding tokens to HTML).
- **`guidelines/`** — foundation specimen cards rendered in the Design System tab (color, type,
  spacing/elevation, brand logo + motifs).

### Components (`window.PulseDesignSystem_424f5e.*`)
- **`components/core/`** — Button, IconButton, Input, Textarea, Switch, Card, Badge, Avatar, Stat.
- **`components/activity/`** — ActivityTile, JoinCode, LiveDot, PollResult, LeaderboardRow,
  QuestionCard. The live-engagement primitives.
- **`components/ai/`** — AISparkle, AIBadge, **AIComposer** (draft-an-agenda hero), **AISummaryCard**
  (answer summaries / theme clusters, with `shimmer` loading), SuggestionChip. The future-ready layer.

Each directory has a `@dsCard` HTML showing live states. Per-component usage is in the sibling
`.prompt.md` files; props in `.d.ts`.

### UI kits (full-screen recreations)
- **`ui_kits/marketing/`** — landing page (hero, features, how-it-works, pricing, CTA).
- **`ui_kits/host/`** — organizer workspace: dashboard, **AI Studio**, builder + live run panel,
  analytics.
- **`ui_kits/participant/`** — the phone experience: join, vote, ask/upvote, quiz.
- **`ui_kits/projector/`** — the dark big-screen stage (`.pulse-stage`): live poll, word cloud,
  leaderboard.

### Other
- **`SKILL.md`** — makes this folder usable as a downloadable Agent Skill.
- Generated (do not edit): `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`.

---

## Caveats / substitutions

- **Brand name "Pulse" is new.** The product ships unnamed ("Interactive Engagement Platform").
  Swap globally if you have an official name.
- **Fonts are substitutions.** The codebase ships no brand typeface (stock shadcn default sans).
  Space Grotesk / Hanken Grotesk / JetBrains Mono are chosen matches loaded from Google Fonts.
  Provide real `.woff2` files and we'll self-host them.
- **Teal/sand/iris identity is a promotion**, not a spec from a designer — derived from latent
  variables in the activity components. Confirm the direction (vs. keeping shadcn slate).
- **AI features are designed, not wired** — the kits mock the AI flows; no live model is called.
