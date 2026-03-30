# Spec: Triangulate — News Convergence Engine

**Owner:** Patrick
**Date:** 2026-02-14
**Status:** In Progress
**Repo/Path:** github.com/[username]/triangulate

---

## 0) One-sentence outcome

Build **a news convergence platform** so that **anyone consuming news** can **see where ideologically opposed outlets confirm the same facts, access primary source documents, and distinguish reporting from commentary** without **manually checking multiple sources or trusting any single authority**, measured by **daily active users, convergence accuracy, and free-to-paid conversion rate**.

---

## 1) Problem and user

- **User(s):** Everyday news consumers, politically engaged citizens across the spectrum, journalists, researchers, educators, students
- **Job-to-be-done:** Determine whether a news story or claim is reliably true by finding independent corroboration across adversarial sources
- **Current workaround:** Manually open 3-5 tabs, compare headlines and claims across outlets, search for primary documents (court filings, bill text), attempt to separate reporting from opinion — all by hand, every time
- **Why now:** Trust in media is at historic lows (31% per Gallup 2024). AI-generated content is accelerating information pollution. LLMs now make claim extraction and semantic comparison feasible at scale for the first time — this product was technically impossible 3 years ago. Ground News has proven product-market fit in the adjacent space but stops short of convergence analysis.

---

## 2) Scope

**In scope:**
- RSS ingestion from 30+ outlets spanning far-left to far-right (including fringe sources)
- Story clustering (grouping articles about the same event)
- AI-powered factual claim extraction from articles
- Cross-spectrum convergence scoring (ideological spread, not just count)
- Reporting vs. commentary classification
- Primary source document detection and linking
- Trust signal system (Single Source → Contested → Converged → Source-Backed → Institutionally Validated)
- Daily Feed UI (homepage showing pre-triangulated stories)
- Story View UI (three-column convergence panel, claims tracker, primary source links)
- Search & Triangulate (paste a headline/URL, get on-demand analysis)
- User authentication (email magic link)
- Three-tier subscription (Free / Standard $5/mo / Premium $18/mo)
- Founder Member program (free Standard for life during startup phase)
- Price lock guarantee (your price never goes up while subscribed)
- Affiliate revenue from paywalled outlet subscriptions
- Mobile-responsive web app (no native app for MVP)

**Out of scope (explicit non-goals):**
- Fact-check verdicts or editorial judgments
- User-generated ratings or comments
- Social features (sharing, profiles, followers)
- Misinformation flagging (trust signals handle this implicitly)
- International sources (US media landscape only for MVP)
- Native mobile apps (iOS/Android)
- Triangulate Bundle deals (requires user volume to negotiate)
- Content moderation of any kind — we show the full spectrum, users decide

**Success criteria (measurable):**
- 100 DAU by month 1, 1,000 DAU by month 3
- 10-15 stories triangulated per day at launch, 25-50 by month 3
- Convergence scoring accuracy >80% (verified by manual spot-checks)
- Free-to-paid conversion rate of 10% month 1, 20% month 3
- Avg. time in Story View >2 minutes
- Primary sources surfaced on >50% of stories by month 3

---

## 3) Functional requirements (FR)

- **FR-1:** System ingests articles from 30+ RSS feeds every 15 minutes, deduplicating by URL
- **FR-2:** System classifies each article as REPORTING, COMMENTARY, or UNKNOWN using URL path analysis and NLP heuristics
- **FR-3:** System clusters articles about the same event into Stories using semantic similarity
- **FR-4:** System extracts 3-8 key factual claims per article using Claude API
- **FR-5:** System matches equivalent claims across articles (semantic deduplication) and calculates convergence score based on ideological spread of confirming sources
- **FR-6:** System assigns trust signals to stories based on highest claim convergence, presence of primary sources, and institutional actions
- **FR-7:** System detects and links primary source documents (court filings, legislation, government data, transcripts, research) referenced in articles
- **FR-8:** Daily Feed displays stories sorted by recency with converged stories boosted, showing trust signal badges, source count, reporting/commentary breakdown, and claim count
- **FR-9:** Story View displays three-column convergence panel (left/center/right coverage), claims tracker with per-claim signals, and primary source links
- **FR-10:** Search endpoint accepts a headline, URL, or topic and performs on-demand triangulation against existing article database
- **FR-11:** User accounts support email magic link authentication with Founder Member auto-assignment during startup phase
- **FR-12:** Stripe integration supports three subscription tiers with price lock, annual billing, and discount coupons (student, nonprofit, PWYC)
- **FR-13:** Free tier shows 5 stories/day with story-level signals; Standard unlocks full feed, claim-level signals, 5 searches/day; Premium unlocks unlimited searches, API access, daily digest
- **FR-14:** Affiliate links are embedded in "Unlock Full Story" UI for paywalled sources in the convergence panel

