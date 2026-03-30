# Round Table Audit — 2026-03-29

> 11 agents audited the Triangulate codebase simultaneously.
> This document synthesizes their findings into a unified, prioritized action plan.

## Agents That Participated

| Agent | Focus Area |
|-------|-----------|
| Red Teamer | Adversarial failure analysis, attack vectors |
| Systems Thinker | Feedback loops, leverage points, unintended consequences |
| First Principles | Core algorithm validity, foundational assumptions |
| Devil's Advocate | Business model, pricing, strategic decisions |
| Assumption Auditor | 46 implicit assumptions, evidence-rated |
| Inversion Agent | "Guarantee failure first" defense check |
| Database Optimizer | Schema, indexes, N+1 queries, scaling |
| Security Engineer | OWASP audit, auth, payments, injection |
| Performance Engineer | Bundle size, render perf, mobile, code splitting |
| LLM/Prompt Architect | Prompt quality, hallucination, cost, parsing |
| Payments Specialist | Stripe lifecycle, webhook security, tier enforcement |
| Data Engineer | Pipeline reliability, idempotency, observability |

---

## P0 — Fix Before Launch (Existential / Data-Corrupting)

### 1. Stripe tier-mapping bug — $7.99 users get $14.99 features
**Agents:** Payments
**File:** `app/routes/api.stripe.webhook.ts:33-35`
**Issue:** Both PREMIUM and JOURNALIST map to DB tier `PREMIUM`. Users paying $7.99 get Journalist Pro features.
**Fix:** Change `JOURNALIST: "PREMIUM"` to `PREMIUM: "STANDARD"`, `JOURNALIST: "PREMIUM"`.

### 2. Failed analysis permanently marks stories as "done"
**Agents:** Red Teamer, Systems Thinker, Inversion, Data Engineer
**File:** `app/routes/api.analyze.ts:191-196`
**Issue:** The catch block sets `lastAnalyzedAt = new Date()` on failure. Stories that fail AI extraction are permanently skipped — silent, irreversible data loss.
**Fix:** Remove `lastAnalyzedAt` from the error handler. Add `analysisFailCount` field to Story model. Exclude stories with 3+ failures from the query.

### 3. SQL injection risk via `$queryRawUnsafe`
**Agents:** Red Teamer, Inversion, Security, Database
**File:** `app/routes/api.search.ts:29`
**Issue:** Uses `$queryRawUnsafe` with user-derived tsquery. Also, `to_tsquery()` throws on special characters.
**Fix:** Switch to `$queryRaw` tagged template. Replace `to_tsquery` with `websearch_to_tsquery` (handles natural language safely).

### 4. No rate limiting on any endpoint
**Agents:** Red Teamer, Inversion, Security, Data Engineer
**Files:** All `app/routes/api.*`
**Issue:** Zero rate limiting anywhere. Email bombing via `/api/auth/send-link`, search abuse, AI cost attacks all possible.
**Fix:** Add rate limiting to auth (3/email/15min), search (30/IP/min), checkout (5/user/hr). Use Upstash Redis or Vercel KV.

### 5. AI hallucination with no grounding check
**Agents:** Red Teamer, First Principles, Inversion, LLM Architect, Assumption Auditor
**File:** `app/lib/claims.ts`
**Issue:** AI extracts "claims" from headlines with no validation that claims are grounded in the source text. Hallucinated claims get convergence scores. One viral screenshot of a fabricated "converged" claim kills credibility.
**Fix:** Add post-extraction grounding check — verify token overlap between each claim and its source headlines. Discard claims below 20% overlap. Log hallucination rate.

### 6. Sequential RSS ingestion will timeout on Vercel
**Agents:** Data Engineer, Assumption Auditor
**File:** `app/routes/api.ingest.ts:31`
**Issue:** 55 feeds fetched sequentially at 20s timeout each = 18+ min worst case. Vercel Pro timeout is 60s.
**Fix:** Parallelize with `Promise.allSettled` in batches of 10. Reduce per-feed timeout to 10s.

### 7. Contested = 0 cliff destroys valid convergence
**Agents:** Systems Thinker
**File:** `app/routes/api.analyze.ts:98-99`
**Issue:** If ANY source contradicts a claim, score drops to 0. A single contrarian outlet can nuke 9-source convergence. Bad actors can systematically zero out scores.
**Fix:** Replace binary zero with weighted formula: `convergenceScore * (supportingCount / totalCount)`.

---

## P1 — Fix Before Scaling (Security / Data Quality / Cost)

### 8. AI cost spiral with no budget cap
**Agents:** Red Teamer, Systems Thinker, Inversion
**Files:** `app/lib/ai.ts`, `app/routes/api.analyze.ts`
**Fix:** Add daily AI call counter. Stop analysis when budget hit. Degrade from Round Table to single-provider at 80% budget.

