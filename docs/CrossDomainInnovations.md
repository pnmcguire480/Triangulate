# Cross-Domain Innovation Specifications

> Synthesized from UI Design, Interaction Design, UX Architecture, and Accessibility audits.
> These five systems exist at the intersection of game design, data visualization, and journalism.
> Each is specified to implementation depth against the existing Triangulate codebase.

---

## 1. The Convergence Heatmap Timeline

### Design Philosophy: Fog of War Meets News

In strategy games, fog of war creates tension through partial information. The player knows the map exists but cannot see it until scouts explore. This is exactly how news convergence works in reality: a story breaks with a single source, and the "map" of truth is almost entirely obscured. As more outlets confirm facts, the fog lifts. The Convergence Heatmap Timeline makes this process visible.

The key insight no specialist proposed: **time is the most underused dimension in news products.** Every existing news tool shows you the current state. None show you the *process* by which that state was reached. This is the difference between a photograph and a time-lapse -- and the time-lapse is always more informative.

### Visual Design

The timeline occupies a horizontal band below the story header, 120px tall on desktop, 80px on mobile. It spans the full width of the content area.

**The X axis** is time, from the first article's `publishedAt` to the present (or to the most recent article). Time is not linear -- it uses a logarithmic scale that expands the first few hours (when most action happens) and compresses the later quiet periods. This matches how news actually develops: a burst of coverage, then tapering.

**The Y axis** is the 7-tier bias spectrum, from FAR_LEFT at the top to FAR_RIGHT at the bottom. CENTER occupies the middle, with slight visual emphasis (a faint horizontal rule at the center line, like the equator on a map).

**The heatmap cells** are rendered as a grid of rectangles. Each cell represents a time bucket (adaptive: 15-minute buckets for stories under 6 hours old, 1-hour buckets for stories under 2 days, 6-hour buckets for older stories) crossed with a bias tier. Cell color intensity represents article count in that bucket-tier intersection:

- **0 articles:** Fog state. Light mode: `var(--color-paper-dark)` with a subtle crosshatch SVG pattern (like uncharted territory on old maps). Dark mode: `var(--color-surface)` with faint static noise (CSS grain pattern at 2% opacity).
- **1 article:** Dim glow. Light: `var(--color-brand-green)` at 15% opacity. Dark: `var(--color-neon-green)` at 10% opacity.
- **2-3 articles:** Medium glow. Light: `var(--color-brand-green)` at 40% opacity. Dark: `var(--color-neon-green)` at 30% opacity.
- **4+ articles:** Full illumination. Light: `var(--color-brand-green)` at 70% opacity. Dark: `var(--color-neon-green)` at 60% opacity with a `box-shadow: 0 0 8px rgba(0, 255, 136, 0.2)` bleed effect.

**The fog edge** is the critical visual element. Where illuminated cells meet fog cells, the boundary is not a hard edge. It is a radial gradient falloff -- illuminated cells "glow" into adjacent fog cells at 20% of their intensity. This creates the impression of partial knowledge: you can almost see what is near the known facts, but not quite. Implemented with CSS `filter: blur(2px)` on a separate overlay layer composited above the grid.

**Convergence score overlay:** A line chart runs across the top of the heatmap showing the story's aggregate convergence score over time. This line starts at 0 when there is a single source and rises as cross-spectrum confirmation occurs. The line color transitions from `var(--color-brand-red)` (low convergence) through `var(--color-brand-amber)` to `var(--color-brand-green)` (high convergence) using an SVG `<linearGradient>` mapped to the score value at each time point.

### Interaction Model

**Hover:** Moving the cursor over any cell reveals a tooltip anchored to the cursor showing:
- Time bucket range ("2:00 PM - 2:15 PM EST")
- Bias tier name ("CENTER_LEFT")
- Article count in this cell
- Source names (up to 3, with "+N more" overflow)
- Convergence score at this moment in time

**Scrub:** Clicking and dragging horizontally along the timeline scrubs through time. A vertical hairline follows the cursor. All other components on the story page (ConvergencePanel, ClaimsTracker) reactively filter to show only data available up to the scrubbed timestamp. This transforms the static story page into a temporal exploration tool. The user can literally watch the story develop, seeing which sources were first, when cross-spectrum confirmation happened, and whether the narrative changed.

**Keyboard:** Left/Right arrow keys move the scrub point by one time bucket. Home/End jump to the first/last bucket. The scrub hairline is focused with `tabindex="0"` and has `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` set to timestamp values, and `aria-label="Story timeline scrubber"`.

**Snap points:** The timeline auto-detects "moments of significance" -- timestamps where the convergence score changed by more than 0.1 in a single bucket, or where a new bias tier entered the story. These are marked with small diamond indicators above the heatmap. Pressing Tab when the scrubber is focused cycles between snap points.

### Data Requirements

The existing `Article.publishedAt` field provides all necessary temporal data. No schema changes required. The timeline data is computed at render time from the story's articles array, which is already loaded in the story detail page loader.

```typescript
// Types for the timeline data structure
interface TimelineBucket {
  startTime: Date;
  endTime: Date;
  tiers: Record<BiasTier, TimelineTierCell>;
  convergenceScore: number; // computed at this point in time
}

interface TimelineTierCell {
  articleCount: number;
  sourceNames: string[];
  regions: Region[];
}

interface ConvergenceSnapshot {
  timestamp: Date;
  score: number;
  tiersCovered: BiasTier[];
  regionsCovered: Region[];
  isSignificantMoment: boolean;
  momentReason?: 'new_tier' | 'score_jump' | 'contradiction' | 'first_cross_center';
}
```

### Component API

```typescript
interface ConvergenceTimelineProps {
  articles: Array<{
    id: string;
    publishedAt: string; // ISO string
    source: {
      name: string;
      biasTier: BiasTier;
      region: Region;
    };
  }>;
  claims: Array<{
    id: string;
    convergenceScore: number;
    sources: Array<{
      articleId: string;
      supports: boolean;
    }>;
  }>;
  onScrub?: (timestamp: Date | null) => void; // null = show all (no scrub active)
  height?: number; // default: 120
  className?: string;
}
```

### Rendering Approach

Use **SVG** for the heatmap grid and convergence line, not Canvas. Rationale:
1. The cell count is bounded (max ~200 cells for a 7-day story at 6-hour buckets across 7 tiers = 196 cells). SVG handles this without performance concern.
2. SVG elements are individually addressable for hover states, ARIA labels, and CSS transitions.
3. The existing codebase uses no Canvas -- SVG keeps the rendering approach consistent.
4. The fog blur effect composites naturally with SVG `<filter>` elements.

