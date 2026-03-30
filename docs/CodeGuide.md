# CODEGUIDE.md — Code Conventions and Standards

> **UPDATE FREQUENCY: SET ONCE, REVISIT RARELY**
> Establish these conventions during project setup and enforce them consistently. Update only when the team agrees to change a convention. AI agents should check this file before writing any code.
>
> **Depends on:** ARCHITECTURE.md (tech stack determines which conventions apply)
> **Feeds into:** All code written by any agent at any tier

---

## Language and Runtime

- **Primary Language:** TypeScript
- **Language Version / Standard:** ES2022+ / TypeScript 5.9
- **Runtime:** Node.js 18+
- **Strict Mode:** [x] Yes

---

## File and Folder Conventions

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Folders | kebab-case | `components/`, `story-view/` |
| Component files | PascalCase | `StoryCard.tsx`, `ConvergencePanel.tsx` |
| Utility files | camelCase | `formatDate.ts`, `clustering.ts` |
| Type/Interface files | camelCase | `types/index.ts` |
| Test files | PascalCase.test | `StoryCard.test.tsx` |
| Style files | N/A (Tailwind utilities) | — |
| Constants | camelCase | `constants.ts` |
| Config files | lowercase | `tsconfig.json`, `vite.config.ts` |

### Where Things Go

| Type of Code | Location | Notes |
|-------------|----------|-------|
| Page / Route components | `app/routes/` | React Router v7 file-based routing |
| Reusable UI components | `app/components/ui/` | Generic: Button, Card, Badge, Skeleton |
| Shell components | `app/components/shell/` | AppShell, TopBar, Sidebar, StatusBar |
| Panel components | `app/components/panels/` | PanelContainer, PanelResizer, DashboardLayout |
| Filter components | `app/components/filters/` | FilterSidebar, BiasSpectrumSelector |
| Wire components | `app/components/wire/` | StoryListRow, WirePanel |
| Lens components | `app/components/lens/` | LensPanel, SpectrumPanel, ClaimsPanel |
| Data visualization | `app/components/dataviz/` | ConvergenceGauge, BiasSpectrumBar, ClaimMatrix |
| Export components | `app/components/export/` | ExportDialog, ConvergenceCertificate |
| Shared components | `app/components/shared/` | Gate, UpgradeTeaser, ExplainerPopover |
| Feature components | `app/components/[feature]/` | Domain-specific: StoryCard, ClaimsTracker |
| Business logic / services | `app/lib/` | clustering.ts, convergence.ts, rss.ts |
| Custom hooks | `app/hooks/` | (future use) |
| Type definitions | `app/types/` | index.ts exports all types |
| Utility functions | `app/lib/` | Alongside business logic |
| Constants and config | `app/lib/constants.ts` | All configuration values |
| API route handlers | `app/routes/api.[route].ts` | React Router v7 flat file routing |
| Database queries / models | `app/lib/prisma.ts` + Prisma schema | Prisma client singleton |
| Tests | Co-located or `__tests__/` | Vitest |
| Static assets | `public/` | Images, fonts |

### Component Organization

```
app/components/
├── shell/        # App chrome: AppShell, TopBar, Sidebar, StatusBar
├── panels/       # Layout panels: PanelContainer, PanelResizer, DashboardLayout
├── filters/      # Filter UI: FilterSidebar, BiasSpectrumSelector
├── wire/         # News wire: StoryListRow, WirePanel
├── lens/         # Story lens: LensPanel, SpectrumPanel, ClaimsPanel
├── dataviz/      # Visualizations: ConvergenceGauge, BiasSpectrumBar, ClaimMatrix
├── export/       # Export: ExportDialog, ConvergenceCertificate
├── shared/       # Cross-cutting: Gate, UpgradeTeaser, ExplainerPopover
├── ui/           # Primitives: Button, Card, Badge, Skeleton
├── feed/         # Feed: FeedList, StoryCard, TopicFilter
├── story/        # Story detail: ConvergencePanel, ClaimsTracker
├── search/       # Search: SearchBar, SearchResults
└── layout/       # Legacy layout: Header, Footer
```

### Import Order

