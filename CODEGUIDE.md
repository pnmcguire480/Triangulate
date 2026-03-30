# CODEGUIDE.md — Code Conventions and Standards

> 📌 **UPDATE FREQUENCY: SET ONCE, REVISIT RARELY**
> Establish these conventions during project setup and enforce them consistently. Update only when the team agrees to change a convention. AI agents should check this file before writing any code.
>
> **Depends on:** ARCHITECTURE.md (tech stack determines which conventions apply)
> **Feeds into:** All code written by any agent at any tier

---

## Language and Runtime

- **Primary Language:**
- **Language Version / Standard:**
- **Runtime:**
- **Strict Mode:** [ ] Yes [ ] No

---

## File and Folder Conventions

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Folders | | `components/`, `user-profile/` |
| Component files | | `UserProfile.tsx`, `user-profile.tsx` |
| Utility files | | `formatDate.ts`, `format-date.ts` |
| Type/Interface files | | `types.ts`, `user.types.ts` |
| Test files | | `UserProfile.test.tsx` |
| Style files | | `UserProfile.module.css` |
| Constants | | `ROUTES.ts`, `constants.ts` |
| Config files | | `biome.json`, `tsconfig.json` |

### Where Things Go

| Type of Code | Location | Notes |
|-------------|----------|-------|
| Page / Route components | | |
| Reusable UI components | | |
| Business logic / services | | |
| Custom hooks | | |
| Type definitions | | |
| Utility functions | | |
| Constants and config | | |
| API route handlers | | |
| Database queries / models | | |
| Tests | | |
| Static assets | | |

### Import Order

<!-- Define the order for import statements. Consistency here prevents messy diffs. -->

```
1.
2.
3.
4.
5.
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | | `userName`, `isLoading` |
| Functions | | `getUserById()`, `formatPrice()` |
| Components | | `UserProfile`, `NavBar` |
| Constants | | `MAX_RETRIES`, `API_BASE_URL` |
| Types / Interfaces | | `User`, `ApiResponse` |
| Enums | | `UserRole`, `OrderStatus` |
| CSS classes | | Tailwind utilities / BEM / module |
| Database tables | | `users`, `order_items` |
| Database columns | | `created_at`, `userId` |
| API routes | | `/api/users`, `/api/orders/:id` |
| Environment variables | | `DATABASE_URL`, `NEXT_PUBLIC_API` |
| Git branches | | `feat/user-auth`, `fix/login-bug` |

---

## Code Style Rules

### General

- **Max line length:**
- **Indentation:** <!-- spaces or tabs, how many -->
- **Trailing commas:** <!-- always, never, ES5 -->
- **Semicolons:** <!-- always, never, ASI -->
- **Quotes:** <!-- single, double, template literals when interpolating -->
- **Bracket style:** <!-- same line, new line -->

### Functions

- **Prefer:** <!-- arrow functions, function declarations, or context-dependent -->
- **Max parameters:** <!-- before extracting to an options object -->
- **Return type annotations:** <!-- always, only for exports, never -->
- **Error handling:** <!-- try/catch, Result type, error boundaries -->

### Components (if applicable)

- **Component style:** <!-- functional only, class allowed, etc. -->
- **Props:** <!-- interface vs type, destructured vs props object -->
- **State management:** <!-- useState, useReducer, Zustand, context rules -->
- **Event handlers:** <!-- naming: handleClick, onClick, on* vs handle* -->

### Types (if TypeScript)

- **Prefer:** <!-- interface vs type — when to use which -->
- **Strict null checks:** [ ] Yes [ ] No
- **`any` usage:** <!-- forbidden, discouraged, allowed in specific cases -->
- **Enums vs union types:**

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
- Document public APIs and exported functions
- Reference ticket/issue numbers when relevant

**Don't:**
- Comment obvious code (`// increment counter` above `count++`)
- Leave commented-out code in production (delete it, git has history)
- Write novels — if you need a paragraph, the code is too complex

---

## Error Handling

- **Strategy:** <!-- try/catch everywhere? Error boundaries? Result types? -->
- **User-facing errors:** <!-- How to display errors to users -->
- **Logging:** <!-- Console.log? Structured logging? External service? -->
- **Sensitive data in errors:** <!-- Never include PII, tokens, or internal details -->

### Error Message Format

```
// Good: actionable, user-friendly
"Unable to save your changes. Please try again."

// Bad: technical, scary
"Error: ECONNREFUSED 127.0.0.1:5432"
```

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

[optional footer]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`

**Examples:**
```
feat(auth): add magic link login
fix(api): handle null response from weather endpoint
docs(readme): update deployment instructions
refactor(utils): extract date formatting to shared module
```

### Commit Discipline

- One logical change per commit
- Never commit broken code to main
- Never commit sensitive data (env vars, keys, tokens)
- Write commits so `git log --oneline` tells a readable story

### Pull Request / Review

- **PR title format:**
- **Description template:**
- **Required before merge:**
  - [ ] Tests pass
  - [ ] Linter clean
  - [ ] CLAUDE.md updated (if state changed)
  - [ ] ARCHITECTURE.md updated (if arch changed)

---

## Testing Standards

- **Framework:**
- **Coverage target:**
- **Test file location:**
- **Test naming:** `describe("[Component/Function]", () => { it("should [behavior]", ...) })`

### What to Test

- Public API / exported functions — always
- User-facing interactions — always
- Edge cases from SCENARIOS.md — always
- Private utilities — only if complex

### What NOT to Test

- Implementation details (test behavior, not structure)
- Third-party library internals
- Anything in SNIFFTEST.md (that's manual, human-only testing)

---

## Dependency Rules

- **Before adding a dependency:** Is there a built-in or existing solution?
- **Max acceptable bundle impact:**
- **Prefer:** <!-- Specific packages, e.g., "date-fns over moment" -->
- **Avoid:** <!-- Known problematic packages -->
- **Audit schedule:** <!-- Weekly? Before deploy? -->

---

## Patterns to Follow

<!-- Project-specific patterns that all code should follow. Add examples. -->

### Pattern: [Name]

**When to use:**
**Example:**
```
// code example
```

---

## Anti-Patterns to Avoid

<!-- Things that have caused problems in this project or that the team has decided to avoid. -->

### Anti-Pattern: [Name]

**Why it's bad:**
**Do this instead:**
```
// better approach
```

---

## Linter / Formatter Configuration

- **Tool:**
- **Config file:**
- **Run on save:** [ ] Yes [ ] No
- **Run in CI:** [ ] Yes [ ] No
- **Command:**

---

## Environment Setup

<!-- Steps for a new developer (or a new AI agent in a new session) to get the project running locally. -->

1.
2.
3.
4.
