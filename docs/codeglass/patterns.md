# Pattern Registry

> Append-only catalog of anti-patterns detected and resolved in this codebase.
> CodeGlass references this during comprehension and code review.

## Format

Each entry:
```
### [Pattern Name]
- **First seen:** [date]
- **Occurrences:** [count]
- **Severity:** P0 | P1 | P2 | P3
- **Detection signature:** [what to grep/look for]
- **Resolution:** [how it was fixed]
- **Files affected:** [list]
```

## Registry

### Dead Computed Value (Computed-But-Not-Used)
- **First seen:** 2026-04-02
- **Occurrences:** 2
- **Severity:** P1
- **Detection signature:** Variable assigned from computation, never read before scope exit
- **Resolution:** `countFactor` in convergence.ts was computed but never multiplied into `score` — real bug affecting convergence scores. `ranked` in engine.ts was computed via `rankClusters()` but discarded — wasted computation. Fix: apply the value or remove the dead code.
- **Files affected:** app/lib/convergence.ts, app/lib/engine.ts

### Server Import Bypass (prisma without .server suffix)
- **First seen:** 2026-04-02
- **Occurrences:** 2
- **Severity:** P1
- **Detection signature:** `import.*from.*prisma` without `.server` in app/lib/ files
- **Resolution:** React Router v7 uses `.server.ts` suffix to fence server-only modules from client bundling. Importing from `./prisma` instead of `./prisma.server` works today (called only from server routes) but will break if the module is ever imported from a client component. Fix: always use `.server` suffix.
- **Files affected:** app/lib/engine.ts, app/lib/source-stats.ts

### Silent Error State (Error Set But Never Displayed)
- **First seen:** 2026-04-02
- **Occurrences:** 1
- **Severity:** P2
- **Detection signature:** `useState<string | null>(null)` where setter is called but state is never rendered
- **Resolution:** pricing.tsx had `setCheckoutError()` called in 3 places but `checkoutError` was never shown in JSX. Users would see no feedback on checkout failures. Fix: add error banner to UI.
- **Files affected:** app/routes/pricing.tsx
