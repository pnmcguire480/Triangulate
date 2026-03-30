# Data Narratives System Design
## Triangulate -- Making Convergence Data Revelatory

**Date:** 2026-03-25
**Author:** Data Storytelling Audit (Tier 4)
**Status:** Design specification -- ready for implementation

---

## Executive Summary

Triangulate already has the hardest part: a working convergence scoring algorithm that measures ideological spread, cross-center agreement, region diversity, and source count. What it lacks is the narrative layer that transforms these numbers into stories humans act on. This document specifies six interlocking data narrative systems that turn Triangulate from "a feed with convergence scores" into "the Bloomberg Terminal for news truth."

The design principle throughout: **every number should arrive pre-interpreted.** No user should ever see "82%" and wonder "is that good?" The system tells them.

---

## 1. The Global Convergence Index (GCI)

### What It Is

A single daily number, published once per 24-hour cycle, representing the overall state of factual agreement across all tracked sources. Analogous to the Dow Jones Industrial Average, but for news truth rather than stock prices. Range: 0-100.

A high GCI means the world's news outlets -- across ideological lines -- are mostly reporting the same facts. A low GCI means outlets are telling fundamentally different stories about reality.

### Algorithm

```typescript
// app/lib/gci.ts

interface GCIInput {
  stories: {
    id: string;
    highestClaimConvergence: number;  // 0-1, from existing scoring
    articleCount: number;
    uniqueBiasTiers: number;          // 1-7
    uniqueRegions: number;            // 1-7+
    trustSignal: TrustSignal;
    claimCount: number;
    contestedClaimCount: number;
  }[];
  period: { start: Date; end: Date };
}

/**
 * Global Convergence Index
 *
 * Three components, weighted:
 *
 * 1. CONVERGENCE BREADTH (40% weight)
 *    What percentage of multi-source stories reached CONVERGED or higher?
 *    This measures how much of the news landscape has cross-spectrum agreement.
 *
 * 2. CONVERGENCE DEPTH (35% weight)
 *    Among converged stories, what is the average highest claim score?
 *    This measures how STRONG the agreement is -- not just that sources
 *    agree, but how many tiers and regions are confirming the same claims.
 *
 * 3. CONTESTATION PENALTY (25% weight, inverted)
 *    What fraction of all extracted claims are contested (sources disagree)?
 *    Higher contestation = lower GCI. This prevents the index from being
 *    inflated by a few high-convergence stories while most claims are disputed.
 */
export function calculateGCI(input: GCIInput): {
  score: number;           // 0-100
  breadth: number;         // 0-100
  depth: number;           // 0-100
  contestation: number;    // 0-100 (inverted: 100 = no contestation)
  components: {
    convergedStoryCount: number;
    multiSourceStoryCount: number;
    totalClaimCount: number;
    contestedClaimCount: number;
    avgConvergenceOfConverged: number;
  };
} {
  const multiSource = input.stories.filter(s => s.articleCount >= 2);
  const converged = multiSource.filter(s =>
    s.trustSignal === 'CONVERGED' ||
    s.trustSignal === 'SOURCE_BACKED' ||
    s.trustSignal === 'INSTITUTIONALLY_VALIDATED'
  );

  // Component 1: Convergence Breadth
  const breadth = multiSource.length > 0
    ? (converged.length / multiSource.length) * 100
    : 0;

  // Component 2: Convergence Depth
  const avgConvergence = converged.length > 0
    ? converged.reduce((sum, s) => sum + s.highestClaimConvergence, 0) / converged.length
    : 0;
  const depth = avgConvergence * 100;

  // Component 3: Contestation (inverted -- lower contestation = higher score)
  const totalClaims = input.stories.reduce((sum, s) => sum + s.claimCount, 0);
  const contestedClaims = input.stories.reduce((sum, s) => sum + s.contestedClaimCount, 0);
  const contestationRate = totalClaims > 0
    ? contestedClaims / totalClaims
    : 0;
  const contestationScore = (1 - contestationRate) * 100;

  // Weighted composite
  const score = Math.round(
    breadth * 0.40 +
    depth * 0.35 +
    contestationScore * 0.25
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breadth: Math.round(breadth),
    depth: Math.round(depth),
    contestation: Math.round(contestationScore),
    components: {
      convergedStoryCount: converged.length,
      multiSourceStoryCount: multiSource.length,
      totalClaimCount: totalClaims,
      contestedClaimCount: contestedClaims,
      avgConvergenceOfConverged: Math.round(avgConvergence * 100) / 100,
    },
  };
}
```

### Interpretation Bands

| GCI Range | Label | Color | Meaning |
|-----------|-------|-------|---------|
| 80-100 | High Convergence | `brand-green` | Outlets across the spectrum are reporting the same facts. Rare -- typically only during unambiguous events (natural disasters, unanimous votes, verified data releases). |
| 60-79 | Moderate Convergence | `brand-teal` | Most major stories have cross-spectrum agreement on core facts, with some contested framing claims. Normal "good day" for news. |
| 40-59 | Mixed Signals | `brand-amber` | Significant disagreement on key stories. Outlets are telling different factual stories -- not just different opinions, different facts. |
| 20-39 | Low Convergence | `brand-red` | The news landscape is fractured. Most stories lack cross-spectrum confirmation. Either information is scarce, or outlets are actively contradicting each other. |
| 0-19 | Informational Fog | `brand-red` (pulsing) | Almost no cross-spectrum agreement on facts. This is historically rare and signals either an information blackout, a rapidly evolving crisis, or coordinated disinformation. |

### Visualization Specification

**Primary Display: The GCI Gauge**

```
Component: GCIGauge
Location: Top of homepage, above the feed
Width: Full bleed of content area
Height: 120px desktop, 80px mobile

Layout:
  Left side (40%):
    - Large number: "67" (GCI score, 48px font-headline, bold)
    - Label underneath: "Global Convergence Index" (12px dateline)
    - Interpretation: "Moderate Convergence" (14px, color-coded)
    - Delta: "+4 from yesterday" or "-7 from yesterday" (12px, green/red)

  Right side (60%):
    - Sparkline: 30-day GCI history
    - X-axis: dates (every 7 days labeled)
    - Y-axis: 0-100 (labeled at 20, 40, 60, 80)
    - Line color: matches current band color
    - Fill: gradient from line color to transparent
    - Annotation: dot on today's value with tooltip
    - Notable events: vertical dashed lines on days with GCI
      swings > 15 points, labeled with the story that caused it

  Interaction:
    - Hover on sparkline shows daily GCI + top converged story
    - Click opens /convergence-index page with full history
    - The 3 sub-components (breadth, depth, contestation) appear
      on hover/click as a breakdown bar
```

