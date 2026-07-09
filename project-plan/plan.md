# Interactive Engagement Platform (IEP)
## Technical Documentation — Phased Delivery Plan with Claude Code Prompts

**Version:** 1.0
**Document type:** Engineering build plan (phases → sprints → Claude Code prompts)
**Product:** Real-time polling, Q&A, quiz, word cloud, and feedback platform for meetings, webinars, classrooms, and corporate events (a Slido/Mentimeter-class product).

---

## How to read this document

The build is organized as **Phases → Sprints → Tasks**, and every sprint ends with a **ready-to-paste Claude Code prompt**. The prompts are written to be run in sequence inside the monorepo described in Phase 0; each assumes the previous sprint's code exists. Acceptance criteria define "done" for each sprint.

- **Phase 1** is the MVP. It is fully functional and shippable on its own.
- **Phases 2–5** are future work, explicitly scoped out of the MVP per the product direction:
  - **No native mobile apps in the MVP** → native iOS/Android moved to **Phase 4** (the MVP web app is responsive + installable as a PWA so phones work day one).
  - **No Zoom / Microsoft Teams integration in the MVP** → moved to **Phase 3**.
  - **AI features** (summarization, sentiment, recommendations) → **Phase 5**.

---

## 1. Technology decisions

The original deck proposed React.js, TypeScript, Socket.IO, MongoDB, Firebase Auth, and Tailwind CSS. The requested changes are **Next.js in place of plain React.js** and **Auth0 in place of Firebase Auth**. The rest of the stack is retained, with a few additions that materially help a real-time product at scale. Each change carries a short rationale so it can be accepted or rejected on its own merits.

### 1.1 Confirmed stack

| Layer | Choice | Status vs. deck | Why |
|-------|--------|-----------------|-----|
| Frontend framework | **Next.js (App Router) + React + TypeScript** | **Changed** from React.js | SSR/SSG for fast public join pages, file-based routing, built-in image/font optimization, first-class Vercel deploy, server actions for light BFF work. |
| Styling | **Tailwind CSS + shadcn/ui** | Kept (+ shadcn) | Tailwind retained; shadcn/ui adds accessible, unstyled-but-themable components so we don't hand-roll dialogs, menus, toasts. |
| Real-time transport | **Socket.IO** | Kept | Proven WebSocket layer with auto-fallback and rooms. (See 1.3 for managed alternatives.) |
| Real-time scaling | **Redis (Socket.IO adapter + pub/sub)** | **Added** | Lets multiple backend instances share socket rooms so the app scales horizontally. Also used for live counters and rate limiting. |
| Backend | **NestJS (Node.js + TypeScript)** | **Refined** (deck implied generic Node) | Modular structure maps 1:1 to our features (auth, events, polls, qa, quiz, analytics) and has first-class Socket.IO "gateways." Express/Fastify is a lighter alternative (1.3). |
| Database | **MongoDB + Mongoose** | Kept | Schema-flexible document model fits dynamic event/poll/response data; horizontal scaling via sharding. |
| Auth | **Auth0** (hosts only) | **Changed** from Firebase Auth | Managed multi-provider auth (social, email/password, enterprise SSO/SAML-ready) issuing OIDC/JWT access tokens. Participants stay anonymous (no login), so auth only guards host/admin surfaces. Auth0's first-class enterprise SSO also smooths the Phase 3 SSO work. |
| Validation | **Zod (shared schemas)** | **Added** | One schema shared by frontend and backend for REST bodies and socket payloads; eliminates drift. |
| Data fetching / client state | **TanStack Query + Zustand** | **Added** | Query for server cache + retries; Zustand for lightweight live UI state (current activity, socket status). |
| Charts | **Recharts** + **d3-cloud** | **Added** | Recharts for poll/quiz/analytics visuals; d3-cloud for word clouds. |
| Monorepo | **Turborepo + pnpm workspaces** | **Added** | Frontend, backend, and shared types in one repo with shared lint/tsconfig and cached builds. |
| Testing | **Vitest/Jest + Playwright** | **Added** | Unit/integration + end-to-end across the host/participant flows. |
| Containerization | **Docker + docker-compose** | **Added** | One command spins up web, api, MongoDB, and Redis locally; identical image deploys to prod. |

### 1.2 Why a separate NestJS backend instead of only Next.js API routes

Next.js route handlers and server actions run in short-lived serverless functions that are not designed to hold thousands of persistent WebSocket connections. Real-time fan-out (a host launches a poll, 5,000 participants must receive it in <1s) needs a long-running stateful Node process. So:

- **Next.js (`apps/web`)** owns all UI, public join pages, the host dashboard, and the projector view. It may use a few server actions / route handlers as a thin BFF.
- **NestJS (`apps/api`)** owns the REST API, the Socket.IO gateway, business logic, and database access. It runs as a persistent container (not serverless).

### 1.3 Open alternatives (decide before Phase 0)

These are genuine options flagged because the brief invited better ideas. None block the plan.

- **Managed real-time instead of self-hosted Socket.IO:** Ably or Pusher remove the burden of running/scaling the socket layer and Redis adapter, at a per-message cost. Recommended if the team is small and wants to avoid infra work. Self-hosted Socket.IO + Redis is cheaper at scale and keeps data in-house.
- **Lighter backend:** Express or Fastify + the `socket.io` package instead of NestJS, if the team prefers minimal structure over NestJS conventions.
- **Auth alternatives:** Auth0 is the chosen managed provider (enterprise-grade, SSO/SAML-ready). Clerk or Auth.js (NextAuth) integrate even more natively with Next.js and are lighter for a pure-Next.js app; consider them if Auth0's enterprise features and pricing are not needed.
- **Database alternative:** PostgreSQL (Prisma) if the team prefers relational integrity for analytics/reporting. MongoDB is retained per the deck and fits the event-document shape well.

