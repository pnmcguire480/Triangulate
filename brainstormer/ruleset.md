# BrainStormer — Ruleset

This file grows over time. Each BrainStormer run appends new rules below.
Never delete or overwrite entries — the value is in the accumulation.

Rules are referenced at the start of every new run (Step 1) to improve
angle ranking and format matching based on what's worked before.

---

<!-- New runs append below this line -->

### Run 1 — 2026-03-25 (Init)

1. **Never position as "balanced" or "both sides."** Triangulate is about convergence of FACTS, not false equivalence. The tagline is "where do enemies agree?" — not "here's what both sides think."

2. **Never editorialize.** Triangulate shows where evidence converges. It never tells users what to think. Content should model this: present convergence data, let the reader draw conclusions.

3. **Lead with the surprising agreement, not the disagreement.** The scroll-stopper is "Fox and MSNBC agree" — not "Fox and MSNBC disagree." Everyone expects disagreement. Convergence is the news.

4. **Ground News is a peer, not an enemy.** Comparison content should credit what Ground News does well (bias labels, clean UI) before showing where Triangulate goes deeper (claim-level, convergence scoring, global scope). Never trash-talk.

5. **"Printing press" aesthetic extends to content voice.** The brand feels like old-school journalism — authoritative, measured, slightly formal. Not startup-bro. Not hot takes. The voice should feel like it belongs in an era when reporting meant something.

6. **Founder Members are evangelists, not customers.** Content targeting Founder Members should make them feel like insiders and co-builders, not buyers getting a deal.

7. **Global scope is a real differentiator — use it.** Cross-region convergence (US + Middle East + Asia confirming the same fact) is dramatically more powerful than left-right US convergence alone. Highlight international examples whenever possible.

8. **The AI Round Table is a trust mechanism, not a feature.** When talking about multi-AI verification, frame it as "we don't trust one source — including our own AI" rather than "look at our cool multi-model architecture."

9. **Cash-constrained = authentic, not apologetic.** The solo founder narrative is a strength. Don't hide the scrappiness — lean into it. But never use it as an excuse for quality.

10. **Independent journalists are the growth flywheel.** Every convergence badge on a Substack post is free marketing. Content should actively court indie journalists as partners, not just users.

### Run 2 — 2026-03-25 (Command Center Audit)

11. **Every number arrives pre-interpreted.** Users should never see "82%" and wonder "is that good?" Every metric needs context — a benchmark, an explanation, a comparison. "82% convergence — this is rare, only 3% of stories reach this level."

12. **The filter system IS the product.** Filtering is not a secondary feature — it is the primary interaction. The Convergence Lens (filter sidebar) should feel like an instrument you learn to play. Design decisions about filtering deserve the same weight as decisions about content display.

13. **No infinite scroll. The newspaper has a last page.** Feed is capped. Finite editions signal "you are informed, you can stop now." Infinite scroll trains compulsive checking.

14. **Never show engagement metrics to users.** No "10,000 people read this" or trending labels. Social proof about popularity warps judgment. Ranking is by convergence quality, not popularity.

15. **Show contradictions prominently, not buried.** When a story has both converged and contested claims, feature the contested ones. "Not everything aligns. Here is where sources disagree." This builds trust through intellectual honesty.

16. **Subscription converts through genuine value gates, not artificial restrictions.** The ConvergencePanel (where enemies agree) is always free — it IS the advertisement. Claims are the product behind the gate. Never gate the aha moment.

17. **The Data Base is an investment, not a rental.** Journalist Pro's persistent research workspace grows more valuable over time. Frame it as building a personal asset, not paying for access.

18. **Desktop-first for the command center, but mobile is first-class.** Every feature must work on mobile. Panels collapse to single-panel views. Filters become bottom sheets. Touch targets are 44px minimum.

19. **Accessibility is architecture, not decoration.** F6 panel cycling, ARIA live regions on filter changes, role="meter" on convergence bars, keyboard shortcuts with modifier keys to avoid screen reader conflicts. Build it in from the start.

20. **The dual aesthetic is a feature, not a theme.** Light mode (Press Room) and dark mode (War Room) are two personalities of the same product. The dateline typography swap (DM Sans → JetBrains Mono) is a signature element. Treat theme as identity, not preference.

### Run 3 — 2026-03-30 (Pipeline Convergence Audit + Journalist Brainstorm)

21. **Superlinear > linear for ideological distance.** Agreement between FAR_LEFT and FAR_RIGHT (distance=6, weight=14.7x) is categorically different from LEFT + CENTER_LEFT (distance=1, weight=1x). Linear distance formulas undervalue the most powerful convergence signals. Use alpha=1.5 exponent.

22. **Regional independence is not binary.** US + Canada share media ecosystems (independence=0.2). US + Middle East are genuinely independent (independence=0.9). A flat "region bonus" misses this. Use the 10x10 independence matrix.

23. **Wire services inflate convergence — filter them.** Reuters/AP/AFP on CNN, BBC, and Fox looks like "3 diverse sources agree" but it's 1 wire report republished 3x. Always filter wire syndications from convergence scoring. Mark sources with `isWireService: true`.

24. **Stories must re-analyze when new evidence arrives.** A story that grows from 2 to 12 articles should not keep its 2-article convergence score. Reset `lastAnalyzedAt` when new articles join existing stories.

25. **Apply the subtraction test to every journalist feature.** Don't ask "what can we add?" Ask "what 45-minute manual task does this eliminate?" Evidence Package eliminates source compilation. Citations eliminate formatting. Alerts eliminate daily re-checking. If a feature doesn't subtract work, don't build it.

26. **Export-first, plugin-later for tool integrations.** For Obsidian and NotebookLM, ship structured export (ZIP of Markdown with YAML frontmatter) before building custom plugins. Journalists need to start using it immediately, not wait for a plugin release cycle.

27. **Claim lifecycle is a trust signal for users.** EMERGING, DEVELOPING, ESTABLISHED, PERSISTENT — these states communicate uncertainty honestly. "This claim is EMERGING" vs "PERSISTENT across 30 sources for 2 weeks" builds trust through transparency.

28. **Conditional AI calls save 50%+ of API cost.** Skip dedup AI calls when rawClaims.length <= 3 (use string similarity). Skip primary doc detection when headlines contain no legal/government keywords. These conditions eliminate most unnecessary API calls without sacrificing quality.

29. **Track source health automatically.** Sources that fail 5 consecutive fetches should auto-deactivate. Sources that recover should auto-reactivate. Don't wait for a human to notice a broken RSS feed.

30. **No competitor does claim-level convergence.** Ground News maps coverage. AllSides shows perspectives. Google clusters stories. NewsGuard rates sources. Nobody extracts claims, matches them across ideologically opposed sources, and scores convergence weighted by ideological distance. This is the moat — protect it.

### Run 4 — 2026-04-02 (BrainStormer Health Check)

31. **Always apply computed values or delete them.** A variable that is assigned but never read is either a bug (value should be used) or dead code (computation should be removed). The countFactor bug showed the real cost: convergence scores were wrong for every 2-4 source claim.

32. **Always use `.server` suffix for server-only lib modules.** If a lib file imports `@prisma/client`, `crypto`, or any Node-only API, the file must use the `.server.ts` suffix. This is structural protection against client bundle leaks, not just convention.

33. **Every `useState` setter must have a corresponding render.** If you call `setError(msg)` somewhere, there must be a `{error && <div>...}` somewhere in the JSX. Silent error state is worse than no error handling — it gives false confidence that errors are handled.