**Secondary Display: The GCI Ticker**

```
Component: GCITicker
Location: Header bar, next to navigation
Size: Compact -- just the number + delta

Format: "GCI 67 +4" with color coding
Click: navigates to /convergence-index

This is the "always visible" form -- like a stock ticker.
Users should internalize checking the GCI like checking the weather.
```

### Historical Trend Narrative

The GCI page (`/convergence-index`) shows the full 90-day history with auto-generated narrative:

```
Template: gci-trend-narrative

"Over the past {period}, the Global Convergence Index has
{trend_verb} from {start_value} to {end_value}.

{if trend === 'rising'}
This means news outlets across the political spectrum are
increasingly agreeing on the basic facts. {top_converged_story}
drove the highest single-day reading of {peak_value} on {peak_date}.

{if trend === 'falling'}
This means the factual picture is becoming more fragmented --
outlets are telling increasingly different stories about the
same events. The sharpest decline occurred on {steepest_drop_date}
when {divergent_story} split coverage along {split_pattern} lines.

{if trend === 'stable'}
The index has remained within a {range_low}-{range_high} band,
suggesting a steady state where some stories converge and others
remain contested. {notable_story} was the period's most converged
story at {story_score}%.
```

### Data Requirements (Schema Addition)

```prisma
model DailyGCI {
  id              String   @id @default(uuid())
  date            DateTime @unique @db.Date
  score           Int      // 0-100
  breadth         Int      // 0-100
  depth           Int      // 0-100
  contestation    Int      // 0-100
  convergedCount  Int
  multiSourceCount Int
  totalClaims     Int
  contestedClaims Int
  topStoryId      String?  // highest-converged story that day
  createdAt       DateTime @default(now())

  topStory        Story?   @relation(fields: [topStoryId], references: [id])

  @@map("daily_gci")
}
```

---

## 2. Convergence Narratives (Auto-Generated Story Summaries)

### What It Is

When a story reaches meaningful convergence (score >= 0.5), the system generates a human-readable narrative that explains WHY the convergence matters -- not just the number, but the specific sources, the timeline, and the historical context.

### Template System

The narrative engine uses composable sentence fragments assembled from the data. No AI is needed for this -- it is deterministic template logic driven by the claim and source data that already exists in the database.

```typescript
// app/lib/narrative.ts

interface NarrativeInput {
  story: {
    id: string;
    generatedTitle: string;
    trustSignal: TrustSignal;
    createdAt: Date;
  };
  claims: {
    claimText: string;
    convergenceScore: number;
    confirmingSources: {
      name: string;
      biasTier: BiasTier;
      region: Region;
    }[];
    contradictingSources: {
      name: string;
      biasTier: BiasTier;
      region: Region;
    }[];
  }[];
  stats: {
    articleCount: number;
    biasTierCount: number;
    regionCount: number;
    reportingCount: number;
    commentaryCount: number;
    highestConvergence: number;
    timeSpanHours: number;     // from first to last article
  };
  context: {
    topicAvgConvergence: number;    // average for this topic
    monthAvgConvergence: number;    // average for this month
    isHighestThisWeek: boolean;
    isHighestThisMonth: boolean;
    similarStoryLastMonth?: {
      title: string;
      convergence: number;
    };
  };
}

export function generateConvergenceNarrative(input: NarrativeInput): string {
  const parts: string[] = [];

  // --- OPENING: The achievement ---
  const pct = Math.round(input.stats.highestConvergence * 100);
  const topClaim = input.claims
    .filter(c => c.convergenceScore > 0)
    .sort((a, b) => b.convergenceScore - a.convergenceScore)[0];

  if (!topClaim) return '';

  // Pick the most ideologically distant confirming pair
  const pair = findWidestPair(topClaim.confirmingSources);
  const convergedClaimCount = input.claims
    .filter(c => c.convergenceScore >= 0.7).length;

  parts.push(
    `This story reached ${pct}% convergence after ` +
    `${pair.left.name} (${formatTier(pair.left.biasTier)}) ` +
    `and ${pair.right.name} (${formatTier(pair.right.biasTier)}) ` +
    `independently confirmed the same factual claims` +
    (input.stats.timeSpanHours <= 24
      ? ` within ${Math.round(input.stats.timeSpanHours)} hours.`
      : ` over ${Math.round(input.stats.timeSpanHours / 24)} days.`)
  );

  // --- MIDDLE: The evidence ---
  if (convergedClaimCount > 1) {
    parts.push(
      `${convergedClaimCount} of ${input.claims.length} extracted claims ` +
      `have cross-spectrum agreement.`
    );
  }

  if (input.stats.regionCount >= 3) {
    parts.push(
      `Sources from ${input.stats.regionCount} global regions ` +
      `are reporting the same facts -- this is not a regional story.`
    );
  }

  if (input.stats.reportingCount > 0 && input.stats.commentaryCount > 0) {
    parts.push(
      `${input.stats.reportingCount} outlets are providing original reporting ` +
      `while ${input.stats.commentaryCount} are offering commentary.`
    );
  }

  // --- CLOSING: The context ---
  if (input.context.isHighestThisMonth) {
    parts.push(
      `This is the highest convergence score on any story this month.`
    );
  } else if (input.context.isHighestThisWeek) {
    parts.push(
      `This is the highest convergence score this week.`
    );
  }

  if (input.context.similarStoryLastMonth) {
    const prev = input.context.similarStoryLastMonth;
    const prevPct = Math.round(prev.convergence * 100);
    if (pct > prevPct + 10) {
      parts.push(
        `For comparison, a similar story last month ` +
        `("${prev.title}") reached only ${prevPct}% convergence.`
      );
    }
  }

  const topicAvgPct = Math.round(input.context.topicAvgConvergence * 100);
  if (pct > topicAvgPct + 15) {
    parts.push(
      `This level of agreement is unusual -- the average convergence ` +
      `for stories in this category is ${topicAvgPct}%.`
    );
  }

  return parts.join(' ');
}

// Helper: find the most ideologically distant pair of confirming sources
function findWidestPair(sources: { name: string; biasTier: BiasTier }[]) {
  const TIER_POS: Record<string, number> = {
    FAR_LEFT: 0, LEFT: 1, CENTER_LEFT: 2,
    CENTER: 3, CENTER_RIGHT: 4, RIGHT: 5, FAR_RIGHT: 6,
  };

  let maxDist = 0;
  let best = { left: sources[0], right: sources[0] };

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const dist = Math.abs(
        (TIER_POS[sources[i].biasTier] ?? 3) -
        (TIER_POS[sources[j].biasTier] ?? 3)
      );
      if (dist > maxDist) {
        maxDist = dist;
        const leftIdx = (TIER_POS[sources[i].biasTier] ?? 3) <
                        (TIER_POS[sources[j].biasTier] ?? 3) ? i : j;
        const rightIdx = leftIdx === i ? j : i;
        best = { left: sources[leftIdx], right: sources[rightIdx] };
      }
    }
  }
  return best;
}

function formatTier(tier: BiasTier): string {
  const labels: Record<string, string> = {
    FAR_LEFT: 'Far Left', LEFT: 'Left', CENTER_LEFT: 'Center-Left',
    CENTER: 'Center', CENTER_RIGHT: 'Center-Right',
    RIGHT: 'Right', FAR_RIGHT: 'Far Right',
  };
  return labels[tier] || tier;
}
```

