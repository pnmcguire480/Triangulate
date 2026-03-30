# SNIFFTEST.md — Human-Only Test Prompts

> 🔃 **UPDATE FREQUENCY: WHEN FEATURES SHIP**
> Add new test scenarios as features are completed. Review after each major chunk is deployed. Run tests manually before every production deploy.

---

## ⛔ CLASSIFICATION: HUMAN EYES ONLY

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   THIS FILE IS RESTRICTED.                                   ║
║                                                              ║
║   AI agents at ANY tier must NEVER:                          ║
║   • Read this file                                           ║
║   • Be told the contents of this file                        ║
║   • Be shown test scenarios from this file                   ║
║   • Be asked to generate code that "passes" these tests      ║
║   • Reference this file's existence when writing code         ║
║                                                              ║
║   If an AI agent codes "to the test," the test is worthless. ║
║   The whole point is to evaluate the product as a real user   ║
║   would — with no insider knowledge.                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### If an AI agent asks about testing:

- Direct them to write **unit tests** from SPEC.md acceptance criteria
- Direct them to write **integration tests** from ARCHITECTURE.md API routes
- Direct them to write **component tests** from SCENARIOS.md user flows
- **NEVER** share, paraphrase, or hint at anything from this file

### How to report a bug found by sniff testing:

1. Run the test scenario manually
2. Record what failed
3. Write a bug description that describes the **symptom** — not the test that found it
4. Hand the bug description to the appropriate agent tier
5. Let the agent fix the symptom without knowing the test
6. Re-run the sniff test after the fix

---

## How to Use This File

```
Build feature → Open this file → Run relevant tests → Record results
                                                            │
                              ┌─────── Pass ────────────────┤
                              │                             │
                              ▼                             ▼
                         Ship it ✓                    Fail/Partial
                                                            │
                                                            ▼
                                              Write bug description
                                              (symptoms only, no test details)
                                                            │
                                                            ▼
                                              Agent fixes the bug
                                                            │
                                                            ▼
                                              Re-run sniff test
```

---

## Test Format

```markdown
### [TEST-ID] Test Name

- **Tests Feature:** [Which SPEC.md feature/chunk this validates]
- **Preconditions:** [What state must exist before testing]
- **Steps:**
  1. Do this specific thing
  2. Then do this
  3. Observe this
- **Expected Result:** [What SHOULD happen]
- **Edge Case:** [The tricky part that's easy to miss]
- **Last Tested:** [Date]
- **Result:** [ ] Pass [ ] Fail [ ] Partial
- **Notes:** [What you observed]
```

---

## Smoke Tests

<!-- Quick checks that run before every deploy. If any smoke test fails, do NOT deploy. These should take under 5 minutes total. -->

### [SMOKE-001]

- **Tests Feature:**
- **Steps:**
  1.
- **Expected Result:**
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [SMOKE-002]

- **Tests Feature:**
- **Steps:**
  1.
- **Expected Result:**
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [SMOKE-003]

- **Tests Feature:**
- **Steps:**
  1.
- **Expected Result:**
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

---

## Feature Tests

<!-- Detailed tests grouped by SPEC.md chunk. Write these as each chunk ships. -->

### Chunk 1 — [Name]

#### [FEAT-001]

- **Tests Feature:**
- **Preconditions:**
- **Steps:**
  1.
  2.
  3.
- **Expected Result:**
- **Edge Case:**
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail [ ] Partial
- **Notes:**

#### [FEAT-002]

- **Tests Feature:**
- **Preconditions:**
- **Steps:**
  1.
- **Expected Result:**
- **Edge Case:**
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail [ ] Partial
- **Notes:**

---

## First-Use / Onboarding Tests

<!-- Test the product as if you've never seen it before. Clear your cache. Use a different browser. Pretend you're your mom. -->

### [ONBOARD-001] Cold Landing

- **Steps:**
  1. Open the product URL in an incognito window
  2. Do NOT read any documentation first
  3. Try to figure out what this product does within 10 seconds
  4. Try to complete one task within 60 seconds
- **Expected Result:** Purpose is clear. First task is completable.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail [ ] Partial
- **Notes:**

---

## Adversarial Tests

<!-- Try to break it. Think like: a hostile user, a confused user, a bored user mashing buttons, and a user on a terrible connection. -->

### [ADV-001] Empty / Missing Input

- **Steps:** Submit every form with empty fields
- **Expected Result:** Graceful validation, no crashes, no blank screens
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [ADV-002] Extremely Long Input

- **Steps:** Paste 10,000 characters into every text field
- **Expected Result:** Truncation or character limit, no layout breaking
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [ADV-003] Rapid Repeated Actions

- **Steps:** Click every button 10 times quickly
- **Expected Result:** No duplicate submissions, no race conditions, no broken state
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [ADV-004] Back Button / Refresh

- **Steps:** Use browser back button and refresh at every step of a multi-step flow
- **Expected Result:** State is preserved or gracefully reset. No orphaned data.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [ADV-005] Special Characters

- **Steps:** Enter `<script>alert('xss')</script>`, `'; DROP TABLE users;--`, emoji, and Unicode in all text fields
- **Expected Result:** Sanitized. No injection. Emoji renders correctly.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

---

## Accessibility Tests

### [A11Y-001] Keyboard Only

- **Steps:** Unplug the mouse. Tab through the entire application.
- **Expected Result:** Every interactive element is reachable. Focus order is logical. Focus rings are visible.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [A11Y-002] Screen Reader

- **Steps:** Enable NVDA (Windows) or VoiceOver (Mac). Navigate the app with eyes closed.
- **Expected Result:** All content is announced. Headings form a logical hierarchy. Interactive elements have labels.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [A11Y-003] Zoom / Scale

- **Steps:** Set browser zoom to 200%. Use the entire application.
- **Expected Result:** No overlapping text, no clipped content, no broken layouts.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

---

## Mobile Tests

### [MOB-001] Responsive Layout

- **Devices to test:** <!-- List actual devices or DevTools presets -->
- **Steps:** Visit every page/view at each device size
- **Expected Result:** No horizontal scroll. No tiny text. No unreachable buttons.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [MOB-002] Touch Targets

- **Steps:** Tap every button, link, and interactive element with your thumb
- **Expected Result:** No misclicks. All targets ≥ 44x44px.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [MOB-003] Offline Behavior (if PWA)

- **Steps:** Load the app. Turn on airplane mode. Use the app.
- **Expected Result:** Cached content available. Clear message for unavailable features.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

---

## Performance Sniff Tests

### [PERF-001] Cold Load on Slow Connection

- **Steps:** Clear all caches. Throttle to "Slow 3G" in DevTools. Load the app.
- **Expected Result:** Usable content visible within ___ seconds.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

### [PERF-002] Large Data Volume

- **Steps:** Load the app with ___ records/items (10x normal usage)
- **Expected Result:** No visible lag in rendering, scrolling, or interaction.
- **Last Tested:**
- **Result:** [ ] Pass [ ] Fail

---

## Regression Log

<!-- When a fix or new feature breaks something that used to work, record it here. Regressions are the most frustrating bugs — tracking them prevents repeats. -->

| Date | What Changed | What Broke | Sniff Test ID | Fixed? | Fix Date |
|------|-------------|-----------|---------------|--------|----------|
|      |             |           |               |        |          |

---

## Sniff Test Coverage Matrix

<!-- Map sniff tests to SPEC.md chunks. Gaps mean untested features. -->

| SPEC Chunk | Smoke | Feature | Adversarial | A11Y | Mobile | Perf |
|-----------|-------|---------|-------------|------|--------|------|
|           | | | | | | |