---

## 4) Non-functional requirements (NFR)

- **Performance:** Feed page loads <2s. Story View loads <3s. Search returns initial results <10s (progressive loading for claims/convergence). RSS ingestion completes all feeds <5 minutes per cycle.
- **Reliability:** 99.5% uptime target. If Claude API is down, stories display without claim analysis (graceful degradation). If a single RSS feed fails, remaining 29+ feeds still process. Retry failed Claude API calls 3x with exponential backoff.
- **Security:** API routes protected by CRON_SECRET for automated endpoints. User auth via NextAuth.js with secure session management. Stripe webhooks verified by signature. No raw API keys in client-side code. Rate limiting on search endpoint (IP-based for unauthenticated, user-based for authenticated).
- **Privacy:** No tracking beyond basic analytics (Plausible or Vercel Analytics — no cookies). No user behavior data sold. Email stored for auth only. Stripe handles all payment data — we never see card numbers. User deletion removes all associated data.
- **Cost:** Claude API budget capped at $200/month initially. Use Haiku for claim extraction (high volume, cheaper), Sonnet for convergence matching (needs accuracy). RSS ingestion is free. Neon PostgreSQL free tier for MVP. Vercel free/hobby tier for hosting.
- **Accessibility/UX:** WCAG 2.1 AA compliance. Mobile-first responsive design. Keyboard navigable. Screen reader compatible. High contrast trust signal colors (not relying on color alone — icons + labels always present).

---

## 5) User flows

**Flow A: Daily Feed Browse**
1. User opens triangulate.app
2. User sees Daily Feed with today's top stories, each showing trust signal badges, source count, and claim count
3. User scans stories, notices a story with "Converged" + "Source-Backed" signals
4. User taps the story card
- **Expected result:** Story View opens with full convergence panel, claims, and primary source links

**Flow B: Search & Triangulate**
1. User sees a headline on social media and wants to verify it
2. User navigates to /search
3. User pastes the headline into the search bar
4. User clicks "Triangulate"
5. System shows progressive loading: "Searching outlets..." → "Extracting claims..." → "Scoring convergence..."
6. Results display using Story View components
- **Expected result:** User sees convergence analysis with trust signals, claims from multiple outlets, and any available primary sources

**Flow C: Sign Up as Founder Member**
1. User clicks "Sign In" from header
2. User enters email address
3. System sends magic link
4. User clicks magic link in email
5. System creates account with isFounder=true (during founder phase)
- **Expected result:** User is authenticated with Founder Member badge, has Standard-tier access, and will never be charged

**Flow D: Subscribe to Standard**
1. Authenticated free-tier user clicks "Upgrade" or visits /pricing
2. User selects Standard tier ($5/month or $50/year)
3. System redirects to Stripe Checkout
4. User completes payment
5. Stripe webhook fires, system updates user tier and locks price
- **Expected result:** User has Standard access, priceLocked is set to $5, subscription is active

**Flow E: Affiliate Click-Through**
1. User is viewing a Story with a paywalled WSJ article in the convergence panel
2. User sees extracted claims from the WSJ article plus an "Unlock Full Story" button
3. User clicks the button
4. System redirects through affiliate link to WSJ subscription page
- **Expected result:** WSJ tracks the referral, user can subscribe, Triangulate earns commission if conversion occurs

---

## 6) Data model

