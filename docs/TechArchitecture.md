# ARCHITECTURE.md — System Design and Technical Stack

> **UPDATE FREQUENCY: EVERY ARCHITECTURAL CHANGE**
> This file is the technical blueprint. Update it when: the tech stack changes, new services are added, the data model evolves, deployment changes, or any architectural decision is made. If an AI agent writes code that contradicts this file, this file wins.
>
> **Depends on:** SPEC.md (what to build), CONTEXT.md (constraints and domain)
> **Feeds into:** CODEGUIDE.md (implementation patterns), AGENTS.md (tier capabilities)

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js 18+ | Stable, broad ecosystem |
| **Framework** | React Router v7 (Remix) + Vite 7 | Loaders/actions pattern, better DX than Next.js, full-stack routing |
| **Language** | TypeScript 5.9 (strict) | Type safety across full stack |
| **UI Library** | React 19 + React DOM 19 | Latest stable, concurrent features |
| **Styling** | Tailwind CSS v4 | CSS-based @theme config, utility-first |
| **Database** | PostgreSQL via Neon | Serverless Postgres, Prisma-friendly, scales to zero |
| **ORM** | Prisma 6.3 | Type-safe queries, migration management, schema-first |
| **Auth** | Custom cookie sessions + magic link | Simple, no dependency on NextAuth. Resend planned for email delivery |
| **AI/ML** | Claude API (@anthropic-ai/sdk) | Clustering, claim extraction, convergence scoring. Multi-AI Round Table: Gemini, DeepSeek, Grok available |
| **APIs/Integrations** | RSS feeds (55+ outlets across 7 regions), rss-parser | Global multi-source news ingestion pipeline |
| **Payments** | Stripe 17.5 | Subscriptions, webhooks, price lock |
| **Build Tool** | Vite 7 | Fast HMR, native ESM, React Router v7 integration |
| **Testing** | Vitest 4 | Vite-native, fast, compatible with React Router |
| **Dev Tools** | VS Code + Claude Code, GitHub | AI-assisted multi-file development |
| **Package Manager** | npm | Standard, reliable |
| **Utilities** | clsx, tailwind-merge, date-fns, lucide-react | Class merging, date formatting, icons |

### Approved Packages (Not Yet Installed)

| Package | Purpose |
|---------|---------|
| cmdk | Command palette (Cmd+K) |
| fuse.js | Client-side fuzzy search for filters |
| tinykeys | Keyboard shortcut binding |
| react-resizable-panels | Draggable panel layout |
| sonner | Toast notifications |
| zustand | Workspace state management with persist middleware |
| @react-pdf/renderer | PDF export for convergence certificates |
| satori | OG image / share card generation |

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  RSS Feeds  │────▶│  /api/ingest │────▶│  PostgreSQL   │
│  (55+ src)  │     │  (cron 15m)  │     │  (Neon)       │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                    ┌──────────────┐               │
                    │ /api/cluster │◀──────────────┤
                    │ (Claude AI)  │               │
                    └──────┬───────┘               │
                           │                       │
                    ┌──────▼───────┐               │
                    │ /api/analyze │               │
                    │ (Claude AI)  │───────────────┤
                    └──────────────┘               │
                                                   │
                    ┌──────────────┐               │
                    │  /api/gci    │◀──────────────┤
                    │ (daily calc) │               │
                    └──────────────┘               │
                                                   │
┌─────────────┐     ┌──────────────┐               │
│  Browser    │────▶│ React Router │◀──────────────┘
│  (User)     │◀────│ v7 + Vite 7  │
└─────────────┘     └──────┬───────┘
                           │
                    ┌──────▼───────┐     ┌──────────────────┐
                    │   Stripe     │     │ /api/notifications│
                    │  (Payments)  │     │  /stream (SSE)    │
                    └──────────────┘     └──────────────────┘