The SVG structure:

```
<svg viewBox="0 0 {width} {height}" role="img" aria-label="Convergence timeline heatmap">
  <defs>
    <pattern id="fog-crosshatch"> ... </pattern>
    <filter id="fog-blur"><feGaussianBlur stdDeviation="2"/></filter>
    <linearGradient id="convergence-gradient"> ... </linearGradient>
  </defs>

  <!-- Fog layer (full grid of crosshatch) -->
  <g class="fog-layer" filter="url(#fog-blur)">
    <rect ... fill="url(#fog-crosshatch)" /> for each unilluminated cell
  </g>

  <!-- Data layer (illuminated cells) -->
  <g class="data-layer">
    <rect ... /> for each cell with articles
    <!-- Each rect has CSS transition on opacity for scrub animation -->
  </g>

  <!-- Convergence score line -->
  <path class="convergence-line" d="..." stroke="url(#convergence-gradient)" />

  <!-- Significance markers -->
  <g class="snap-points">
    <polygon points="diamond shape" /> for each significant moment
  </g>

  <!-- Scrub hairline (positioned via state) -->
  <line class="scrub-line" x1={scrubX} y1="0" x2={scrubX} y2={height}
        stroke="var(--color-ink)" stroke-dasharray="2 2" />
</svg>
```

### Animation Choreography

On initial render, the heatmap does not appear fully formed. It performs a left-to-right reveal over 1.2 seconds, using a `clip-path: inset(0 {100-progress}% 0 0)` animation. This creates the sensation of the timeline "unfolding" as if the user is watching history unspool. The convergence line draws itself using the standard SVG `stroke-dashoffset` animation technique.

During scrubbing, cells to the right of the scrub point transition to 20% opacity over 150ms. The convergence line path is recomputed to terminate at the scrub point. This is a CSS transition, not a JS animation -- the component sets a CSS custom property `--scrub-progress` on the SVG element, and the cells use `opacity: calc(var(--cell-time) <= var(--scrub-progress) ? 1 : 0.2)` logic implemented via data attributes and a corresponding Tailwind utility.

Actually, since CSS cannot do conditional logic on custom properties that way, the implementation uses a class-based approach: cells with `data-bucket-index` greater than the current scrub bucket index get a `.dimmed` class toggled via React state. The transition is on the `opacity` CSS property with `transition: opacity 150ms ease-out`.

### Accessibility

- `role="img"` on the SVG with a computed `aria-label` that describes the overall pattern: "Convergence timeline for [story title]. Coverage spans [time range]. [N] sources across [M] bias tiers. Convergence score reached [X]% at [time]."
- Each significance marker has `role="button"` and `aria-label` describing the event: "New coverage from RIGHT tier at 3:15 PM increased convergence to 67%."
- Screen reader users get a text-based alternative below the SVG: a `<details>` element with `<summary>Timeline data</summary>` containing a simple table of time buckets and their data.
- The scrubber implements `role="slider"` with full keyboard support as described above.

---

## 2. The Adversarial Constellation

### Design Philosophy: Star Maps for Information

Linear bias spectrums (like Triangulate's current `biasSpreadWidth` bar in StoryCard) compress two dimensions of information into one. The existing system knows both **bias tier** (7 values) and **region** (10 values) for every source. This is 70 possible positions, yet the current UI projects them onto a single axis.

The Adversarial Constellation uses the full 2D space. It borrows from astronomical star charts: individual sources are stars, stories create gravitational connections, and high convergence creates bright nebulae where enemies agree.

No news product has attempted this because no news product has the data model to support it. Triangulate's schema -- with `BiasTier`, `Region`, `ClaimSource.supports`, and computed `convergenceScore` -- provides exactly the inputs needed.

### Coordinate System

**X axis: Ideological Position**
Uses the existing `BIAS_TIER_POSITION` mapping (0-6 scale) from `convergence.ts`. Positions are:
- FAR_LEFT: x = 0 (leftmost)
- LEFT: x = 1
- CENTER_LEFT: x = 2
- CENTER: x = 3 (center)
- CENTER_RIGHT: x = 4
- RIGHT: x = 5
- FAR_RIGHT: x = 6 (rightmost)

These are normalized to a 0-1 range for SVG rendering: `x_normalized = position / 6`.

Sources at the same bias tier are jittered vertically by up to 8px to prevent overlap, using a deterministic hash of the source ID (not random -- the same source always appears at the same position).

**Y axis: Geographic Region**
Regions are arranged vertically in a meaningful order -- not alphabetical, but by geographic proximity to create visual clustering of neighboring regions:
- GLOBAL: y = 0 (top -- wire services span everything)
- US: y = 1
- CANADA: y = 2
- LATIN_AMERICA: y = 3
- UK: y = 4
- EUROPE: y = 5
- MIDDLE_EAST: y = 6
- AFRICA: y = 7
- ASIA_PACIFIC: y = 8
- OCEANIA: y = 9

Normalized: `y_normalized = position / 9`.

This creates a 7x10 conceptual grid, but sources are not placed on exact grid points. Each source gets a base position from its tier and region, then a small deterministic offset (the jitter) to create organic clustering rather than rigid rows and columns.

### Visual Elements

**Source Stars:**
Each source outlet is a circle. Size encodes activity level (number of articles from this source in the current view):
- 1 article: radius 3px
- 2-3 articles: radius 5px
- 4+ articles: radius 7px

Color encodes bias tier using the existing brand palette:
- FAR_LEFT, LEFT: `var(--color-brand-green)` (in dark mode: `var(--color-neon-green)`)
- CENTER_LEFT, CENTER, CENTER_RIGHT: `var(--color-brand-teal)` (dark: `var(--color-neon-cyan)`)
- RIGHT, FAR_RIGHT: `var(--color-brand-red)` (dark: `var(--color-neon-red)`)

In dark mode, each star gets a `<radialGradient>` fill that is solid at center and fades to transparent at the edge, plus a CSS `filter: drop-shadow(0 0 3px {color})` glow. This creates the literal "star in space" effect.

**Story Connection Lines:**
When two sources cover the same story, a line connects them. Line properties encode the relationship:
- **Both support the same claim:** Solid line, `stroke-opacity: 0.6`, color matches the higher-convergence source.
- **One supports, one contradicts:** Dashed line (`stroke-dasharray: 4 3`), `stroke-opacity: 0.3`, color is `var(--color-brand-amber)`.
- **Cross-spectrum (LEFT-tier source connected to RIGHT-tier source):** Line is thicker (`stroke-width: 2` vs default `1`), because cross-spectrum connections are the signal Triangulate exists to surface.

Line opacity also scales with the number of shared claims: 1 shared claim = 0.3 opacity, 2 = 0.45, 3+ = 0.6. This prevents a single weak connection from looking as important as deep agreement.

**Convergence Nebulae:**
When 3 or more sources cluster on the same story with convergence score above 0.5, a "nebula" forms. This is an SVG `<ellipse>` positioned at the centroid of the participating sources, with:
- Width and height determined by the bounding box of the source positions, plus 20px padding.
- Fill: radial gradient from `var(--color-brand-green)` at 8% opacity at center to transparent at edge.
- In dark mode: the gradient is from `var(--color-neon-green)` at 12% opacity, with `filter: blur(8px)` creating a soft glow.
- The nebula pulses subtly using the existing `signal-pulse` animation at reduced intensity (opacity range 0.6-1.0 instead of the default).

The nebula is drawn BEHIND the source stars and connection lines (lower z-order in SVG layering). This creates a soft glow beneath the sharp points of data.

**Axis Labels:**
Left edge: region names in the `dateline` CSS class, vertically positioned at each region's Y coordinate.
Bottom edge: bias tier labels, also in `dateline` class. The CENTER label has a slightly bolder weight.
A faint vertical line at x=CENTER and a faint horizontal line at y=GLOBAL create crosshairs that orient the viewer.

### Interaction Model

**Hover on Source Star:** The star scales to 1.5x (CSS `transform: scale(1.5)` with `transition: transform 150ms ease-out`). All connection lines FROM this source brighten to full opacity. All other connection lines dim to 0.05 opacity. A tooltip shows: source name, bias tier, region, article count in current view, and the source's overall convergence participation rate (how often this source's reporting is confirmed by adversarial outlets).