**Entities:**
- **Source:** `{ id: UUID, name: string, url: string, rssFeedUrl: string, biasCategory: BiasCategory, biasTier: BiasTier, affiliateUrl: string?, createdAt: datetime }` constraints `{ name unique, url unique }`
- **Article:** `{ id: UUID, sourceId: FK(Source), title: string, url: string(unique), publishedAt: datetime, contentType: ContentType, rawText: text?, storyId: FK(Story)?, createdAt: datetime }`
- **Story:** `{ id: UUID, generatedTitle: string, summary: text?, trustSignal: TrustSignal, createdAt: datetime, updatedAt: datetime, lastAnalyzedAt: datetime? }`
- **Claim:** `{ id: UUID, storyId: FK(Story), claimText: text, claimType: ClaimType, convergenceScore: float(default 0), createdAt: datetime }`
- **ClaimSource:** `{ id: UUID, claimId: FK(Claim), articleId: FK(Article), quote: text?, supports: boolean(default true) }`
- **PrimaryDoc:** `{ id: UUID, storyId: FK(Story), docType: DocType, url: string, title: string, createdAt: datetime }`
- **User:** `{ id: UUID, email: string(unique), name: string?, tier: UserTier(default FREE), stripeCustomerId: string?, priceLocked: float?, isFounder: boolean(default false), joinedAt: datetime, subscriptionActive: boolean(default false) }`

**Enums:**
- **BiasCategory:** LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT
- **BiasTier:** FAR_LEFT, LEFT, CENTER_LEFT, CENTER, CENTER_RIGHT, RIGHT, FAR_RIGHT
- **ContentType:** REPORTING, COMMENTARY, UNKNOWN
- **TrustSignal:** SINGLE_SOURCE, CONTESTED, CONVERGED, SOURCE_BACKED, INSTITUTIONALLY_VALIDATED
- **ClaimType:** FACTUAL, EVALUATIVE
- **DocType:** COURT_FILING, LEGISLATION, OFFICIAL_STATEMENT, GOVERNMENT_DATA, TRANSCRIPT, RESEARCH, OTHER
- **UserTier:** FREE, STANDARD, PREMIUM

**Relationships:**
- `Source` 1..N `Article`
- `Story` 1..N `Article`
- `Story` 1..N `Claim`
- `Story` 1..N `PrimaryDoc`
- `Claim` 1..N `ClaimSource`
- `Article` 1..N `ClaimSource`

**Storage:**
- DB: PostgreSQL (Neon free tier → paid as needed)
- ORM: Prisma
- Migrations: Prisma Migrate (forward-only for MVP)
- Backfill: Seed script for initial 30+ sources

---

## 7) API / Interface surface

**Endpoints / Commands:**
- `GET /api/ingest` — input: `CRON_SECRET header` — output: `{ articlesAdded, errors, totalSources }` — errors: `401 unauthorized, 500 feed failures (partial success OK)`
- `GET /api/cluster` — input: `CRON_SECRET header` — output: `{ storiesCreated, articlesAssigned }` — errors: `401, 500 Claude API failure`
- `GET /api/analyze` — input: `CRON_SECRET header` — output: `{ storiesAnalyzed, claimsExtracted, primaryDocsFound }` — errors: `401, 500, 429 Claude rate limit`
- `GET /api/stories` — input: `?limit=20&offset=0&topic=all` — output: `StoryCardData[]` — errors: `500`
- `GET /api/stories/[id]` — input: `story UUID` — output: `Story with all relations` — errors: `404 not found, 500`
- `POST /api/search` — input: `{ query: string }` — output: `Story with convergence data` — errors: `400 empty query, 401 unauthenticated, 403 tier limit, 429 rate limit, 500`
- `POST /api/webhooks/stripe` — input: `Stripe event payload` — output: `200 OK` — errors: `400 bad signature`

**Events / Webhooks:**
- `checkout.session.completed` — update user tier, set priceLocked, assign Founder coupon if applicable
- `customer.subscription.updated` — sync tier changes
- `customer.subscription.deleted` — downgrade to FREE, set subscriptionActive=false

---

## 8) Edge cases and failure modes

**Edge cases:**
- A story is covered by only one outlet → trust signal = SINGLE_SOURCE, still displayed in feed
- Two outlets from the same bias category confirm a claim → low convergence weight (same-side confirmation = +0.2 only)
- An article is behind a paywall and RSS only returns title + snippet → use available text for clustering, note limited analysis
- A fringe outlet publishes something no other outlet covers → flagged as SINGLE_SOURCE, user can see it's uncorroborated
- A claim is confirmed by all outlets except one → that dissenting outlet is surfaced in the Claims Tracker as "1 outlet disputes"
- Founder Member cancels and re-subscribes → loses Founder status, comes back at current price
- User subscribes during a price increase transition → price locked at the rate displayed at checkout time