### Example Outputs

**High convergence, cross-spectrum:**
> This story reached 82% convergence after The Guardian (Left) and Fox News (Right) independently confirmed the same factual claims within 6 hours. 3 of 5 extracted claims have cross-spectrum agreement. Sources from 4 global regions are reporting the same facts -- this is not a regional story. This is the highest convergence score on any story this month.

**Moderate convergence with context:**
> This story reached 54% convergence after NPR (Center-Left) and The Wall Street Journal (Center-Right) independently confirmed the same factual claims over 2 days. 8 outlets are providing original reporting while 3 are offering commentary. For comparison, a similar story last month ("Fed Signals Rate Decision") reached only 31% convergence.

**High convergence with rarity signal:**
> This story reached 91% convergence after Democracy Now (Far Left) and The Daily Wire (Far Right) independently confirmed the same factual claims within 3 hours. 6 of 7 extracted claims have cross-spectrum agreement. Sources from 5 global regions are reporting the same facts -- this is not a regional story. This level of agreement is unusual -- the average convergence for stories in this category is 38%.

### UI Placement

```
Component: ConvergenceNarrative
Location: Story detail page, between the header and the ConvergencePanel
Style: Blockquote-style, with a green left border (2px)
Font: font-body, text-sm, text-ink, italic
Background: brand-green/3 (barely tinted)
Padding: p-4

Only renders when highest convergence >= 0.5
Premium feature: full narrative
Free tier: first sentence only, with "Upgrade to read the full analysis"
```

---

## 3. The Disagreement Map

### What It Is

A visualization and narrative system for CONTESTED claims -- where sources actively disagree. This is equally valuable to convergence because it shows WHERE the fault lines are: do disagreements split along ideology? Region? Or are they randomly distributed (which suggests genuine uncertainty rather than partisan framing)?

### Disagreement Classification Algorithm

```typescript
// app/lib/disagreement.ts

interface DisagreementAnalysis {
  claimId: string;
  claimText: string;
  pattern: 'IDEOLOGICAL' | 'REGIONAL' | 'RANDOM' | 'INSTITUTIONAL';
  confidence: number;  // 0-1, how clearly the pattern fits
  supporting: SourceGroup;
  contradicting: SourceGroup;
  narrative: string;
}

interface SourceGroup {
  sources: { name: string; biasTier: BiasTier; region: Region }[];
  avgBiasPosition: number;   // 0-6
  regions: Region[];
}

/**
 * Classify the disagreement pattern for a contested claim.
 *
 * IDEOLOGICAL: Supporting and contradicting sources cluster on
 *   opposite sides of the bias spectrum. The claim splits LEFT vs RIGHT.
 *   Signal: avg bias position differs by >= 2.0 between groups.
 *
 * REGIONAL: Supporting and contradicting sources cluster by region,
 *   not ideology. The claim splits US vs EUROPE, or MIDDLE_EAST vs GLOBAL.
 *   Signal: region overlap < 30% between groups AND bias positions overlap.
 *
 * INSTITUTIONAL: One side is predominantly wire services / center outlets
 *   and the other is predominantly partisan. Suggests framing differences
 *   rather than factual disagreement.
 *   Signal: one group has avgBiasPosition within 1.0 of center (3.0)
 *   and the other does not.
 *
 * RANDOM: No clear pattern. Sources on both sides of the spectrum
 *   appear in both groups. This suggests genuine uncertainty or
 *   evolving information rather than partisan disagreement.
 *   Signal: bias position difference < 1.5 AND region overlap > 50%.
 */
export function classifyDisagreement(
  supporting: { name: string; biasTier: BiasTier; region: Region }[],
  contradicting: { name: string; biasTier: BiasTier; region: Region }[]
): DisagreementAnalysis['pattern'] {
  const TIER_POS: Record<string, number> = {
    FAR_LEFT: 0, LEFT: 1, CENTER_LEFT: 2,
    CENTER: 3, CENTER_RIGHT: 4, RIGHT: 5, FAR_RIGHT: 6,
  };

  const avgPos = (sources: { biasTier: BiasTier }[]) => {
    if (sources.length === 0) return 3;
    return sources.reduce((sum, s) => sum + (TIER_POS[s.biasTier] ?? 3), 0)
      / sources.length;
  };

  const supportAvg = avgPos(supporting);
  const contradictAvg = avgPos(contradicting);
  const biasDiff = Math.abs(supportAvg - contradictAvg);

  const supportRegions = new Set(supporting.map(s => s.region));
  const contradictRegions = new Set(contradicting.map(s => s.region));
  const regionOverlap = [...supportRegions]
    .filter(r => contradictRegions.has(r)).length /
    Math.max(supportRegions.size, contradictRegions.size, 1);

  // Check ideological split
  if (biasDiff >= 2.0) return 'IDEOLOGICAL';

  // Check institutional split (one side anchored to center)
  const supportNearCenter = Math.abs(supportAvg - 3) <= 1.0;
  const contradictNearCenter = Math.abs(contradictAvg - 3) <= 1.0;
  if (supportNearCenter !== contradictNearCenter && biasDiff >= 1.0) {
    return 'INSTITUTIONAL';
  }

  // Check regional split
  if (regionOverlap < 0.3 && biasDiff < 1.5) return 'REGIONAL';

  // Default: random
  return 'RANDOM';
}
```

### Disagreement Narrative Templates

