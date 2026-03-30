# SCENARIOS.md — User Journeys and Flows

> **UPDATE FREQUENCY: EVERY MAJOR FEATURE**
> This file bridges the gap between SPEC.md (what to build) and actual implementation. It describes HOW users move through the product — step by step, screen by screen.
>
> **Depends on:** SPEC.md (user stories and features), CONTEXT.md (domain understanding)
> **Feeds into:** ART.md (UI decisions), SNIFFTEST.md (test cases), ARCHITECTURE.md (API/data needs)

---

## How to Write Scenarios

Each scenario follows a user through a complete task — from intent to outcome. Include:

- **Who** the user is (reference SPEC.md user types)
- **What** they're trying to accomplish
- **Where** they start (entry point)
- **Each step** they take, including what they see and do
- **Happy path** (everything works)
- **Sad paths** (things go wrong)
- **Edge cases** (unusual but valid situations)

Good scenarios are specific enough to code from but readable enough to discuss with non-technical people.

---

## Environment Assumptions

- **Runtime:** Local dev server (localhost:3000) or Vercel preview deployment
- **Test doubles:** Stripe test mode (test card 4242 4242 4242 4242), Claude API live (or mocked responses for CI)
- **Seed data:** 30+ sources seeded via prisma db seed, at least 100 articles from a 24-hour ingestion run

---

## Core Scenarios

### [SC-ingest-001] RSS Ingestion — Happy Path

**User:** System (automated cron)
**Goal:** Process all feeds and store articles correctly
**Entry Point:** GET /api/ingest
**Preconditions:** 30+ sources exist with valid RSS feed URLs
**Related Chunk:** Chunk 3

#### Happy Path

1. GET /api/ingest called with valid CRON_SECRET header
2. System fetches RSS feeds from all 30+ sources
3. System classifies each article as REPORTING, COMMENTARY, or UNKNOWN
4. System deduplicates by URL
5. Outcome: Response 200 with `{ articlesAdded >= 0, errors: [], totalSources >= 30 }`

#### Sad Path(s)

- **If CRON_SECRET is missing/wrong:** Response 401, no processing occurs

#### Edge Cases

- Some articles may only have title + snippet (paywalled sources)
- RSS feed may return items already in the database

#### State Changes

- **Before:** Article table has N records
- **After:** Article table has N + articlesAdded records, each with valid sourceId and contentType

**Observability:** Logs contain event=ingest_complete, articlesAdded, errorCount

---

### [SC-ingest-002] Partial Feed Failure

**User:** System (automated cron)
**Goal:** Continue ingesting when some feeds fail
**Entry Point:** GET /api/ingest
**Preconditions:** 30+ sources seeded, at least 2 have broken RSS URLs
**Related Chunk:** Chunk 3

#### Happy Path

1. System attempts all 30+ feeds
2. 2 feeds fail (broken URLs)
3. Remaining 28+ feeds process normally
4. Outcome: Response 200, `errors` array has 2 entries, `articlesAdded > 0`

#### State Changes

- **Before:** Some feeds have bad URLs
- **After:** Articles from working feeds stored; no partial/corrupt records from failed feeds

**Observability:** Logs contain event=feed_error for each failed feed

---

### [SC-ingest-003] Duplicate Rejection

**User:** System (automated cron)
**Goal:** Prevent duplicate articles
**Entry Point:** GET /api/ingest
**Preconditions:** Article with URL "https://example.com/story-123" already exists
**Related Chunk:** Chunk 3

#### Happy Path

1. Ingestion runs, feed contains item with existing URL
2. Duplicate is silently skipped
3. Outcome: Article not counted in articlesAdded, no error reported

#### State Changes

- **Before:** 1 article with that URL
- **After:** Still 1 article with that URL (unchanged)

---

### [SC-cluster-001] Story Clustering — Happy Path

**User:** System (automated cron)
**Goal:** Group related articles from different outlets into Stories
**Entry Point:** GET /api/cluster
**Preconditions:** 20+ unclustered articles from last 24 hours
**Related Chunk:** Chunk 4

#### Happy Path