### 9. Set temperature to 0.0-0.2 for all AI extraction calls
**Agents:** LLM Architect
**Files:** `app/lib/ai.ts` (all provider functions)
**Fix:** Add `temperature: 0.1` to Claude, Gemini, DeepSeek, Grok calls. Reduces randomness in factual extraction.

### 10. Prompt injection via article titles
**Agents:** LLM Architect, Security
**File:** `app/lib/claims.ts:42-43`
**Fix:** Use XML delimiters for title interpolation. Strip control characters. Add output schema validation.

### 11. Timing-unsafe cron secret comparison
**Agents:** Red Teamer, Security
**Files:** `api.ingest.ts`, `api.cluster.ts`, `api.analyze.ts`
**Fix:** Use `crypto.timingSafeEqual()` instead of `!==`.

### 12. Magic link token race condition (non-atomic consume)
**Agents:** Security
**File:** `app/routes/auth.verify.tsx:15-46`
**Fix:** Use atomic `updateMany` with WHERE token matches, check `result.count === 0` for invalid.

### 13. Usage tracking cookie is unsigned and trivially bypassable
**Agents:** Security, Payments
**File:** `app/lib/usage-tracking.ts`
**Fix:** Add `HttpOnly` flag. For authenticated users, track server-side.

### 14. Missing database indexes on hot queries
**Agents:** Database Optimizer
**Files:** `prisma/schema.prisma`
**Fix:** Add indexes on `stories.lastAnalyzedAt`, `stories.createdAt`, composite partial index for feed query, partial index for unclustered articles.

### 15. N+1 queries in analyze pipeline
**Agents:** Database Optimizer
**File:** `app/routes/api.analyze.ts:102-152`
**Fix:** Batch claim/doc creation in `$transaction`. Eliminate redundant re-queries on lines 157-163.

### 16. Prisma singleton not cached in production (connection exhaustion)
**Agents:** Database Optimizer
**File:** `app/lib/prisma.ts`
**Fix:** Remove the `NODE_ENV` guard so singleton works in all environments.

### 17. Claim extraction prompt asks for "3-8 per article" — causes hallucination
**Agents:** LLM Architect
**File:** `app/lib/claims.ts:45`
**Fix:** Change to "3-12 total from this headline set". Add grounding instruction: "Only extract claims explicitly stated."

### 18. Anthropic client re-instantiated on every AI call
**Agents:** LLM Architect
**File:** `app/lib/ai.ts:19`
**Fix:** Create singleton client, reuse across calls.

### 19. Stripe webhook not idempotent + missing refund/dispute handlers
**Agents:** Payments
**File:** `app/routes/api.stripe.webhook.ts`
**Fix:** Add event ID deduplication. Add `charge.dispute.created` and `charge.refunded` handlers.

### 20. Subscription update webhook doesn't sync tier changes
**Agents:** Payments
**File:** `app/routes/api.stripe.webhook.ts:62-77`
**Fix:** Read price from subscription items and map to tier, not just active/inactive.

---

## P2 — Fix Before 100K Articles (Performance / Scale)

### 21. `@react-pdf/renderer` (500KB) in main bundle
**Agents:** Performance
**File:** `app/components/export/ExportDialog.tsx`
**Fix:** Dynamic `import()` for PDF module only when user exports.

### 22. Zero `React.memo` anywhere — re-render storm on j/k navigation
**Agents:** Performance
**Files:** `StoryListRow.tsx`, `ConvergenceGauge.tsx`
**Fix:** Add `memo()` to StoryListRow, ConvergenceGauge, SidebarLink. Fix unstable onClick references.

### 23. CommandPalette (cmdk + fuse.js, 40KB) loaded on every page
**Agents:** Performance
**File:** `app/components/shell/AppShell.tsx`
**Fix:** `lazy(() => import('./CommandPalette'))` with Suspense.

### 24. Home loader fetches 200 stories with full includes
**Agents:** Performance
**File:** `app/routes/home.tsx`
**Fix:** Reduce to 50, select only needed fields, add DB indexes.

### 25. Stories analyzed once, never re-analyzed when new articles arrive
**Agents:** Systems Thinker, Inversion, Data Engineer
**File:** `app/routes/api.analyze.ts`
**Fix:** Clear `lastAnalyzedAt` when engine assigns new articles to existing story.

### 26. OFFSET pagination will degrade at scale
**Agents:** Database Optimizer
**File:** `app/routes/api.stories.ts:43`
**Fix:** Switch to cursor-based pagination.

### 27. Google Fonts render-blocking
**Agents:** Performance
**File:** `app/root.tsx`
**Fix:** Self-host via `@fontsource` packages. Saves 100-300ms LCP.

### 28. Remove dead dependency `react-resizable-panels`
**Agents:** Performance
**File:** `package.json`
**Fix:** `npm uninstall react-resizable-panels`