---

## 2. Target architecture (MVP)

```
                          ┌─────────────────────────────────────────┐
                          │              Clients                      │
                          │  Host dashboard │ Participant │ Projector  │
                          │   (Next.js)     │  (Next.js)  │ (Next.js)  │
                          └───────┬───────────────┬───────────────┬───┘
                                  │ HTTPS REST     │ WebSocket (Socket.IO)
                                  ▼                ▼
                          ┌─────────────────────────────────────────┐
                          │            apps/api (NestJS)              │
                          │  Auth │ Events │ Polls │ Q&A │ Quiz │     │
                          │  Feedback │ WordCloud │ Analytics │       │
                          │  Realtime Gateway (Socket.IO)             │
                          └───────┬───────────────┬───────────────┬──┘
                                  │               │               │
                              ┌───▼───┐       ┌───▼────┐      ┌────▼────┐
                              │MongoDB│       │ Redis  │      │  Auth0  │
                              │(Atlas)│       │(adapter│      │ (hosts) │
                              │       │       │+counts)│      │  OIDC   │
                              └───────┘       └────────┘      └─────────┘
```

**Three client surfaces, one codebase (`apps/web`):**
1. **Host dashboard** — authenticated; create events, build activities, run sessions live, view analytics.
2. **Participant view** — public; join via 6-char code or QR, respond to activities, ask/upvote questions. No login.
3. **Projector view** — public, read-only big-screen display of live results for the room.

---

## 3. Data model (MongoDB collections)

These extend the deck's collections (Users, Events, Polls, Responses, Questions) with the fields the features actually require. Field names are illustrative; finalize in Sprint 0.

**users** (hosts/admins only)
```
_id, auth0Sub (unique), name, email, role ('host' | 'admin'),
plan, createdAt, updatedAt
```

**events**
```
_id, hostId (ref users), name, description,
eventCode (unique, 6 chars), status ('draft' | 'live' | 'ended'),
settings { allowAnonymousQA, requireModeration, participantNames },
activeActivityId (ref activities | null),
startedAt, endedAt, createdAt, updatedAt
```

**participants** (anonymous, per-session)
```
_id, eventId (ref events), anonId (uuid stored in client),
displayName (optional), firstSeenAt, lastSeenAt
```

**activities** (unified parent for poll / quiz / wordcloud / feedback)
```
_id, eventId (ref events), type ('poll' | 'quiz' | 'wordcloud' | 'feedback'),
title, order, status ('idle' | 'live' | 'closed'),
config (type-specific, see below), createdAt, updatedAt
```
- **poll config:** `{ pollType: 'single'|'multiple'|'rating'|'open', question, options:[{id,label}], ratingScale }`
- **quiz config:** `{ questions:[{id, text, options:[{id,label}], correctOptionId, points, timeLimitSec}] }`
- **wordcloud config:** `{ prompt, maxWordsPerParticipant }`
- **feedback config:** `{ prompt, fields:[{id, type:'rating'|'text', label}] }`

**responses** (poll/quiz/feedback/wordcloud submissions)
```
_id, eventId, activityId (ref activities), participantAnonId,
selectedOptionIds:[], textValue, ratingValue, quizQuestionId,
isCorrect, awardedPoints, createdAt
```

**questions** (Q&A)
```
_id, eventId (ref events), text, authorAnonId, authorName (optional),
voteCount, voterAnonIds:[], status ('pending'|'approved'|'answered'|'dismissed'),
createdAt, updatedAt
```

**Indexes (minimum):** `events.eventCode (unique)`, `responses.{eventId, activityId}`, `questions.{eventId, status}`, `participants.{eventId, anonId} (unique)`.

---

## 4. Real-time contract (Socket.IO)

All sockets join a **room keyed by `eventId`**. Redis adapter fans events out across API instances.

**Rooms**
- `event:{eventId}` — everyone in a session.
- `host:{eventId}` — host/projector only (moderation + private counts).

**Client → Server**
| Event | Payload | Who |
|-------|---------|-----|
| `event:join` | `{ eventCode, anonId, displayName? }` | Participant |
| `activity:respond` | `{ activityId, selectedOptionIds?, textValue?, ratingValue? }` | Participant |
| `quiz:answer` | `{ activityId, questionId, optionId, clientTimeMs }` | Participant |
| `wordcloud:submit` | `{ activityId, words:[] }` | Participant |
| `qa:ask` | `{ text, displayName? }` | Participant |
| `qa:upvote` | `{ questionId }` | Participant |
| `activity:launch` | `{ activityId }` | Host |
| `activity:close` | `{ activityId }` | Host |
| `qa:moderate` | `{ questionId, status }` | Host |
| `session:end` | `{ eventId }` | Host |

**Server → Client (broadcasts)**
| Event | Payload | Target |
|-------|---------|--------|
| `participant:count` | `{ count }` | room |
| `activity:launched` | `{ activity }` | room |
| `activity:closed` | `{ activityId }` | room |
| `poll:results` | `{ activityId, tallies }` | room |
| `quiz:question` | `{ questionId, ... , endsAt }` | room |
| `quiz:leaderboard` | `{ top:[{name, points}] }` | room |
| `wordcloud:update` | `{ words:[{text, weight}] }` | room |
| `qa:new` | `{ question }` | host (+ room if approved) |
| `qa:updated` | `{ question }` | room |
| `session:ended` | `{ eventId }` | room |

**Guarantees:** server is the source of truth; clients never compute tallies locally except for optimistic UI. Every broadcast is idempotent so a reconnecting client can re-sync by re-requesting current state on `event:join`.