```typescript
export function generateDisagreementNarrative(
  claim: string,
  pattern: DisagreementAnalysis['pattern'],
  supporting: { name: string; biasTier: BiasTier; region: Region }[],
  contradicting: { name: string; biasTier: BiasTier; region: Region }[]
): string {
  const supportNames = supporting.slice(0, 3).map(s => s.name).join(', ');
  const contradictNames = contradicting.slice(0, 3).map(s => s.name).join(', ');

  switch (pattern) {
    case 'IDEOLOGICAL':
      return (
        `This claim splits along ideological lines. ` +
        `${supportNames} support it, while ${contradictNames} contradict it. ` +
        `The disagreement tracks closely with left-right positioning -- ` +
        `this is a claim where political perspective appears to determine ` +
        `what outlets report as fact.`
      );

    case 'REGIONAL':
      const supportRegionStr = [...new Set(supporting.map(s => s.region))]
        .map(formatRegion).join(', ');
      const contradictRegionStr = [...new Set(contradicting.map(s => s.region))]
        .map(formatRegion).join(', ');
      return (
        `This claim splits along regional lines, not ideological ones. ` +
        `Sources in ${supportRegionStr} support it, ` +
        `while sources in ${contradictRegionStr} contradict it. ` +
        `This pattern often indicates different access to local information ` +
        `or different government transparency standards.`
      );

    case 'INSTITUTIONAL':
      return (
        `This claim shows an institutional split. ` +
        `Wire services and centrist outlets report it differently than ` +
        `partisan sources. This pattern often indicates a framing disagreement ` +
        `rather than a factual one -- the underlying data may be the same, ` +
        `but the characterization differs.`
      );

    case 'RANDOM':
      return (
        `This claim shows no clear ideological or regional pattern in its ` +
        `disagreement. Sources on both sides of the spectrum and from ` +
        `multiple regions disagree. This typically indicates ` +
        `genuinely uncertain information -- the facts may still be emerging.`
      );
  }
}

function formatRegion(region: Region): string {
  const labels: Record<string, string> = {
    US: 'the US', UK: 'the UK', EUROPE: 'Europe',
    MIDDLE_EAST: 'the Middle East', ASIA_PACIFIC: 'Asia-Pacific',
    CANADA: 'Canada', GLOBAL: 'global wire services',
    LATIN_AMERICA: 'Latin America', AFRICA: 'Africa', OCEANIA: 'Oceania',
  };
  return labels[region] || region;
}
```

### Visualization: The Split Diagram

```
Component: DisagreementMap
Location: Story detail page, within ClaimsTracker for contested claims
Trigger: only renders for claims where isContested() === true

Layout (per contested claim):

  ┌─────────────────────────────────────────────────┐
  | CONTESTED -- Ideological Split                   |
  | "The president signed the executive order"       |
  |                                                  |
  |  SUPPORTS                  CONTRADICTS           |
  |  ┌─────────┐              ┌──────────┐          |
  |  | Guardian |              | Fox News |          |
  |  | NPR     |              | Daily    |          |
  |  | HuffPost|              |  Wire    |          |
  |  └─────────┘              └──────────┘          |
  |                                                  |
  |  avg position: 1.3         avg position: 5.7     |
  |                                                  |
  |  [Narrative text explaining the pattern...]      |
  └─────────────────────────────────────────────────┘

Visual details:
  - Split layout: two columns with a vertical divider
  - Left column: green tint (brand-green/5 bg)
  - Right column: red tint (brand-red/5 bg)
  - Source pills: colored by their bias tier (existing pill style)
  - Pattern label: "Ideological Split" / "Regional Split" /
    "Institutional Split" / "No Clear Pattern"
  - Pattern label uses amber for ideological, teal for regional,
    purple for institutional, grey for random
  - Connecting lines between the same source across multiple
    contested claims (shows if a source is consistently on one side)

Aggregate view (story-level):
  At the top of ClaimsTracker, before individual claims:
  "Of {n} extracted claims, {converged} are converged and
   {contested} are contested. Contested claims split
   {x} ideologically, {y} regionally, {z} with no clear pattern."
```

---

## 4. Source Credibility Trajectories

### What It Is

A per-source "track record" showing how often a source's claims get independently confirmed by ideologically distant outlets. This is NOT a credibility rating -- it is a confirmation rate, purely mathematical.

### Algorithm

```typescript
// app/lib/source-trajectory.ts

interface SourceTrajectory {
  sourceId: string;
  sourceName: string;
  biasTier: BiasTier;
  region: Region;

  // Core metrics
  totalClaims: number;           // claims from articles by this source
  confirmedByAdversary: number;  // claims also confirmed by source 2+ tiers away
  contestedCount: number;        // claims contradicted by another source
  unconfirmedCount: number;      // claims with no other source weighing in

  // Derived
  confirmationRate: number;      // confirmedByAdversary / totalClaims (0-1)
  contestationRate: number;      // contestedCount / totalClaims (0-1)

  // Trend (rolling 30-day windows)
  trend: {
    period: string;              // "2026-02", "2026-03"
    confirmationRate: number;
    claimCount: number;
  }[];

  // Peer comparison
  peerAvgConfirmation: number;   // avg confirmation rate for same bias tier
  peerRank: number;              // 1 = highest confirmation in tier
  peerTotal: number;             // total sources in tier
}

/**
 * "Adversary" = a source at least 2 bias tier positions away.
 *
 * Example: For a LEFT source (position 1), adversaries are
 * CENTER_RIGHT (4), RIGHT (5), FAR_RIGHT (6).
 *
 * For a CENTER source (position 3), adversaries are
 * FAR_LEFT (0), LEFT (1), RIGHT (5), FAR_RIGHT (6).
 *
 * This prevents the metric from being inflated by echo-chamber
 * confirmation (LEFT confirmed by CENTER_LEFT is expected and
 * uninteresting).
 */
const MIN_ADVERSARY_DISTANCE = 2;

export function calculateSourceTrajectory(
  sourceId: string,
  claims: {
    claimId: string;
    claimText: string;
    convergenceScore: number;
    sourceArticleBiasTier: BiasTier;
    otherConfirmingSources: { biasTier: BiasTier }[];
    isContested: boolean;
  }[]
): Pick<SourceTrajectory, 'totalClaims' | 'confirmedByAdversary' |
  'contestedCount' | 'unconfirmedCount' | 'confirmationRate' |
  'contestationRate'> {

  const TIER_POS: Record<string, number> = {
    FAR_LEFT: 0, LEFT: 1, CENTER_LEFT: 2,
    CENTER: 3, CENTER_RIGHT: 4, RIGHT: 5, FAR_RIGHT: 6,
  };

  let confirmedByAdversary = 0;
  let contested = 0;
  let unconfirmed = 0;

  const sourcePos = TIER_POS[claims[0]?.sourceArticleBiasTier] ?? 3;

  for (const claim of claims) {
    if (claim.isContested) {
      contested++;
      continue;
    }

    const hasAdversaryConfirmation = claim.otherConfirmingSources.some(s => {
      const otherPos = TIER_POS[s.biasTier] ?? 3;
      return Math.abs(sourcePos - otherPos) >= MIN_ADVERSARY_DISTANCE;
    });

    if (hasAdversaryConfirmation) {
      confirmedByAdversary++;
    } else if (claim.otherConfirmingSources.length === 0) {
      unconfirmed++;
    }
  }

  const total = claims.length;

  return {
    totalClaims: total,
    confirmedByAdversary,
    contestedCount: contested,
    unconfirmedCount: unconfirmed,
    confirmationRate: total > 0 ? confirmedByAdversary / total : 0,
    contestationRate: total > 0 ? contested / total : 0,
  };
}
```

