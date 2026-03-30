# SPEC.md — Product Specification

> 🔄 **UPDATE FREQUENCY: EVERY FEATURE CHANGE**
> This is the single source of truth for WHAT the product does and WHO it's for. ARCHITECTURE.md covers HOW. Update this file every time a feature is added, changed, descoped, or reprioritized.
>
> **Depends on:** CONTEXT.md (for background), CLAUDE.md (for current state)
> **Feeds into:** ARCHITECTURE.md (technical implementation), SCENARIOS.md (user flows), SNIFFTEST.md (test cases)

---

## Product Overview

- **Name:**
- **Tagline:** <!-- One sentence that sells it to a stranger -->
- **Problem:** <!-- What specific pain does this solve? For whom? Be concrete. -->
- **Solution:** <!-- How does this product solve that pain? One paragraph max. -->
- **Core Value Proposition:** <!-- Why this and not the alternative? What's unique? -->

---

## Target Users

### Primary User

- **Who:** <!-- Be specific: "backyard beekeeper with 2-10 hives" not "beekeeper" -->
- **Context:** <!-- When, where, and why do they use this? -->
- **Technical Literacy:** <!-- Can they install an app? Use a CLI? Write code? -->
- **Current Workaround:** <!-- What do they do today without this product? -->
- **What They Care About:** <!-- Speed? Simplicity? Privacy? Cost? -->

### Secondary User(s)

| User Type | Context | What They Care About |
|-----------|---------|---------------------|
|           |         |                     |

### Anti-Users

<!-- Who is this NOT for? Being explicit prevents building the wrong features. -->

-
-

---

## User Stories

<!-- Format: As a [user type], I want [action] so that [benefit]. -->
<!-- Priority: P0 = MVP ship-blocker, P1 = important post-MVP, P2 = nice-to-have, P3 = future/maybe -->

### P0 — MVP (Must Have to Ship)

- [ ] *Frame:** The flagship positioning. When Fox News and MSNBC report the same fact, that's signal. When Al Jazeera and The Jerusalem Post converge, that's powerful.
- [ ] *Best for:** Launch messaging, homepage hero, social hooks, elevator pitch
- [ ] *Tone:** Confident, slightly provocative, non-partisan
- [ ] *Example headline:** "Fox News and MSNBC just agreed on something. Here's what."
- [ ] *Frame:** The problem angle. Ratings drive coverage. Credible outlets platform bad actors for engagement. Media consolidation means fewer independent voices.

### P1 — Important (Ship Soon After MVP)

- [ ] As a _____, I want _____ so that _____.
- [ ] As a _____, I want _____ so that _____.

### P2 — Nice-to-Have

- [ ] As a _____, I want _____ so that _____.

### P3 — Future / Stretch

- [ ] As a _____, I want _____ so that _____.

---

## Feature Map

<!-- Group features into buildable chunks. Each chunk is an independent unit of work that can be developed, tested, and shipped on its own. Order chunks by dependency: Chunk 1 has no dependencies, Chunk 2 may depend on Chunk 1, etc. -->

### Chunk 1 — [Name]

**Goal:** <!-- One sentence: what does this chunk accomplish? -->
**Priority:** P0 / P1 / P2 / P3
**Dependencies:** None / Chunk X
**Estimated Complexity:** [ ] Simple (hours) [ ] Medium (days) [ ] Complex (week+)
**Assigned Tier:** <!-- Which BabyTierOS tier handles most of this work? -->

**Features:**
- [ ]
- [ ]

**Acceptance Criteria:**
<!-- How do we know this chunk is DONE? Be specific and testable. -->
- [ ]
- [ ]

**Notes:**

---

### Chunk 2 — [Name]

**Goal:**
**Priority:** P0 / P1 / P2 / P3
**Dependencies:**
**Estimated Complexity:** [ ] Simple [ ] Medium [ ] Complex
**Assigned Tier:**

**Features:**
- [ ]

**Acceptance Criteria:**
- [ ]

**Notes:**

---

### Chunk 3 — [Name]

**Goal:**
**Priority:** P0 / P1 / P2 / P3
**Dependencies:**
**Estimated Complexity:** [ ] Simple [ ] Medium [ ] Complex
**Assigned Tier:**

**Features:**
- [ ]

**Acceptance Criteria:**
- [ ]

**Notes:**

---

<!-- Add more chunks as needed. Most MVPs have 3-5 chunks. -->

## Content / Data Model

<!-- What types of data does this product create, store, and display? This section bridges SPEC and ARCHITECTURE. -->

| Entity | Description | Key Fields | Owned By |
|--------|------------|-----------|----------|
|        |            |           |          |

---

## Pages / Views / Screens

<!-- Every distinct view the user will see. This becomes the navigation map. -->

| View | Purpose | Key Components | Auth Required? | Priority |
|------|---------|---------------|----------------|----------|
|      |         |               |                |          |

---

## Non-Functional Requirements

<!-- The "-ilities" — things that aren't features but matter just as much. -->

- **Performance:** <!-- Target load times, response times, data volume limits -->
- **Accessibility:** <!-- WCAG level, screen reader support, keyboard navigation -->
- **Offline Support:** <!-- PWA? Service worker? What works without internet? -->
- **Responsive:** <!-- Mobile-first? Target breakpoints? -->
- **SEO:** <!-- SSR/SSG? Meta tags? Open Graph cards? Sitemap? -->
- **Security:** <!-- Auth method, encryption, rate limiting, input validation -->
- **Privacy:** <!-- What data is collected? Where stored? Who can access? GDPR/CCPA? -->
- **i18n:** <!-- Multi-language support needed? If so, which languages? -->

---

## Explicitly Out of Scope

<!-- Things this product will NOT do. Be specific. Prevents scope creep and manages expectations. Review this list when someone (including you) suggests a new feature. -->

1.
2.
3.

---

## Success Metrics

<!-- How do you know this product is working? Define measurable outcomes. -->

| Metric | Target | How Measured | When to Check |
|--------|--------|-------------|---------------|
|        |        |             |               |

---

## Competitive / Prior Art

<!-- What else exists in this space? What can you learn from it? What makes yours different? -->

| Name | What It Does | What's Good | What's Missing | Link |
|------|-------------|-------------|----------------|------|
|      |             |             |                |      |

---

## Open Questions

<!-- Unresolved decisions. These should shrink over time. If a question has been open for more than two sessions, force a decision. -->

- [ ]
- [ ]

---

## Revision History

<!-- Track major spec changes so you can understand how the product evolved. -->

| Date | Change | Decided By | Rationale |
|------|--------|-----------|-----------|
|      |        |           |           |
