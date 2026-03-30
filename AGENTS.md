# AGENTS.md — LLM Tier Routing and Agent Roles

> 🔃 **UPDATE FREQUENCY: WHEN SCOPE OR TOOLS SHIFT**
> This file defines WHO does WHAT in your AI-assisted workflow. Update it when: new AI tools become available, the project scope changes significantly, or you discover a tier boundary that needs adjustment.
>
> **Depends on:** CLAUDE.md (project rules), CODEGUIDE.md (code conventions)
> **Feeds into:** All development work (agents check their tier before acting)

---

## The Five-Tier System

BabyTierOS routes every development task to the appropriate level of AI capability. The principle: **use the minimum tier that can handle the task correctly.** Don't call in an architect to hammer a nail. Don't ask autocomplete to design a database.

```
COMPLEXITY ──────────────────────────────────────────▶

  Tier 1        Tier 2         Tier 3         Tier 4         Tier 5
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ AUTO-   │  │ LOCAL    │  │ MID-     │  │ AGENTIC  │  │ STRATE-  │
│ COMPLETE│  │ ASSIST   │  │ RANGE    │  │ BUILDER  │  │ GIST     │
│         │  │          │  │          │  │          │  │          │
│ Accept/ │  │ Simple   │  │ Single-  │  │ Multi-   │  │ Planning │
│ Reject  │  │ edits    │  │ file     │  │ file     │  │ Specs    │
│         │  │ Rename   │  │ tasks    │  │ features │  │ Review   │
│         │  │ Format   │  │ Focused  │  │ Complex  │  │ Arch     │
│         │  │ Boiler-  │  │ logic    │  │ logic    │  │ Strategy │
│         │  │ plate    │  │          │  │          │  │          │
└─────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Tier Definitions

### Tier 1 — Autocomplete

**Default Tool:** Continue, GitHub Copilot, or built-in IDE autocomplete
**Mode:** Passive — suggestions appear, you accept or reject

**Handles:**
- Single-line completions
- Import statement completion
- Closing brackets, tags, and boilerplate
- Obvious pattern continuation

**Boundaries:**
- No multi-line generation
- No architectural awareness
- Accept or reject only — no conversation

**When to escalate to Tier 2:** You're rejecting more suggestions than accepting, or the completion requires understanding context beyond the current line.

---

### Tier 2 — Local Assistant

**Default Tool:** Ollama (running locally), small language models
**Mode:** Active — you ask, it responds. Fast, private, free.

**Handles:**
- Variable and function renaming
- Simple code reformatting
- Boilerplate generation (interfaces, types, basic components)
- Converting between similar syntaxes
- Quick "how do I..." lookups
- Comment generation

**Boundaries:**
- No logic changes that alter behavior
- No new file creation
- No state management changes
- Single-file scope only
- Must not read SNIFFTEST.md

**When to escalate to Tier 3:** The task requires understanding business logic, writing non-trivial functions, or touching data transformations.

---

### Tier 3 — Specialist

**Default Tool:** DeepSeek, or equivalent mid-range cloud LLM
**Mode:** Active — focused single-file tasks with clear scope

**Handles:**
- Individual component creation
- Data transformation and formatting logic
- Single utility functions with defined inputs/outputs
- Algorithm implementation from a clear description
- Writing individual test files
- Research and code examples

**Boundaries:**
- Single-file scope only (no cross-file awareness)
- No architectural decisions
- No dependency management
- No database schema changes
- Must not read SNIFFTEST.md

**When to escalate to Tier 4:** The task requires awareness of multiple files, touches the database, involves auth/permissions, or requires understanding the full codebase.

---

### Tier 4 — Builder

**Default Tool:** Claude Code (VS Code terminal mode), or equivalent agentic coding tool
**Mode:** Agentic — can read the full codebase, make multi-file changes, run commands

**Handles:**
- Multi-file feature implementation
- Complex business logic spanning multiple modules
- API route creation and integration
- Database schema changes (with human approval)
- Refactoring approved by Tier 5
- Git operations (commits, branches)
- Debugging complex cross-file issues
- Dependency installation (with human approval)

**Boundaries:**
- Must follow patterns established in CLAUDE.md and CODEGUIDE.md
- Must not refactor without Tier 5 or human approval
- Must not install new dependencies without human approval
- Must not modify CLAUDE.md rules, AGENTS.md, or SNIFFTEST.md
- Must not make architectural decisions (escalate to Tier 5)
- Must not delete files without human approval

**When to escalate to Tier 5:** The task involves a decision with tradeoffs ("should we use X or Y?"), requires planning a multi-session feature, involves reviewing someone else's code, or requires writing/revising specs.

---

### Tier 5 — Strategist

**Default Tool:** Claude Chat (Opus), or equivalent frontier model in conversation mode
**Mode:** Conversational — planning, reasoning, reviewing. Does not write production code directly.

**Handles:**
- Project planning and roadmapping
- Spec writing and revision (SPEC.md, SCENARIOS.md)
- Architectural decisions (ARCHITECTURE.md)
- Code review and feedback
- Complex debugging (reasoning about root causes)
- Evaluating tradeoffs and presenting options
- Writing CONTEXT.md and ART.md
- Strategy for features, launch, and scope

**Boundaries:**
- Does not write production code directly (that's Tier 4)
- Does not make unilateral decisions — presents options, human decides
- Must not read SNIFFTEST.md
- Plans and designs, does not implement

**When to involve the human directly:** Decisions that affect budget, timeline, user-facing commitments, external stakeholders, or anything the AI isn't confident about.

---

## Escalation Protocol

```
Stuck at Tier 1 ──▶ Tier 2 (need context beyond current line)
Stuck at Tier 2 ──▶ Tier 3 (need real logic, not just formatting)
Stuck at Tier 3 ──▶ Tier 4 (need multi-file awareness)
Stuck at Tier 4 ──▶ Tier 5 (need architectural guidance)
Stuck at Tier 5 ──▶ Human makes the call
```

**Signs an agent should escalate:**
- Guessing instead of knowing
- Task requires files the agent can't see
- Multiple valid approaches with unclear tradeoffs
- Task touches auth, payments, or personal data
- Output doesn't match existing codebase patterns
- Agent has attempted the same fix twice without success

---

## Delegation Protocol

```
Tier 5 overkill ──▶ Tier 4 (just needs implementation, not planning)
Tier 4 overkill ──▶ Tier 3 (single file, clear scope)
Tier 3 overkill ──▶ Tier 2 (renaming, formatting, boilerplate)
Tier 2 overkill ──▶ Tier 1 (line completion)
```

---

## Human-in-the-Loop Checkpoints

These actions require **explicit human approval** regardless of which tier is performing them:

- [ ] Installing a new dependency
- [ ] Creating or modifying a database table / schema
- [ ] Changing authentication or authorization logic
- [ ] Modifying deployment configuration
- [ ] Deleting any file
- [ ] Refactoring more than 3 files simultaneously
- [ ] Changing environment variables
- [ ] Modifying CLAUDE.md rules, AGENTS.md, or SNIFFTEST.md
- [ ] Any action that affects production data
- [ ] Any action that exposes the project externally (deploy, publish, share)

---

## Session Handoff Between Tiers

When work passes from one tier to another (e.g., Tier 5 plans, Tier 4 builds):

### Outgoing Agent

1. Update CLAUDE.md → "Last Session" section
2. Summarize what was decided or accomplished
3. List specific next steps for the receiving tier
4. Note any constraints or "don't touch" areas
5. Commit current work

### Incoming Agent

1. Read CLAUDE.md completely
2. Read the handoff notes from the outgoing agent
3. Load relevant files per CLAUDE.md's "Context Window Management"
4. Confirm understanding of the task before starting
5. Follow CODEGUIDE.md conventions from the first line

---

## Agent Skills Registry

<!-- Project-specific capabilities beyond the standard tier definitions. Use this when a project needs specialized roles. -->

| Skill Name | Description | Assigned Tier | When to Invoke |
|-----------|-------------|--------------|----------------|
|           |             |              |                |

**Examples of project-specific skills:**
- "Content Writer" (Tier 5) — drafts copy, blog posts, marketing text
- "Data Pipeline Agent" (Tier 4) — handles ETL, data migration, scraping
- "UI Prototyper" (Tier 3) — creates individual components from ART.md specs
- "Test Generator" (Tier 3) — writes unit tests from SPEC.md acceptance criteria (NOT from SNIFFTEST.md)

---

## Tool Configuration

<!-- Record the specific tools and models configured for each tier in this project. -->

| Tier | Tool | Model / Version | Config Notes |
|------|------|----------------|-------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## Lessons Learned

<!-- Record what works and what doesn't across sessions. This section makes the system smarter over time. -->

| Date | Observation | Adjustment Made |
|------|------------|----------------|
|      |            |                |