### Visualization: Source Profile Card

```
Component: SourceProfile
Route: /source/:id
Access: Premium feature

Layout:

  ┌──────────────────────────────────────────────────────────┐
  |  THE GUARDIAN                                             |
  |  Left -- United Kingdom           Since tracking: Jan '26 |
  |                                                           |
  |  ┌─────────────────────────────────────────────────┐     |
  |  |  Confirmation Rate                               |     |
  |  |                                                  |     |
  |  |  [============================------]  72%       |     |
  |  |                                                  |     |
  |  |  Peer avg (Left tier): 61%                       |     |
  |  |  Rank: 2nd of 8 tracked Left sources             |     |
  |  └─────────────────────────────────────────────────┘     |
  |                                                           |
  |  ┌─────────────────────────────────────────────────┐     |
  |  |  Claim Breakdown          (127 claims tracked)   |     |
  |  |                                                  |     |
  |  |  Confirmed by adversary   72%  ████████████░░░  |     |
  |  |  Confirmed by neighbor    14%  ██░░░░░░░░░░░░░  |     |
  |  |  Contested                 8%  █░░░░░░░░░░░░░░  |     |
  |  |  Unconfirmed               6%  █░░░░░░░░░░░░░░  |     |
  |  └─────────────────────────────────────────────────┘     |
  |                                                           |
  |  ┌─────────────────────────────────────────────────┐     |
  |  |  30-Day Trend                                    |     |
  |  |       ___                                        |     |
  |  |  80% /   \    ___                                |     |
  |  |     /     \__/   \                               |     |
  |  |  60%              \___                           |     |
  |  |                       \___                       |     |
  |  |  40%                                             |     |
  |  |  Jan    Feb    Mar                               |     |
  |  └─────────────────────────────────────────────────┘     |
  |                                                           |
  |  "72% of The Guardian's factual claims have been          |
  |   independently confirmed by sources at least 2 bias      |
  |   tiers away. This places The Guardian 2nd among 8        |
  |   tracked Left-leaning sources. Their confirmation rate   |
  |   has declined 4 points over the past 30 days."           |
  └──────────────────────────────────────────────────────────┘

Colors:
  - Confirmed by adversary: brand-green
  - Confirmed by neighbor: brand-teal
  - Contested: brand-red
  - Unconfirmed: ink/20

Trend line:
  - Color: brand-green if above peer avg, brand-amber if below
  - Peer avg shown as dashed horizontal line

CRITICAL FRAMING NOTE:
  The page must include a disclaimer:
  "Confirmation rate measures how often other outlets independently
   report the same facts. It does not measure accuracy, quality,
   or trustworthiness. A low confirmation rate may indicate
   exclusive reporting, not unreliable reporting."
```

### Narrative Template

```typescript
export function generateSourceNarrative(t: SourceTrajectory): string {
  const pct = Math.round(t.confirmationRate * 100);
  const peerPct = Math.round(t.peerAvgConfirmation * 100);
  const tierLabel = formatTier(t.biasTier);

  let narrative = `${pct}% of ${t.sourceName}'s factual claims have been ` +
    `independently confirmed by sources at least 2 bias tiers away. `;

  if (pct > peerPct + 5) {
    narrative += `This places ${t.sourceName} above the ${tierLabel} ` +
      `tier average of ${peerPct}%. `;
  } else if (pct < peerPct - 5) {
    narrative += `This is below the ${tierLabel} tier average of ${peerPct}%. `;
  } else {
    narrative += `This is in line with the ${tierLabel} tier average of ${peerPct}%. `;
  }

  // Trend
  if (t.trend.length >= 2) {
    const recent = t.trend[t.trend.length - 1];
    const prior = t.trend[t.trend.length - 2];
    const delta = Math.round((recent.confirmationRate - prior.confirmationRate) * 100);
    if (Math.abs(delta) >= 3) {
      narrative += `Their confirmation rate has ${delta > 0 ? 'risen' : 'declined'} ` +
        `${Math.abs(delta)} points over the past 30 days.`;
    } else {
      narrative += `Their confirmation rate has been stable over the past 30 days.`;
    }
  }

  return narrative;
}
```

### Schema Addition

```prisma
model SourceMonthlyStats {
  id                    String   @id @default(uuid())
  sourceId              String
  month                 DateTime @db.Date  // first of month
  totalClaims           Int
  confirmedByAdversary  Int
  contestedCount        Int
  unconfirmedCount      Int
  confirmationRate      Float
  contestationRate      Float
  createdAt             DateTime @default(now())

  source                Source   @relation(fields: [sourceId], references: [id])

  @@unique([sourceId, month])
  @@map("source_monthly_stats")
}
```

---

## 5. The "Why It Matters" Explanatory Layer

### What It Is

An on-demand contextual layer that translates convergence data into plain language for non-expert users. Every data point in the UI should be one tap/hover away from an explanation. This is not dumbing down -- it is providing the interpretive frame that makes data actionable.

### Implementation: Tooltip + Expandable System

```typescript
// app/lib/explainers.ts

/**
 * Explainer content keyed by data point type.
 * Each explainer has:
 * - short: one sentence for tooltips (< 100 chars)
 * - long: full explanation for expanded view (2-4 sentences)
 * - benchmark: a statistical comparison that anchors the number
 */

interface Explainer {
  short: string;
  long: string;
  benchmark?: string;
}

// --- CONVERGENCE SCORE EXPLAINERS ---

