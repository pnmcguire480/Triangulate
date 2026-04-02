# CodeGlass Walkthrough: BrainStormer Health Check

**Date:** 2026-04-02
**Depth:** Level 3 (Deep Glass)
**Scope:** Full quality audit, comprehension scan, governance drift, test gaps

---

## WHAT

Full-project health check using BrainStormer's quality (Paladin) and comprehension (CodeGlass) sub-skills. Found and fixed 2 bugs, 1 dead code path, 2 server import risks, 1 missing UI error state. Added 28 new tests. Installed ESLint. Committed prior session's uncommitted work.

## HOW

1. **Eval harness (Tier 1):** Build, lint, typecheck, tests
   - Build: PASS (client 2217 modules, server 93 modules)
   - Lint: FAIL -> installed eslint + typescript-eslint, configured flat config
   - TypeScript: PASS (0 errors)
   - Tests: PASS (90/90 at start, 118/118 by end)

2. **Lint audit found 37 problems (2 errors, 35 warnings)**
   - Fixed all 2 errors (useless-assignment in comparisons.ts, api.search.ts)
   - Fixed 15 warnings (unused vars/imports across 7 files)
   - Remaining 22 warnings are all `no-explicit-any` in AI pipeline + Stripe webhook code (acceptable)

3. **Comprehension scan found 3 patterns:**
   - Dead Computed Value: countFactor (real bug) + ranked (dead code)
   - Server Import Bypass: prisma without .server suffix
   - Silent Error State: checkout error never displayed

4. **Test gap fill:**
   - Entity extraction: 15 tests (dictionary, types, numbers, quotes, edge cases)
   - Convergence countFactor: 2 tests (penalty behavior verification)
   - Comparisons: 5 tests (zero scores, boundaries, topic in narrative)
   - Ingest classifyUrl: 6 tests (opinion paths, case sensitivity, invalid URLs)

## WHERE

| File | Change | Why |
|------|--------|-----|
| `eslint.config.js` | NEW | ESLint flat config for TypeScript + React |
| `app/lib/convergence.ts:164` | Bug fix | `countFactor` now applied to score |
| `app/lib/engine.ts:389` | Dead code removal | `rankClusters()` result was unused |
| `app/lib/engine.ts:12` | Import fix | `./prisma` -> `./prisma.server` |
| `app/lib/source-stats.ts:6` | Import fix | `./prisma` -> `./prisma.server` |
| `app/routes/pricing.tsx:143` | Bug fix | Added error banner for checkout failures |
| `app/lib/__tests__/entities.test.ts` | NEW | 15 entity extraction tests |
| `app/lib/__tests__/ingest-utils.test.ts` | NEW | 6 URL classification tests |
| `docs/codeglass/patterns.md` | Updated | 3 new pattern registry entries |

## WHEN

- ESLint runs on `npm run lint` (part of eval harness)
- Tests run on `npm test` (vitest run)
- countFactor applies every time `calculateConvergenceScore()` is called (analysis pipeline)
- Error banner shows when Stripe checkout fails (user-facing, immediate)

## WHY

**countFactor bug:** The convergence algorithm computes a "source count factor" that penalizes claims confirmed by fewer sources (0.7x for 2 sources, up to 1.0x for 5+). This was computed as a variable but never multiplied into the score. Result: a claim confirmed by only 2 sources got the same credit as one confirmed by 10. This fundamentally undermines the trust signal hierarchy — CONVERGED status requires >= 0.7 convergence, and without the penalty, 2-source claims could reach that threshold too easily.

**Server import:** React Router v7's `.server.ts` convention is a hard boundary. Any module imported from a client component that transitively imports `@prisma/client` will fail at runtime (or worse, leak the DB client into the client bundle). The engine.ts and source-stats.ts files only run server-side today, but a future refactor importing them from a component would cause a cryptic build failure. The .server suffix prevents this structurally.

**ESLint setup:** The project had a `lint` script in package.json but no eslint dependency. This meant CI would fail silently. The flat config approach (eslint.config.js) is the modern standard and doesn't require the deprecated .eslintrc format.

---

## Proposed Rules

31. **Always apply computed values or delete them.** A variable that is assigned but never read is either a bug (value should be used) or dead code (computation should be removed). The countFactor bug shows the real cost: convergence scores were wrong for every 2-4 source claim.

32. **Always use `.server` suffix for server-only lib modules.** If a lib file imports `@prisma/client`, `crypto`, or any Node-only API, the file must use the `.server.ts` suffix. This is structural protection, not convention.

33. **Every `useState` setter must have a corresponding render.** If you call `setError(msg)` somewhere, there must be a `{error && <div>...}` somewhere in the JSX. Silent error state is worse than no error handling — it gives false confidence that errors are handled.