**Failure modes:**
- Claude API down → detection: HTTP 5xx/timeout → mitigation: skip claim extraction, display stories without convergence scores, retry on next cycle, show "Analysis pending" badge
- RSS feed returns malformed XML → detection: parser throws → mitigation: log error, skip feed, process remaining feeds
- Stripe webhook fails → detection: Stripe dashboard retry log → mitigation: Stripe retries automatically up to 72 hours; idempotent webhook handler prevents duplicate processing
- Story clustering produces bad groupings (unrelated articles merged) → detection: manual spot-check + user feedback → mitigation: adjust clustering threshold, add ability to manually unlink articles
- Database connection pool exhausted → detection: Prisma connection timeout → mitigation: connection pooling via PgBouncer/Neon's built-in pooler, queue overflow requests

---

## 9) Observability

- **Logs (structured):** `{ timestamp, event, sourceId?, storyId?, claimCount?, convergenceScore?, error?, duration_ms }`
- **Metrics:** articles_ingested (counter), stories_created (counter), claims_extracted (counter), convergence_scores (histogram), claude_api_latency_ms (histogram), claude_api_errors (counter), search_requests (counter), affiliate_clicks (counter), signups (counter), tier_upgrades (counter)
- **Tracing:** Request ID on all API routes, correlation between ingest → cluster → analyze pipeline
- **Dashboards:** Daily ingestion health (articles/hour by source), convergence score distribution, Claude API cost tracker, user funnel (visit → signup → upgrade), affiliate click-through rate
- **Alerts:** Ingestion failure >50% of feeds for 2 consecutive cycles, Claude API error rate >20%, Zero stories created in 24 hours, Stripe webhook failures

---

## 10) Security review (minimum)

**Threat model summary (top 3):**
- Threat: Unauthorized cron job execution → mitigation: CRON_SECRET header required on all automated endpoints, rotated monthly
- Threat: Stripe webhook spoofing → mitigation: Verify webhook signature using STRIPE_WEBHOOK_SECRET before processing
- Threat: Search endpoint abuse (scraping/DDoS) → mitigation: IP-based rate limiting (unauthenticated), user-based rate limiting (authenticated), CAPTCHA on repeated failures

- **Secrets:** Stored in Vercel environment variables (encrypted at rest). Never committed to git. .env.local in .gitignore.
- **Permissions:** FREE users: read limited feed, no search. STANDARD: full feed, 5 searches/day. PREMIUM: unlimited. ADMIN: manual story management (future).
- **Audit logs:** User tier changes, subscription events, Founder Member assignments, price lock events.

---

## 11) Rollout / rollback

**Rollout plan:**
1. Deploy to Vercel preview branch for internal testing
2. Seed production database with all sources
3. Run ingestion pipeline for 48 hours to build article corpus
4. Enable clustering and analysis, verify convergence quality
5. Invite 10-20 beta testers (friends, family) for feedback
6. Fix critical issues from beta
7. Open Founder Member signups (public launch)
8. Enable Stripe for paid tiers after 2 weeks of stable operation

**Rollback plan:**
- What to revert: Vercel instant rollback to previous deployment
- Data rollback: Stories and claims can be regenerated from articles (articles are the source of truth). User data preserved across deployments.

---

## 12) Acceptance criteria (must be testable)