export function explainConvergenceScore(score: number): Explainer {
  const pct = Math.round(score * 100);

  if (pct >= 80) return {
    short: `${pct}% -- exceptionally high agreement across the spectrum.`,
    long: `${pct}% of the ideological spectrum confirms the same facts about this story. ` +
      `Sources that rarely agree -- from far-left to far-right -- are reporting the same claims. ` +
      `This level of agreement is the strongest signal Triangulate can produce.`,
    benchmark: `This happens on roughly 5% of stories we track. ` +
      `When it does, the underlying facts are very likely accurate.`,
  };

  if (pct >= 60) return {
    short: `${pct}% -- strong agreement with some gaps.`,
    long: `${pct}% convergence means sources across most of the political spectrum ` +
      `are confirming the same core facts, though some outlets disagree on details. ` +
      `The central claims are well-supported.`,
    benchmark: `About 15% of multi-source stories reach this level. ` +
      `The core facts are likely solid; disputed details deserve attention.`,
  };

  if (pct >= 40) return {
    short: `${pct}% -- moderate agreement, notable gaps.`,
    long: `${pct}% convergence means some cross-spectrum agreement exists, ` +
      `but significant portions of the ideological landscape are either ` +
      `silent or reporting different facts. The story is developing.`,
    benchmark: `This is the most common range -- about 35% of stories land here. ` +
      `Treat key claims with healthy skepticism until convergence rises.`,
  };

  if (pct >= 20) return {
    short: `${pct}% -- weak agreement, mostly contested.`,
    long: `${pct}% convergence means very few outlets across the spectrum agree on the facts. ` +
      `Most claims are either contested or unconfirmed by adversarial sources. ` +
      `This story's factual foundation is uncertain.`,
    benchmark: `About 25% of stories have this weak a signal. ` +
      `Wait for more sources before drawing conclusions.`,
  };

  return {
    short: `${pct}% -- minimal convergence detected.`,
    long: `${pct}% convergence means almost no cross-spectrum agreement. ` +
      `Either very few outlets are covering this story, or the ones that are ` +
      `disagree on fundamental facts.`,
    benchmark: `About 20% of stories never rise above this level. ` +
      `This is not necessarily wrong -- it may be too early for convergence.`,
  };
}

// --- TRUST SIGNAL EXPLAINERS ---

export function explainTrustSignal(signal: TrustSignal): Explainer {
  switch (signal) {
    case 'SINGLE_SOURCE':
      return {
        short: 'Only one outlet is reporting this story.',
        long: 'This story has been reported by a single news outlet. ' +
          'No other source has independently covered the same event. ' +
          'This does not mean the story is wrong -- it means it has not ' +
          'been independently verified through our convergence process.',
        benchmark: 'About 40% of stories start as single-source. ' +
          'Many gain additional coverage within 24-48 hours.',
      };

    case 'CONTESTED':
      return {
        short: 'Multiple outlets cover this, but they disagree on key facts.',
        long: 'Multiple news outlets have reported on this event, but they ' +
          'disagree on one or more factual claims. The Claims section below ' +
          'shows exactly which facts are disputed and by whom.',
        benchmark: 'About 30% of multi-source stories remain contested. ' +
          'Check the Disagreement Map to see if the split is ideological, ' +
          'regional, or random.',
      };

    case 'CONVERGED':
      return {
        short: 'Sources across the political spectrum confirm the same facts.',
        long: 'Outlets from different ideological positions have independently ' +
          'reported the same factual claims. This is the core signal Triangulate ' +
          'is built to detect -- when adversaries agree, the facts are likely solid.',
        benchmark: 'Only about 20% of multi-source stories reach this level. ' +
          'Cross-spectrum agreement is genuinely rare and meaningful.',
      };

    case 'SOURCE_BACKED':
      return {
        short: 'Converged facts AND linked to primary source documents.',
        long: 'This story has both cross-spectrum convergence and references to ' +
          'primary source documents (court filings, legislation, official data). ' +
          'The facts are confirmed by both independent reporting and original documents.',
        benchmark: 'Fewer than 10% of stories have both convergence and primary ' +
          'documentation. This is a very strong factual signal.',
      };

    case 'INSTITUTIONALLY_VALIDATED':
      return {
        short: 'Converged, documented, AND an institution has acted on it.',
        long: 'Beyond cross-spectrum agreement and primary documents, an institution ' +
          '(court, legislature, agency) has taken concrete action related to this story. ' +
          'Institutional action is the strongest possible external validation.',
        benchmark: 'This is the rarest signal -- fewer than 3% of stories. ' +
          'When institutions act, the underlying facts are essentially confirmed.',
      };
  }
}

// --- GCI EXPLAINERS ---

export function explainGCI(score: number): Explainer {
  if (score >= 80) return {
    short: `GCI ${score} -- the news landscape is highly aligned on facts today.`,
    long: `A Global Convergence Index of ${score} means that across all stories ` +
      `we track today, outlets from different political positions are largely ` +
      `reporting the same facts. This is an unusually high reading.`,
    benchmark: `The GCI has been above 80 on only X days in the past 90 days. ` +
      `This typically coincides with unambiguous, well-documented events.`,
  };

  if (score >= 60) return {
    short: `GCI ${score} -- healthy factual agreement across the spectrum.`,
    long: `A Global Convergence Index of ${score} means most major stories today ` +
      `have meaningful cross-spectrum agreement on core facts. Some stories are ` +
      `still contested, but the overall landscape is more convergent than not.`,
    benchmark: `The GCI averages around 55-65 on a typical day. ` +
      `${score} is within the normal range.`,
  };

  // ... similar for lower bands ...

  return {
    short: `GCI ${score} -- significant factual fragmentation today.`,
    long: `A Global Convergence Index of ${score} means outlets are telling ` +
      `very different factual stories today. Core claims are contested across ` +
      `the spectrum. Information consumers should be especially cautious.`,
    benchmark: `The GCI drops below 40 on roughly 1 in 5 days. ` +
      `This is not unusual but warrants attention.`,
  };
}

// --- SOURCE COUNT EXPLAINERS ---

