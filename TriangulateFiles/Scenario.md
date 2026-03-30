# Scenario Suite: Triangulate — News Convergence Engine

**Purpose:** External behavioral scenarios that validate outcomes. These live OUTSIDE the codebase the generator reads. Treat as holdout evaluation.

---

## Rules

1. Write scenarios as black-box behavior: inputs, user actions, expected outputs.
2. No internal implementation hints.
3. Include happy path, edge cases, abuse cases, and failure injection.
4. Each scenario has an ID and is runnable in CI against a built artifact.

---

## Environment assumptions

- **Runtime:** Local dev server (localhost:3000) or Vercel preview deployment
- **Test doubles:** Stripe test mode (test card 4242 4242 4242 4242), Claude API live (or mocked responses for CI)
- **Seed data:** 30+ sources seeded via prisma db seed, at least 100 articles from a 24-hour ingestion run

---

## Core Scenarios

### SC-ingest-001-happy_path: RSS ingestion processes all feeds

**Intent:** Verify the ingestion pipeline handles 30+ feeds and stores articles correctly

**Given:**
- 30+ sources exist in the Source table with valid RSS feed URLs
- The Article table may or may not have existing articles

**When:**
- GET /api/ingest is called with valid CRON_SECRET header

**Then:**

*Expected outputs:*
- Response 200 with JSON body containing `articlesAdded >= 0`, `errors` (array), `totalSources >= 30`
- Response completes within 5 minutes

*Expected side effects:*
- New Article records exist in the database with valid sourceId, title, url, publishedAt
- No duplicate URLs in the Article table
- Each article has a contentType of REPORTING, COMMENTARY, or UNKNOWN

*Invariants:*
- Existing articles are not modified or deleted
- Source records are not modified

**Observability checks:**
- Logs contain: event=ingest_complete, articlesAdded, errorCount
- Metrics changed: articles_ingested counter increased

---

### SC-ingest-002-partial_feed_failure: Ingestion continues when feeds fail

**Intent:** Verify that a few broken feeds don't stop the entire pipeline

**Given:**
- 30+ sources seeded, at least 2 have invalid/broken RSS feed URLs

**When:**
- GET /api/ingest is called with valid CRON_SECRET

**Then:**

*Expected outputs:*
- Response 200 (not 500)
- `errors` array contains entries for the failed feeds
- `articlesAdded > 0` (articles from working feeds were still ingested)

*Expected side effects:*
- Articles from working feeds are stored
- No articles from broken feeds are stored
- No partial/corrupt records in the database

*Invariants:*
- Failed feeds do not crash the process or block other feeds

**Observability checks:**
- Logs contain: event=feed_error for each failed feed, with source name and error message

---

### SC-ingest-003-duplicate_rejection: Duplicate articles are not re-inserted

**Intent:** Verify URL-based deduplication

**Given:**
- An article with URL "https://example.com/story-123" already exists in the Article table

**When:**
- Ingestion runs and the RSS feed contains an item with the same URL

**Then:**

*Expected outputs:*
- The article is not counted in `articlesAdded`
- No error is reported for this duplicate

*Expected side effects:*
- Article table count does not increase for this URL
- The existing article record is unchanged

*Invariants:*
- No duplicate URLs exist in the Article table

---

### SC-cluster-001-happy_path: Articles cluster into stories

**Intent:** Verify story clustering groups related articles from different outlets

**Given:**
- At least 20 unclustered articles from the last 24 hours exist
- Multiple articles cover the same real-world event (e.g., same Senate vote reported by NYT, Fox, AP)

**When:**
- GET /api/cluster is called with valid CRON_SECRET

**Then:**

*Expected outputs:*
- Response 200 with `storiesCreated >= 1`, `articlesAssigned >= 2`

*Expected side effects:*
- Story records created with generatedTitle (non-empty string)
- Articles within a story come from multiple different sources
- Each story's articles have storyId set to the Story's id
- Single-article clusters get trustSignal = SINGLE_SOURCE

*Invariants:*
- An article belongs to at most one story
- Articles from the same source are not the sole members of a cluster (need cross-outlet coverage)

**Observability checks:**
- Logs contain: event=clustering_complete, storiesCreated, articlesAssigned

---

### SC-analyze-001-happy_path: Claims extracted and convergence scored

**Intent:** Verify the full analysis pipeline produces claims with convergence scores

**Given:**
- At least 3 Stories exist that have not been analyzed (lastAnalyzedAt is null)
- Each Story has articles from at least 2 different bias categories

**When:**
- GET /api/analyze is called with valid CRON_SECRET

**Then:**

*Expected outputs:*
- Response 200 with `storiesAnalyzed >= 1`, `claimsExtracted >= 1`