1. GET /api/cluster called with valid CRON_SECRET
2. System groups articles about the same event
3. System generates neutral headlines per Story
4. Single-article clusters get trustSignal = SINGLE_SOURCE
5. Outcome: Response 200 with `{ storiesCreated >= 1, articlesAssigned >= 2 }`

#### State Changes

- **Before:** Articles have storyId = null
- **After:** Articles have storyId set; Story records created with generatedTitle

**Observability:** Logs contain event=clustering_complete, storiesCreated, articlesAssigned

---

### [SC-analyze-001] Claims & Convergence — Happy Path

**User:** System (automated cron)
**Goal:** Extract claims and score convergence
**Entry Point:** GET /api/analyze
**Preconditions:** 3+ Stories with lastAnalyzedAt = null, each with articles from 2+ bias categories
**Related Chunk:** Chunk 5

#### Happy Path

1. GET /api/analyze called with valid CRON_SECRET
2. System extracts 3-8 claims per article
3. System matches equivalent claims across articles
4. System scores convergence based on ideological spread
5. System updates trust signals
6. Outcome: Response 200 with `{ storiesAnalyzed >= 1, claimsExtracted >= 1 }`

#### Sad Path(s)

- **If Claude API is down:** Response 200 with storiesAnalyzed: 0, no crash

#### State Changes

- **Before:** Stories have no claims, lastAnalyzedAt = null
- **After:** Claims created with convergenceScore 0.0-1.0, trustSignal updated, lastAnalyzedAt set

---

### [SC-analyze-002] Cross-Spectrum Scores Higher

**User:** System
**Goal:** Verify convergence weighting
**Entry Point:** Analysis pipeline
**Preconditions:** Story A has LEFT + RIGHT claim; Story B has LEFT + CENTER_LEFT claim
**Related Chunk:** Chunk 5

#### Happy Path

1. Analysis runs on both stories
2. Story A's claim convergence > Story B's claim convergence
3. Cross-spectrum agreement always outweighs same-side agreement

---

### [SC-analyze-003] Fringe-Only Cap

**User:** System
**Goal:** Prevent fringe echo chamber false convergence
**Entry Point:** Analysis pipeline
**Preconditions:** Story has a claim confirmed by 3 FAR_RIGHT sources only
**Related Chunk:** Chunk 5

#### Happy Path

1. Analysis runs
2. That claim's convergence score <= 0.2 (capped)
3. Fringe echo chambers don't produce false convergence signals

---

### [SC-feed-001] Daily Feed — Happy Path

**User:** News consumer (unauthenticated)
**Goal:** Browse today's triangulated stories
**Entry Point:** / (homepage)
**Preconditions:** 5+ analyzed Stories with trust signals
**Related Chunk:** Chunk 6

#### Happy Path

1. User navigates to homepage
2. Page loads in under 2 seconds
3. User sees story cards with: title, trust signal badges, source count, reporting/commentary breakdown
4. Stories ordered by recency, converged stories boosted
5. User taps a story card → navigates to Story View

#### Edge Cases

- What if no stories exist yet? Show empty state with explanation.
- What if user is on slow connection? Show skeleton loaders.

---

### [SC-story-001] Story View — Happy Path

**User:** News consumer
**Goal:** See full convergence analysis for a story
**Entry Point:** /story/[id]
**Preconditions:** Story has articles from LEFT, CENTER, RIGHT + claims + primary source
**Related Chunk:** Chunk 7

#### Happy Path

1. User navigates to /story/[id]
2. Three-column convergence panel shows articles grouped by bias direction
3. Each article shows source name, title (linking to original), reporting/commentary label
4. Claims tracker shows claims sorted by convergence score (highest first)
5. Primary source section shows document links with type icons
6. Outcome: User understands convergence landscape for this story

#### Edge Cases

- Story with only 1 source → single column, SINGLE_SOURCE badge
- Paywalled articles → "Unlock Full Story" affiliate button

---

### [SC-story-002] Fringe Sources Visible

**User:** News consumer
**Goal:** Verify fringe outlets are not censored
**Entry Point:** /story/[id]
**Preconditions:** Story has articles from Breitbart (FAR_RIGHT) and Jacobin (FAR_LEFT) alongside mainstream
**Related Chunk:** Chunk 7

#### Happy Path

