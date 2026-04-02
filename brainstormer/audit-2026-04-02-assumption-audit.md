# Crucible Assumption Audit — 2026-04-02

> 47 implicit assumptions identified across 6 pipeline layers.
> 12 load-bearing. 11 of 12 load-bearing assumptions scored below 5/10 evidence.
> 3 existential assumptions with zero empirical validation.

## Summary

| Layer | Assumptions | Load-Bearing | Critical Findings |
|-------|------------|-------------|-------------------|
| Data Ingestion | 10 | 2 | RSS fragility, snippet quality unknown |
| Entity Extraction | 9 | 2 | Dictionary gaps outside US politics |
| AI Claim Extraction | 9 | 3 | JSON reliability, extraction consistency |
| Convergence Scoring | 9 | 3 | Core philosophical assumption untested |
| Trust Signals / Business | 6 | 3 | Zero user research on willingness to pay |
| Operations / Scaling | 4 | 0 | Auto-deactivation could erode source roster |

## Top 5 Risks

1. **#29: Ideological distance = information independence** (Score: 3/10, EXISTENTIAL)
   - The foundational premise. If outlets agree because they share wire copy, convergence measures nothing.
   - Falsification: Manually trace 20 high-convergence stories to primary sources. 4 hours.

2. **#39: Users value convergence over fact-checking** (Score: 1/10, EXISTENTIAL)
   - Zero user research validates the core product thesis.
   - Falsification: Show 10 people a mockup, ask willingness to pay. 2 hours.

3. **#11: Entity dictionary covers global events** (Score: 3/10, STRUCTURAL)
   - Dictionary is US-heavy. Non-US events fail to cluster.
   - Falsification: Run extractEntities on 50 non-US headlines, measure coverage. 1 hour.

4. **#35: Wire service filtering prevents syndication inflation** (Score: 3/10, STRUCTURAL)
   - Only AP and Reuters flagged. AFP, UPI, Xinhua, TASS not flagged.
   - Falsification: Check 10 high-convergence stories for wire copies. 2 hours.

5. **#2: RSS snippets provide enough text** (Score: 3/10, STRUCTURAL)
   - Unknown % of feeds return useful snippets. Many return only teasers.
   - Falsification: Query DB after 7 days: % of articles with snippet > 100 chars. 1 query.

## Bugs Found

1. ~~countFactor computed but never applied~~ **FIXED this session**
2. **classifyTopic uses wrong task key** (`claim_extraction` -> `topic_classification`) **FIXED this session**
3. `as any` casts in api.analyze.ts for contentSnippet/isWireService — **Known, acceptable** (Prisma type sync)

## Falsification Plan

All tests are cheap (<1 week, <$50):
- #29: Manual trace of 20 stories (4 hours)
- #39: 10-person mockup test (2 hours)
- #1: Run pipeline for 7 days, track feed success rates
- #2: SQL query on snippet quality after 7 days
- #11: Entity extraction on 50 non-US headlines (1 hour)
- #35: Manual wire copy check on 10 stories (2 hours)

Full audit details in agent output file.