---
## 5. Roadmap at a glance

| Phase | Theme | Sprints | In MVP? |
|-------|-------|---------|---------|
| **Phase 0** | Foundation & tooling | Sprint 0 | ✅ Yes |
| **Phase 1** | Core MVP | Sprints 1–7 | ✅ Yes |
| **Phase 2** | Hardening, scale, i18n, PWA polish | Sprints 8–10 | ❌ Future |
| **Phase 3** | Zoom & Microsoft Teams integrations + SSO | Sprints 11–12 | ❌ Future |
| **Phase 4** | Native mobile apps (iOS/Android) | Sprints 13–15 | ❌ Future |
| **Phase 5** | AI Studio v2 (End-to-End AI Ecosystem) | Sprints 16–23+ | ❌ Future |

Suggested cadence: 1–2 week sprints. Phase 1 (MVP) is ~7 sprints of focused work after the Sprint 0 foundation.

---

# PHASE 0 — Foundation & Tooling

**Goal:** A running monorepo with both apps booting, shared types, linting, Docker, and CI — so every later sprint plugs into a stable base.

## Sprint 0 — Repo, tooling, and skeleton

**Deliverables**
- Turborepo + pnpm workspaces: `apps/web` (Next.js), `apps/api` (NestJS), `packages/types` (shared Zod schemas + TS types), `packages/config` (eslint/tsconfig/prettier).
- `apps/web`: Next.js App Router + TypeScript + Tailwind + shadcn/ui initialized; health page renders.
- `apps/api`: NestJS boots with a `/health` endpoint; Mongoose connects to MongoDB; Socket.IO gateway online with Redis adapter.
- `docker-compose.yml`: web, api, mongo, redis all start with one command.
- GitHub Actions CI: install → lint → typecheck → unit test → build on every PR.
- `.env.example` files for both apps.

**Acceptance criteria**
- `pnpm dev` (via Turborepo) starts web on :3000 and api on :4000.
- `docker compose up` brings up all four services; web reaches api `/health`; api reaches Mongo and Redis.
- CI passes green on a trivial PR.

### Claude Code prompt — Sprint 0
```
You are setting up a greenfield monorepo for a real-time audience engagement platform
called "Interactive Engagement Platform" (Slido/Mentimeter style).

Create a Turborepo monorepo using pnpm workspaces with this structure:
  apps/web      -> Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
  apps/api      -> NestJS + TypeScript, Mongoose (MongoDB), Socket.IO gateway with the
                   @socket.io/redis-adapter, Redis (ioredis)
  packages/types  -> shared Zod schemas + inferred TypeScript types, published to both apps
  packages/config -> shared eslint, prettier, and tsconfig base configs

Requirements:
1. Root: pnpm-workspace.yaml, turbo.json with dev/build/lint/typecheck/test pipelines,
   a root package.json with scripts that delegate to turbo.
2. apps/web: Next.js App Router, TypeScript strict, Tailwind configured, shadcn/ui
   initialized (button, card, dialog, input, toast). A "/" page that fetches the api
   /health endpoint server-side and shows its status. Configure an env var
   NEXT_PUBLIC_API_URL.
3. apps/api: NestJS app with a HealthModule exposing GET /health that checks Mongo and
   Redis connectivity. ConfigModule for env. Mongoose connection via MONGODB_URI.
   A RealtimeGateway using Socket.IO bound to the same server, wired to the Redis adapter
   via REDIS_URL. Enable CORS for the web origin.
4. packages/types: export Zod schemas for User, Event, Participant, Activity, Response,
   Question (use the data model I will paste below) and their inferred types. Both apps
   import from "@iep/types".
5. docker-compose.yml at root with services: web, api, mongo (mongo:7), redis (redis:7).
   api and web build from their own Dockerfiles. Wire env vars between services.
6. .env.example in apps/web and apps/api listing every required var.
7. GitHub Actions workflow .github/workflows/ci.yml: pnpm install, then turbo
   lint typecheck test build.

Data model to encode in packages/types (MongoDB collections):
<paste Section 3 "Data model" from the technical doc here>

Do not implement business features yet — only the skeleton, health checks, shared types,
and infra. Verify `pnpm dev` runs both apps and `docker compose up` starts all services.
```

---

# PHASE 1 — Core MVP

The shippable product: hosts create events, run live polls/quizzes/word clouds/feedback, take anonymous Q&A with upvoting, and review analytics. Participants join with a code/QR and respond instantly. Real-time sync under load.

## Sprint 1 — Host auth & event management (CRUD)

