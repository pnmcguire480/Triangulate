# CodeGlass — Rules File

This file grows over time. Every rule represents a lesson learned from broken code,
a successful fix, or a pattern that prevents repeated failures.

Claude reads this file before generating any code. Every rule here is a constraint
that prevents known mistakes from happening again.

Rules are added by the human after CodeGlass walkthroughs surface them.
Never delete rules — the value is in the accumulation.

---

## How Rules Work

1. Claude generates code → the eval harness runs → the CodeGlass walkthrough explains the result
2. If something broke (or almost broke), a rule gets proposed
3. Patrick reviews the proposed rule and decides whether to add it here
4. On every future code generation, Claude reads this file first and follows every rule

---

## Format

Each rule follows this structure:
- **Rule name** (short, searchable)
- **Do this:** the correct pattern
- **Don't do this:** the incorrect pattern
- **Why:** what breaks if you ignore this
- **Stack:** which part of the stack this applies to
- **Source:** which project/task surfaced this
- **Date added**

---

## Rules

### Rule: Guard Watch Returns
- **Do this:** Always guard `form.watch()` return values with `Array.isArray()` before iterating or spreading
- **Don't do this:** Cast with `as string[]` — silences TypeScript but crashes in production
- **Why:** `form.watch("some.path")` can return `undefined`, a proxy object, or unexpected types — especially in production builds where React Hook Form internals behave differently than dev mode. Caused `TypeError: e is not iterable` in IntakeForms production wizard.
- **Stack:** React, React Hook Form
- **Source:** IntakeForms — wizard production crash
- **Date:** 2026-03-22

### Rule: CI Prisma Generate
- **Do this:** Always run `prisma generate` before `next build` in CI/CD build scripts: `"build": "prisma generate && next build"`
- **Don't do this:** Assume `@prisma/client` exists in CI — the generated client is gitignored
- **Why:** CI environments start from a clean checkout. Without the generate step, TypeScript fails with `Module '"@prisma/client"' has no exported member 'PrismaClient'`
- **Stack:** Prisma, Next.js, Vercel
- **Source:** IntakeForms — Vercel deploy failure
- **Date:** 2026-03-22

### Rule: Dynamic Schema Generation
- **Do this:** Generate Zod schemas from typed field definitions at runtime rather than hand-writing per-form schemas
- **Don't do this:** Write separate `z.object()` schemas that duplicate field definitions — they diverge over time
- **Why:** Single source of truth — add a field to a group definition and both UI rendering and validation update automatically. Hand-written schemas diverge from field definitions, causing fields that render without validation or validation rules that reference nonexistent fields.
- **Stack:** React, Zod, TypeScript
- **Source:** IntakeForms — wizard field library
- **Date:** 2026-03-22

### Rule: Step-Skipping Wizard
- **Do this:** When a wizard step has zero groups to display, skip it in both forward and backward navigation
- **Don't do this:** Let users land on blank wizard pages when conditional logic returns no content
- **Why:** Prevents empty-step UX when a rule engine or conditional logic returns no content for a step. Users should never land on a blank page and wonder if something broke.
- **Stack:** React, React Hook Form
- **Source:** IntakeForms — wizard conditional steps
- **Date:** 2026-03-22

### Rule: No Service Role Key in Client Code
- **Do this:** Keep `SUPABASE_SERVICE_ROLE_KEY` in server-side code only (Edge Functions, API routes, scripts)
- **Don't do this:** Import or reference service role keys anywhere in `src/` client-facing code
- **Why:** The service role key bypasses all RLS policies. If it leaks to the browser via a bundle, any user can read/write/delete any row in any table. This is the #1 Supabase security mistake.
- **Stack:** Supabase
- **Source:** PALADIN quality/references/supabase.md
- **Date:** 2026-03-23

### Rule: RLS on Every Public Table
- **Do this:** Enable Row Level Security on every table in the `public` schema and add at least one policy per table
- **Don't do this:** Leave tables without RLS — they're readable/writable by any authenticated (or anon) user
- **Why:** Supabase exposes every `public` table through the PostgREST API. Without RLS, the anon key grants full access. A missing policy is an open database.
- **Stack:** Supabase
- **Source:** PALADIN quality/references/supabase.md
- **Date:** 2026-03-23

