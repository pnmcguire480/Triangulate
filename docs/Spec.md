# SPEC.md — Product Specification

> **UPDATE FREQUENCY: EVERY FEATURE CHANGE**
> This is the single source of truth for WHAT the product does and WHO it's for. ARCHITECTURE.md covers HOW. Update this file every time a feature is added, changed, descoped, or reprioritized.
>
> **Depends on:** CONTEXT.md (for background), CLAUDE.md (for current state)
> **Feeds into:** ARCHITECTURE.md (technical implementation), SCENARIOS.md (user flows), SNIFFTEST.md (test cases)

---

## Product Overview

- **Name:** Triangulate
- **Tagline:** See where ideologically opposed outlets — across the globe — confirm the same facts.
- **Problem:** Trust in media is at historic lows (31% per Gallup 2024). AI-generated content is accelerating information pollution. People have no efficient way to verify whether a news claim is corroborated across adversarial sources.
- **Solution:** A global news convergence engine that ingests 55+ outlets across the political spectrum from 7 regions, clusters stories, extracts factual claims, and scores convergence based on ideological spread and cross-regional agreement — surfacing where enemies agree.
- **Core Value Proposition:** Unlike Ground News (which shows coverage breadth), Triangulate performs claim-level convergence analysis across adversarial sources. It doesn't tell you what to think — it shows you where the facts overlap.

---

## Target Users

### Primary User

- **Who:** Everyday news consumers and politically engaged citizens across the spectrum
- **Context:** Reading daily news, encountering a headline on social media, wanting to verify a claim before sharing or forming an opinion
- **Technical Literacy:** Can use a web app, comfortable with email login
- **Current Workaround:** Manually open 3-5 tabs, compare headlines and claims across outlets, search for primary documents (court filings, bill text), attempt to separate reporting from opinion — all by hand, every time
- **What They Care About:** Truth, transparency, not being manipulated, efficiency

### Secondary User(s)

| User Type | Context | What They Care About |
|-----------|---------|---------------------|
| Journalists | Verifying cross-outlet coverage before publishing | Speed, accuracy, primary sources |
| Researchers/Educators | Studying media ecosystems, teaching media literacy | Comprehensive data, spectrum visibility |
| Students | Learning to evaluate news critically | Clarity, accessibility |

### Anti-Users