**Deliverables**
- Auth0 in `apps/web` (email/password + Google via Universal Login) for hosts; auth state via the Auth0 Next.js SDK.
- NestJS auth guard verifying Auth0 access tokens (JWT validated against Auth0's JWKS) → `req.user`; upsert into `users`.
- Events REST API: create / list (mine) / get / update / delete; unique 6-char `eventCode` generation with collision retry; QR code generation for the join URL.
- Host dashboard pages: event list, create event, event detail (draft state) with shareable code + QR.

**Acceptance criteria**
- A host can sign up, log in, create an event, and see its code + QR.
- Unauthenticated REST calls to event endpoints return 401.
- Event codes are unique and URL-safe.

### Claude Code prompt — Sprint 1
```
Implement host authentication and event management on top of the existing monorepo.

apps/api (NestJS):
- AuthModule: integrate Auth0. A JwtAuthGuard that reads the Bearer access token, verifies it
  against Auth0's JWKS (issuer + audience checks, RS256), and attaches the user. On first
  verified request, upsert a users document (auth0Sub from the token `sub`, name, email,
  role='host'). Use a library such as passport-jwt + jwks-rsa (or jose) for verification.
- EventsModule: Mongoose schema per packages/types. REST endpoints (all guarded except none
  are public here): POST /events, GET /events (host's own), GET /events/:id,
  PATCH /events/:id, DELETE /events/:id. Generate a unique 6-char alphanumeric eventCode
  (exclude ambiguous chars 0/O/1/I) with retry-on-collision. Validate bodies with the Zod
  schemas from @iep/types using a ZodValidationPipe.
- Add an endpoint or util that returns the participant join URL and a QR code (use the
  "qrcode" package) as a data URL.

apps/web (Next.js):
- Auth0 Next.js SDK (@auth0/nextjs-auth0) with Universal Login (email/password + Google).
  An AuthProvider context + useAuth hook. Obtain an access token for the API audience and
  attach it as a Bearer token to all API calls (TanStack Query + a fetch wrapper).
- Protected /dashboard route group (redirect to /login if unauthenticated).
- Pages: /dashboard (list my events with status badges + "Create" button),
  /dashboard/events/new (form: name, description, settings toggles),
  /dashboard/events/[id] (detail: shows eventCode big, QR code, copy-link button, edit, delete).
- Use shadcn/ui components and TanStack Query for all data fetching with optimistic updates
  on create/delete.

Write unit tests for eventCode generation (uniqueness + charset) and the JWT auth guard
(valid token attaches user; missing/invalid/wrong-audience token rejects with 401).
Acceptance: a host can register, log in, create an event, and view its code + QR; protected
endpoints reject requests without a valid token.
```

---

## Sprint 2 — Participant join flow & real-time core

**Deliverables**
- Public participant entry: `/join`, `/join/[code]`, name-optional step; generates/stores a persistent `anonId` (localStorage) — no login.
- Socket.IO client wired into `apps/web` (singleton, reconnect, status in Zustand).
- Backend gateway: `event:join` validates the code, registers the participant, joins the room, broadcasts `participant:count`; on join, server replies with current session snapshot (active activity, approved questions) so late joiners sync.
- Live participant counter on host dashboard and projector view scaffold (`/present/[code]`).

**Acceptance criteria**
- Opening a join link on multiple devices increments a live count visible to the host within ~1s.
- A participant who reconnects re-receives current session state automatically.
- Invalid/ended event codes are rejected with a friendly message.

### Claude Code prompt — Sprint 2
```
Build the anonymous participant join flow and the real-time core.

apps/web:
- A Socket.IO client singleton (connects to NEXT_PUBLIC_API_URL). Track connection status
  in a Zustand store (connected/reconnecting/disconnected) with a small status indicator.
- Generate a persistent anonId (uuid) stored in localStorage on first visit; reuse it.
- Public pages (no auth): /join (enter code), /join/[code] (optional display name, then join).
  On join, emit event:join {eventCode, anonId, displayName?} and route to /event/[code]
  (the live participant screen — placeholder grid for now showing connection + participant count).
- A projector view /present/[code] (public, read-only) that joins the room and shows a large
  participant count and a "waiting for host" state.

apps/api (RealtimeGateway):
- Handle event:join: look up event by code; if missing or status='ended', emit an error event.
  Otherwise upsert a participants doc ({eventId, anonId, displayName}), join socket rooms
  event:{eventId} and (for hosts/projector) host:{eventId}. Maintain a live participant count
  in Redis (per event) and broadcast participant:count to the room on join/disconnect.
- On join, send the joining client a session:snapshot with the current activeActivity (if any)
  and the list of approved questions, so late joiners and reconnecting clients are in sync.
- Handle disconnect: decrement count, broadcast.

Use the shared socket event names/payloads from the Section 4 real-time contract (I'll paste it).
Acceptance: joining from several browser tabs updates the host's live count in real time;
reconnecting a tab restores its state; invalid codes show a friendly error.
```

---

## Sprint 3 — Live Polling module

**Deliverables**
- Poll builder in host dashboard: single choice, multiple choice, rating scale, open text.
- Host run controls: launch, close, relaunch a poll; only one activity `live` per event at a time.
- Participant poll UI for all four types with optimistic submit + duplicate-vote protection (per `anonId` per activity).
- Live result aggregation server-side; `poll:results` broadcast on each new response (throttled/batched to ~4 updates/sec under load).
- Results visualization with Recharts (bars for choice, distribution for rating, live list/word-style for open text) on participant, host, and projector views.

**Acceptance criteria**
- Launching a poll pushes it to all participants in <1s; responses appear on the projector live.
- A participant cannot double-vote on a single-choice poll.
- Result tallies are computed server-side and match the database.

### Claude Code prompt — Sprint 3
```
Implement the Live Polling module end-to-end.

apps/api:
- Extend ActivitiesModule for type='poll' with config {pollType, question, options[], ratingScale}.
  REST: create/update/delete/reorder poll activities under an event (host-guarded).
- Gateway: activity:launch sets the activity status='live' and event.activeActivityId, enforces
  only ONE live activity per event (close the previous), and broadcasts activity:launched.
  activity:close sets status='closed', broadcasts activity:closed.
- Gateway: activity:respond persists a responses doc. Enforce one response per (activityId, anonId)
  for single-choice/rating (upsert); allow the configured multi-select for multiple-choice.
  Recompute tallies server-side and broadcast poll:results {activityId, tallies}. Batch broadcasts
  to at most ~4/sec per activity to handle bursts (debounce/throttle in the gateway).

apps/web:
- Host: a poll builder UI (choose type, edit question/options/rating scale) inside the event detail,
  plus a "Run" panel with Launch / Close buttons and a live results preview.
- Participant (/event/[code]): when activity:launched arrives for a poll, render the matching input
  (radio / checkboxes / rating stars / textarea). Submit via activity:respond with optimistic UI;
  after submit show the live results. Block resubmission per the rules above.
- Projector (/present/[code]): large live Recharts visualization that updates on poll:results.
  Single/multiple -> bar chart; rating -> distribution + average; open text -> live scrolling list.

Write tests for tally computation and duplicate-vote prevention.
Acceptance: host launches a poll, participants on multiple devices respond, and bars animate live
on the projector within ~1s; double-voting is prevented on single-choice polls.
```

---

## Sprint 4 — Anonymous Q&A with upvoting & moderation

**Deliverables**
- Participant Q&A: submit questions (anonymous or with optional name), upvote others' questions (one vote per `anonId` per question), see live ordering by votes.
- Moderation queue for hosts: pending → approved/dismissed/answered; optional "require moderation" event setting that holds questions until approved.
- Real-time: `qa:new` to host (and to room if auto-approved), `qa:updated` on vote/status changes; live re-sort.
- Projector Q&A view: top questions by votes.

**Acceptance criteria**
- A submitted question reaches the host instantly; once approved it appears for everyone.
- Upvotes are one-per-participant and reorder the list live.
- With moderation on, unapproved questions are never shown to participants.

### Claude Code prompt — Sprint 4
```
Implement the anonymous Q&A module with upvoting and moderation.

apps/api:
- QuestionsModule (Mongoose schema per @iep/types): a question has text, authorAnonId,
  optional authorName, voteCount, voterAnonIds[], status (pending|approved|answered|dismissed).
- Gateway handlers:
  - qa:ask {text, displayName?}: create question. If event.settings.requireModeration is true,
    status='pending' and emit qa:new only to host:{eventId}; otherwise status='approved' and
    broadcast qa:new to event:{eventId}.
  - qa:upvote {questionId}: add anonId to voterAnonIds only if absent (idempotent), recompute
    voteCount, broadcast qa:updated to the room.
  - qa:moderate {questionId, status} (host only): update status; when moving to 'approved',
    broadcast qa:new to the room; on any change broadcast qa:updated.
- REST: GET questions for an event filtered by status (host gets all; public gets approved only).

apps/web:
- Participant (/event/[code]): a Q&A tab — text box to ask (with optional name), and a live list
  of approved questions sorted by votes desc then recency, each with an upvote button that disables
  after voting (track voted ids locally + server idempotency).
- Host: a moderation panel inside the event run view — incoming/pending column with
  approve/dismiss/mark-answered actions; approved column sorted by votes.
- Projector: top N approved questions by votes, auto-reordering on qa:updated.

Tests: one-vote-per-anonId enforcement; moderation gating (pending questions never broadcast to room).
Acceptance: with moderation on, a host sees pending questions, approves one, and it appears for all
participants; upvotes reorder the list live and cannot be repeated by the same participant.
```

---

## Sprint 5 — Interactive Quizzes, Word Clouds & Feedback

**Deliverables**
- **Quizzes:** multi-question quizzes with correct answers, points, per-question timer; host advances questions; scoring + live leaderboard (`quiz:leaderboard`); speed-based bonus optional.
- **Word clouds:** participants submit words for a prompt; server aggregates frequency → `wordcloud:update`; rendered with d3-cloud, weighted by count.
- **Feedback:** structured (rating) + open-text feedback forms collected at session end or on demand.

**Acceptance criteria**
- A quiz runs question-by-question with a visible countdown; leaderboard updates after each question.
- Word cloud grows live as words arrive; duplicates increase weight, not count of entries.
- Feedback responses are stored and visible in analytics (Sprint 6).

### Claude Code prompt — Sprint 5
```
Implement three more activity types: quizzes, word clouds, and feedback. They reuse the
activities/responses model and the launch/close gateway flow from Sprint 3.

QUIZZES (type='quiz', config.questions[] with options, correctOptionId, points, timeLimitSec):
- apps/api: host builds quiz questions via REST. Gateway: quiz advances one question at a time —
  host emits a "next question" action; server broadcasts quiz:question {questionId, options, endsAt}.
  quiz:answer {activityId, questionId, optionId, clientTimeMs} -> persist a response, mark isCorrect,
  award points (optionally scaled by remaining time), reject answers after endsAt or a second answer
  to the same question by the same anonId. After a question closes, compute and broadcast
  quiz:leaderboard {top:[{name, points}]}.
- apps/web: host run controls (start quiz, next question, show leaderboard). Participant: answer
  buttons with a countdown synced to endsAt; after answering, lock and show correct/incorrect.
  Projector: current question + countdown, then animated leaderboard.

WORD CLOUDS (type='wordcloud', config {prompt, maxWordsPerParticipant}):
- apps/api: wordcloud:submit {activityId, words[]} -> store, enforce maxWordsPerParticipant per anonId,
  normalize (trim/lowercase), aggregate frequency, broadcast wordcloud:update {words:[{text, weight}]}
  (throttled).
- apps/web: participant input for words; projector + participant render with d3-cloud, sized by weight.

FEEDBACK (type='feedback', config {prompt, fields:[{id,type:'rating'|'text',label}]}):
- apps/api: activity:respond stores feedback responses keyed by field id.
- apps/web: host builds the form; participant fills rating + text fields; submissions stored for analytics.

Tests: quiz scoring + late-answer rejection; word frequency aggregation; feedback persistence.
Acceptance: a timed quiz runs end-to-end with a live leaderboard; a word cloud updates live with
weighted words; feedback is captured and stored.
```

---

## Sprint 6 — Analytics dashboard & post-session reports

**Deliverables**
- Per-event analytics: participation rate, responses per activity, poll/quiz result breakdowns, quiz leaderboard, top questions, word cloud snapshots, feedback summaries.
- Engagement timeline (responses over the session duration).
- Automated post-session report: generated on `session:end`, viewable in-app and exportable to **PDF and CSV**.
- Aggregation done server-side (MongoDB aggregation pipelines), cached in Redis for fast reloads.

**Acceptance criteria**
- Ending a session produces a report within seconds covering every activity that ran.
- Numbers in analytics reconcile exactly with the `responses` collection.
- CSV and PDF exports download and open correctly.

### Claude Code prompt — Sprint 6
```
Implement the analytics dashboard and automated post-session reporting.

apps/api (AnalyticsModule):
- MongoDB aggregation pipelines to compute, per event:
  participation rate (distinct responding anonIds / participants), responses per activity,
  poll tallies, quiz scores + final leaderboard, top questions by votes, word cloud term weights,
  feedback averages + text list, and an engagement timeline (responses bucketed by minute).
- REST: GET /events/:id/analytics (host-guarded) returning the full summary; cache the result in
  Redis with invalidation when new responses arrive for a live event.
- On session:end (gateway), set event.status='ended', finalize and cache the report.
- Export endpoints: GET /events/:id/report.csv and /events/:id/report.pdf (use a server-side PDF
  lib; lay out each activity's results clearly). 

apps/web (host dashboard):
- /dashboard/events/[id]/analytics: cards for headline stats (participants, participation %,
  total responses, questions asked), per-activity result charts (Recharts), the quiz leaderboard,
  top questions, a word cloud snapshot, feedback summary, and the engagement timeline chart.
- "Download CSV" and "Download PDF" buttons hitting the export endpoints.
- Auto-redirect to this analytics page when a host ends a live session.

Tests: aggregation correctness against seeded responses; report covers all activity types.
Acceptance: ending a session shows a complete analytics report whose numbers match the database,
and both CSV and PDF exports download successfully.
```

---

## Sprint 7 — Security, reliability, testing & deployment

**Deliverables (maps directly to the deck's Security & Reliability slide)**
- **Security:** Auth0 JWT (access-token) validation on all host surfaces, RBAC (host/admin), Zod input validation + sanitization on every REST body and socket payload, Helmet headers, HTTPS enforcement, per-event/per-IP rate limiting on `qa:ask`/`activity:respond` via Redis, CORS lockdown. (Passwords are handled by Auth0, so no local bcrypt store; documented as an intentional deviation from the deck.)
- **Reliability:** centralized exception filter + structured logging (pino), `/health` + readiness probes, graceful Socket.IO degradation (long-poll fallback), automated MongoDB Atlas backup policy, graceful shutdown draining sockets.
- **Testing:** Vitest/Jest coverage on services/gateways; Playwright E2E covering create→join→poll→Q&A→quiz→report on a real browser matrix; a load test (Artillery/k6) simulating N concurrent participants.
- **Deployment:** web → Vercel; api + Redis → Railway/Render/Fly.io (persistent container); MongoDB → Atlas; environment promotion (preview → staging → prod); CI/CD pipeline.

**Acceptance criteria**
- E2E suite passes the full happy path headlessly in CI.
- Load test sustains the MVP target (e.g., 1,000 concurrent participants in one event) within latency budget (<1s broadcast p95).
- App deploys to a public URL with HTTPS and working real-time across regions.

### Claude Code prompt — Sprint 7
```
Harden, test, and deploy the MVP.

SECURITY (apps/api):
- Enforce the Auth0 JwtAuthGuard on all host/admin REST + host-only socket actions; add an RBAC
  guard for role='admin' endpoints (map roles from an Auth0 custom claim or the users doc).
  Validate every REST body and socket payload with the Zod schemas (reject + log on failure).
  Add Helmet, strict CORS (web origin only), and Redis-backed rate limiting on qa:ask and
  activity:respond (per anonId + per IP). Sanitize user text before storage/echo. Document that
  auth/passwords are delegated to Auth0 (no local bcrypt store).

RELIABILITY (apps/api):
- Global exception filter returning structured errors; pino structured logging with request ids.
- Liveness /health and readiness /ready probes. Graceful shutdown: stop accepting new sockets,
  flush, then exit. Ensure Socket.IO falls back to HTTP long-polling when WebSocket is blocked.
- Document the MongoDB Atlas automated backup + restore policy in /docs/runbook.md.

TESTING (repo):
- Raise unit/integration coverage on services and the gateway. Add Playwright E2E in apps/web
  covering: host creates event -> two participants join -> host runs a poll -> participants vote ->
  host opens Q&A -> participant asks + another upvotes -> host runs a quiz -> host ends session ->
  analytics report renders and CSV/PDF export. Add a k6 (or Artillery) script simulating 1000
  concurrent participants in one event, asserting p95 broadcast latency < 1s.

DEPLOYMENT:
- Dockerfiles finalized for web and api. Add deploy config for: web on Vercel, api+Redis on
  Railway/Render/Fly.io, MongoDB Atlas connection. Extend CI/CD to build, test, and deploy to a
  staging environment on main, with a manual promote to production. Document all env vars and the
  deploy steps in /docs/deployment.md.

Acceptance: full E2E passes in CI headlessly; the load test meets the latency target; the app is
reachable at a public HTTPS URL with working real-time sync.
```

---

## MVP definition of done (end of Phase 1)

- Hosts: register/login, create events (code + QR), build & run polls (4 types), quizzes (timed + leaderboard), word clouds, feedback, and moderate anonymous Q&A with upvoting — all live.
- Participants: join with no login on any device, respond in real time, ask/upvote questions.
- Real-time sync is sub-second at the target concurrency; results are server-authoritative.
- Every session produces an analytics report exportable to CSV/PDF.
- Security and reliability measures from Sprint 7 are in place; app is deployed with HTTPS.
- Works well on mobile browsers and is installable as a PWA (no native app required for the MVP).

---
# PHASE 2 — Hardening, Scale, i18n & PWA polish (post-MVP)

**Goal:** Take the MVP from "works" to "works for big customers." Not required to ship the MVP.

## Sprint 8 — Horizontal scale & performance
- Multi-instance API behind a load balancer with sticky sessions (or fully stateless via the Redis adapter); verify cross-instance broadcasts.
- Connection limits, backpressure, and broadcast batching tuned from real load tests; scale targets raised (e.g., 10k+ concurrent in one event).
- MongoDB read/write optimization: indexes review, optional sharding key on `eventId`, archival of ended events.

**Claude Code prompt — Sprint 8**
```
Scale the real-time backend horizontally. Verify the Socket.IO Redis adapter correctly fans
broadcasts across multiple api instances (add an integration test running two api processes).
Add connection/backpressure limits and tune broadcast batching for polls/wordclouds under load.
Review and add MongoDB indexes; introduce an archival job moving ended events' responses to a
cold collection. Re-run the k6 load test at 10k concurrent participants and document results and
tuning in /docs/scaling.md.
```

## Sprint 9 — Internationalization (i18n)
- next-intl (or next-i18next) in `apps/web`; externalize all strings; locale-routed pages; RTL support.
- Localized participant + host UI; per-event default language setting.

**Claude Code prompt — Sprint 9**
```
Add internationalization to apps/web using next-intl. Externalize all UI strings into locale
message catalogs, add locale-prefixed routing, and support at least English + one RTL language
(e.g., Arabic) including layout mirroring. Add a per-event default language setting persisted on
the event. Provide a script to detect untranslated keys in CI.
```

## Sprint 10 — PWA & enterprise analytics polish
- Full PWA: installable, offline join-screen fallback, push-ready service worker (web push for hosts).
- Enterprise analytics: cross-event dashboards, trends over time, CSV/API data export, org-level rollups.

**Claude Code prompt — Sprint 10**
```
1) Turn apps/web into a full PWA (manifest, service worker, offline fallback for the participant
   join screen, installability on Android/iOS browsers). 2) Build an enterprise analytics area:
   cross-event dashboards for a host/org (engagement trends over time, comparisons across events),
   plus a data export API and scheduled CSV exports. Keep all aggregation server-side with Redis
   caching.
```

---

# PHASE 3 — Zoom & Microsoft Teams Integrations + SSO (deferred from MVP)

**Goal:** Run the engagement experience inside video-conferencing tools and support enterprise login. **Explicitly out of MVP scope per the product direction.**

## Sprint 11 — Zoom integration
- Zoom App / SDK app: embed the participant view as an in-meeting app panel; map Zoom meeting → IEP event; SSO meeting participants as anonymous IEP participants automatically.
- OAuth with Zoom; publish to Zoom Marketplace (or private install) later.

**Claude Code prompt — Sprint 11**
```
Build a Zoom integration. Create a Zoom App that embeds the IEP participant view as an in-meeting
panel. Implement Zoom OAuth, map a Zoom meeting to an IEP event (auto-create/link), and
auto-enroll meeting participants as anonymous IEP participants (using the Zoom user context as the
anonId source). Add a host-side "Connect Zoom" flow in /dashboard settings. Document the Zoom
Marketplace app manifest and required scopes in /docs/integrations/zoom.md. Keep all real-time
flows identical to the web app.
```

## Sprint 12 — Microsoft Teams integration + Enterprise SSO
- Teams app (tab + meeting extension) embedding host and participant views; Teams SSO.
- Enterprise SSO (SAML/OIDC) for hosts via Auth0 Enterprise Connections (Auth0 natively brokers customer IdPs, so most of this is configuration rather than new code).

**Claude Code prompt — Sprint 12**
```
1) Build a Microsoft Teams app using the Teams JS SDK: a meeting-side panel for participants and a
   tab for hosts, embedding the existing views, with Teams SSO mapping users to IEP host/participant
   identities. Provide the Teams app manifest in /docs/integrations/teams.md. 2) Add enterprise SSO
   (SAML/OIDC) for host accounts via Auth0 Enterprise Connections so organizations can log in with
   their IdP. Keep anonymous participant join unchanged.
```

---

# PHASE 4 — Native Mobile Apps (deferred from MVP)

**Goal:** Native iOS & Android apps. **Explicitly out of MVP scope** — the MVP relies on the responsive web app + PWA. Reusing the monorepo's shared `@iep/types` and the same REST/Socket.IO API means the apps are thin clients over the existing backend.

## Sprint 13 — Mobile foundation (React Native + Expo)
- New `apps/mobile` (Expo + TypeScript) in the monorepo; shared types and API client; auth + join flow.

**Claude Code prompt — Sprint 13**
```
Add apps/mobile to the monorepo: an Expo (React Native) + TypeScript app that reuses @iep/types and
talks to the existing REST + Socket.IO API. Implement: host login (Auth0 via react-native-auth0)
and the anonymous participant join flow (code/QR scan via expo-camera, persistent anonId via
secure storage), plus the
live participant screen scaffold and socket connection management mirroring the web client.
```

## Sprint 14 — Mobile activity parity
- Native participant UI for polls, Q&A + upvoting, quizzes (with timers), word clouds, feedback.

**Claude Code prompt — Sprint 14**
```
In apps/mobile, implement full participant parity with the web app: poll responses (all 4 types),
anonymous Q&A with upvoting, timed quizzes with leaderboard, word cloud submission, and feedback —
all driven by the same Socket.IO events. Match the real-time behavior and duplicate-protection rules
of the web client. Add a basic host run-control screen.
```

## Sprint 15 — Push notifications & store release
- Push notifications (Expo push / FCM / APNs) for session start and host alerts; store assets, builds, and submission to App Store + Google Play.

**Claude Code prompt — Sprint 15**
```
Add push notifications to apps/mobile (Expo Notifications -> FCM/APNs) for "session starting" and
host moderation alerts, with a backend NotificationService to send them. Prepare store release:
app icons/splash, EAS build profiles, privacy disclosures, and submission configs for the Apple App
Store and Google Play. Document the release process in /docs/mobile-release.md.
```

---

# PHASE 5 — AI Studio v2 (deferred from MVP)

**Goal:** A massive expansion of the original "AI features" into an end-to-end "AI Studio" ecosystem spanning the entire event lifecycle. **Out of MVP scope.** Built as an isolated service (e.g., background worker) leveraging MongoDB Atlas Vector Search so it can fail without affecting core real-time Socket.IO flows.

## Phase 1: AI Workspace 2.0 (Foundation)
- Establish the AI infrastructure: microservice/worker processes for LLM interaction, prompt management, and streaming interfaces (SSE) to the frontend.
- Implement MongoDB Atlas Vector Search for semantic retrieval.
- Set up model routing (e.g., GPT-4o for complex tasks, cheaper models for fast analysis).

## Phase 2: AI Session Planner
- Pre-event AI tools for hosts to automatically generate session agendas, quiz questions, and poll structures based on topic inputs or uploaded documents.

## Phase 3: AI Copilot Chat
- An interactive chat interface embedded in the Host Dashboard that provides real-time assistance, configuration help, and drives the Session Planner and Activity Library features.

## Phase 4: AI Review & Optimization
- Automated AI review of planned sessions to suggest improvements (e.g., "Add an icebreaker here", "This quiz might be too long").

## Phase 5: AI Activity Library
- An AI-curated and dynamically generated library of engagement activities (polls, word clouds) that hosts can instantly drop into their sessions.

## Phase 6: Live AI Assistant
- Real-time summarization of Q&A, clustering of duplicate questions, and live sentiment analysis.
- Dynamic "smart poll" generation during the live event based on audience discussion.

## Phase 7: Post Event Intelligence
- Automated narrative insights in post-session reports (key takeaways, engagement patterns).
- Action item extraction and cross-session trend detection for hosts/organizations.

## Phase 8: Enterprise AI
- Implementation of PII (Personally Identifiable Information) redaction before LLM inference.
- Support for custom enterprise models, compliance logging, and SSO integration for AI features.

---

## Appendix A — Repository layout (target)

```
iep/
├─ apps/
│  ├─ web/         # Next.js (App Router) — host, participant, projector views
│  ├─ api/         # NestJS — REST + Socket.IO gateway + business logic
│  └─ mobile/      # (Phase 4) Expo React Native
├─ packages/
│  ├─ types/       # @iep/types — shared Zod schemas + TS types + socket contract
│  ├─ ui/          # (optional) shared React components
│  └─ config/      # eslint, prettier, tsconfig bases
├─ docs/           # runbook.md, deployment.md, scaling.md, integrations/, mobile-release.md
├─ docker-compose.yml
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Appendix B — Environment variables (MVP)

**apps/api**: `PORT`, `MONGODB_URI`, `REDIS_URL`, `AUTH0_ISSUER_BASE_URL` (e.g. `https://<tenant>.auth0.com/`), `AUTH0_AUDIENCE` (API identifier), `WEB_ORIGIN`, `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX`.
**apps/web**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE` (the API identifier so the SDK requests an access token for apps/api).

## Appendix C — Deviations from the original deck (intentional)

1. **Next.js replaces React.js** (requested) — adds SSR for fast public join pages and a cleaner deploy story.
2. **NestJS named as the backend framework** — the deck implied a generic Node backend; NestJS gives module boundaries that match the features and native Socket.IO gateway support. Express/Fastify is the lighter alternative.
3. **Redis added** — required for horizontal scaling of Socket.IO and used for live counters + rate limiting.
4. **Zod + shared types package added** — one validation source for REST and sockets across both apps.
5. **Auth0 replaces Firebase Auth** (requested) — Auth0 provides the same managed multi-provider auth and JWT issuance while adding first-class enterprise SSO/SAML (Enterprise Connections), which de-risks the Phase 3 SSO work. The API verifies Auth0-issued OIDC access tokens against the tenant JWKS; the web app uses the Auth0 Next.js SDK with Universal Login.
6. **bcrypt (deck's "secure password hashing") is not implemented locally** — authentication is delegated to Auth0, which manages credential hashing; keeping a parallel local password store would be redundant and less secure. If a self-hosted credential store is later required, bcrypt would be reintroduced in the auth service.
7. **Mobile, Zoom/Teams, and AI features are deferred** to Phases 4, 3, and 5 respectively, per the product direction that the MVP excludes them.

## Appendix D — How to use the Claude Code prompts

1. Run **Sprint 0** first to scaffold the repo; paste the Section 3 data model where the prompt indicates.
2. Run sprints **in order** — each prompt assumes the previous sprint's code exists in the repo.
3. When a prompt says "paste Section 4 / the real-time contract," include that section so Claude Code uses the exact event names and payloads.
4. After each sprint, run the acceptance criteria as your manual + automated test gate before moving on.
5. Keep `@iep/types` authoritative — when a schema changes, update it there first so both apps stay in sync.

test

*End of document.*