*Expected side effects:*
- Claim records created with non-empty claimText, claimType is FACTUAL or EVALUATIVE
- ClaimSource records link claims to their source articles
- Convergence scores are between 0.0 and 1.0
- Story trustSignal updated based on highest claim convergence
- lastAnalyzedAt set to current timestamp on processed stories

*Invariants:*
- Claims are linked to valid articles that belong to the same story
- Convergence scores reflect ideological spread (not just count)

---

### SC-analyze-002-cross_spectrum_convergence: Cross-spectrum gets higher score

**Intent:** Verify that a claim confirmed by LEFT + RIGHT sources scores higher than one confirmed by LEFT + CENTER_LEFT

**Given:**
- Story A has a claim confirmed by articles from LEFT and RIGHT sources
- Story B has a claim confirmed by articles from LEFT and CENTER_LEFT sources

**When:**
- Analysis runs on both stories

**Then:**

*Expected outputs:*
- Story A's claim convergence score > Story B's claim convergence score

*Invariants:*
- Cross-spectrum agreement always outweighs same-side agreement

---

### SC-analyze-003-fringe_only_capped: Fringe-only claims get capped score

**Intent:** Verify that claims confirmed only by FAR_LEFT or FAR_RIGHT sources don't get high convergence

**Given:**
- A Story has a claim confirmed by 3 FAR_RIGHT sources and no other sources

**When:**
- Analysis runs

**Then:**

*Expected outputs:*
- That claim's convergence score is <= 0.2

*Invariants:*
- Fringe echo chambers do not produce false convergence signals

---

### SC-feed-001-happy_path: Daily Feed loads with stories and signals

**Intent:** Verify the homepage displays stories correctly

**Given:**
- At least 5 analyzed Stories exist with trust signals assigned

**When:**
- User navigates to / (homepage)

**Then:**

*Expected outputs:*
- Page loads in under 2 seconds
- Story cards are visible with: title, trust signal badge(s), source count, reporting/commentary breakdown
- Stories are ordered by recency with converged stories boosted
- Trust signal badges show correct icon + label for each signal type

*Invariants:*
- No story appears without a trust signal
- Signal colors match specification (green=converged, amber=contested, red=single source)

---

### SC-story-001-happy_path: Story View shows convergence panel

**Intent:** Verify the core product page renders correctly

**Given:**
- A Story exists with articles from LEFT, CENTER, and RIGHT sources
- The Story has claims with convergence scores and at least one primary source document

**When:**
- User navigates to /story/[id]

**Then:**

*Expected outputs:*
- Three-column convergence panel shows articles grouped by bias direction
- Each article shows source name, title (linking to original), and reporting/commentary label
- Convergent claims are highlighted across columns
- Claims tracker shows claims sorted by convergence score (highest first)
- Each claim shows convergence dot (green/amber/red), confirming outlet count, and claim type badge
- Primary source section shows document links with type icons

*Invariants:*
- All outlets are displayed regardless of bias tier (including FAR_LEFT and FAR_RIGHT)
- No editorial judgment is displayed — only convergence data and source links

---

### SC-story-002-fringe_sources_visible: Fringe outlets appear in convergence panel

**Intent:** Verify that far-left and far-right sources are not hidden or censored

**Given:**
- A Story has articles from Breitbart (FAR_RIGHT) and Jacobin (FAR_LEFT) alongside mainstream sources

**When:**
- User views the Story

**Then:**

*Expected outputs:*
- Breitbart article appears in the right-leaning column
- Jacobin article appears in the left-leaning column
- Both have their source names displayed clearly
- Neither is hidden, dimmed, or warning-labeled differently than mainstream sources

*Invariants:*
- No source is censored based on bias tier
- All sources are treated equally in display (convergence scoring may weight differently, but display is neutral)

---

### SC-search-001-happy_path: Search returns triangulated results

**Intent:** Verify on-demand triangulation works

**Given:**
- User is authenticated with Standard tier
- The article database has coverage of a recent event from multiple outlets

**When:**
- User POSTs to /api/search with `{ query: "Senate infrastructure bill vote" }`

**Then:**

*Expected outputs:*
- Response 200 with Story data including articles, claims, convergence scores, trust signal
- Response arrives within 15 seconds

*Expected side effects:*
- If a new Story was created for this search, it is persisted for future queries

---

### SC-search-002-rate_limit: Free users cannot search

**Intent:** Verify tier-gated access on search

**Given:**
- User is authenticated with FREE tier

**When:**
- User POSTs to /api/search

**Then:**

*Expected outputs:*
- Response 403 with message indicating search requires Standard or Premium tier

*Invariants:*
- No search processing occurs
- No Story is created

---

### SC-search-003-standard_daily_limit: Standard users limited to 5 searches/day

**Intent:** Verify daily search limit for Standard tier

**Given:**
- User is authenticated with Standard tier
- User has already performed 5 searches today

**When:**
- User POSTs a 6th search