- **AC-1:** Given 20+ active RSS feeds, when the ingest endpoint runs, then new articles are stored in the database with correct sourceId, contentType classification, and no duplicate URLs.
- **AC-2:** Given 50+ unclustered articles from the last 24 hours, when the cluster endpoint runs, then articles about the same event are grouped into Stories with generated titles.
- **AC-3:** Given a Story with articles from LEFT, CENTER, and RIGHT sources, when analysis runs, then claims are extracted, convergence scores reflect ideological spread, and the trust signal is set to CONVERGED.
- **AC-4:** Given a Story where all confirming sources are from the same bias category, when analysis runs, then the convergence score is low (<0.3) and the trust signal is CONTESTED or SINGLE_SOURCE.
- **AC-5:** Given a Story that references a .gov URL or court filing number, when analysis runs, then a PrimaryDoc record is created with the correct docType and URL.
- **AC-6:** Given an authenticated Standard-tier user, when they submit a search query, then results display within 15 seconds with progressive loading of convergence data.
- **AC-7:** Given a new user signing up while IS_FOUNDER_PHASE=true, when their account is created, then isFounder is set to true and they have Standard-tier access.
- **AC-8:** Given a subscriber at $5/month when prices increase for new users, then their Stripe subscription remains at $5/month (price lock verified).
- **AC-9:** Given the Daily Feed, when a user loads the homepage, then stories are displayed with trust signal badges, source counts, and the page loads in under 2 seconds.
- **AC-10:** Given an article from a FAR_RIGHT or FAR_LEFT source, when it appears in a story's convergence panel, then it is displayed with its bias tier label and the source is not censored or hidden.

---

## 13) Open questions / unknowns (blockers)

- **Q1:** What is the Founder Member cutoff milestone? 1,000 users? 5,000 users? A calendar date? — decision needed by: launch week
- **Q2:** Which fringe outlets have reliable RSS feeds? Need to test: AlterNet, Jacobin, The Intercept, Daily Kos (far left); Breitbart, Gateway Pundit, OANN, Newsmax, Epoch Times (far right) — decision needed by: before Chunk 2 (source seeding)
- **Q3:** Claude API cost at scale: at 50 stories/day × 5 articles/story × claim extraction + convergence matching, what's the monthly Claude bill? — decision needed by: before Chunk 5
- **Q4:** Legal review of displaying article titles and extracted claims from paywalled sources — is this fair use? — decision needed by: before public launch
- **Q5:** Domain name: triangulate.app? triangulatenews.com? converge.news? — decision needed by: before public launch

---

## 14) Implementation notes (for AI builder)

**Constraints:**
- Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Claude API, Stripe
- Libraries allowed: rss-parser, @anthropic-ai/sdk, stripe, next-auth, date-fns
- No changes to: pricing structure (3 tiers forever), trust signal methodology (convergence-based, never editorial), Founder Member guarantee
- Primary development environment: VS Code on PC, GitHub Codespaces on mobile (Pixel phone + Bluetooth keyboard)
- Single-file HTML artifacts preferred for standalone tools and demos

**Source Database — Full Spectrum (30+ outlets):**

| Tier | Outlets |
|------|---------|
| FAR_LEFT | AlterNet, Jacobin, The Intercept, Democracy Now! |
| LEFT | MSNBC, The Guardian, Vox, HuffPost |
| CENTER_LEFT | New York Times, Washington Post, CNN, NPR |
| CENTER | Associated Press, Reuters, BBC, PBS, C-SPAN |
| CENTER_RIGHT | Wall Street Journal, The Economist, Forbes, The Hill |
| RIGHT | Fox News, Daily Wire, New York Post, National Review |
| FAR_RIGHT | Breitbart, Newsmax, The Epoch Times, OANN, Gateway Pundit |

Note: Bias tier labels are used internally for convergence weighting. They are NOT displayed as judgments to users. Users see the outlet name and can optionally view the tier classification. The inclusion of fringe outlets is intentional — people should see the full spectrum so they can evaluate the landscape themselves. We do not censor, we illuminate.

**Convergence scoring weights (BiasTier-aware):**
- Same-tier confirmation: +0.1
- Adjacent-tier confirmation: +0.3
- Cross-center confirmation: +0.7
- Full-spectrum confirmation (FAR_LEFT ↔ FAR_RIGHT): +1.0
- CENTER source confirming: +0.3 bonus always
- Fringe-only claim (only FAR_LEFT or FAR_RIGHT sources): convergence score capped at 0.2 regardless of count

**Definition of done:**
- [ ] All AC pass
- [ ] Scenario suite pass
- [ ] CI gates pass
- [ ] Docs updated
- [ ] Mobile responsive verified on real device
- [ ] Founder Member flow works end-to-end
- [ ] Stripe test mode verified with test card
