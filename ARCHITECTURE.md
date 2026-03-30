# ARCHITECTURE.md — System Design and Technical Stack

> 🔄 **UPDATE FREQUENCY: EVERY ARCHITECTURAL CHANGE**
> This file is the technical blueprint. Update it when: the tech stack changes, new services are added, the data model evolves, deployment changes, or any architectural decision is made. If an AI agent writes code that contradicts this file, this file wins.
>
> **Depends on:** SPEC.md (what to build), CONTEXT.md (constraints and domain)
> **Feeds into:** CODEGUIDE.md (implementation patterns), AGENTS.md (tier capabilities)

---

## Tech Stack

<!-- Finalize during the planning session. Every choice should have a rationale — "because it's popular" is not a rationale. Think: why THIS over the alternatives, for THIS project? -->

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | | |
| **Framework** | | |
| **Language** | | |
| **Styling** | | |
| **Database** | | |
| **ORM / Query** | | |
| **Auth** | | |
| **Storage** | | |
| **Hosting** | | |
| **CDN** | | |
| **AI / ML** | | |
| **APIs** | | |
| **Realtime** | | |
| **Dev Tools** | | |
| **Package Manager** | | |
| **Linter / Formatter** | | |
| **Testing** | | |
| **CI / CD** | | |
| **Monitoring** | | |

---

## Architecture Overview

<!-- High-level description of how the system fits together. Write it so someone could sketch the system on a whiteboard from this section alone. -->

<!-- Include an ASCII or text diagram: -->

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  [ DIAGRAM HERE ]                     │
│                                                      │
│  Describe the major components and how data flows    │
│  between them.                                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

-
-

---

## Directory Structure

<!-- The project's file/folder layout. Update this as the structure evolves. AI agents reference this to know where to put new files. -->

```
project-root/
├── CLAUDE.md
├── SPEC.md
├── SCENARIOS.md
├── ARCHITECTURE.md
├── AGENTS.md
├── CODEGUIDE.md
├── ART.md
├── CONTEXT.md
├── SNIFFTEST.md
├── README.md
├── src/
│   ├── components/
│   ├── pages/ (or app/)
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   ├── types/
│   └── utils/
├── public/
├── prisma/ (or supabase/)
├── tests/
├── .env.local
├── .env.example
├── package.json
├── biome.json
└── tsconfig.json
```

**Naming conventions:**
- Folders:
- Files:
- Components:

---

## Data Model

### Entities

<!-- Every data type the system manages. This should mirror the database schema. -->

| Entity | Purpose | Key Fields | Indexes |
|--------|---------|-----------|---------|
|        |         |           |         |

### Relationships

<!-- How entities connect. Foreign keys, join tables, polymorphic associations. -->

```
Entity A ──< has many >── Entity B
Entity B ──< belongs to >── Entity A
Entity C ──< many-to-many >── Entity D (via join table E)
```

### Row-Level Security / Access Control

<!-- Who can read, write, update, delete each entity? Critical for multi-user and multi-tenant systems. -->

| Entity | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
|        |      |        |        |        |

### Migrations

- **Migration tool:**
- **Migration naming:**
- **Rollback strategy:**

---

## API Design

### Internal Routes

<!-- API routes the frontend calls. Group by resource. -->

| Method | Route | Purpose | Auth | Request Body | Response |
|--------|-------|---------|------|-------------|----------|
|        |       |         |      |             |          |

### External Integrations

<!-- Third-party APIs the system calls. -->

| Service | Purpose | Auth Method | Rate Limits | Fallback |
|---------|---------|-------------|-------------|----------|
|         |         |             |             |          |

### Webhook Endpoints

<!-- Incoming webhooks from external services. -->

| Source | Endpoint | Purpose | Validation |
|--------|----------|---------|-----------|
|        |          |         |           |

---

## Authentication and Authorization

- **Provider:**
- **Strategy:** <!-- JWT, session, OAuth, magic link, API key, none -->
- **Session duration:**
- **Refresh mechanism:**
- **Roles / permissions:**

| Role | Can Access | Can Modify | Can Delete | Can Admin |
|------|-----------|-----------|-----------|-----------|
|      |           |           |           |           |

- **Protected routes:**
- **Public routes:**

---

## State Management

<!-- How the application tracks and manages state at every layer. -->

| State Type | Technology | What It Holds | Scope |
|-----------|-----------|---------------|-------|
| **Client UI** | | | Per-component |
| **Client Global** | | | App-wide |
| **Server Cache** | | | Per-session |
| **Persistent** | | | Per-user |
| **Realtime** | | | Multi-user |

---

## Deployment Pipeline

| Stage | Tool | Trigger | Notes |
|-------|------|---------|-------|
| Lint | | | |
| Test | | | |
| Build | | | |
| Preview | | | |
| Deploy | | | |
| Monitor | | | |

### Environment Variables

<!-- List all required env vars (NEVER the values). AI agents need to know what exists. -->

| Variable | Purpose | Required | Where Set |
|----------|---------|----------|-----------|
|          |         |          |           |

### Environments

| Environment | URL | Branch | Purpose |
|------------|-----|--------|---------|
| Local | localhost:XXXX | any | Development |
| Preview | | PR branches | Review |
| Production | | main | Live |

---

## Performance Targets

| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| First Contentful Paint | < 1.5s | | Lighthouse |
| Largest Contentful Paint | < 2.5s | | Lighthouse |
| Time to Interactive | < 3.5s | | Lighthouse |
| Cumulative Layout Shift | < 0.1 | | Lighthouse |
| Bundle Size (JS) | < 200KB | | build output |
| Lighthouse Score | > 90 | | Lighthouse |
| API Response (p95) | < 500ms | | monitoring |

---

## Security Checklist

- [ ] Input sanitization on all user-facing forms
- [ ] CORS configured (allow only known origins)
- [ ] Rate limiting on auth and API routes
- [ ] Environment variables — no secrets in code or git
- [ ] Dependency audit clean (npm audit / equivalent)
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced
- [ ] SQL injection prevention (parameterized queries / ORM)
- [ ] XSS prevention (output encoding, CSP)
- [ ] File upload validation (type, size, content)
- [ ] Error messages don't leak internal details

---

## Scalability Notes

<!-- Where does the system break first if usage grows 10x? 100x? What would you change? Not urgent — but think about it. -->

**Bottlenecks:**
-

**Scaling strategy:**
-

---

## Technical Debt Tracker

<!-- Known shortcuts, hacks, or "fix later" items. Be honest. Debt you track is debt you can repay. Debt you ignore compounds. -->

| Item | Severity | Location | Added | Notes |
|------|----------|----------|-------|-------|
|      | Low/Med/High |    |       |       |

---

## Decision Log

<!-- WHY were technical choices made? Future-you (and future AI agents) will thank you. A decision without rationale is a decision that gets accidentally reversed. -->

| Date | Decision | Alternatives Considered | Rationale | Decided By |
|------|----------|------------------------|-----------|-----------|
|      |          |                        |           |           |