- People looking for fact-check verdicts or editorial judgments (we don't render opinions)
- Users wanting social features, comments, or user-generated ratings

---

## User Stories

### P0 — MVP (Must Have to Ship)

- [x] As a news consumer, I want to see a daily feed of pre-triangulated stories so that I don't have to manually check multiple outlets.
- [x] As a news consumer, I want to see which claims are confirmed across the political spectrum so that I can assess reliability.
- [x] As a news consumer, I want to see trust signal badges on stories so that I can quickly gauge convergence level.
- [x] As a user, I want to search/paste a headline and get on-demand triangulation so that I can verify claims I encounter elsewhere.
- [x] As a user, I want to sign up with email magic link so that I can access personalized features without passwords.

### P0 — Command Center (Launch)

- [ ] As a journalist, I want a command-center layout with fixed panels so I can scan stories, analyze convergence, and read claims without page navigation.
- [ ] As a user, I want to filter stories by bias tier, region, topic, convergence score, and time range so I can find what matters to me.
- [ ] As a user, I want to see a Global Convergence Index so I can understand the daily state of news agreement at a glance.
- [ ] As a power user, I want keyboard shortcuts and a command palette (Cmd+K) so I can navigate without a mouse.

### P1 — Important (Ship Soon After MVP)

- [x] As a subscriber, I want my price locked at signup rate so that I'm never surprised by a price increase.
- [x] As a Founder Member, I want free Standard access for life so that early supporters are rewarded.

### P1 — Command Center (Soon After Launch)

- [ ] As a journalist, I want to export convergence data as CSV, JSON, or PDF so I can cite it in my reporting.
- [ ] As a Pro user, I want a Convergence Certificate so I can prove sources agreed on specific facts.
- [ ] As a user, I want saved filter presets so I can return to my preferred views quickly.
- [ ] As a journalist, I want to see source credibility trajectories so I can understand an outlet's confirmation track record.

### P2 — Nice-to-Have

- [ ] As a subscriber, I want a daily digest email so that I can stay informed without visiting the site.
- [ ] As a Pro user, I want to export my research as a NotebookLM Pack or Obsidian Vault.
- [ ] As a Pro user, I want a persistent research workspace (The Data Base) that logs everything I investigate.
- [ ] As a user, I want density modes (compact/comfortable/spacious) so the interface fits my preference.

### P3 — Future / Stretch

- [ ] As a power user, I want API access so that I can integrate convergence data into my own tools.
- [ ] As a user, I want to replay a story's convergence development over time.
- [ ] As a user, I want an opt-in data sonification mode for auditory feedback.

---

## Feature Map

### Chunk 1 — Project Setup & Folder Structure

**Goal:** Scaffold the React Router v7 (Remix) project with full directory structure, Tailwind CSS, and Prisma configuration.
**Priority:** P0
**Dependencies:** None
**Estimated Complexity:** [x] Simple (hours)
**Assigned Tier:** Tier 4

**Features:**
- [x] React Router v7 (Remix) with TypeScript
- [x] Tailwind CSS styling
- [x] Prisma ORM configured
- [x] Component skeleton (layout, feed, story, search, ui)
- [x] Type definitions

**Acceptance Criteria:**
- [x] `npm run build` passes
- [x] Dev server starts

---

### Chunk 2 — Database Schema & Source Seeding

**Goal:** Define the full data model and seed 30+ news sources across the 7-tier political spectrum.
**Priority:** P0
**Dependencies:** Chunk 1
**Estimated Complexity:** [x] Simple (hours)
**Assigned Tier:** Tier 4

**Features:**
- [x] Prisma schema with 7 models and 8 enums
- [x] Migration applied to Neon PostgreSQL
- [x] Seed script for 30 outlets across 7 bias tiers
- [x] Affiliate URLs for paywalled outlets

**Acceptance Criteria:**
- [x] `prisma migrate dev` succeeds
- [x] `prisma db seed` populates 30 sources
- [x] Seed is idempotent (upsert)

---

### Chunk 3 — RSS Ingestion Pipeline

**Goal:** Ingest articles from all 30+ RSS feeds, classify content type, and deduplicate.
**Priority:** P0
**Dependencies:** Chunk 2
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4

**Features:**
- [x] `rss-parser` fetch and parse per source
- [x] ContentType classification (REPORTING/COMMENTARY/UNKNOWN) via URL heuristics
- [x] URL-based deduplication
- [x] Error isolation (one bad feed doesn't kill the pipeline)
- [x] CRON_SECRET protection

**Acceptance Criteria:**
- [x] AC-1: Articles stored with correct sourceId, contentType, no duplicate URLs

---

### Chunk 4 — Story Clustering Engine

**Goal:** Group articles about the same event into Stories using Claude-powered semantic clustering.
**Priority:** P0
**Dependencies:** Chunk 3
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4

**Features:**
- [x] Claude Haiku-powered batch clustering
- [x] Neutral headline generation per Story
- [x] SINGLE_SOURCE trust signal for singletons

**Acceptance Criteria:**
- [x] AC-2: Articles about the same event are grouped into Stories with generated titles

---

### Chunk 5 — Claim Extraction & Convergence Scoring

**Goal:** Extract factual claims from articles and score convergence based on ideological spread.
**Priority:** P0
**Dependencies:** Chunk 4
**Estimated Complexity:** [x] Complex (week+)
**Assigned Tier:** Tier 4 + Tier 5

**Features:**
- [x] Claude-powered claim extraction (3-8 claims per article)
- [x] Semantic claim deduplication across articles
- [x] BiasTier-aware convergence scoring
- [x] Trust signal calculation
- [x] Primary source document detection

**Acceptance Criteria:**
- [x] AC-3: Cross-spectrum claims scored as CONVERGED
- [x] AC-4: Same-side-only claims score low (<0.3)
- [x] AC-5: Primary docs detected and linked

---

### Chunk 6 — Daily Feed UI

**Goal:** Build the homepage showing pre-triangulated stories with trust signals.
**Priority:** P0
**Dependencies:** Chunk 5
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4

**Features:**
- [x] Story cards with trust signal badges, source count, claim count
- [x] Converged stories boosted in sort order
- [x] Reporting vs commentary breakdown per story

**Acceptance Criteria:**
- [x] AC-9: Feed loads <2s with trust signals visible

---

### Chunk 7 — Story View UI

**Goal:** Build the three-column convergence panel with claims tracker and primary sources.
**Priority:** P0
**Dependencies:** Chunk 5
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4

**Features:**
- [x] Three-column convergence panel (left/center/right)
- [x] Claims tracker with per-claim signals
- [x] Primary source document links
- [x] Affiliate "Unlock Full Story" buttons

**Acceptance Criteria:**
- [x] AC-10: All outlets displayed regardless of bias tier

---

### Chunk 8 — Search & Triangulate

**Goal:** On-demand triangulation via headline/URL input.
**Priority:** P0
**Dependencies:** Chunk 5
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4

**Features:**
- [x] Search endpoint with progressive loading
- [ ] Tier-gated access (Standard+)
- [ ] Daily search limits

**Acceptance Criteria:**
- [ ] AC-6: Results within 15 seconds with progressive loading

---

### Chunk 9 — Auth, Stripe & Subscriptions

**Goal:** User accounts, Founder Member program, and three-tier subscriptions.
**Priority:** P0
**Dependencies:** Chunk 6
**Estimated Complexity:** [x] Complex (week+)
**Assigned Tier:** Tier 4

**Features:**
- [x] Email magic link auth (cookie sessions)
- [x] Founder Member auto-assignment
- [x] Stripe Checkout for FREE / Premium ($7.99/mo) / Journalist Pro ($14.99/mo)
- [x] Price lock guarantee
- [x] Webhook processing

**Acceptance Criteria:**
- [x] AC-7: Founder auto-assigned during founder phase
- [x] AC-8: Price lock maintained on renewal

---

### Chunk 10 — Deploy, Polish & Launch

**Goal:** Production deployment, mobile responsiveness, final polish.
**Priority:** P0
**Dependencies:** All chunks
**Estimated Complexity:** [x] Medium (days)
**Assigned Tier:** Tier 4 + Tier 5

**Features:**
- [ ] Vercel production deployment
- [ ] Mobile responsive verification
- [ ] Error pages and loading states
- [ ] Beta testing round

**Acceptance Criteria:**
- [ ] All ACs pass
- [ ] Scenario suite passes
- [ ] Mobile responsive on real device

> **NOTE:** The original 10-chunk MVP plan is COMPLETE (all chunks implemented, some acceptance criteria still pending verification). A new 13-chunk command center roadmap for launch exists in `docs/ROADMAP-TO-LAUNCH.md`.

---

## Content / Data Model

| Entity | Description | Key Fields | Owned By |
|--------|------------|-----------|----------|
| Source | News outlet with bias classification | name, url, rssFeedUrl, biasCategory, biasTier, affiliateUrl | System |
| Article | Individual news article from a source | title, url (unique), publishedAt, contentType, sourceId, storyId | System |
| Story | Clustered event grouping articles | generatedTitle, trustSignal, lastAnalyzedAt | System |
| Claim | Extracted factual/evaluative claim | claimText, claimType, convergenceScore, storyId | System |
| ClaimSource | Links claims to supporting articles | claimId, articleId, quote, supports | System |
| PrimaryDoc | Linked primary source documents | docType, url, title, storyId | System |
| User | Authenticated user account | email, tier, isFounder, priceLocked, stripeCustomerId | System |

**Enums:**
- **BiasCategory:** LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT
- **BiasTier:** FAR_LEFT, LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT, FAR_RIGHT
- **ContentType:** REPORTING, COMMENTARY, UNKNOWN
- **TrustSignal:** SINGLE_SOURCE, CONTESTED, CONVERGED, SOURCE_BACKED, INSTITUTIONALLY_VALIDATED
- **ClaimType:** FACTUAL, EVALUATIVE
- **DocType:** COURT_FILING, LEGISLATION, OFFICIAL_STATEMENT, GOVERNMENT_DATA, TRANSCRIPT, RESEARCH, OTHER
- **UserTier:** FREE, STANDARD, PREMIUM

**Relationships:**
- Source 1..N Article
- Story 1..N Article
- Story 1..N Claim
- Story 1..N PrimaryDoc
- Claim 1..N ClaimSource
- Article 1..N ClaimSource

---

## Pages / Views / Screens

| View | Purpose | Key Components | Auth Required? | Priority |
|------|---------|---------------|----------------|----------|
| / (Homepage) | Daily Feed with triangulated stories | StoryCard, TopicFilter, FeedList | No (limited for free) | P0 |
| /story/[id] | Story View with convergence panel | ConvergencePanel, ClaimsTracker, PrimarySourceList | No (limited for free) | P0 |
| /search | Search & Triangulate | SearchBar, SearchResults | Yes (Standard+) | P0 |
| /pricing | Subscription tiers | PricingCards, FounderBadge | No | P0 |
| /auth/signin | Magic link login | EmailInput | No | P0 |
| /sources | Source Intelligence directory | SourceList, BiasFilter, RegionFilter | No | P1 |
| /sources/:id | Source detail with credibility trajectory | CredibilityChart, ConfirmationHistory | No | P1 |
| /trends | Historical convergence trends, GCI over time | GCIChart, TrendFilters | No | P1 |
| /research | Personal research workspace (The Data Base) | ResearchLog, SavedClaims, ExportTools | Yes (Pro) | P2 |
| /connections | Connection Map / knowledge graph | GraphVisualization, NodeDetail | Yes (Pro) | P2 |

---

## Non-Functional Requirements

- **Performance:** Feed page loads <2s. Story View loads <3s. Search returns <10s (progressive). RSS ingestion <5 min per cycle.
- **Accessibility:** WCAG 2.2 AA minimum (AAA where practical). Keyboard navigable. Screen reader compatible. Trust signal colors + icons + labels (not color-alone).
- **Keyboard Navigation:** F6 panel cycling, Cmd+K command palette, vim-style sequential shortcuts.
- **Density Modes:** Compact (32px rows), Comfortable (40px, default), Spacious (52px).
- **Offline Support:** Not planned for MVP.
- **Responsive:** Desktop-first command center, responsive down to mobile (first-class). Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl).
- **SEO:** SSR via React Router v7 loaders. Meta tags and Open Graph cards on story pages.
- **Security:** CRON_SECRET on automated endpoints. Cookie sessions. Stripe webhook signatures. Rate limiting on search. No raw API keys client-side.
- **Privacy:** No tracking beyond basic analytics (Plausible or Vercel Analytics). Email for auth only. Stripe handles payment data. User deletion removes all data.
- **i18n:** Not planned for MVP (US English only).

---

## Explicitly Out of Scope

1. Fact-check verdicts or editorial judgments
2. User-generated ratings, comments, or social features
3. Misinformation flagging (trust signals handle this implicitly)
4. Native mobile apps (iOS/Android)
5. Content moderation of any kind — we show the full spectrum, users decide
6. Real-time collaboration (this is a personal tool, not a team product)
7. Data sonification (Phase 5 — deferred)

---

## Success Metrics

| Metric | Target | How Measured | When to Check |
|--------|--------|-------------|---------------|
| DAU | 100 by month 1, 1,000 by month 3 | Analytics | Weekly |
| Stories triangulated/day | 10-15 at launch, 25-50 by month 3 | Database query | Daily |
| Convergence accuracy | >80% | Manual spot-checks | Monthly |
| Free-to-paid conversion | 10% month 1, 20% month 3 | Stripe + DB | Monthly |
| Avg time in Story View | >2 minutes | Analytics | Weekly |
| Primary source coverage | >50% of stories by month 3 | Database query | Monthly |

---

## Competitive / Prior Art

| Name | What It Does | What's Good | What's Missing | Link |
|------|-------------|-------------|----------------|------|
| Ground News | Shows coverage breadth across outlets | Bias ratings, visual spectrum | No claim-level analysis, no convergence scoring | groundnews.com |
| AllSides | Rates media bias, shows left/center/right | Clear bias labels | Static ratings, no dynamic claim matching | allsides.com |
| Ad Fontes Media | Media bias chart | Comprehensive chart | Not a consumer product, no real-time analysis | adfontesmedia.com |

---

## Open Questions

- [ ] Q1: Founder Member cutoff milestone? (1K users? 5K? Calendar date?) — by launch week
- [ ] Q2: Fringe RSS feed reliability — test before production seeding
- [ ] Q3: Claude API cost at scale (~$200/mo budget) — verify before Chunk 5
- [ ] Q4: Legal review of displaying titles/claims from paywalled sources (fair use?) — before launch
- [ ] Q5: Domain name (triangulate.app? triangulatenews.com? converge.news?) — before launch

---

## Revision History

| Date | Change | Decided By | Rationale |
|------|--------|-----------|-----------|
| 2026-02-14 | Initial spec created | Patrick | Project kickoff |
| 2026-03-08 | Added 7-point BiasTier system | Patrick | Better convergence weighting for fringe outlets |
| 2026-03-08 | Added fringe-only convergence cap (0.2) | Patrick | Prevent echo chamber false convergence |
| 2026-03-13 | Migrated from Next.js to React Router v7 (Remix) | Patrick | Better data loading patterns, nested routes |
| 2026-03-13 | Expanded from US-only to global (7 regions, 55+ outlets) | Patrick | Global convergence is a stronger product |
| 2026-03-25 | Command center redesign approved — Bloomberg Terminal style | Patrick | Journalist-grade interface for power users |
| 2026-03-25 | New user tiers: FREE / PREMIUM ($7.99) / JOURNALIST PRO ($14.99) + Founder program | Patrick | Better segmentation, Pro tier for journalists |
| 2026-03-25 | 8 new packages approved, 13-chunk launch roadmap created | Patrick | Command center requires new UI infrastructure |