1. Breitbart appears in right-leaning column
2. Jacobin appears in left-leaning column
3. Both displayed clearly with source names, not hidden or dimmed

#### State Changes

- No sources censored based on bias tier

---

### [SC-search-001] Search & Triangulate — Happy Path

**User:** Authenticated Standard-tier user
**Goal:** Verify a headline from social media
**Entry Point:** /search
**Preconditions:** Article database has coverage of the event
**Related Chunk:** Chunk 8

#### Happy Path

1. User navigates to /search
2. User pastes headline into search bar
3. User clicks "Triangulate"
4. Progressive loading: "Searching..." → "Extracting claims..." → "Scoring convergence..."
5. Results display with convergence analysis
6. Outcome: Response within 15 seconds

---

### [SC-search-002] Free Users Cannot Search

**User:** Authenticated FREE-tier user
**Goal:** Attempt search
**Entry Point:** POST /api/search
**Preconditions:** User is FREE tier
**Related Chunk:** Chunk 8

#### Sad Path

1. User submits search
2. Response 403: "Search requires Standard or Premium tier"
3. No processing occurs

---

### [SC-search-003] Standard Daily Limit

**User:** Authenticated Standard-tier user
**Goal:** Exceed daily search limit
**Entry Point:** POST /api/search
**Preconditions:** User has already performed 5 searches today
**Related Chunk:** Chunk 8

#### Sad Path

1. User submits 6th search
2. Response 429: "Daily limit reached. Upgrade to Premium for unlimited."

---

### [SC-auth-001] Unauthenticated Denied

**User:** Unauthenticated visitor
**Goal:** Access protected endpoint
**Entry Point:** POST /api/search
**Preconditions:** No auth session
**Related Chunk:** Chunk 9

#### Sad Path

1. POST /api/search without auth
2. Response 401
3. No processing occurs

---

### [SC-auth-002] Founder Assignment

**User:** New user
**Goal:** Sign up during founder phase
**Entry Point:** Magic link auth
**Preconditions:** IS_FOUNDER_PHASE = "true"
**Related Chunk:** Chunk 9

#### Happy Path

1. User enters email, receives magic link
2. User clicks link, account created
3. isFounder = true, tier = STANDARD
4. No payment required

---

### [SC-auth-003] Non-Founder After Cutoff

**User:** New user
**Goal:** Sign up after founder phase ends
**Entry Point:** Magic link auth
**Preconditions:** IS_FOUNDER_PHASE = "false"
**Related Chunk:** Chunk 9

#### Happy Path

1. User creates account
2. isFounder = false, tier = FREE

---

### [SC-pay-001] Price Lock

**User:** Existing subscriber
**Goal:** Keep original price on renewal
**Entry Point:** Stripe billing cycle
**Preconditions:** priceLocked = 5.00, current price is $8/month
**Related Chunk:** Chunk 9

#### Happy Path

1. Billing cycle renews
2. User charged $5 (not $8)
3. priceLocked unchanged, subscription active

---

### [SC-pay-002] Cancel & Resubscribe Loses Lock

**User:** Cancelled subscriber
**Goal:** Resubscribe at current prices
**Entry Point:** /pricing
**Preconditions:** Was priceLocked at $5, cancelled, current price is $8
**Related Chunk:** Chunk 9

#### Happy Path

1. User re-subscribes
2. priceLocked updated to 8.00
3. Charged $8/month going forward

---

## Security Scenarios

### [SC-sec-001] CRON_SECRET Required

**User:** Unauthorized caller
**Goal:** Access automated endpoints
**Entry Point:** GET /api/ingest, /api/cluster, /api/analyze
**Preconditions:** No CRON_SECRET header or wrong value

#### Sad Path

1. Call any automated endpoint without valid CRON_SECRET
2. Response 401 for each
3. No processing occurs

---

### [SC-sec-002] Stripe Webhook Signature

**User:** Malicious actor
**Goal:** Spoof a Stripe webhook
**Entry Point:** POST /api/webhooks/stripe
**Preconditions:** Valid-looking JSON body but invalid signature

#### Sad Path

1. Webhook processed
2. Response 400
3. No user records modified, no tier changes

---

## Failure Scenarios