```
1. React / React Router imports
2. Third-party library imports
3. Internal lib/utils imports (~/lib/*)
4. Internal component imports (~/components/*)
5. Type imports
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | `userName`, `isLoading` |
| Functions | camelCase | `getUserById()`, `formatPrice()` |
| Components | PascalCase | `StoryCard`, `ConvergencePanel` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Types / Interfaces | PascalCase | `Story`, `ApiResponse` |
| Enums | PascalCase values | `BiasCategory.CENTER_LEFT` |
| CSS classes | Tailwind utilities | `className="flex items-center gap-2"` |
| Database tables | PascalCase (Prisma) | `Source`, `Article`, `ClaimSource` |
| Database columns | camelCase (Prisma) | `createdAt`, `sourceId`, `biasTier` |
| API routes | kebab-case | `/api/ingest`, `/api/webhooks/stripe` |
| Environment variables | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `CRON_SECRET` |
| Git branches | type/description | `feat/user-auth`, `fix/login-bug` |

---

## Code Style Rules

### General

- **Max line length:** 120 characters (soft limit)
- **Indentation:** 2 spaces
- **Trailing commas:** ES5 (arrays, objects)
- **Semicolons:** Always
- **Quotes:** Single quotes for JS/TS, double quotes for JSX attributes
- **Bracket style:** Same line (K&R style)

### Functions

- **Prefer:** Arrow functions for utilities, function declarations for components
- **Max parameters:** 3 before extracting to an options object
- **Return type annotations:** On exported functions
- **Error handling:** try/catch with structured logging

### Components

- **Component style:** Functional only (no class components)
- **Props:** Interface for complex, inline type for simple
- **State management:** React useState for local, server components where possible
- **Event handlers:** `handle*` naming convention (`handleClick`, `handleSubmit`)

### Component API Patterns

- **Composition over configuration:** Use compound components for complex UI (`Panel` > `Panel.Header` + `Panel.Body`)
- **Seven-prop maximum:** If a component exceeds 7 props, decompose it into smaller components or use compound patterns
- **Fixed vocabulary for common props:**
  - `variant` — visual style (e.g., `"default" | "outline" | "ghost"`)
  - `size` — dimensional scale (e.g., `"sm" | "md" | "lg"`)
  - `density` — spacing/compactness (e.g., `"compact" | "default" | "relaxed"`)
  - `as` — polymorphic element type (e.g., `as="button"`, `as="a"`)
- **Variant record pattern:** For components with 3+ variants, use a variant record instead of conditionals:

```tsx
const variantStyles: Record<Variant, string> = {
  default: 'bg-surface text-primary',
  outline: 'border border-border text-primary',
  ghost: 'text-muted hover:bg-surface',
  danger: 'bg-red-600 text-white',
};
```

### Types (TypeScript)

- **Prefer:** Interface for object shapes, type for unions/aliases
- **Strict null checks:** [x] Yes
- **`any` usage:** Forbidden (use `unknown` or proper types)
- **Enums vs union types:** Prisma enums in schema, TypeScript enums in types/index.ts

---

## Comment Standards

```
// Single-line: explain WHY, not WHAT. The code shows what. Comments show why.

// TODO: [description] — tracked, has a plan to resolve
// FIXME: [description] — broken, needs fixing before ship
// HACK: [description] — intentional shortcut, explain why and when to fix
// NOTE: [description] — important context that isn't obvious from the code
```

**Do:**
- Comment on non-obvious business logic
- Explain "why" when the code looks wrong but is intentional
- Reference ticket/issue numbers when relevant

**Don't:**
- Comment obvious code
- Leave commented-out code in production
- Write novels — if you need a paragraph, the code is too complex

---

## Error Handling

- **Strategy:** try/catch with structured error logging on API routes; React error boundaries for UI
- **User-facing errors:** Friendly messages, no technical details
- **Logging:** Structured JSON logs with event, context, and error fields
- **Sensitive data in errors:** Never include PII, tokens, or internal details

---

## Git Workflow

### Branch Strategy

- **Main branch:** `main` — always deployable
- **Feature branches:** `feat/[short-description]`
- **Bug fix branches:** `fix/[short-description]`
- **Hotfix branches:** `hotfix/[short-description]`

### Commit Message Format

```
type(scope): short description

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`

**Examples:**
```
feat(ingest): add RSS feed ingestion pipeline
fix(cluster): handle empty article list gracefully
docs(readme): update deployment instructions
```

### Commit Discipline

- One logical change per commit
- Never commit broken code to main
- Never commit sensitive data (env vars, keys, tokens)
- Write commits so `git log --oneline` tells a readable story

---

## Testing Standards

- **Framework:** Vitest 4 with vite-tsconfig-paths
- **Coverage target:** Meaningful coverage on convergence scoring and business logic
- **Test file location:** Co-located or `__tests__/`
- **Test naming:** `describe("[Component/Function]", () => { it("should [behavior]", ...) })`

### What to Test

- Convergence scoring logic — always
- API route handlers — always
- User-facing interactions — always
- Edge cases from SCENARIOS.md — always

### What NOT to Test

- Implementation details (test behavior, not structure)
- Third-party library internals
- Anything in SNIFFTEST.md (that's manual, human-only testing)

---

## Dependency Rules

- **Before adding a dependency:** Is there a built-in or existing solution?
- **Allowed dependencies:** rss-parser, @anthropic-ai/sdk, stripe, date-fns, clsx, lucide-react, tailwind-merge, cmdk, fuse.js, tinykeys, react-resizable-panels, sonner, zustand, @react-pdf/renderer, satori
- **Prefer:** date-fns over moment, native fetch over axios
- **Audit schedule:** Before each deploy

---

## Environment Setup

1. Clone the repository
2. `npm install`
3. Copy `.env` and fill in values
4. `npx prisma migrate dev` to apply database migrations
5. `npx prisma db seed` to seed 30+ news sources
6. `npm run dev` to start the development server