### 29. Add CASCADE deletes on claims, claim_sources, primary_docs
**Agents:** Database Optimizer
**File:** `prisma/schema.prisma`
**Fix:** Add `onDelete: Cascade` to Claim.story, ClaimSource.claim, ClaimSource.article, PrimaryDoc.story.

### 30. Add per-source health tracking
**Agents:** Data Engineer, Inversion
**Fix:** Add `Source.lastFetchedAt` and `Source.consecutiveFailures`. Auto-deactivate after 20 failures.

---

## P3 — Strategic / Longer-Term

### 31. Headlines-only extraction is fundamentally limited
**Agents:** First Principles, Systems Thinker, LLM Architect, Assumption Auditor
**Fix:** Persist `contentSnippet` from RSS (already fetched, currently discarded). Feed snippets into entity extraction and claim extraction. This is the single highest-ROI quality improvement.

### 32. Wire service laundering inflates convergence scores
**Agents:** First Principles, Systems Thinker
**Fix:** Add `sourceType` field (WIRE_SERVICE, ORIGINAL_REPORTING, AGGREGATOR). Count wire-derived articles as single source in convergence math.

### 33. Jaccard token comparison for Round Table is meaningless on JSON output
**Agents:** LLM Architect, Assumption Auditor
**Fix:** Replace with structured claim-set comparison (compare parsed claim objects, not raw tokens).

### 34. Entity dictionary is hand-curated, US/Western-centric, ~300 entries
**Agents:** Red Teamer, Systems Thinker, Inversion, Assumption Auditor, Data Engineer
**Fix:** Short-term: expand with transliterated non-English entities. Long-term: add dynamic entity discovery from frequent proper nouns.

### 35. Trust signal hierarchy conflates source diversity with evidence quality
**Agents:** First Principles
**Fix:** Decompose into two scores: `sourceConfidence` (source count/diversity) and `evidenceQuality` (evidence type).

### 36. No data retention / archival policy
**Agents:** Database Optimizer, Data Engineer, Inversion
**Fix:** Add nightly cleanup: archive stories >90 days, delete unclustered articles >7 days.

### 37. Zero market validation on pricing
**Agents:** Devil's Advocate, Assumption Auditor
**Fix:** Landing page test with $50-100 ad spend before launch. Survey 20 news consumers.

### 38. Convergence formula weights are arbitrary (no empirical basis)
**Agents:** First Principles, Assumption Auditor
**Fix:** Treat bonuses (0.15, 0.1, 0.1) as tunable hyperparameters. Calibrate against labeled test cases. Document rationale.

---

## Quick Wins (< 30 min each)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 9 | Set `temperature: 0.1` on all AI calls | 5 min | Reduces hallucination |
| 17 | Change claim prompt to "3-12 total" + add grounding instruction | 5 min | Reduces hallucination |
| 18 | Singleton Anthropic client | 10 min | Latency improvement |
| 11 | `timingSafeEqual` for cron secrets | 10 min | Security hardening |
| 22 | `memo(StoryListRow)` | 5 min | Major re-render reduction |
| 28 | Remove dead `react-resizable-panels` | 2 min | Bundle hygiene |
| 16 | Fix Prisma singleton for production | 5 min | Prevents connection exhaustion |
| 27 | Add font preload hints | 5 min | -200ms LCP |

---

## Consensus Findings (flagged by 3+ agents)

| Finding | Agents |
|---------|--------|
| AI hallucination with no grounding check | Red Team, First Principles, Inversion, LLM, Assumptions (5) |
| No rate limiting anywhere | Red Team, Inversion, Security, Data Engineer (4) |
| Failed analysis permanently stamps stories as done | Red Team, Systems, Inversion, Data Engineer (4) |
| Headlines-only is insufficient data for claims | First Principles, Systems, LLM, Assumptions (4) |
| SQL injection via $queryRawUnsafe | Red Team, Inversion, Security, Database (4) |
| AI cost spiral with no budget cap | Red Team, Systems, Inversion (3) |
| Entity dictionary will not scale globally | Red Team, Inversion, Assumptions, Data Engineer (4) |
| Stories never re-analyzed when new articles arrive | Systems, Inversion, Data Engineer (3) |
| Sequential ingestion will timeout | Data Engineer, Assumptions (2+) |
| Convergence formula weights are arbitrary | First Principles, Assumptions (2+) |

---

## Agent Agreement Matrix

All 11 agents were asked independently. No agent saw another's findings.
The convergence of their findings IS the signal — just like Triangulate itself.

**Strongest consensus (every operational agent flagged):**
> The pipeline marks failed stories as permanently analyzed. This is silent, irreversible data loss.

**Second strongest:**
> AI claim extraction from headlines has no grounding validation. Hallucinated claims will get convergence scores.

**Third strongest:**
> Zero rate limiting on a product that sends emails and makes AI API calls.

These three items should be fixed before any user touches the product.