**Hover on Connection Line:** Both connected sources highlight. The tooltip shows: the two source names, the story title they share, the number of shared claims, and whether they agree or disagree.

**Click on Source Star:** Navigates to a Source Intelligence page (as proposed by the UX Architect). The constellation serves as both visualization and navigation.

**Click on Nebula:** Filters the story feed to show only stories contributing to that nebula cluster. The URL updates with the story IDs as query params for shareability.

**Zoom and Pan:** On desktop, scroll-wheel zooms (SVG `viewBox` manipulation). Click-and-drag pans. On mobile, pinch-to-zoom and drag-to-pan. The SVG `viewBox` is managed via React state:

```typescript
const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 700, h: 500 });
```

Zoom changes `w` and `h` proportionally. Pan changes `x` and `y`. The component clamps these to prevent zooming beyond data bounds.

**Filter Integration:** When the Convergence Lens filters (from the Interaction Designer's spec) are active, the constellation updates reactively. Sources not matching the filter shrink to 1px radius and 0.1 opacity -- they become "dim background stars" rather than disappearing entirely. This maintains spatial context while focusing attention.

### Component API

```typescript
interface AdversarialConstellationProps {
  sources: Array<{
    id: string;
    name: string;
    biasTier: BiasTier;
    region: Region;
    articleCount: number;
    convergenceParticipationRate?: number; // 0-1
  }>;
  connections: Array<{
    sourceAId: string;
    sourceBId: string;
    storyId: string;
    storyTitle: string;
    sharedClaimCount: number;
    agreementType: 'agree' | 'disagree' | 'mixed';
    convergenceScore: number;
  }>;
  nebulae: Array<{
    storyId: string;
    sourceIds: string[];
    convergenceScore: number;
    centroid: { x: number; y: number }; // pre-computed
  }>;
  activeFilters?: {
    biasTiers?: BiasTier[];
    regions?: Region[];
    minConvergence?: number;
  };
  onSourceClick?: (sourceId: string) => void;
  onNebulaClick?: (storyId: string) => void;
  width?: number;  // default: container width
  height?: number; // default: 500
  className?: string;
}
```

### Rendering Approach

SVG again, but with a performance consideration: the constellation could have 55+ source nodes and potentially hundreds of connection lines. The rendering strategy:

1. **Nebulae layer** (bottom): `<g class="nebulae">` -- these are few and large, no performance concern.
2. **Connection lines layer**: `<g class="connections">` -- potentially many. Lines for off-screen connections (when zoomed) are culled by checking if both endpoints are outside the viewBox with a 50px margin. This is a simple bounds check in the render function, not a virtualization library.
3. **Source stars layer** (top): `<g class="sources">` -- max 55 nodes. Each is a `<circle>` with a unique `data-source-id` attribute for event delegation.

Event handling uses a single `onMouseMove` handler on the SVG element that finds the nearest source/line via coordinate math, rather than individual event handlers on 55+ elements. This is the standard pattern for interactive SVGs with many elements.

```typescript
function findNearestSource(svgX: number, svgY: number, sources: PositionedSource[]): string | null {
  let nearest: string | null = null;
  let minDist = 15; // 15px detection radius
  for (const s of sources) {
    const dist = Math.hypot(svgX - s.cx, svgY - s.cy);
    if (dist < minDist) {
      minDist = dist;
      nearest = s.id;
    }
  }
  return nearest;
}
```

### Dark Mode Transformation

In light mode, the constellation has a warm, map-like quality: cream background (`var(--color-paper-aged)`), source dots are solid colored circles, connection lines are thin ink strokes. It resembles a network diagram from a newspaper's data journalism desk.

In dark mode, it becomes a literal star field: black background (`var(--color-paper)`), source dots glow with neon halos, connection lines are luminous threads, nebulae are soft green fog. The crosshair guides become faint grid lines with `rgba(0, 255, 136, 0.04)` stroke, like a tactical display.

This dual personality matches the existing Triangulate aesthetic perfectly -- the CSS theme variables handle the transformation with no JavaScript logic change.

### Accessibility

- The SVG has `role="img"` with a computed `aria-label`: "Source constellation showing [N] outlets across [M] regions. [X] convergence clusters detected."
- Each source star has `role="button"`, `tabindex="0"`, and `aria-label="[Source name], [bias tier], [region], [N] articles"`.
- Tab order follows a logical path: left-to-right, top-to-bottom through the sources (sorted by x then y position).
- A text-mode fallback table is available via `<details>` beneath the SVG, listing all sources and their connections.
- Focus indicators use `outline: 2px solid var(--color-brand-teal)` with 2px offset, visible in both light and dark modes.
- The F6 panel cycling from the Accessibility specialist's spec should include the constellation as a panel stop.

---

## 3. The Claim Battlefield

### Design Philosophy: Terrain of Truth

The existing ClaimsTracker shows claims as a vertical list with supporting/contradicting source badges. This is functional but fails to communicate the spatial relationship between agreement and disagreement. In game design terms, it is an inventory screen when it should be a battle map.

The Claim Battlefield reimagines each claim as a piece of contested terrain. Sources that confirm the claim are arrayed on one side; sources that contradict it are on the other. The claim text itself is the territory they are fighting over. The user sees, at a glance, the "force disposition" of truth.

### Layout Structure

The Claim Battlefield occupies the full width of the story detail content area. Each claim gets a horizontal row that is 80-120px tall, depending on source count. Claims are stacked vertically, separated by thin rule lines.

Within each row, the layout is:

```
[Supporting Sources] | [Claim Territory] | [Contradicting Sources]
       ~30%          |      ~40%         |        ~30%
```

If a claim has no contradicting sources (pure convergence), the right column collapses and the claim territory expands to fill 70% with the supporting sources on the left at 30%. If a claim has no supporting sources (pure contradiction -- rare), the inverse.

### The Claim Territory (Center Column)

The claim text occupies the center. Its background color encodes the convergence score:
- Score >= 0.7: `var(--color-brand-green)` at 6% opacity. Peaceful territory -- mostly settled.
- Score 0.3-0.7: `var(--color-brand-amber)` at 6% opacity. Contested ground.
- Score < 0.3: `var(--color-brand-red)` at 6% opacity. Active dispute.

A thin progress bar at the top of the claim territory shows the balance of forces: width proportional to `supporting / (supporting + contradicting)`. A perfectly balanced claim (50/50) has the bar at center. A fully converged claim fills the bar entirely from the left.

The claim type badge (FACTUAL or EVALUATIVE from the existing schema) appears above the claim text as a small label, using the same styling as the current ClaimsTracker.

### Source Formations (Side Columns)

Sources on each side are rendered as small, stacked cards (36px tall each). Each card shows:
- Source name in `dateline` style
- Bias tier indicator: a 4px-wide vertical stripe on the card's outer edge, colored by bias tier
- Region flag: a 2-letter ISO code in `score` CSS class
- Quote snippet: if the `ClaimSource.quote` field is populated, a truncated version (60 chars) appears in italic beneath the source name

Sources on the supporting side have their bias tier stripe on the LEFT edge of the card. Sources on the contradicting side have it on the RIGHT edge. This creates visual symmetry -- the two sides mirror each other across the claim territory.

**Formation lines:** Thin SVG lines connect each source card to the claim territory center, creating a visual "force projection." Supporting sources connect to the left edge of the claim territory; contradicting sources to the right edge. Line color matches the source's bias tier color.

When sources from opposing bias tiers are on the SAME side (e.g., a FAR_LEFT and a FAR_RIGHT source both supporting the same claim), their formation lines cross the center axis and create an X pattern. This is visually striking and immediately communicates cross-spectrum agreement -- the exact signal Triangulate exists to surface. These crossing lines use a thicker stroke (`stroke-width: 2`) and brighter color.

### The "Battle Lines" Visualization

Between the supporting and contradicting columns, where the formation lines converge on the claim territory, the system draws a visual "contested boundary." This is a vertical SVG element running the height of the claim row:

- If the claim is mostly converged (>70% support), the boundary is a thin, calm green line.
- If the claim is heavily contested (40-60% split), the boundary becomes a jagged, zigzag line (like a war front on a military map), colored amber.
- If the claim is mostly contradicted (<30% support), the boundary is a thin red line weighted to the contradicting side.

The zigzag is generated procedurally: a `<polyline>` with points that alternate left and right of center by 3-6px, with the amplitude proportional to the contestation level. At 50/50, the zigzag is most pronounced. At 90/10, it is nearly straight.

```typescript
function generateBattleLine(
  yStart: number,
  yEnd: number,
  centerX: number,
  contestationLevel: number // 0 = fully supporting, 1 = fully contradicting, 0.5 = even split
): string {
  const amplitude = Math.sin(contestationLevel * Math.PI) * 6; // max amplitude at 0.5
  const segments = Math.floor((yEnd - yStart) / 8);
  const points: string[] = [];

  for (let i = 0; i <= segments; i++) {
    const y = yStart + (i / segments) * (yEnd - yStart);
    const xOffset = (i % 2 === 0 ? -1 : 1) * amplitude;
    // Shift the line toward the weaker side
    const biasShift = (contestationLevel - 0.5) * 20;
    points.push(`${centerX + xOffset + biasShift},${y}`);
  }

  return points.join(' ');
}
```

### Component API

```typescript
interface ClaimBattlefieldProps {
  claims: Array<{
    id: string;
    claimText: string;
    claimType: ClaimType;
    convergenceScore: number;
    supportingSources: Array<{
      id: string;
      sourceName: string;
      biasTier: BiasTier;
      region: Region;
      quote?: string | null;
    }>;
    contradictingSources: Array<{
      id: string;
      sourceName: string;
      biasTier: BiasTier;
      region: Region;
      quote?: string | null;
    }>;
  }>;
  onSourceClick?: (sourceId: string) => void;
  onClaimClick?: (claimId: string) => void;
  compact?: boolean; // true = reduce row height, hide quotes. For mobile.
  className?: string;
}
```

### Rendering Approach

This is a hybrid HTML + SVG component. The source cards and claim text are standard HTML (for text rendering, accessibility, and click handling). The formation lines and battle line are SVG overlaid on top.

The structure:

```tsx
<div className="claim-battlefield relative">
  {claims.map(claim => (
    <div key={claim.id} className="claim-row relative flex items-stretch border-b border-border">
      {/* HTML: Supporting sources */}
      <div className="w-[30%] flex flex-col gap-1 p-2">
        {claim.supportingSources.map(s => <SourceCard key={s.id} {...s} side="left" />)}
      </div>

      {/* HTML: Claim territory */}
      <div className="flex-1 relative p-3 flex flex-col justify-center">
        <ClaimTerritory claim={claim} />
      </div>

      {/* HTML: Contradicting sources */}
      <div className="w-[30%] flex flex-col gap-1 p-2">
        {claim.contradictingSources.map(s => <SourceCard key={s.id} {...s} side="right" />)}
      </div>

      {/* SVG: Formation lines + battle line, absolutely positioned over the row */}
      <svg className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <FormationLines claim={claim} />
        <BattleLine contestation={claim.contestationLevel} />
      </svg>
    </div>
  ))}
</div>
```

The SVG is positioned absolutely over each row with `pointer-events: none` so clicks pass through to the HTML elements beneath. The SVG lines are drawn by measuring the DOM positions of source cards and claim territory using `useRef` and `useLayoutEffect`, then converting to SVG coordinates.

### Responsive Behavior

On screens below 768px, the battlefield switches to a stacked vertical layout:
- Claim territory at top (full width)
- Supporting sources below (full width, green left-border)
- Battle line (horizontal zigzag)
- Contradicting sources below that (full width, red left-border)

The formation lines are hidden on mobile -- the vertical stacking makes the relationship clear without them.

### Animation

On initial render, source cards fade in from their respective sides (supporting cards slide in from the left, contradicting from the right) over 300ms with staggered delays using the existing `.stagger-children` CSS pattern. The formation lines draw themselves using `stroke-dashoffset` animation over 400ms, starting after the cards have appeared.

When a claim's convergence score changes (e.g., during timeline scrubbing from Section 1), the claim territory background color transitions smoothly (`transition: background-color 300ms ease`), the progress bar width animates (`transition: width 300ms ease`), and the battle line morphs its amplitude via SVG `<animate>` or by transitioning the `d` attribute of the polyline (using the `d` CSS property transition which is supported in modern browsers via CSS `d: path(...)` ).

### Accessibility

- Each claim row has `role="group"` with `aria-label="Claim: [claimText truncated to 100 chars]. [N] supporting sources, [M] contradicting sources. Convergence: [X]%."`.
- Source cards have `role="listitem"` within `role="list"` containers for the supporting and contradicting sides.
- The SVG formation lines and battle line have `aria-hidden="true"` -- they are decorative enhancements. The HTML structure communicates the same information without them.
- Keyboard navigation: Tab moves through source cards in reading order (supporting left-to-right, then claim, then contradicting left-to-right). Each source card is focusable and activatable with Enter to navigate to the source.

---

## 4. Sound Design for Data (Data Sonification)

### Design Philosophy: The Sound of Convergence

Sound is the only sensory channel that conveys information without requiring visual attention. A user scrolling through stories can hear convergence levels changing without looking at numbers. A user with low vision can perceive the data through pitch and rhythm. And psychologically, audio cues create emotional resonance that purely visual data cannot: a rising pitch feels like progress, dissonance feels like uncertainty.

This is designed as an **opt-in** feature, off by default. It is activated via a toggle in the user's settings and persists across sessions via the `User` model (a new boolean field `sonificationEnabled`). The audio palette uses the Web Audio API, generating tones procedurally rather than loading audio files. This means zero additional asset downloads and complete programmatic control over every parameter.

### Audio Palette

**Base Tone: "The Pulse"**
A sine wave at 220 Hz (A3), played at -30dB (very quiet). This is the ambient backdrop tone that plays while viewing any story. It is barely perceptible -- designed to sit beneath consciousness and create a sense of "liveness" without being intrusive. The tone is continuous but modulated:

```typescript
function createPulseTone(ctx: AudioContext, convergenceScore: number): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  // Base frequency shifts with convergence: low convergence = lower pitch
  osc.frequency.value = 220 + (convergenceScore * 110); // 220-330 Hz range (A3 to E4)

  const gain = ctx.createGain();
  gain.gain.value = 0.02; // Very quiet

  // Slow amplitude modulation creates "breathing" effect
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.3; // 0.3 Hz = one breath every ~3 seconds
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  osc.connect(gain);
  gain.connect(ctx.destination);
  return osc;
}
```

**Convergence Chime: "The Signal"**
When the user opens a story with convergence score above 0.5, a three-note ascending chord plays:
- Root: 261 Hz (C4)
- Third: 329 Hz (E4)
- Fifth: 392 Hz (G4)

Each note is a sine wave with a 50ms attack, 200ms sustain, 300ms release. Notes are staggered by 80ms (root, then third 80ms later, then fifth 80ms after that). Volume: -20dB. The chord resolves on a major triad -- psychologically associated with completion and satisfaction.

For stories with convergence score below 0.3, the chord uses a minor triad instead:
- Root: 261 Hz (C4)
- Minor third: 311 Hz (Eb4)
- Fifth: 392 Hz (G4)

The minor chord is inherently more tense, cueing the user that this story has low agreement.

For contested stories (score 0.3-0.5), the chord adds a diminished fifth:
- Root: 261 Hz (C4)
- Third: 329 Hz (E4)
- Diminished fifth: 370 Hz (Gb4)

This tritone (the "devil's interval") creates subtle dissonance, the auditory equivalent of a yellow warning light.

**Source Tick: "The Click"**
When scrolling through the story feed, each story card that enters the viewport triggers a single very short tick:
- A 1000 Hz sine wave with 5ms attack, 0ms sustain, 20ms release (total duration: 25ms).
- Volume: -35dB (barely audible).
- Pitch shifts slightly based on article count: `1000 + (articleCount * 50)` Hz. A story with 10 sources ticks at 1500 Hz; a single-source story at 1050 Hz. This creates a subtle rhythm as the user scrolls -- stories with more coverage produce higher, brighter clicks.

This uses IntersectionObserver on each StoryCard to trigger the tick when the card crosses 50% visibility. Ticks are rate-limited to maximum 4 per second to prevent audio clutter during fast scrolling.

**Claim Resolution Tone: "The Verdict"**
When viewing the Claim Battlefield, each claim row can be focused. Upon focus, a brief tone plays:
- High convergence (>0.7): A clean fifth interval (C4 + G4), 150ms, -25dB. Sounds resolved.
- Contested (0.3-0.7): A beating interval created by two close frequencies (261 Hz and 267 Hz), 200ms, -25dB. The 6 Hz difference creates audible "beats" -- a wavering, uncertain sound.
- Low convergence (<0.3): A descending minor second (B3 to Bb3), 200ms, -25dB. Sounds unresolved, like a question.

**Timeline Scrub Sound: "The Teletype"**
When scrubbing the Convergence Heatmap Timeline, each time bucket the scrub point crosses triggers a short percussive click. When the scrub crosses a "significant moment" snap point, the click becomes a louder, longer chime (the convergence chord for the story's score at that moment). This creates an audio texture that communicates density of coverage: scrubbing through a period of heavy coverage produces rapid clicks; scrubbing through quiet periods produces silence. It is the audio equivalent of the heatmap's fog.

### Implementation Architecture

```typescript
// Singleton audio engine, lazy-initialized on user interaction (required by browser autoplay policies)
class SonificationEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private masterGain: GainNode | null = null;

  // Must be called from a user gesture (click, keypress)
  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5; // Master volume, user-adjustable
    this.masterGain.connect(this.ctx.destination);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.ctx) {
      this.ctx.suspend();
    } else if (enabled && this.ctx) {
      this.ctx.resume();
    }
  }

  setMasterVolume(volume: number) {
    // volume: 0-1
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.05);
    }
  }

  playConvergenceChime(score: number) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const root = 261.63; // C4

    let frequencies: number[];
    if (score >= 0.5) {
      frequencies = [root, root * 5/4, root * 3/2]; // Major triad
    } else if (score >= 0.3) {
      frequencies = [root, root * 5/4, root * 7/5]; // With diminished 5th
    } else {
      frequencies = [root, root * 6/5, root * 3/2]; // Minor triad
    }

    frequencies.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const env = this.ctx!.createGain();
      env.gain.value = 0;
      env.gain.setTargetAtTime(0.08, now + i * 0.08, 0.02);        // attack
      env.gain.setTargetAtTime(0.04, now + i * 0.08 + 0.05, 0.1);  // decay
      env.gain.setTargetAtTime(0, now + i * 0.08 + 0.25, 0.15);    // release

      osc.connect(env);
      env.connect(this.masterGain!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    });
  }

  playSourceTick(articleCount: number) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freq = 1000 + (articleCount * 50);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = this.ctx.createGain();
    env.gain.value = 0;
    env.gain.setTargetAtTime(0.04, now, 0.002);     // 5ms attack
    env.gain.setTargetAtTime(0, now + 0.005, 0.01);  // 20ms release

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playClaimTone(convergenceScore: number) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (convergenceScore >= 0.7) {
      // Clean fifth
      this.playInterval(261.63, 392, 0.15, now);
    } else if (convergenceScore >= 0.3) {
      // Beating interval (subtle dissonance)
      this.playInterval(261.63, 267, 0.2, now);
    } else {
      // Descending minor second
      this.playInterval(246.94, 233.08, 0.2, now); // B3 to Bb3
    }
  }

  private playInterval(freq1: number, freq2: number, duration: number, startTime: number) {
    [freq1, freq2].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const env = this.ctx!.createGain();
      env.gain.value = 0;
      env.gain.setTargetAtTime(0.05, startTime, 0.01);
      env.gain.setTargetAtTime(0, startTime + duration * 0.6, duration * 0.3);

      osc.connect(env);
      env.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.3);
    });
  }
}

// Exported singleton
export const sonification = new SonificationEngine();
```

### React Integration

A React context provides sonification state to the component tree:

```typescript
interface SonificationContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  engine: SonificationEngine;
}

// Hook for components to trigger sounds
function useSonification() {
  const ctx = useContext(SonificationContext);

  return {
    playConvergenceChime: useCallback((score: number) => {
      ctx.engine.playConvergenceChime(score);
    }, [ctx.engine]),

    playSourceTick: useCallback((articleCount: number) => {
      ctx.engine.playSourceTick(articleCount);
    }, [ctx.engine]),

    playClaimTone: useCallback((score: number) => {
      ctx.engine.playClaimTone(score);
    }, [ctx.engine]),
  };
}
```

### User Controls

The sonification toggle appears in the site header (near the existing ThemeToggle). It is a simple icon button:
- Off state: a muted speaker icon (from lucide-react: `VolumeX`).
- On state: a speaker icon with sound waves (`Volume2`).

A long-press or right-click on the toggle opens a small popover with a volume slider (0-100%). The setting persists via `localStorage` for anonymous users and via the User model for authenticated users.

### Accessibility Considerations

- Sonification is OFF by default. It must be explicitly enabled. This respects users with auditory processing sensitivities.
- When enabled, a `role="status"` `aria-live="polite"` region announces "Data sonification enabled" (and "disabled" when turned off).
- The sonification does NOT replace any visual information. It is purely supplementary. All data communicated through sound is also available visually.
- Volume controls have `aria-label="Data sonification volume"` and `role="slider"`.
- Sound is suppressed when the user's system reports `prefers-reduced-motion: reduce`, unless the user has explicitly opted in.

---

## 5. The Replay Mode

### Design Philosophy: Game Replays Teach by Showing

In competitive games, replay mode is how players learn. They watch what happened at accelerated speed and see patterns they missed in real time. News convergence has the same property: the real-time experience is confusing (articles appear in random order from random outlets), but the compressed replay reveals the pattern.

Replay mode lets a user press play and watch a story's convergence develop from the first article to the present, at 10x-100x speed. Sources appear on the Adversarial Constellation as they publish. Claims form in the Claim Battlefield. The Convergence Heatmap Timeline fills in. The convergence score rises. The user watches "truth emerge from noise" in 15-60 seconds.

This is a teaching tool. It shows people how news convergence WORKS by making the invisible process visible and compressed.

### Activation

A "Replay" button appears in the story detail header, next to the story title. The button uses the lucide-react `Play` icon with the text "Watch convergence develop." When clicked, the page enters replay mode.

### Replay State Machine

```typescript
type ReplayState =
  | { status: 'idle' }
  | { status: 'playing'; currentTime: Date; speed: number }
  | { status: 'paused'; currentTime: Date; speed: number }
  | { status: 'finished' };

interface ReplayEvent {
  timestamp: Date;
  type: 'article_published' | 'claim_formed' | 'convergence_changed' | 'new_region' | 'cross_center';
  data: {
    articleId?: string;
    claimId?: string;
    sourceName?: string;
    biasTier?: BiasTier;
    region?: Region;
    convergenceScoreBefore?: number;
    convergenceScoreAfter?: number;
  };
}
```

The replay engine pre-computes the full event timeline from the story's data at mount time. Events are sorted chronologically. During playback, the engine advances a virtual clock and emits events as the clock passes their timestamps.

### Visual Orchestration

When replay mode is active, all three visualizations on the story page respond to the virtual clock:

**Convergence Heatmap Timeline:**
The scrub point auto-advances with the virtual clock. Cells to the right of the current time are in full fog state. The convergence line draws itself in real time. This is the same scrub mechanism from Section 1, but driven by the replay clock instead of user input.

**Adversarial Constellation:**
Sources start invisible (opacity 0, scale 0). As the replay clock reaches each article's `publishedAt`, the publishing source's star "pops in" with a scale animation (0 to 1.2 to 1.0 over 200ms, an elastic ease). Connection lines draw themselves between sources that have both appeared and share claims. Nebulae fade in when their constituent sources are all visible and convergence threshold is met.

**Claim Battlefield:**
Claims start hidden. As the replay reveals articles that constitute claim sources, the claims "build" progressively:
- First source on a claim: the claim text fades in with a single source card.
- Each subsequent source: the source card slides in from its side (supporting from left, contradicting from right).
- The battle line recalculates its zigzag amplitude as the balance shifts.
- The convergence bar fills proportionally.

### The Replay HUD

A floating control bar appears at the bottom of the viewport during replay, styled consistently with the existing Triangulate aesthetic:

```
[Pause] [<<<] [< ] [ >] [>>>]  |  Speed: 10x  |  12 of 47 events  |  Convergence: 34%  |  [Exit Replay]
```

- Pause/Play toggle
- Speed controls: 10x, 25x, 50x, 100x (left arrows decrease, right arrows increase)
- Event counter: shows progress through the event timeline
- Live convergence score readout
- Exit button returns to static view

The HUD is a fixed `<div>` at `bottom: 16px`, centered, with `z-index: 50`. Background: `var(--color-surface)` with `backdrop-filter: blur(8px)`. Border: `1px solid var(--color-border-strong)`. Rounded corners: `border-radius: 8px`. This matches the floating UI pattern common in media players.

### Narration Track

During replay, a narration panel appears to the right of (or below on mobile) the visualizations. It is a scrolling log of significant events in natural language:

```
3:15 PM — AP (CENTER, GLOBAL) breaks the story.
3:22 PM — Reuters (CENTER, UK) publishes matching coverage.
3:28 PM — Fox News (RIGHT, US) confirms the central claim.
           ★ Cross-center convergence detected. Score: 34% → 52%.
3:41 PM — The Guardian (LEFT, UK) adds regional context.
           ★ Cross-region convergence detected. Score: 52% → 61%.
3:58 PM — Breitbart (FAR_RIGHT, US) disputes the timeline claim.
           ⚡ Claim #3 is now contested.
4:15 PM — Al Jazeera (CENTER_LEFT, MIDDLE_EAST) confirms 4 of 5 claims.
           ★ Score: 61% → 78%. Story upgraded to CONVERGED.
```

Each narration entry fades in as the replay clock reaches its timestamp. Significant moments (score jumps, status changes) are highlighted with star or lightning bolt markers and bold text. The narration log has `role="log"` and `aria-live="polite"` for screen reader users.

### Replay Engine Implementation

```typescript
class ReplayEngine {
  private events: ReplayEvent[];
  private startTime: Date;
  private endTime: Date;
  private virtualTime: Date;
  private speed: number = 10;
  private animationFrameId: number | null = null;
  private lastRealTimestamp: number = 0;
  private eventIndex: number = 0;
  private subscribers: Set<(state: ReplaySnapshot) => void> = new Set();

  constructor(events: ReplayEvent[]) {
    this.events = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.startTime = this.events[0]?.timestamp ?? new Date();
    this.endTime = this.events[this.events.length - 1]?.timestamp ?? new Date();
    this.virtualTime = new Date(this.startTime);
  }

  subscribe(cb: (state: ReplaySnapshot) => void) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  play() {
    this.lastRealTimestamp = performance.now();
    this.tick();
  }

  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  seekTo(timestamp: Date) {
    this.virtualTime = timestamp;
    // Reset event index to the correct position
    this.eventIndex = this.events.findIndex(e => e.timestamp > timestamp);
    if (this.eventIndex === -1) this.eventIndex = this.events.length;
    this.emit();
  }

  private tick() {
    const now = performance.now();
    const realElapsed = now - this.lastRealTimestamp;
    this.lastRealTimestamp = now;

    // Advance virtual time by realElapsed * speed
    const virtualElapsed = realElapsed * this.speed;
    this.virtualTime = new Date(this.virtualTime.getTime() + virtualElapsed);

    // Emit any events that the virtual clock has passed
    const newEvents: ReplayEvent[] = [];
    while (
      this.eventIndex < this.events.length &&
      this.events[this.eventIndex].timestamp <= this.virtualTime
    ) {
      newEvents.push(this.events[this.eventIndex]);
      this.eventIndex++;
    }

    if (newEvents.length > 0 || realElapsed > 0) {
      this.emit(newEvents);
    }

    // Check if replay is finished
    if (this.virtualTime >= this.endTime) {
      this.emit();
      return; // Don't schedule next frame
    }

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  private emit(newEvents: ReplayEvent[] = []) {
    const snapshot: ReplaySnapshot = {
      virtualTime: new Date(this.virtualTime),
      eventsProcessed: this.eventIndex,
      totalEvents: this.events.length,
      newEvents,
      isFinished: this.virtualTime >= this.endTime,
      speed: this.speed,
    };
    this.subscribers.forEach(cb => cb(snapshot));
  }

  destroy() {
    this.pause();
    this.subscribers.clear();
  }
}

interface ReplaySnapshot {
  virtualTime: Date;
  eventsProcessed: number;
  totalEvents: number;
  newEvents: ReplayEvent[];
  isFinished: boolean;
  speed: number;
}
```

### React Integration

```typescript
function useReplayEngine(events: ReplayEvent[]) {
  const engineRef = useRef<ReplayEngine | null>(null);
  const [snapshot, setSnapshot] = useState<ReplaySnapshot | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');

  useEffect(() => {
    const engine = new ReplayEngine(events);
    engineRef.current = engine;

    const unsub = engine.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.isFinished) setStatus('finished');
    });

    return () => {
      unsub();
      engine.destroy();
    };
  }, [events]);

  const play = useCallback(() => {
    engineRef.current?.play();
    setStatus('playing');
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setStatus('paused');
  }, []);

  const setSpeed = useCallback((speed: number) => {
    engineRef.current?.setSpeed(speed);
  }, []);

  const seekTo = useCallback((timestamp: Date) => {
    engineRef.current?.seekTo(timestamp);
  }, []);

  return { snapshot, status, play, pause, setSpeed, seekTo };
}
```

The story detail page wraps its visualizations in a `<ReplayProvider>` that conditionally passes the virtual time to child components:

```typescript
// In the story detail route component:
const { snapshot, status, play, pause, setSpeed } = useReplayEngine(replayEvents);

// Pass to timeline:
<ConvergenceTimeline
  articles={articles}
  claims={claims}
  onScrub={handleScrub}
  replayTime={status !== 'idle' ? snapshot?.virtualTime : undefined}
/>

// Pass to constellation:
<AdversarialConstellation
  sources={sources}
  connections={connections}
  nebulae={nebulae}
  replayTime={status !== 'idle' ? snapshot?.virtualTime : undefined}
/>

// Pass to battlefield:
<ClaimBattlefield
  claims={claims}
  replayTime={status !== 'idle' ? snapshot?.virtualTime : undefined}
/>
```

Each visualization component filters its data to only include items with timestamps before `replayTime` when it is defined. When `replayTime` is undefined, all data is shown (normal static mode).

### Sound Integration

When replay mode is active and sonification is enabled, the audio palette from Section 4 activates automatically:
- Each `article_published` event triggers a `playSourceTick()` with the article's source count.
- Each `convergence_changed` event where the score crosses a tier boundary (0.3, 0.5, 0.7) triggers a `playConvergenceChime()`.
- Each `cross_center` event triggers a distinctive ascending fourth interval (C4 to F4) -- the "aha" moment when enemies agree.
- The base pulse tone shifts frequency in real time as the convergence score changes.

This creates a rich audio landscape during replay: the user hears the story "building" through clicks, chimes, and tonal shifts. Combined with the visual animation, it is a multi-sensory experience that no other news product offers.

### Keyboard Controls

- Space: Play/Pause toggle
- Left arrow: Rewind 5 events
- Right arrow: Fast-forward 5 events
- `[` key: Decrease speed one tier
- `]` key: Increase speed one tier
- Escape: Exit replay mode
- Home: Jump to start
- End: Jump to end

These are captured via a `useEffect` keydown listener that is active ONLY when replay mode is engaged. The listener checks `event.target` to avoid capturing keystrokes in text inputs. Keyboard shortcuts are documented in a `<details>` accordion labeled "Keyboard shortcuts" within the replay HUD.

### Accessibility

- The replay HUD has `role="toolbar"` with `aria-label="Replay controls"`.
- Play/Pause button has `aria-label="Play replay"` / `aria-label="Pause replay"` toggled by state.
- Speed selector has `role="spinbutton"` with `aria-valuemin="10"`, `aria-valuemax="100"`, `aria-valuenow={speed}`, `aria-label="Replay speed multiplier"`.
- The narration log provides a screen-reader-accessible alternative to the visual animation. Since it has `role="log"` and `aria-live="polite"`, screen readers announce each new entry as it appears, giving a real-time verbal description of the convergence process.
- The event counter has `aria-label="Replay progress: [N] of [M] events processed"`.

---

## Cross-System Integration Map

These five systems are not independent features. They form an interlocking web:

```
Heatmap Timeline ──scrub──► filters all other components
       │                            │
       │                    ┌───────┴───────┐
       │                    ▼               ▼
       │           Constellation    Claim Battlefield
       │                    │               │
       │                    └───────┬───────┘
       │                            │
       ▼                            ▼
  Replay Engine ──drives──► all three visualizations
       │
       ▼
  Sonification Engine ──responds to──► all replay events + user interactions
```

The key integration points:

1. **Timeline scrubbing filters Constellation and Battlefield.** When the user drags the timeline scrubber, the Constellation shows only sources that had published by that time, and the Battlefield shows only claims that had been formed by that time. This is the same `onScrub` callback mechanism used by the replay engine.

2. **Replay drives all three visualizations.** The replay engine is essentially an automated timeline scrubber. All three visualizations already support temporal filtering via the `replayTime` prop, so replay mode is architecturally free once scrubbing works.

3. **Sonification responds to everything.** The sonification engine is event-driven. Any component can call `playConvergenceChime()`, `playSourceTick()`, or `playClaimTone()`. During replay, the replay engine triggers these. During normal browsing, the visualizations trigger them on user interaction.

4. **Constellation clicks navigate to Source Intelligence pages.** The Constellation is both a visualization and a navigation tool, connecting the story detail view to the Sources section of the UX Architect's four-section layout.

5. **Battlefield formation lines connect to the Constellation.** Clicking a source card in the Battlefield could highlight that source in the Constellation (if both are visible), creating a cross-visualization link.

### Schema Requirements

These innovations require **zero schema changes**. All five systems derive their data from the existing models:
- `Article.publishedAt` provides temporal data for the Timeline and Replay.
- `Source.biasTier` and `Source.region` provide spatial positioning for the Constellation.
- `ClaimSource.supports` provides the agree/disagree axis for the Battlefield.
- `Claim.convergenceScore` drives color, sound, and animation intensity across all systems.

The only data model addition is the `sonificationEnabled` boolean on the User model, and that is optional (can default to localStorage for anonymous users).

### Performance Budget

All five systems together must not degrade story page load time by more than 100ms. The strategy:
- Heatmap Timeline: data computation is O(n) where n = article count. Max ~50 articles per story. Negligible.
- Constellation: SVG with max 55 source nodes. The connection line computation is O(n^2) in source pairs, but capped at ~1500 comparisons for 55 sources. Negligible.
- Battlefield: HTML rendering, same as the current ClaimsTracker with added SVG overlays. No new data fetching.
- Sonification: Web Audio API is zero-cost until a tone is triggered. No audio files to load.
- Replay: All computation uses pre-loaded data. The replay engine runs on `requestAnimationFrame`, which is inherently frame-budget-aware.

The dominant cost is SVG paint operations for the Constellation and Timeline. These should be profiled on a mid-range Android device (the budget target for Triangulate's global audience) to ensure 60fps during interactions. If needed, the Constellation can throttle connection line rendering during zoom/pan by only drawing lines for on-screen sources.

---

## Build Priority

Recommended implementation order, based on data dependency and user value:

1. **Convergence Heatmap Timeline** -- uses only existing article data, provides temporal scrubbing that all other systems depend on.
2. **Claim Battlefield** -- direct upgrade to the existing ClaimsTracker, reuses same data and component slot.
3. **Adversarial Constellation** -- requires computing connection data from claim-source relationships, but all data is already loaded on the story page.
4. **Replay Mode** -- depends on Timeline, Constellation, and Battlefield all supporting temporal filtering.
5. **Sonification** -- purely additive, can be layered on at any point without changing other systems.

Each can ship independently and provide value alone. But the compound effect of all five together is what makes Triangulate feel like nothing else in the news space.