```

**Key architectural decisions:**

- Cron-driven pipeline (ingest -> cluster -> analyze) rather than real-time processing -- simpler, cheaper, good enough for 15-min news freshness
- Claude as primary AI, with Gemini/DeepSeek/Grok available for multi-AI verification ("AI Round Table")
- Graceful degradation: if Claude is down, stories display without claim analysis
- Error isolation: one bad RSS feed never blocks the others
- Command center UI: Bloomberg Terminal-inspired fixed panel layout with faceted filtering
- Global scope: 55+ outlets across 7 bias tiers and 7 regions, bias calibrated relative to each region's political center

---

## Directory Structure

```
project-root/
├── CLAUDE.md              # AI agent entry point (root)
├── LICENSE                 # MIT License
├── README.md              # Project overview
├── docs/
│   ├── Spec.md            # Product specification
│   ├── Context.md         # Background and domain knowledge
│   ├── Scenarios.md       # User flows and journeys
│   ├── TechArchitecture.md # This file
│   ├── Agents.md          # AI agent tier routing
│   ├── CodeGuide.md       # Code conventions
│   ├── ArtDirection.md    # Visual design guidelines
│   └── SniffTest.md       # Human-only test scenarios
├── app/
│   ├── root.tsx           # Root layout
│   ├── app.css            # Tailwind v4 @theme config
│   ├── routes/            # React Router v7 file-based routing
│   │   ├── home.tsx
│   │   ├── story.$id.tsx
│   │   ├── search.tsx
│   │   ├── pricing.tsx
│   │   ├── auth.signin.tsx
│   │   ├── api.ingest.ts
│   │   ├── api.cluster.ts
│   │   ├── api.analyze.ts
│   │   ├── api.search.ts
│   │   ├── api.gci.ts
│   │   ├── api.health.ts
│   │   ├── api.workspace.ts
│   │   ├── api.notifications.stream.ts
│   │   └── api.webhooks.stripe.ts
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── feed/          # FeedList, StoryCard, TopicFilter
│   │   ├── story/         # ConvergencePanel, ClaimsTracker, PrimarySourceList, TrustSignalBadge
│   │   ├── search/        # SearchBar, SearchResults
│   │   ├── ui/            # Badge, Button, Card, Skeleton
│   │   ├── shell/         # AppShell, TopBar, Sidebar, StatusBar, BottomTabBar, CommandPalette, ShortcutOverlay, NotificationToast
│   │   ├── panels/        # PanelContainer, PanelResizer, DashboardLayout
│   │   ├── filters/       # FilterSidebar, BiasSpectrumSelector, RegionFilter, ConvergenceSlider, TopicCloud, TimeHorizon
│   │   ├── wire/          # StoryListRow, WirePanel, TodaysSurprise, WireSkeleton
│   │   ├── lens/          # LensPanel, SpectrumPanel, ClaimsPanel, PrimaryDocsPanel, ConvergenceExplainer
│   │   ├── dataviz/       # ConvergenceGauge, BiasSpectrumBar, RegionIndicator, ClaimMatrix, TimelineStrip, GCIGauge, GCITicker
│   │   ├── export/        # ExportDialog, ConvergenceCertificate
│   │   └── shared/        # Gate, UpgradeTeaser, ExplainerPopover
│   ├── lib/
│   │   ├── auth.ts        # Cookie sessions, getUser, getUserId, createUserSession, isFounderPhase
│   │   ├── claude.ts      # Claude API wrapper
│   │   ├── clustering.ts  # Story clustering logic
│   │   ├── convergence.ts # Convergence scoring algorithm
│   │   ├── signals.ts     # Trust signal calculation
│   │   ├── rss.ts         # RSS feed parsing
│   │   ├── stripe.ts      # Stripe integration
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── constants.ts   # Outlets, bias tiers, regions
│   │   ├── capabilities.ts
│   │   ├── gci.ts         # Global Convergence Index calculation
│   │   ├── source-stats.ts
│   │   ├── narratives.ts
│   │   ├── disagreement.ts
│   │   ├── explainers.ts
│   │   ├── comparisons.ts
│   │   ├── email.ts       # Resend integration
│   │   ├── usage-tracking.ts
│   │   ├── filters/       # FilterProvider, filter-codec, useFilterState
│   │   ├── stores/        # workspace.ts (Zustand)
│   │   ├── hooks/         # usePanelFocus, useKeyboardShortcuts, useKeymap, useProgressiveTips
│   │   └── export/        # csv, pdf, certificate
│   └── types/
│       ├── index.ts       # Core types and enums
│       ├── filters.ts     # Filter state types
│       └── workspace.ts   # Workspace state types
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── react-router.config.ts # React Router v7 config
├── vite.config.ts         # Vite 7 config
├── vitest.config.ts       # Vitest 4 config
├── tsconfig.json
├── package.json
└── .env                   # Local environment variables (not committed)
```

**Naming conventions:**
- Folders: kebab-case (`story-view/`)
- Files: PascalCase for components (`StoryCard.tsx`), camelCase for lib (`clustering.ts`)
- Components: PascalCase (`ConvergencePanel`)
- Route files: dot-separated per React Router v7 convention (`story.$id.tsx`, `api.ingest.ts`)

---

## Data Model

### Entities

| Entity | Purpose | Key Fields | Indexes |
|--------|---------|-----------|---------|
| Source | News outlet with bias + region classification | name (unique), url (unique), rssFeedUrl, biasCategory, biasTier, region | -- |
| Article | Individual news article | title, url (unique), publishedAt, contentType, sourceId, storyId | sourceId, storyId, publishedAt |
| Story | Clustered event grouping | generatedTitle, trustSignal, lastAnalyzedAt | -- |
| Claim | Extracted factual/evaluative claim | claimText, claimType, convergenceScore, storyId | storyId |
| ClaimSource | Links claims to supporting articles | claimId, articleId, quote, supports | claimId, articleId |
| PrimaryDoc | Primary source documents | docType, url, title, storyId | storyId |
| User | Authenticated user account | email (unique), tier, isFounder, priceLocked | -- |
| Session | Cookie-based auth session | userId, expiresAt | userId |
| DailyGCI | Global Convergence Index snapshot | date (unique), score, breadth, depth, contestation, storyCount | date |
| Workspace | Saved user workspace state | userId, name, state (JSON), isDefault | userId |
| SourceMonthlyStats | Per-source monthly reliability | sourceId, month, claimsTotal, claimsConfirmed, confirmationRate | sourceId, month |

### Relationships

```
Source ──< has many >── Article
Source ──< has many >── SourceMonthlyStats
Story ──< has many >── Article
Story ──< has many >── Claim
Story ──< has many >── PrimaryDoc
Claim ──< has many >── ClaimSource
Article ──< has many >── ClaimSource
User ──< has many >── Session
User ──< has many >── Workspace
```

### Row-Level Security / Access Control

| Entity | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
| Source | All | System | System | Admin |
| Article | All | System (ingest) | System (cluster) | Admin |
| Story | All (tier-limited) | System (cluster) | System (analyze) | Admin |
| Claim | Authenticated (tier-limited) | System (analyze) | System | Admin |
| User | Self only | Auth flow | Self + Stripe webhook | Self |
| DailyGCI | All | System (cron) | System | Admin |
| Workspace | Self only | Authenticated | Self | Self |
| SourceMonthlyStats | All | System | System | Admin |

### Migrations

- **Migration tool:** Prisma Migrate
- **Migration naming:** Descriptive (`init`, `add-claims-table`)
- **Rollback strategy:** Forward-only for MVP. Stories/claims can be regenerated from articles.
- **Migrations applied:** 3 (init, sources, claims)

---

## API Design

### Internal Routes

| Method | Route | Purpose | Auth | Request Body | Response |
|--------|-------|---------|------|-------------|----------|
| GET | /api/ingest | RSS feed ingestion | CRON_SECRET | -- | `{ articlesAdded, errors, totalSources }` |
| GET | /api/cluster | Story clustering | CRON_SECRET | -- | `{ storiesCreated, articlesAssigned }` |
| GET | /api/analyze | Claim extraction + convergence | CRON_SECRET | -- | `{ storiesAnalyzed, claimsExtracted, primaryDocsFound }` |
| POST | /api/search | On-demand triangulation | User (Standard+) | `{ query }` | `Story` with convergence |
| POST | /api/webhooks/stripe | Stripe event handler | Stripe signature | Event payload | 200 OK |
| GET | /api/gci | Daily Global Convergence Index | None | -- | `{ date, score, breadth, depth, contestation, storyCount }` |
| GET | /api/health | System health check | None | -- | `{ status, db, pipeline }` |
| GET/POST | /api/workspace | Save/load user workspaces | Authenticated | Workspace JSON | `Workspace` |
| GET | /api/notifications/stream | SSE notification stream | Authenticated | -- | Server-sent events |

### Page Routes (React Router v7 Loaders)

| Route | Loader Returns | Auth |
|-------|---------------|------|
| / (home) | Stories feed, filter state, GCI | None |
| /story/:id | Story detail with claims, convergence, sources | None (tier-gated claims) |
| /search | Search results | User (Standard+) |
| /pricing | Pricing tiers, founder phase status | None |
| /auth/signin | -- | None |

### External Integrations

| Service | Purpose | Auth Method | Rate Limits | Fallback |
|---------|---------|-------------|-------------|----------|
| Claude API | Clustering, claims, convergence | API key | Per-model limits | Skip analysis, show "pending" |
| Gemini API | Multi-AI verification (Round Table) | API key | Standard | Claude-only analysis |
| DeepSeek API | Multi-AI verification (Round Table) | API key | Standard | Claude-only analysis |
| Grok API | Multi-AI verification (Round Table) | API key | Standard | Claude-only analysis |
| RSS feeds (55+) | Article ingestion across 7 regions | None | 15-min poll interval | Skip failed feed, continue |
| Stripe | Payments, subscriptions | Secret key + webhook sig | Standard | N/A |
| Resend | Magic link email delivery | API key | Standard | Console.log in dev |

### Webhook Endpoints

| Source | Endpoint | Purpose | Validation |
|--------|----------|---------|-----------|
| Stripe | /api/webhooks/stripe | Subscription lifecycle | Signature verification |
| Cron | /api/ingest, /api/cluster, /api/analyze, /api/gci | Pipeline automation | CRON_SECRET header |

---

## Authentication and Authorization

- **Provider:** Custom cookie sessions (`app/lib/auth.ts`)
- **Strategy:** Email magic link (passwordless)
- **Session duration:** 30 days
- **Session storage:** Database-backed (Session model)
- **Key functions:** `getUser(request)`, `getUserId(request)`, `createUserSession(userId)`, `isFounderPhase()`
- **Email delivery:** Resend (planned), currently console.log stub in dev

### Roles / Permissions

| Role | Can Access | Can Modify | Can Delete | Can Admin |
|------|-----------|-----------|-----------|-----------|
| Free | 5 stories/day, story-level signals | Own profile, own workspace | Own account | No |
| Premium ($7.99/mo) | Full feed, claim-level signals, 10 searches/day, export | Own profile, own workspace | Own account | No |
| Journalist Pro ($14.99/mo) | Unlimited searches, API access, daily digest, all exports | Own profile, own workspace | Own account | No |
| Founder | Same as Premium (free, price-locked) | Own profile, own workspace | Own account | No |

- **Protected routes:** /api/search (Premium+), /api/workspace (authenticated), subscription management
- **Public routes:** / (feed), /story/:id, /pricing, /auth/signin

---

## State Management

| State Type | Technology | What It Holds | Scope |
|-----------|-----------|---------------|-------|
| **Filter State** | URL search params via `useSearchParams()` | Bias, region, convergence, topic, time filters | Shareable, bookmarkable |
| **UI Chrome** | React context + `useReducer`, persisted to localStorage | Sidebar open/closed, panel sizes, theme, tips dismissed | Per-device |
| **Workspace** | Zustand with persist middleware + server sync | Saved filter presets, panel layouts, named workspaces | Per-user, synced |
| **Server Data** | Remix loaders via `useLoaderData()` | Stories, claims, convergence data, GCI | Per-request |
| **Component UI** | React `useState` | Loading states, tooltips, local toggles | Per-component |
| **Persistent** | PostgreSQL (Neon) | All entities | Global |

---

## Deployment Pipeline

| Stage | Tool | Trigger | Notes |
|-------|------|---------|-------|
| Lint | ESLint | Pre-commit | -- |
| Test | Vitest | Pre-commit / CI | Unit tests for convergence, signals |
| Build | Vite 7 | Git push | React Router v7 build |
| Preview | Vercel | PR branch | Preview URL per PR |
| Deploy | Vercel | Merge to main | Auto-deploy |
| Cron | Vercel Cron | Schedule | 15-min ingest cycle |

### Environment Variables

| Variable | Purpose | Required | Where Set |
|----------|---------|----------|-----------|
| DATABASE_URL | Neon PostgreSQL connection | Yes | Vercel env / .env |
| ANTHROPIC_API_KEY | Claude API access | Yes | Vercel env / .env |
| STRIPE_SECRET_KEY | Stripe server-side | Yes | Vercel env / .env |
| STRIPE_WEBHOOK_SECRET | Webhook verification | Yes | Vercel env / .env |
| STRIPE_PREMIUM_PRICE_ID | Premium tier Stripe price | Yes | Vercel env / .env |
| STRIPE_JOURNALIST_PRICE_ID | Journalist Pro tier Stripe price | Yes | Vercel env / .env |
| COOKIE_SECRET | Session cookie encryption | Yes | Vercel env / .env |
| CRON_SECRET | Automated endpoint auth | Yes | Vercel env / .env |
| IS_FOUNDER_PHASE | Founder Member toggle | Yes | Vercel env / .env |
| RESEND_API_KEY | Email delivery (magic links) | Yes (prod) | Vercel env / .env |
| MAGIC_LINK_BASE_URL | Base URL for magic link callbacks | Yes | Vercel env / .env |
| GEMINI_API_KEY | Gemini AI (Round Table) | Optional | Vercel env / .env |
| DEEPSEEK_API_KEY | DeepSeek AI (Round Table) | Optional | Vercel env / .env |
| GROK_API_KEY | Grok AI (Round Table) | Optional | Vercel env / .env |

### Environments

| Environment | URL | Branch | Purpose |
|------------|-----|--------|---------|
| Local | localhost:5173 | any | Development (Vite dev server) |
| Preview | *.vercel.app | PR branches | Review |
| Production | TBD | main | Live |

---

## Performance Targets

| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| First Contentful Paint | < 1.5s | -- | Lighthouse |
| Largest Contentful Paint | < 2.5s | -- | Lighthouse |
| Time to Interactive | < 3.5s | -- | Lighthouse |
| Cumulative Layout Shift | < 0.1 | -- | Lighthouse |
| Feed Page Load | < 2s | -- | Browser DevTools |
| Story View Load | < 3s | -- | Browser DevTools |
| Search Response | < 15s | -- | API timing |
| Ingestion Cycle | < 5 min | -- | Logs |
| Lighthouse Score | > 90 | -- | Lighthouse |
| Command palette open | < 100ms | -- | Browser DevTools |
| Filter apply (URL update) | < 50ms | -- | Browser DevTools |
| Panel resize | 60fps | -- | Browser DevTools |

---

## Security Checklist

- [ ] Input sanitization on all user-facing forms
- [ ] CORS configured (allow only known origins)
- [x] Rate limiting on auth and API routes
- [x] Environment variables -- no secrets in code or git
- [ ] Dependency audit clean (npm audit)
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced (Vercel default)
- [x] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (React default escaping + CSP)
- [ ] Error messages don't leak internal details
- [x] Cookie sessions with httpOnly, secure, sameSite flags
- [x] Stripe webhook signature verification
- [x] CRON_SECRET on pipeline endpoints

---

## Scalability Notes

**Bottlenecks:**
- Claude API rate limits and cost at high article volume
- Single-threaded RSS polling (sequential per source)
- Neon free tier connection limits
- GCI calculation grows with story count

**Scaling strategy:**
- Parallel RSS fetching when volume demands it
- Claude API budget monitoring with auto-pause
- Neon paid tier when free tier is insufficient
- GCI pre-computed daily via cron, cached in DailyGCI table
- SSE notifications over polling for real-time updates

---

## Technical Debt Tracker

| Item | Severity | Location | Added | Notes |
|------|----------|----------|-------|-------|
| Vitest path alias broken | Medium | vitest.config.ts | 2026-03-25 | `~/types` not resolving; add `tsconfigPaths()` to vitest plugins |
| Magic link email stubbed | Medium | app/lib/auth.ts | 2026-03-13 | Logs to console in dev; wire Resend for prod |
| Stripe price IDs not set | Medium | .env | 2026-03-13 | Create products in Stripe Dashboard, set env vars |
| No error boundary pages | Low | app/routes/ | 2026-03-13 | Add error.tsx and catch-all routes |

---

## Decision Log

| Date | Decision | Alternatives Considered | Rationale | Decided By |
|------|----------|------------------------|-----------|-----------|
| 2026-02-14 | Neon PostgreSQL | Supabase, PlanetScale | Free tier, Prisma-friendly, serverless | Patrick |
| 2026-02-14 | Claude API for NLP | OpenAI, local models | Best reasoning for claim extraction | Patrick |
| 2026-03-08 | 7-point BiasTier | 5-point only | Better convergence weighting for fringe outlets | Patrick |
| 2026-03-08 | npm over Bun | Bun | More stable, broader compatibility | Patrick |
| 2026-03-13 | React Router v7 (Remix) | Next.js 14 App Router, SvelteKit | Better DX, loaders/actions pattern, simpler mental model | Patrick |
| 2026-03-13 | Custom cookie sessions | NextAuth.js | Simpler, no dependency, full control over session logic | Patrick |
| 2026-03-13 | Tailwind CSS v4 | Tailwind v3.4 | CSS-based @theme config, modern approach | Patrick |
| 2026-03-13 | Global scope (7 regions) | US-only | Cross-region convergence is the strongest trust signal | Patrick |
| 2026-03-25 | Command center redesign | Standard feed layout | Bloomberg Terminal-style fixed panels, faceted filtering, power-user UX | Patrick |
| 2026-03-25 | 8 new packages approved | Built from scratch | cmdk, fuse.js, tinykeys, react-resizable-panels, sonner, zustand, @react-pdf/renderer, satori | Patrick |
| 2026-03-25 | URL search params for filters | React state, Zustand | Shareable, bookmarkable, SSR-compatible | Patrick |
| 2026-03-25 | Zustand for workspace state | React context, jotai | Persist middleware, simple API, server sync | Patrick |