export function explainSourceCount(
  count: number,
  tierCount: number,
  regionCount: number
): Explainer {
  return {
    short: `${count} outlets across ${tierCount} bias tiers and ${regionCount} regions.`,
    long: `This story is being covered by ${count} news outlets. ` +
      `They span ${tierCount} of 7 possible bias tiers ` +
      `(from Far Left to Far Right) and ${regionCount} global regions. ` +
      (tierCount >= 5
        ? 'This is broad spectrum coverage -- the story is being reported by almost every ideological position.'
        : tierCount >= 3
        ? 'Coverage spans a meaningful portion of the spectrum but has gaps.'
        : 'Coverage is concentrated in a narrow portion of the spectrum.'),
    benchmark: tierCount >= 5
      ? 'Stories covered by 5+ tiers represent the top 10% of coverage breadth.'
      : `The average multi-source story spans ${3} tiers.`,
  };
}
```

### UI Component

```
Component: ExplainerTooltip
Trigger: "?" icon next to any data point, or hover on premium tier
Style: Popover with subtle shadow, 280px max-width

  ┌──────────────────────────────────┐
  |  82% Convergence                 |
  |                                  |
  |  Sources across the political    |
  |  spectrum confirm the same facts |
  |  about this story. This level of |
  |  agreement is the strongest      |
  |  signal Triangulate produces.    |
  |                                  |
  |  ─────────────────────────────── |
  |  This happens on roughly 5% of  |
  |  stories we track.              |
  └──────────────────────────────────┘

  - "?" icon: 14px, ink-faint, hover to ink-muted
  - Popover bg: paper (light) / surface (dark)
  - Border: border-border
  - Benchmark section: separated by thin rule, dateline style
  - Animation: fade in 150ms

  On mobile: tapping "?" opens an expandable section inline
  rather than a popover (avoids tooltip positioning issues).
```

---

## 6. Comparative Story Cards

### What It Is

A system that surfaces interesting comparisons between stories -- same topic different convergence, same sources different conclusions, or temporal comparisons (how convergence on an issue has evolved). These are the "aha moment" generators.

### Comparison Types

```typescript
// app/lib/comparisons.ts

type ComparisonType =
  | 'CONVERGENCE_SHIFT'    // Same topic, different convergence levels over time
  | 'SOURCE_REVERSAL'      // A source that supported a claim now contradicts it (or vice versa)
  | 'REGIONAL_DIVERGENCE'  // Same event, US says X, Europe says Y
  | 'SPEED_TO_CONVERGENCE' // Story A converged in 2 hours, Story B took 5 days
  | 'OUTLIER_CONFIRMED'    // A claim initially from one fringe source later confirmed by center
  ;

interface StoryComparison {
  type: ComparisonType;
  storyA: { id: string; title: string; convergence: number; date: string };
  storyB: { id: string; title: string; convergence: number; date: string };
  headline: string;    // The comparison expressed as a sentence
  detail: string;      // 2-3 sentence explanation
  significance: number; // 0-1, how interesting/rare this comparison is
}
```

### Comparison Detection Algorithms

```typescript
/**
 * CONVERGENCE_SHIFT: Find pairs of stories on the same topic
 * where convergence changed dramatically.
 *
 * Uses entity signature overlap to find related stories,
 * then compares their convergence scores.
 */
export function findConvergenceShifts(
  stories: {
    id: string;
    title: string;
    entitySignature: string[];
    highestConvergence: number;
    createdAt: Date;
  }[]
): StoryComparison[] {
  const comparisons: StoryComparison[] = [];

  for (let i = 0; i < stories.length; i++) {
    for (let j = i + 1; j < stories.length; j++) {
      const a = stories[i];
      const b = stories[j];

      // Must share at least 2 entities
      const shared = a.entitySignature
        .filter(e => b.entitySignature.includes(e));
      if (shared.length < 2) continue;

      // Must have meaningfully different convergence
      const diff = Math.abs(a.highestConvergence - b.highestConvergence);
      if (diff < 0.25) continue;

      // Must be at least 24 hours apart (not the same news cycle)
      const hoursDiff = Math.abs(
        a.createdAt.getTime() - b.createdAt.getTime()
      ) / (1000 * 60 * 60);
      if (hoursDiff < 24) continue;

      const [higher, lower] = a.highestConvergence > b.highestConvergence
        ? [a, b] : [b, a];
      const higherPct = Math.round(higher.highestConvergence * 100);
      const lowerPct = Math.round(lower.highestConvergence * 100);

      comparisons.push({
        type: 'CONVERGENCE_SHIFT',
        storyA: {
          id: higher.id, title: higher.title,
          convergence: higher.highestConvergence,
          date: higher.createdAt.toISOString(),
        },
        storyB: {
          id: lower.id, title: lower.title,
          convergence: lower.highestConvergence,
          date: lower.createdAt.toISOString(),
        },
        headline: `Convergence on "${shared[0]}" shifted from ${lowerPct}% to ${higherPct}%`,
        detail: `Two stories about ${shared.join(' and ')} show dramatically ` +
          `different levels of cross-spectrum agreement. ` +
          `"${higher.title.slice(0, 60)}..." reached ${higherPct}% convergence, ` +
          `while "${lower.title.slice(0, 60)}..." reached only ${lowerPct}%. ` +
          `The difference suggests that specific framing or new evidence ` +
          `changed how outlets reported on this topic.`,
        significance: diff * (shared.length / 5), // more shared entities = more meaningful
      });
    }
  }

  return comparisons.sort((a, b) => b.significance - a.significance);
}

/**
 * SPEED_TO_CONVERGENCE: Track how quickly different stories converge.
 *
 * Some stories converge within hours (breaking hard news).
 * Others take days (complex investigations, contested science).
 * The speed itself is a signal.
 */