**Then:**

*Expected outputs:*
- Response 429 with message about daily limit reached and suggestion to upgrade to Premium

---

### SC-auth-001-unauthenticated_denied: Protected routes reject unauthenticated requests

**Intent:** Verify auth on protected endpoints

**Given:**
- No authentication token/session

**When:**
- POST /api/search with a query

**Then:**

*Expected outputs:*
- Response 401

*Invariants:*
- No search processing occurs

---

### SC-auth-002-founder_assignment: Founder status assigned during founder phase

**Intent:** Verify Founder Member program works

**Given:**
- IS_FOUNDER_PHASE environment variable is "true"

**When:**
- A new user creates an account via magic link

**Then:**

*Expected side effects:*
- User record has isFounder = true
- User record has tier = STANDARD (or equivalent free Standard access)

*Invariants:*
- No payment is required
- Founder status persists across sessions

---

### SC-auth-003-founder_phase_off: Non-founder signup after cutoff

**Intent:** Verify Founder status is not given after phase ends

**Given:**
- IS_FOUNDER_PHASE environment variable is "false"

**When:**
- A new user creates an account

**Then:**

*Expected side effects:*
- User record has isFounder = false
- User record has tier = FREE

---

### SC-pay-001-price_lock: Subscriber keeps original price

**Intent:** Verify the price lock guarantee

**Given:**
- User subscribed at $5/month and priceLocked = 5.00
- The Standard price has been changed to $8/month for new subscribers

**When:**
- Stripe billing cycle renews

**Then:**

*Expected outputs:*
- User is charged $5 (not $8)

*Invariants:*
- priceLocked value is unchanged
- Subscription remains active

---

### SC-pay-002-cancel_resubscribe_loses_lock: Price lock resets on cancellation

**Intent:** Verify that cancelled users lose their price lock

**Given:**
- User had priceLocked = 5.00 but cancelled their subscription
- Current Standard price is $8/month

**When:**
- User re-subscribes to Standard

**Then:**

*Expected side effects:*
- User's priceLocked is updated to 8.00
- User is charged $8/month going forward

---

### SC-sec-001-cron_secret_required: Automated endpoints reject unauthorized calls

**Intent:** Verify CRON_SECRET protection

**Given:**
- No CRON_SECRET header or wrong value

**When:**
- GET /api/ingest
- GET /api/cluster
- GET /api/analyze

**Then:**

*Expected outputs:*
- Response 401 for each endpoint

*Invariants:*
- No ingestion, clustering, or analysis occurs

---

### SC-sec-002-stripe_webhook_signature: Spoofed webhooks are rejected

**Intent:** Verify Stripe webhook signature verification

**Given:**
- A POST to /api/webhooks/stripe with a valid-looking JSON body but invalid Stripe signature header

**When:**
- The webhook endpoint processes the request

**Then:**

*Expected outputs:*
- Response 400

*Invariants:*
- No user records are modified
- No tier changes occur

---

### SC-fail-001-claude_api_timeout: Graceful degradation when Claude is down

**Intent:** Verify the system doesn't crash when the AI layer is unavailable

**Given:**
- Claude API is unreachable (timeout or 5xx)

**When:**
- GET /api/analyze runs

**Then:**

*Expected outputs:*
- Response 200 with `storiesAnalyzed: 0`
- No crash or 500 error

*Expected side effects:*
- Stories remain in their current state (no claims added, no trust signal changed)
- Error logged with details

*Invariants:*
- Existing stories, claims, and signals are not corrupted
- Feed continues to display existing data normally

---

### SC-fail-002-database_connection: System handles database connection issues

**Intent:** Verify database resilience

**Given:**
- Database connection pool is exhausted or temporarily unavailable

**When:**
- User loads the homepage

**Then:**

*Expected outputs:*
- Error page or loading state displayed (not a raw crash/stack trace)
- System recovers once database is available again

---

### SC-data-001-migration_compatible: Migration runs forward cleanly

**Intent:** Verify database migrations work

**Given:**
- A fresh PostgreSQL database with no tables

**When:**
- `npx prisma migrate deploy` is run

**Then:**

*Expected outputs:*
- All tables created without errors
- Seed script runs successfully and populates 30+ sources

*Invariants:*
- No data loss on existing databases when new migrations are added

---

### SC-obs-001-logs_metrics_traces: Key flows emit observability data

**Intent:** Verify structured logging on critical paths

**Given:**
- Ingestion, clustering, and analysis endpoints run successfully

**When:**
- Logs are inspected after a full pipeline cycle

**Then:**

*Expected outputs:*
- Structured log entries exist for: ingest_complete, clustering_complete, analysis_complete
- Each log entry includes timestamp, event name, and relevant counts
- Error events include error message and source context

---

## CI gate checklist

Everything below must be true before shipping. Check each box.

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