### Rule: Document All Env Vars in .env.example
- **Do this:** Maintain a `.env.example` with every env var the app references, with placeholder values and comments
- **Don't do this:** Let env vars accumulate in code without documentation — new developers and CI pipelines break silently
- **Why:** `process.env.MISSING_VAR` returns `undefined` at runtime, not a build error. An `.env.example` is the only reliable way to catch missing config before deployment.
- **Stack:** Universal
- **Source:** PALADIN quality/references/universal.md
- **Date:** 2026-03-23

### Rule: No Console Statements in Production Code
- **Do this:** Remove `console.log`, `console.warn`, `console.debug` from production source files. Use a structured logger if logging is needed.
- **Don't do this:** Leave debug logging in shipped code — it leaks internal state to browser devtools and clutters output
- **Why:** Console statements in production expose implementation details to users, slow rendering in tight loops, and make real errors harder to spot in noisy output.
- **Stack:** JavaScript, TypeScript
- **Source:** PALADIN quality/references/universal.md
- **Date:** 2026-03-23

### Rule: Always Check .gitignore for Secrets Files
- **Do this:** Verify `.env`, `.env.local`, `.env.production`, and any `*secret*` files are in `.gitignore` before first commit
- **Don't do this:** Commit env files and try to remove them later — git history preserves them forever
- **Why:** Once a secret hits git history, it requires a full history rewrite (BFG or filter-branch) plus rotating every exposed credential. Prevention is 100x cheaper than cleanup.
- **Stack:** Universal
- **Source:** PALADIN quality/references/universal.md
- **Date:** 2026-03-23

### Rule: Regenerate Supabase Types After Schema Changes
- **Do this:** Run `supabase gen types typescript` after every migration and commit the updated types file
- **Don't do this:** Modify the database schema without regenerating types — TypeScript won't catch column mismatches
- **Why:** Stale types let you write code that references renamed/removed columns. It compiles fine but crashes at runtime with "column does not exist" errors.
- **Stack:** Supabase, TypeScript
- **Source:** PALADIN quality/references/supabase.md
- **Date:** 2026-03-23

### Rule: Images Must Have Alt Attributes
- **Do this:** Every `<img>` tag must have an `alt` attribute. Decorative images get `alt=""`. Meaningful images get descriptive text.
- **Don't do this:** Omit `alt` — screen readers announce the filename or URL, which is useless
- **Why:** WCAG 2.1 Level A requirement. Breaks accessibility for visually impaired users and fails automated a11y audits (pa11y, axe-core).
- **Stack:** HTML, React, JSX
- **Source:** PALADIN quality/references/universal.md
- **Date:** 2026-03-23

### Rule: Async Functions Need Error Boundaries
- **Do this:** Wrap async operations in try/catch or attach `.catch()` handlers. In React, pair with error boundaries for component-level recovery.
- **Don't do this:** Fire async calls without handling rejection — unhandled promise rejections crash Node and silently fail in browsers
- **Why:** An unhandled rejection in a `useEffect` fetch call shows users a blank screen with no error message. The Loading/Error/Data triad exists specifically to handle this.
- **Stack:** JavaScript, TypeScript, React
- **Source:** PALADIN quality/references/universal.md
- **Date:** 2026-03-23

### Rule: Test Before Ship
- **Do this:** Run full test suite before pushing to main
- **Don't do this:** Push and let CI catch failures
- **Why:** CI failures block the whole team; local runs catch your mistakes
- **Stack:** Universal
- **Source:** template:universal
- **Date:** 2026-03-24
- **Confidence:** high
- **Hits:** 0
- **Misses:** 0
- **Last fired:** never

### Rule: Atomic Commits
- **Do this:** Each commit does one logical thing
- **Don't do this:** Bundle unrelated changes in a single commit
- **Why:** Mixed commits make bisect useless and reverts dangerous
- **Stack:** Universal
- **Source:** template:universal
- **Date:** 2026-03-24
- **Confidence:** high
- **Hits:** 0
- **Misses:** 0
- **Last fired:** never

### Rule: Review Your Own Diff
- **Do this:** Read your own diff before requesting review
- **Don't do this:** Submit PRs without self-review
- **Why:** Self-review catches 50% of issues before bothering teammates
- **Stack:** Universal
- **Source:** template:universal
- **Date:** 2026-03-24
- **Confidence:** high
- **Hits:** 0
- **Misses:** 0
- **Last fired:** never
