# SCENARIOS.md — User Journeys and Flows

> 🔃 **UPDATE FREQUENCY: EVERY MAJOR FEATURE**
> This file bridges the gap between SPEC.md (what to build) and actual implementation. It describes HOW users move through the product — step by step, screen by screen. Write a new scenario for every significant user flow.
>
> **Depends on:** SPEC.md (user stories and features), CONTEXT.md (domain understanding)
> **Feeds into:** ART.md (UI decisions), SNIFFTEST.md (test cases), ARCHITECTURE.md (API/data needs)

---

## How to Write Scenarios

Each scenario follows a user through a complete task — from intent to outcome. Include:

- **Who** the user is (reference SPEC.md user types)
- **What** they're trying to accomplish
- **Where** they start (entry point)
- **Each step** they take, including what they see and do
- **Happy path** (everything works)
- **Sad paths** (things go wrong)
- **Edge cases** (unusual but valid situations)

Good scenarios are specific enough to code from but readable enough to discuss with non-technical people.

---

## Scenario Template

```markdown
### [SC-XXX] Scenario Name

**User:** [Who — reference SPEC.md user type]
**Goal:** [What they're trying to accomplish]
**Entry Point:** [Where they start — URL, screen, notification, etc.]
**Preconditions:** [What must be true before this flow begins]
**Related Chunk:** [Which SPEC.md chunk does this validate]

#### Happy Path

1. User sees...
2. User does...
3. System responds with...
4. User sees...
5. Outcome: ...

#### Sad Path(s)

- **If [condition]:** System shows... User can...
- **If [condition]:** System shows... User can...

#### Edge Cases

- What if the user is on a slow connection?
- What if the user refreshes mid-flow?
- What if the data is empty?
- What if the user has done this 1,000 times before?

#### State Changes

- **Before:** [What the data/system state looks like before]
- **After:** [What changes as a result of this flow]

#### Notes
```

---

## Core Scenarios

<!-- These are the essential flows that define the product. If these don't work, nothing works. -->

### [SC-001]

**User:**
**Goal:**
**Entry Point:**
**Preconditions:**
**Related Chunk:**

#### Happy Path

1.
2.
3.

#### Sad Path(s)

-

#### Edge Cases

-

#### State Changes

- **Before:**
- **After:**

---

### [SC-002]

**User:**
**Goal:**
**Entry Point:**
**Preconditions:**
**Related Chunk:**

#### Happy Path

1.
2.
3.

#### Sad Path(s)

-

#### Edge Cases

-

#### State Changes

- **Before:**
- **After:**

---

### [SC-003]

**User:**
**Goal:**
**Entry Point:**
**Preconditions:**
**Related Chunk:**

#### Happy Path

1.
2.
3.

#### Sad Path(s)

-

#### Edge Cases

-

#### State Changes

- **Before:**
- **After:**

---

## Onboarding / First-Use Scenario

<!-- The very first time someone uses the product. This is the most important scenario — if this fails, nothing else matters. -->

### [SC-ONBOARD]

**User:** Brand-new user, never seen the product before
**Goal:** Understand what this does and accomplish one meaningful task
**Entry Point:**
**Preconditions:** None — they just arrived

#### Happy Path

1.
2.
3.

#### First Impression Questions

- Within 5 seconds, can they tell what this product does?
- Within 30 seconds, can they start their first task?
- Within 2 minutes, can they complete one full cycle?
- Do they need to create an account to do anything useful?
- What happens if they leave and come back tomorrow?

---

## Error and Recovery Scenarios

<!-- What happens when things go wrong. These protect the user experience. -->

### [SC-ERR-001] Network Failure

- **During:** [Which flows are affected]
- **User sees:**
- **Recovery:**
- **Data loss risk:**

### [SC-ERR-002] Invalid Input

- **During:**
- **User sees:**
- **Recovery:**

### [SC-ERR-003] Expired / Stale Data

- **During:**
- **User sees:**
- **Recovery:**

---

## Scenario Coverage Matrix

<!-- Track which SPEC.md chunks and user stories have scenarios written. Gaps here mean untested flows. -->

| SPEC Chunk | User Story | Scenario ID | Status |
|-----------|-----------|-------------|--------|
|           |           |             | [ ] Draft [ ] Complete [ ] Tested |

---

## Notes

<!-- Observations from writing scenarios — patterns, recurring edge cases, UX insights -->

-