### [SC-fail-001] Claude API Timeout

**User:** System
**Goal:** Graceful degradation when AI layer is down
**Entry Point:** GET /api/analyze
**Preconditions:** Claude API unreachable

#### Happy Path

1. Analysis runs
2. Response 200 with storiesAnalyzed: 0
3. No crash, existing data preserved
4. Error logged

---

### [SC-fail-002] Database Connection Issues

**User:** News consumer
**Goal:** Load homepage when DB is struggling
**Entry Point:** / (homepage)
**Preconditions:** DB connection pool exhausted or temporarily unavailable

#### Sad Path

1. User loads homepage
2. Error page or loading state (not raw crash/stack trace)
3. System recovers when DB is available

---

## Data Scenarios

### [SC-data-001] Migration Compatible

**User:** Developer
**Goal:** Run migrations on fresh database
**Entry Point:** `npx prisma migrate deploy`
**Preconditions:** Fresh PostgreSQL database

#### Happy Path

1. Migrations run without errors
2. All tables created
3. Seed script runs, populates 30+ sources
4. No data loss on existing databases with new migrations

---

## Observability Scenarios

### [SC-obs-001] Logs and Metrics

**User:** Developer/Operator
**Goal:** Verify observability on critical paths
**Entry Point:** Full pipeline cycle
**Preconditions:** Ingestion, clustering, and analysis run successfully

#### Happy Path

1. Structured log entries for: ingest_complete, clustering_complete, analysis_complete
2. Each entry has timestamp, event name, relevant counts
3. Error events include error message and source context

---

## Scenario Coverage Matrix

| SPEC Chunk | User Story | Scenario ID | Status |
|-----------|-----------|-------------|--------|
| Chunk 3 | RSS ingestion | SC-ingest-001, 002, 003 | [x] Complete |
| Chunk 4 | Story clustering | SC-cluster-001 | [x] Complete |
| Chunk 5 | Claims & convergence | SC-analyze-001, 002, 003 | [x] Complete |
| Chunk 6 | Daily Feed | SC-feed-001 | [x] Complete |
| Chunk 7 | Story View | SC-story-001, 002 | [x] Complete |
| Chunk 8 | Search | SC-search-001, 002, 003 | [x] Complete |
| Chunk 9 | Auth & payments | SC-auth-001, 002, 003, SC-pay-001, 002 | [x] Complete |
| Security | CRON + Stripe | SC-sec-001, 002 | [x] Complete |
| Failure | Graceful degradation | SC-fail-001, 002 | [x] Complete |
| Data | Migrations | SC-data-001 | [x] Complete |
| Observability | Logging | SC-obs-001 | [x] Complete |

---

## CI Gate Checklist

### Build
- [ ] Build is reproducible from clean checkout (`npm install && npm run build`)
- [ ] Lint and static analysis pass (`npm run lint`)
- [ ] TypeScript compilation succeeds with no errors

### Tests
- [ ] Unit tests pass with meaningful coverage on convergence scoring logic
- [ ] Integration tests pass against test database
- [ ] Scenario suite passes (all required scenarios green)

### Security
- [ ] Dependency vulnerability scan: no critical issues (`npm audit`)
- [ ] Secrets scan: clean (no API keys in committed code)
- [ ] AuthZ tests cover tier boundaries (Free/Standard/Premium access)
- [ ] CRON_SECRET protection verified on all automated endpoints
- [ ] Stripe webhook signature verification active

### Data
- [ ] Migrations run forward cleanly on empty database
- [ ] Seed script is idempotent (can run multiple times safely)
- [ ] No destructive migration without explicit approval

### Observability
- [ ] Structured logs present on ingestion, clustering, and analysis
- [ ] Key metrics emitted (articles ingested, stories created, claims extracted)
- [ ] Error paths logged with context

### Performance
- [ ] Homepage loads in under 2 seconds
- [ ] Story View loads in under 3 seconds
- [ ] Ingestion cycle completes in under 5 minutes

### Release
- [ ] Version tagged
- [ ] Rollback plan documented (Vercel instant rollback)
- [ ] Feature flag for IS_FOUNDER_PHASE documented
- [ ] README updated with setup instructions