export function findSpeedComparisons(
  stories: {
    id: string;
    title: string;
    highestConvergence: number;
    firstArticleAt: Date;
    convergenceReachedAt: Date | null; // when score first crossed 0.7
  }[]
): StoryComparison[] {
  const converged = stories.filter(
    s => s.convergenceReachedAt && s.highestConvergence >= 0.7
  );

  if (converged.length < 2) return [];

  // Sort by speed (fastest first)
  const withSpeed = converged.map(s => ({
    ...s,
    hoursToConverge: (s.convergenceReachedAt!.getTime() - s.firstArticleAt.getTime())
      / (1000 * 60 * 60),
  })).sort((a, b) => a.hoursToConverge - b.hoursToConverge);

  const comparisons: StoryComparison[] = [];

  // Compare fastest vs slowest
  if (withSpeed.length >= 2) {
    const fastest = withSpeed[0];
    const slowest = withSpeed[withSpeed.length - 1];
    const speedRatio = slowest.hoursToConverge / Math.max(fastest.hoursToConverge, 0.5);

    if (speedRatio >= 3) {
      comparisons.push({
        type: 'SPEED_TO_CONVERGENCE',
        storyA: {
          id: fastest.id, title: fastest.title,
          convergence: fastest.highestConvergence,
          date: fastest.firstArticleAt.toISOString(),
        },
        storyB: {
          id: slowest.id, title: slowest.title,
          convergence: slowest.highestConvergence,
          date: slowest.firstArticleAt.toISOString(),
        },
        headline:
          `"${fastest.title.slice(0, 40)}..." converged in ` +
          `${formatDuration(fastest.hoursToConverge)} -- ` +
          `"${slowest.title.slice(0, 40)}..." took ` +
          `${formatDuration(slowest.hoursToConverge)}`,
        detail:
          `Both stories ultimately reached strong convergence, but at ` +
          `very different speeds. Fast convergence typically indicates ` +
          `unambiguous, well-documented events. Slow convergence suggests ` +
          `the facts were initially murky, contested, or required ` +
          `investigation to verify.`,
        significance: Math.min(1, speedRatio / 10),
      });
    }
  }

  return comparisons;
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${Math.round(hours)} hours`;
  return `${Math.round(hours / 24)} days`;
}
```

### Visualization: Comparison Card

```
Component: ComparisonCard
Location: Homepage sidebar (desktop), below feed (mobile)
Also: /comparisons page for full list
Access: Free users see 1/day, Premium unlimited

Layout:

  ┌──────────────────────────────────────────────────────┐
  |  CONVERGENCE SHIFT                            Weekly |
  |  ──────────────────────────────────────────────────  |
  |                                                      |
  |  Convergence on "federal budget" shifted              |
  |  from 23% to 87%                                     |
  |                                                      |
  |  ┌────────────────┐    ┌────────────────┐           |
  |  |  Mar 5          |    |  Mar 19         |          |
  |  |  "Budget Talks  |    |  "Budget Bill   |          |
  |  |   Stall in      |    |   Passes With   |          |
  |  |   Congress"     |    |   Bipartisan    |          |
  |  |                 |    |   Support"      |          |
  |  |  [====--] 23%   |    |  [========] 87% |          |
  |  |  3 outlets      |    |  14 outlets     |          |
  |  |  2 tiers        |    |  6 tiers        |          |
  |  └────────────────┘    └────────────────┘           |
  |                                                      |
  |  "Two stories about federal budget show              |
  |   dramatically different levels of agreement.        |
  |   The shift suggests new evidence or resolution      |
  |   changed how outlets reported on this topic."       |
  └──────────────────────────────────────────────────────┘

Visual details:
  - Two mini story cards side by side
  - Convergence bars use the same green/amber/red color coding
  - Arrow or gradient between them showing the direction of change
  - Headline is bold font-headline
  - Detail text is font-body, text-sm, text-ink-muted
  - Type badge in top-left: "CONVERGENCE SHIFT" / "SPEED COMPARISON" etc.
  - Comparative connector: a thin line or arrow between the two cards
    with the delta value on it ("+64%")
```

### Aggregate Comparisons View

```
Route: /comparisons
Title: "Patterns in Convergence"

Sections:
1. "Biggest Convergence Shifts This Week" -- stories where
   convergence changed most between related events
2. "Fastest to Converge" -- stories that went from 0 to 70%+
   in under 6 hours
3. "Slow Burns" -- stories that took days to converge
4. "Source Reversals" -- sources that changed position on a claim

Each section shows 3-5 comparison cards.
Premium feature for full access; free tier sees section headers
and the top comparison from each.
```

---

## Implementation Priority

| System | Complexity | Data Ready? | Premium Gate? | Priority |
|--------|-----------|-------------|---------------|----------|
| Why It Matters (explainers) | Low | Yes -- all data exists | No (free) | SHIP FIRST |
| Convergence Narratives | Medium | Yes -- all data exists | Partial | SHIP SECOND |
| Disagreement Map | Medium | Yes -- isContested + sources exist | Partial | SHIP THIRD |
| Global Convergence Index | Medium | Needs daily aggregation job | No (free) | SHIP FOURTH |
| Comparative Story Cards | High | Needs entity signatures stored | Yes | SHIP FIFTH |
| Source Trajectories | High | Needs monthly aggregation | Yes | SHIP SIXTH |

### Schema Migrations Required

1. `DailyGCI` table (for GCI history)
2. `SourceMonthlyStats` table (for source trajectories)
3. Add `convergenceReachedAt` field to `Story` model (for speed comparisons)
4. Add `entitySignature` field to `Story` model (for topic comparisons)

### New Files to Create

```
app/lib/gci.ts                    -- GCI calculation
app/lib/narrative.ts              -- Convergence narrative generation
app/lib/disagreement.ts           -- Disagreement classification
app/lib/source-trajectory.ts      -- Source confirmation tracking
app/lib/explainers.ts             -- Why It Matters content
app/lib/comparisons.ts            -- Comparative story detection

app/components/data/GCIGauge.tsx           -- GCI homepage widget
app/components/data/GCITicker.tsx          -- GCI header ticker
app/components/data/ConvergenceNarrative.tsx -- Story narrative block
app/components/data/DisagreementMap.tsx     -- Contested claim visualization
app/components/data/ExplainerTooltip.tsx    -- Contextual explainer
app/components/data/ComparisonCard.tsx      -- Side-by-side comparison
app/components/data/SourceProfile.tsx       -- Source trajectory page

app/routes/convergence-index.tsx   -- Full GCI history page
app/routes/source.$id.tsx          -- Source profile page
app/routes/comparisons.tsx         -- Comparative patterns page
app/routes/api.gci.compute.ts      -- Daily GCI computation endpoint
```

---

## Design Principles (For All Systems)

1. **Pre-interpreted numbers.** No user should ever see a raw number without context. "82%" always appears with "exceptionally high agreement" or equivalent. The interpretation is not optional -- it is part of the data display.

2. **One insight per component.** Each visualization makes exactly one point. The GCI Gauge says "today's overall convergence is X." The Convergence Narrative says "here's why this story's convergence matters." Never combine two insights into one visual.

3. **Color carries meaning, not decoration.** Green = converged. Amber = contested/developing. Red = low convergence or single source. Purple = institutional. Teal = regional/neutral. Every color usage should be traceable to one of these meanings.

4. **Benchmarks anchor every number.** "82%" means nothing without "this happens on 5% of stories." Every number gets a benchmark -- either historical ("average is X"), categorical ("this places it in the top Y%"), or temporal ("this is Z points higher than last month").

5. **Narrative before data.** On the story page, the Convergence Narrative (words) appears before the ConvergencePanel (visualization). Humans process stories before charts. The chart confirms what the narrative claimed.

6. **Disagreement is as valuable as agreement.** The system never treats contested claims as failures. A cleanly classified ideological split is just as informative as convergence -- it tells the user exactly where the fault line is and why.

7. **Framing is neutral, always.** The system describes patterns ("this claim splits along ideological lines") without judging which side is correct. Triangulate illuminates; it does not adjudicate. The user decides.
