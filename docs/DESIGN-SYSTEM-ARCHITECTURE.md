# Triangulate Design System Architecture

> **Purpose:** Complete specification for the design token system, component API patterns,
> dual-aesthetic theming, data visualization colors, animation tokens, density modes,
> and signature visual elements. This is the engineering blueprint that turns
> COMMAND-CENTER-DESIGN.md into buildable code.
>
> **Stack:** React Router v7 + Tailwind v4 (@theme CSS custom properties) + Vite 7
> **Depends on:** COMMAND-CENTER-DESIGN.md (layout spec), app.css (current tokens)
> **Feeds into:** Every component in app/components/

---

## 1. Token Architecture

### 1.1 Three-Tier Token Model

Tokens are organized in three tiers inside `app/app.css` using Tailwind v4's `@theme` directive.
Components NEVER reference Tier 1 tokens directly. They reference Tier 2 (semantic) or Tier 3 (component) tokens.

```
TIER 1: Global (raw values)          --color-green-500: #2D6A4F;
TIER 2: Semantic (intent)            --color-action-primary: var(--color-green-500);
TIER 3: Component (binding)          --button-bg-primary: var(--color-action-primary);
```

Theming swaps Tier 2. Component code never changes. Adding a brand means defining a new Tier 2 set.

### 1.2 Spacing Scale

The spacing system uses a geometric progression anchored to a 4px base unit.
These are registered as Tailwind v4 theme tokens so they work as utility classes.

```css
@theme {
  /* Spacing Scale — 4px base, named for intent */
  --spacing-0: 0px;
  --spacing-px: 1px;
  --spacing-0_5: 2px;
  --spacing-1: 4px;
  --spacing-1_5: 6px;
  --spacing-2: 8px;
  --spacing-2_5: 10px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
}
```

These are Tailwind's defaults. We do NOT create custom spacing names. The existing
Tailwind utility classes (`p-4`, `gap-6`, `m-8`) remain the interface. Density modes
(section 6) override these at the component level, not at the token level.

### 1.3 Color System — Complete Tier 1 (Global Tokens)

```css
@theme {
  /* ── Tier 1: Global Color Palette ── */

  /* Neutrals (warm gray, newspaper-ink influenced) */
  --color-neutral-50:  #FAF9F6;
  --color-neutral-100: #F5F0E8;
  --color-neutral-200: #EDE8DD;
  --color-neutral-300: #D4CFC4;
  --color-neutral-400: #9E9EB0;
  --color-neutral-500: #6B6B82;
  --color-neutral-600: #3D3D56;
  --color-neutral-700: #1A1A2E;
  --color-neutral-800: #12121F;
  --color-neutral-900: #0A0A12;
  --color-neutral-950: #06060A;

  /* Green (convergence, trust, primary action) */
  --color-green-400: #34D399;
  --color-green-500: #2D6A4F;
  --color-green-600: #1B4332;
  --color-green-neon: #00FF88;

  /* Amber (contested, caution, warmth) */
  --color-amber-400: #FBBF24;
  --color-amber-500: #E9C46A;
  --color-amber-neon: #FFD166;

  /* Red (single source, error, urgency) */
  --color-red-400: #F87171;
  --color-red-500: #E76F51;
  --color-red-neon: #FF6B6B;

  /* Teal (info, source-backed, secondary data) */
  --color-teal-400: #2DD4BF;
  --color-teal-500: #264653;
  --color-teal-neon: #00D4FF;

  /* Purple (institutional, premium, verified) */
  --color-purple-400: #A78BFA;
  --color-purple-500: #6C63FF;
  --color-purple-neon: #A78BFA;

  /* Navy (brand foundation) */
  --color-navy-700: #16213E;
  --color-navy-800: #1A1A2E;
}
```

### 1.4 Color System — Tier 2 (Semantic Tokens)

These map intent to raw values. The `.dark` class swaps every one of these.

```css
@theme {
  /* ── Tier 2: Semantic Colors — Light Mode Defaults ── */

  /* Surface hierarchy (paper metaphor) */
  --color-ink:            var(--color-neutral-700);  /* #1A1A2E */
  --color-ink-light:      var(--color-neutral-600);  /* #3D3D56 */
  --color-ink-muted:      var(--color-neutral-500);  /* #6B6B82 */
  --color-ink-faint:      var(--color-neutral-400);  /* #9E9EB0 */
  --color-paper:          var(--color-neutral-50);   /* #FAF9F6 */
  --color-paper-aged:     var(--color-neutral-100);  /* #F5F0E8 */
  --color-paper-dark:     var(--color-neutral-200);  /* #EDE8DD */
  --color-surface:        #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-sunken: var(--color-neutral-100);

  /* Borders */
  --color-border:         rgba(26, 26, 46, 0.08);
  --color-border-strong:  rgba(26, 26, 46, 0.15);
  --color-border-focus:   var(--color-green-500);

  /* Action colors */
  --color-action-primary:    var(--color-green-500);
  --color-action-secondary:  var(--color-teal-500);
  --color-action-destructive: var(--color-red-500);

  /* Feedback */
  --color-feedback-success:  var(--color-green-500);
  --color-feedback-warning:  var(--color-amber-500);
  --color-feedback-error:    var(--color-red-500);
  --color-feedback-info:     var(--color-teal-500);

  /* Selection */
  --color-selection:  rgba(45, 106, 79, 0.2);

  /* Panel chrome (app shell specific) */
  --color-shell-bg:        var(--color-neutral-100);
  --color-shell-border:    var(--color-border-strong);
  --color-shell-header-bg: var(--color-neutral-50);
  --color-statusbar-bg:    var(--color-neutral-200);
  --color-panel-bg:        #FFFFFF;
  --color-panel-header-bg: var(--color-neutral-50);
}
```

Dark mode override (complete swap, no fallbacks):

```css
.dark {
  /* Surface hierarchy (terminal metaphor) */
  --color-ink:            #E8E6F0;
  --color-ink-light:      #C4C1D0;
  --color-ink-muted:      #8A87A0;
  --color-ink-faint:      #5C5975;
  --color-paper:          #0A0A12;
  --color-paper-aged:     #10101C;
  --color-paper-dark:     #161625;
  --color-surface:        #12121F;
  --color-surface-raised: #1A1A2E;
  --color-surface-sunken: #06060A;

  /* Borders (neon-tinted) */
  --color-border:         rgba(0, 255, 136, 0.06);
  --color-border-strong:  rgba(0, 255, 136, 0.12);
  --color-border-focus:   var(--color-green-neon);

  /* Action colors (neon variants) */
  --color-action-primary:    var(--color-green-neon);
  --color-action-secondary:  var(--color-teal-neon);
  --color-action-destructive: var(--color-red-neon);

  /* Feedback (neon variants) */
  --color-feedback-success:  var(--color-green-neon);
  --color-feedback-warning:  var(--color-amber-neon);
  --color-feedback-error:    var(--color-red-neon);
  --color-feedback-info:     var(--color-teal-neon);

  /* Selection */
  --color-selection:  rgba(0, 255, 136, 0.2);

  /* Panel chrome */
  --color-shell-bg:        #06060A;
  --color-shell-border:    rgba(0, 255, 136, 0.08);
  --color-shell-header-bg: #0A0A12;
  --color-statusbar-bg:    #06060A;
  --color-panel-bg:        #12121F;
  --color-panel-header-bg: #0F0F1A;
}
```

### 1.5 Typography Scale

```css
@theme {
  /* Font families (already in place) */
  --font-headline: "Playfair Display", Georgia, "Times New Roman", serif;
  --font-body:     "DM Sans", system-ui, sans-serif;
  --font-mono:     "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --font-data:     "JetBrains Mono", "Fira Code", ui-monospace, monospace;

  /* Type scale — augmented fourth (1.414) with fine steps */
  --text-2xs:   0.625rem;    /* 10px — micro labels, tier counts */
  --text-xs:    0.6875rem;   /* 11px — datelines, metadata */
  --text-sm:    0.8125rem;   /* 13px — body small, captions */
  --text-base:  0.875rem;    /* 14px — body text (dense dashboard) */
  --text-md:    1rem;        /* 16px — comfortable body */
  --text-lg:    1.125rem;    /* 18px — section headings */
  --text-xl:    1.5rem;      /* 24px — panel titles */
  --text-2xl:   2rem;        /* 32px — page headlines */
  --text-3xl:   2.5rem;      /* 40px — hero / display */

  /* Line heights */
  --leading-none:    1;
  --leading-tight:   1.2;
  --leading-snug:    1.35;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* Tracking */
  --tracking-tighter: -0.02em;
  --tracking-tight:   -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.1em;
  --tracking-widest:  0.15em;
}
```

Typography assignments by component role:

| Role | Family | Weight | Size | Leading | Tracking |
|------|--------|--------|------|---------|----------|
| Panel title | `--font-headline` | 700 | `--text-lg` | `--leading-tight` | `--tracking-tight` |
| Story headline (Wire) | `--font-headline` | 600 | `--text-base` | `--leading-snug` | `--tracking-tight` |
| Story headline (Lens) | `--font-headline` | 700 | `--text-xl` | `--leading-tight` | `--tracking-tighter` |
| Body text | `--font-body` | 400 | `--text-base` | `--leading-normal` | `--tracking-normal` |
| Dateline / label | `--font-body` | 600 | `--text-xs` | `--leading-none` | `--tracking-wider` |
| Score / numeric | `--font-data` | 500 | `--text-sm` | `--leading-none` | `--tracking-normal` |
| Claim text | `--font-body` | 400 | `--text-sm` | `--leading-relaxed` | `--tracking-normal` |
| Status bar | `--font-mono` | 400 | `--text-2xs` | `--leading-none` | `--tracking-wide` |
| Command palette input | `--font-mono` | 400 | `--text-md` | `--leading-normal` | `--tracking-normal` |

Dark mode font swap: datelines switch from `--font-body` to `--font-mono` (already implemented).
This is the only structural typography change between themes.

### 1.6 Elevation / Shadow Scale

Light mode uses traditional box-shadows (ink on paper). Dark mode uses border glow (neon CRT).

```css
@theme {
  /* Light mode shadows */
  --shadow-xs:   0 1px 2px rgba(26, 26, 46, 0.04);
  --shadow-sm:   0 1px 3px rgba(26, 26, 46, 0.06), 0 1px 2px rgba(26, 26, 46, 0.04);
  --shadow-md:   0 4px 6px rgba(26, 26, 46, 0.06), 0 2px 4px rgba(26, 26, 46, 0.04);
  --shadow-lg:   0 10px 15px rgba(26, 26, 46, 0.08), 0 4px 6px rgba(26, 26, 46, 0.04);
  --shadow-xl:   0 20px 25px rgba(26, 26, 46, 0.10), 0 8px 10px rgba(26, 26, 46, 0.04);
  --shadow-inner: inset 0 2px 4px rgba(26, 26, 46, 0.04);
}

.dark {
  /* Dark mode: glow replaces shadow */
  --shadow-xs:   0 0 0 1px rgba(0, 255, 136, 0.04);
  --shadow-sm:   0 0 4px rgba(0, 255, 136, 0.04), 0 0 0 1px rgba(0, 255, 136, 0.06);
  --shadow-md:   0 0 8px rgba(0, 255, 136, 0.05), 0 0 0 1px rgba(0, 255, 136, 0.08);
  --shadow-lg:   0 0 15px rgba(0, 255, 136, 0.06), 0 0 0 1px rgba(0, 255, 136, 0.10);
  --shadow-xl:   0 0 25px rgba(0, 255, 136, 0.08), 0 0 0 1px rgba(0, 255, 136, 0.12);
  --shadow-inner: inset 0 0 4px rgba(0, 255, 136, 0.03);
}
```

Usage: `className="shadow-md"` applies `--shadow-md` in either theme automatically.

### 1.7 Border Radius Scale

The design is deliberately sharp. Newspaper columns and terminal windows do not have rounded corners. The radius scale is minimal.

```css
@theme {
  --radius-none: 0;
  --radius-sm:   2px;     /* default for most components */
  --radius-md:   4px;     /* badges, tags */
  --radius-lg:   6px;     /* modals, command palette */
  --radius-full: 9999px;  /* pills, indicators only */
}
```

Convention: almost everything uses `rounded-sm` (2px). Full rounding is reserved exclusively
for status indicator dots and convergence gauge endpoints. Cards, buttons, panels, inputs
all use `rounded-sm`. This sharpness is a signature element.

### 1.8 Timing / Easing Tokens

See Section 5 for the full animation system. Quick reference:

```css
@theme {
  --duration-instant:  75ms;
  --duration-fast:     150ms;
  --duration-normal:   250ms;
  --duration-slow:     400ms;
  --duration-slower:   600ms;
  --duration-glacial:  1000ms;

  --ease-default:   cubic-bezier(0.4, 0, 0.2, 1);  /* Tailwind ease-out */
  --ease-in:        cubic-bezier(0.4, 0, 1, 1);
  --ease-out:       cubic-bezier(0, 0, 0.2, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-data:      cubic-bezier(0.16, 1, 0.3, 1);   /* for gauge/chart animations */
  --ease-sharp:     cubic-bezier(0.4, 0, 0.6, 1);     /* panel collapse */
}
```

---

## 2. Component API Patterns

### 2.1 Universal Prop Conventions

Every component in the system follows these naming rules. No exceptions.

| Prop | Type | Purpose |
|------|------|---------|
| `variant` | string union | Visual style variation. Examples: `"primary" \| "secondary" \| "ghost"` |
| `size` | `"sm" \| "md" \| "lg"` | Dimensional scale. Always these three values. Never pixel values as props. |
| `density` | `"compact" \| "comfortable" \| "spacious"` | Spacing mode (see section 6). Inherits from context if not set. |
| `disabled` | `boolean` | Prevents interaction. Applies `opacity-50 pointer-events-none`. |
| `className` | `string` | Escape hatch for one-off overrides via `cn()`. Always optional. |
| `as` | `React.ElementType` | Polymorphic rendering. Used on Button (renders as `<a>` or `<Link>`). |
| `children` | `React.ReactNode` | Composition slot. Most components use this, not config props. |

### 2.2 Composition Over Configuration

Components use the compound component pattern. Internal sub-components are exported
as properties of the parent.

```tsx
// CORRECT: Composition
<Panel>
  <Panel.Header title="The Wire" actions={<FilterButton />} />
  <Panel.Body scrollable>
    <StoryList stories={stories} />
  </Panel.Body>
  <Panel.Footer>
    <ConvergenceMinimap />
  </Panel.Footer>
</Panel>

// WRONG: Configuration
<Panel
  title="The Wire"
  headerActions={<FilterButton />}
  body={<StoryList stories={stories} />}
  footer={<ConvergenceMinimap />}
  scrollable
/>
```

Rule: if a component has more than 7 direct props (excluding `className`, `children`,
and HTML passthrough), it must be decomposed into compound sub-components.

### 2.3 The cn() Utility

All components use `cn()` (clsx + tailwind-merge) for class composition. The pattern is:

```tsx
function Component({ variant, size, className, ...props }) {
  return (
    <div className={cn(
      // 1. Base styles (always applied)
      "inline-flex items-center font-medium",
      // 2. Variant styles (conditional)
      variant === "primary" && "bg-action-primary text-paper",
      variant === "ghost" && "bg-transparent text-ink-muted hover:text-ink",
      // 3. Size styles (conditional)
      size === "sm" && "text-xs px-2 py-1",
      size === "md" && "text-sm px-3 py-1.5",
      // 4. className escape hatch (last, so it wins)
      className,
    )} {...props} />
  );
}
```

### 2.4 Variant System

Variants are defined as a record lookup, not inline conditionals, when there are 3+ options.
This pattern is mandatory for components with visual variants:

```tsx
const variants = {
  primary:   "bg-ink text-paper hover:bg-ink-light",
  secondary: "bg-surface text-ink border border-border-strong hover:border-ink/30",
  ghost:     "text-ink-muted hover:text-ink hover:bg-ink/5",
  danger:    "bg-feedback-error text-paper hover:bg-red-400",
} as const;

type ButtonVariant = keyof typeof variants;
```

This pattern exists in the current `Button.tsx` and should be replicated across
all variant-bearing components.

### 2.5 Component File Structure

Each component directory follows this structure:

```
app/components/
  ui/                     # Primitive, context-free components
    Button.tsx
    Badge.tsx
    Card.tsx
    Skeleton.tsx
    ThemeToggle.tsx
  shell/                  # App shell: fixed chrome
    AppShell.tsx          # The root layout wrapper
    HeaderBar.tsx         # 48px top bar
    StatusBar.tsx         # 28px bottom bar
    Panel.tsx             # Generic panel container (compound)
    PanelRail.tsx         # Collapsed panel indicator strip
    CommandPalette.tsx    # Cmd+K overlay
  wire/                   # The Wire (left panel) components
    StoryRow.tsx          # Compact story list row
    StoryList.tsx         # Virtualized story list
    FilterBar.tsx         # Collapsible filter container
    BiasSpectrumToggle.tsx
    RegionToggle.tsx
    ConvergenceSlider.tsx
    TimeRangeSelector.tsx
    FilterChip.tsx
  lens/                   # The Lens (center panel) components
    ConvergenceOverview.tsx
    StoryDetail.tsx
    SpectrumPanel.tsx     # 3-column Left/Center/Right
    ArticleRow.tsx
  dossier/                # The Dossier (right panel) components
    ClaimsTracker.tsx
    ClaimRow.tsx
    PrimarySourceList.tsx
    AIRoundTable.tsx
    SourceMatrix.tsx
  dataviz/                # Data visualization primitives
    ConvergenceGauge.tsx  # SVG arc gauge
    BiasSpectrumBar.tsx   # 7-segment colored bar
    ConvergenceDial.tsx   # Radial dial
    RegionIndicator.tsx   # Region dot/flag
    TrustSignalBadge.tsx
    ConvergenceSparkline.tsx
  shared/                 # Cross-cutting utilities
    DensityProvider.tsx   # React context for density mode
    ThemeProvider.tsx     # React context for theme state
```

### 2.6 Component API Quick Reference

Here are the API signatures for the key new components:

```tsx
// Panel (compound component)
interface PanelProps {
  name: string;               // "wire" | "lens" | "dossier"
  defaultWidth?: number;      // pixels, only for resizable panels
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

// Panel.Header
interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;  // slot for buttons/toggles in header
}

// Panel.Body
interface PanelBodyProps {
  scrollable?: boolean;       // adds overflow-y-auto + scrollbar-thin
  children: React.ReactNode;
}

// StoryRow (Wire panel - compact)
interface StoryRowProps {
  story: StoryCardProps;
  selected?: boolean;
  variant?: "compact" | "comfortable";
}

// ConvergenceGauge (SVG arc)
interface ConvergenceGaugeProps {
  score: number;              // 0-1
  size?: "sm" | "md" | "lg";  // 32px, 48px, 80px
  showLabel?: boolean;
  animated?: boolean;
}

// BiasSpectrumBar (7-segment)
interface BiasSpectrumBarProps {
  activeTiers: BiasTier[];    // which of the 7 tiers have coverage
  variant?: "bar" | "dots";   // bar = filled segments, dots = circles
  size?: "sm" | "md";
  interactive?: boolean;      // clickable tier toggles (for filters)
  onTierToggle?: (tier: BiasTier) => void;
}

// CommandPalette
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;          // "Cmd+K", "F", "1-7"
  icon?: React.ReactNode;
  action: () => void;
  group?: string;             // "Navigation" | "Filters" | "Actions"
}
```

---

## 3. The Dual-Aesthetic System

### 3.1 Architecture: CSS Variable Swap + Structural Modifiers

The dual aesthetic is implemented in three layers:

**Layer 1: Variable swap (90% of the work).** The `.dark` class on `<html>` swaps
all Tier 2 semantic tokens. Components reference `bg-surface`, `text-ink`, `border-border`
and get the correct values automatically. This requires zero component code changes.

**Layer 2: Structural CSS modifiers (9% of the work).** Some visual effects only exist
in one theme. These are applied via `.dark .component-class` selectors in `app.css`,
never via JavaScript theme checks. The component renders the same DOM in both themes;
CSS controls what is visible.

| Effect | Light mode | Dark mode |
|--------|-----------|-----------|
| Rule lines | 1px solid `--color-border` | 1px solid `rgba(0,255,136, 0.08)` |
| Card elevation | `box-shadow` | `border-glow` + subtle `box-shadow` |
| Scanlines | Not rendered | `::after` pseudo-element with repeating-linear-gradient |
| Text glow | Not applied | `text-shadow` on scores, headlines |
| Dateline font | `--font-body` | `--font-mono` |
| Selection color | Green tint | Neon green tint |
| Scrollbar thumb | Neutral gray | Neon green at 12% opacity |

**Layer 3: Conditional rendering (1% of the work, avoid when possible).** Only used when
the DOM structure must differ. The single current case: dark mode shows a subtle CRT
vignette overlay on the app shell. This is an absolutely-positioned div that is `hidden dark:block`.

```tsx
// The ONLY acceptable pattern for conditional theme rendering:
<div className="hidden dark:block absolute inset-0 pointer-events-none
  bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.3))]" />
```

### 3.2 Dark Mode Signature Effects (CSS Classes)

These are defined in `app.css` and applied as utility classes in component markup:

```css
/* Scanline overlay — applied to the app shell root */
.scanlines { position: relative; }
.dark .scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 136, 0.015) 2px,
    rgba(0, 255, 136, 0.015) 4px
  );
  z-index: 50;
}

/* Glow classes — text-shadow variants */
.dark .glow-green  { text-shadow: 0 0 10px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.1); }
.dark .glow-cyan   { text-shadow: 0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.1); }
.dark .glow-amber  { text-shadow: 0 0 10px rgba(255, 209, 102, 0.3), 0 0 20px rgba(255, 209, 102, 0.1); }
.dark .glow-red    { text-shadow: 0 0 10px rgba(255, 107, 107, 0.3), 0 0 20px rgba(255, 107, 107, 0.1); }
.dark .glow-purple { text-shadow: 0 0 10px rgba(167, 139, 250, 0.3), 0 0 20px rgba(167, 139, 250, 0.1); }

/* Card glow — border + shadow variant for elevated surfaces */
.dark .card-glow {
  border: 1px solid rgba(0, 255, 136, 0.08);
  background: rgba(18, 18, 31, 0.8);
}
.dark .card-glow:hover {
  border-color: rgba(0, 255, 136, 0.15);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.05);
}

/* CRT vignette — applied to app shell wrapper */
.dark .crt-vignette::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.4));
  z-index: 40;
}
```

### 3.3 Light Mode Signature Effects

```css
/* Rule lines — newspaper column dividers */
.rule-line        { border-top: 1px solid var(--color-border); }
.rule-line-thick  { border-top: 2px solid var(--color-border-strong); }
.rule-line-double { border-top: 3px double var(--color-border-strong); }

/* Aged paper texture — CSS noise pattern on body */
body {
  background-image:
    url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.03'/></svg>");
  background-color: var(--color-paper);
}
.dark body {
  background-image: none;  /* No texture in dark mode */
}

/* Ink stamp effect for TrustSignal badges in light mode */
.ink-stamp {
  position: relative;
}
.ink-stamp::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") repeat; /* noise texture */
  mix-blend-mode: multiply;
  opacity: 0.15;
  pointer-events: none;
}
.dark .ink-stamp::after { display: none; }
```

---

## 4. Data Visualization Color System

### 4.1 Design Constraints

All data viz colors must:
- Pass WCAG 2.1 AA contrast against both `--color-surface` (light) and `--color-surface` (dark)
- Be distinguishable by deuteranopia, protanopia, and tritanopia colorblind users
- Maintain semantic meaning across themes (red = caution, green = trust, etc.)
- Use a separate palette from UI chrome colors to prevent confusion

### 4.2 Bias Tier Colors

The 7 bias tiers use a diverging color scale centered on neutral gray. The scale
runs from blue (left-leaning) through gray (center) to red-orange (right-leaning).
This is NOT a political judgment; it is a conventional spectrum mapping that users expect.

The colors are chosen to be distinguishable under all three common colorblindness types
by varying both hue AND luminance. Each tier has a distinct lightness value.

```css
@theme {
  /* Bias Tier Colors — Diverging Blue-Gray-Red */
  --color-bias-far-left:     #1E40AF;  /* deep blue, L=32 */
  --color-bias-left:         #3B82F6;  /* medium blue, L=55 */
  --color-bias-center-left:  #60A5FA;  /* light blue, L=68 */
  --color-bias-center:       #8B8B9E;  /* neutral gray, L=58 */
  --color-bias-center-right: #F59E0B;  /* amber, L=68 */
  --color-bias-right:        #EF4444;  /* red, L=48 */
  --color-bias-far-right:    #991B1B;  /* deep red, L=28 */
}

.dark {
  /* Higher saturation + luminance for dark backgrounds */
  --color-bias-far-left:     #3B82F6;  /* brighter blue */
  --color-bias-left:         #60A5FA;
  --color-bias-center-left:  #93C5FD;
  --color-bias-center:       #A8A8BC;
  --color-bias-center-right: #FCD34D;
  --color-bias-right:        #F87171;
  --color-bias-far-right:    #FCA5A5;
}
```

Colorblind safety: the blue-red diverging scale is distinguishable under deuteranopia
because both ends also differ in luminance (dark blue L=32, dark red L=28, but intermediate
values differ by 10+ lightness points). For tritanopia (blue-yellow confusion), the
center-right amber (#F59E0B) is visually distinct from center-left blue (#60A5FA)
by luminance alone. A secondary encoding (position on the 7-segment bar) provides
a spatial cue that does not depend on color at all.

### 4.3 Convergence Grade Colors

Convergence scores (0.0 to 1.0) map to a sequential green scale. Low convergence
is desaturated; high convergence is vivid.

```css
@theme {
  --color-convergence-0:   var(--color-neutral-400);  /* no convergence — gray */
  --color-convergence-25:  #A3B18A;                   /* low — olive */
  --color-convergence-50:  #6B9E5F;                   /* medium — sage green */
  --color-convergence-75:  #2D6A4F;                   /* high — forest green */
  --color-convergence-100: #1B4332;                   /* maximum — deep green */
}

.dark {
  --color-convergence-0:   var(--color-neutral-500);
  --color-convergence-25:  #4ADE80;
  --color-convergence-50:  #22C55E;
  --color-convergence-75:  #00FF88;
  --color-convergence-100: #00FF88;  /* neon at max */
}
```

For the SVG gauge, the score maps to a CSS gradient:

```tsx
// In ConvergenceGauge.tsx
function scoreToColor(score: number, isDark: boolean): string {
  // Returns the appropriate convergence color for the score
  if (score < 0.25) return `var(--color-convergence-0)`;
  if (score < 0.50) return `var(--color-convergence-25)`;
  if (score < 0.75) return `var(--color-convergence-50)`;
  if (score < 0.90) return `var(--color-convergence-75)`;
  return `var(--color-convergence-100)`;
}
```

### 4.4 Region Colors

Nine regions need nine distinct colors. These use a categorical palette optimized
for map visualizations. Each region color includes a muted variant for backgrounds.

```css
@theme {
  --color-region-us:           #3B82F6;
  --color-region-uk:           #8B5CF6;
  --color-region-europe:       #06B6D4;
  --color-region-middle-east:  #F59E0B;
  --color-region-asia-pacific: #EF4444;
  --color-region-canada:       #EC4899;
  --color-region-latin-america:#10B981;
  --color-region-africa:       #F97316;
  --color-region-oceania:      #14B8A6;
}
```

Region colors do NOT change between light and dark themes. They are constant reference
colors, with contrast handled by the background surface they sit on. In dark mode,
region indicators render as dots with a subtle glow matching their color.

### 4.5 Trust Signal Colors

These map directly to the existing `TRUST_SIGNAL_CONFIG` in `app/types/index.ts`.

```css
@theme {
  --color-signal-single-source:             var(--color-red-500);
  --color-signal-contested:                 var(--color-amber-500);
  --color-signal-converged:                 var(--color-green-500);
  --color-signal-source-backed:             var(--color-teal-500);
  --color-signal-institutionally-validated:  var(--color-purple-500);
}

.dark {
  --color-signal-single-source:             var(--color-red-neon);
  --color-signal-contested:                 var(--color-amber-neon);
  --color-signal-converged:                 var(--color-green-neon);
  --color-signal-source-backed:             var(--color-teal-neon);
  --color-signal-institutionally-validated:  var(--color-purple-neon);
}
```

### 4.6 Claim Status Colors

Claims are either supported or contested by individual articles. The claim matrix uses:

```css
@theme {
  --color-claim-supports:   var(--color-green-500);   /* article supports claim */
  --color-claim-contradicts: var(--color-red-500);     /* article contradicts claim */
  --color-claim-silent:     var(--color-neutral-300);  /* article does not address claim */
  --color-claim-ambiguous:  var(--color-amber-500);    /* unclear support */
}
```

In the claim matrix (truth table), these render as filled cells with 15% opacity
backgrounds and full-strength border-left accents. Example:

```tsx
<td className="border-l-2" style={{
  borderColor: `var(--color-claim-supports)`,
  backgroundColor: `color-mix(in srgb, var(--color-claim-supports) 15%, transparent)`
}}>
```

---

## 5. Animation Token System

### 5.1 Motion Categories

All animations fall into one of four categories, each with assigned timing:

| Category | Purpose | Duration | Easing | Examples |
|----------|---------|----------|--------|----------|
| **Micro** | State changes on a single element | `--duration-fast` (150ms) | `--ease-default` | Button hover, checkbox toggle, tooltip show |
| **Transition** | Content or layout changes | `--duration-normal` (250ms) | `--ease-out` | Panel tab switch, filter apply, story selection |
| **Structural** | Panel resize, collapse, expand | `--duration-slow` (400ms) | `--ease-sharp` | Dossier collapse, filter panel expand |
| **Data** | Chart, gauge, score animations | `--duration-slower` (600ms) | `--ease-data` | Convergence gauge fill, spectrum bar animate |

### 5.2 Choreography Rules

**Rule 1: Parent before children.** When a panel opens, the container animates first
(expand), then children fade in with stagger. Never animate children while the container
is still moving.

**Rule 2: Exit faster than enter.** Enter transitions use `--duration-normal` (250ms).
Exit transitions use `--duration-fast` (150ms). Users need to see what is arriving;
they do not need to watch things leave.

**Rule 3: Stagger delay is 50ms.** When multiple elements enter (story list rows,
claim rows, filter chips), each subsequent element delays by 50ms. Maximum 8 staggered
elements (400ms total). After 8, all remaining elements enter together.

**Rule 4: Data animations always ease-data.** Gauge arcs, score numbers, spectrum bars,
and any numeric data visualization uses `--ease-data` (cubic-bezier(0.16, 1, 0.3, 1)).
This creates a fast-start, gentle-settle motion that feels precise and confident.

**Rule 5: Respect prefers-reduced-motion.** All animations are wrapped in:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.3 Keyframe Library

```css
/* Panel collapse/expand */
@keyframes panel-collapse {
  from { width: var(--panel-width); opacity: 1; }
  to   { width: var(--panel-rail-width, 40px); opacity: 0.6; }
}

/* Convergence gauge fill (SVG stroke-dashoffset) */
@keyframes gauge-fill {
  from { stroke-dashoffset: var(--gauge-circumference); }
  to   { stroke-dashoffset: var(--gauge-target); }
}

/* Score counter (CSS counter + content) */
@keyframes score-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Story row enter (for list updates) */
@keyframes row-enter {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Filter chip enter */
@keyframes chip-enter {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

/* Command palette backdrop */
@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Command palette body */
@keyframes palette-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Signal pulse (trust badge) */
@keyframes signal-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}

/* Neon flicker (dark mode only, very subtle) */
@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  92%      { opacity: 1; }
  93%      { opacity: 0.85; }
  94%      { opacity: 1; }
  96%      { opacity: 0.9; }
  97%      { opacity: 1; }
}
```

### 5.4 Transition Utility Classes

```css
/* Applied via className in components */
.transition-micro    { transition: all var(--duration-fast) var(--ease-default); }
.transition-content  { transition: all var(--duration-normal) var(--ease-out); }
.transition-panel    { transition: all var(--duration-slow) var(--ease-sharp); }
.transition-data     { transition: all var(--duration-slower) var(--ease-data); }
```

---

## 6. Density Modes

### 6.1 Three Density Levels

Density affects spacing, font size, row height, and icon size across the entire application.
It is implemented as a CSS class on the app shell root and a React context for components
that need to read the value programmatically.

```css
/* Density tokens — applied as data attribute on <html> */
[data-density="compact"] {
  --density-row-height:    32px;
  --density-row-padding:   4px 8px;
  --density-cell-gap:      4px;
  --density-section-gap:   8px;
  --density-font-body:     var(--text-sm);    /* 13px */
  --density-font-label:    var(--text-2xs);   /* 10px */
  --density-icon-size:     14px;
  --density-badge-padding: 2px 6px;
}

[data-density="comfortable"] {
  --density-row-height:    40px;
  --density-row-padding:   8px 12px;
  --density-cell-gap:      8px;
  --density-section-gap:   16px;
  --density-font-body:     var(--text-base);  /* 14px */
  --density-font-label:    var(--text-xs);    /* 11px */
  --density-icon-size:     16px;
  --density-badge-padding: 4px 10px;
}

[data-density="spacious"] {
  --density-row-height:    52px;
  --density-row-padding:   12px 16px;
  --density-cell-gap:      12px;
  --density-section-gap:   24px;
  --density-font-body:     var(--text-md);    /* 16px */
  --density-font-label:    var(--text-sm);    /* 13px */
  --density-icon-size:     20px;
  --density-badge-padding: 6px 12px;
}
```

### 6.2 DensityProvider (React Context)

```tsx
// app/components/shared/DensityProvider.tsx
import { createContext, useContext, useState, useEffect } from "react";

type Density = "compact" | "comfortable" | "spacious";

interface DensityContextValue {
  density: Density;
  setDensity: (d: Density) => void;
}

const DensityContext = createContext<DensityContextValue>({
  density: "comfortable",
  setDensity: () => {},
});

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = useState<Density>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("triangulate-density") as Density) || "comfortable";
    }
    return "comfortable";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    localStorage.setItem("triangulate-density", density);
  }, [density]);

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  return useContext(DensityContext);
}
```

### 6.3 Component Density Usage

Components consume density tokens via CSS custom properties, not via props.
The `data-density` attribute on `<html>` sets the tokens; components reference them:

```tsx
// StoryRow uses density tokens automatically
function StoryRow({ story, selected }: StoryRowProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-border cursor-pointer transition-micro",
        selected && "bg-action-primary/5 border-l-2 border-l-action-primary",
      )}
      style={{
        minHeight: "var(--density-row-height)",
        padding: "var(--density-row-padding)",
        gap: "var(--density-cell-gap)",
        fontSize: "var(--density-font-body)",
      }}
    >
      {/* ... */}
    </div>
  );
}
```

For components where Tailwind utilities are preferred over inline styles,
use Tailwind arbitrary values: `min-h-[var(--density-row-height)]`.

### 6.4 Default Density by User Tier

| User Tier | Default Density | Rationale |
|-----------|----------------|-----------|
| Free | comfortable | Approachable for hobbyists |
| Premium | comfortable | Same default, toggle available |
| Journalist Pro | compact | Power users want density |

Users can always change their density. The default is a starting point.

---

## 7. The "Proprietary Feel" Audit

### Five Signature Visual Elements

These are the visual details that make Triangulate recognizable at a glance.
If someone screenshots this app, these five elements should make it unconfusable
with any other news product.

---

**1. The Convergence Gauge**

A semi-circular SVG arc that fills from left to right based on the convergence score.
The arc is thick (8px stroke in compact, 12px in spacious) with rounded endcaps.
In light mode, the arc is a solid green gradient (olive to forest). In dark mode,
the arc is neon green with a soft glow filter.

What makes it proprietary: the gauge is NOT a progress bar. It is an arc — a dial,
like a fuel gauge or a seismograph reading. This shape communicates "measurement"
and "precision," not "completion." No news product uses this shape.

Implementation:

```tsx
function ConvergenceGauge({ score, size = "md" }: ConvergenceGaugeProps) {
  const dimensions = { sm: 32, md: 48, lg: 80 };
  const strokes = { sm: 4, md: 6, lg: 8 };
  const d = dimensions[size];
  const s = strokes[size];
  const r = (d - s) / 2;
  const circumference = Math.PI * r; // semi-circle
  const offset = circumference * (1 - score);

  return (
    <svg width={d} height={d / 2 + s} viewBox={`0 0 ${d} ${d / 2 + s}`}>
      {/* Track */}
      <path
        d={`M ${s/2} ${d/2} A ${r} ${r} 0 0 1 ${d - s/2} ${d/2}`}
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth={s}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${s/2} ${d/2} A ${r} ${r} 0 0 1 ${d - s/2} ${d/2}`}
        fill="none"
        stroke={scoreToColor(score)}
        strokeWidth={s}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-data"
      />
    </svg>
  );
}
```

---

**2. The Bias Spectrum Bar**

A horizontal bar divided into 7 equal segments, one per `BiasTier`. Active tiers
are filled with their tier color. Inactive tiers are hollow (border only).
The bar has a thin center tick mark at the CENTER position.

What makes it proprietary: this is NOT a simple gradient bar. It is a segmented
instrument, like a graphic equalizer or a mixing board channel display. Each segment
is a discrete, toggleable unit. The visual immediately communicates "we measure
across the full political spectrum" without any text.

```
Light mode:  [##][##][##][||][  ][##][  ]
             blue---------gray------red
             active tiers filled, inactive empty, center tick

Dark mode:   [##][##][##][||][  ][##][  ]
             same structure but colors are neon-bright with glow
```

---

**3. The Newspaper Rule Lines**

Horizontal rules that divide content sections, implemented in three weights:
thin (1px), thick (2px), and double (3px double-line). In light mode, these are
classic newspaper column separators — subtle, authoritative, and immediately
evocative of print journalism. In dark mode, they become faint neon scan lines.

What makes it proprietary: no web app uses double-line rules anymore. This is
a deliberate anachronism that signals "this is about journalism, not technology."
Combined with the Playfair Display serif font, it creates a visual language that
says "old-world credibility meets modern data."

```css
/* The double rule above major sections */
.rule-line-editorial {
  border-top: 1px solid var(--color-border-strong);
  border-bottom: 1px solid var(--color-border-strong);
  height: 3px;
  margin: var(--density-section-gap) 0;
}
.dark .rule-line-editorial {
  border-top-color: rgba(0, 255, 136, 0.12);
  border-bottom-color: rgba(0, 255, 136, 0.12);
}
```

---

**4. The CRT Scanline Overlay (Dark Mode Only)**

A full-viewport pseudo-element that applies faint horizontal lines over the entire
interface, simulating a CRT monitor. The lines are 2px apart and use neon green at
1.5% opacity — barely visible at normal viewing distance, but perceptible as texture.
Combined with the vignette (darkened edges) and neon glow effects, this creates a
"war room terminal" feeling that is completely unique in news products.

What makes it proprietary: this single effect transforms a standard dark mode into
a cinematic experience. It says "you are using classified intelligence software"
rather than "you turned off the lights." No news aggregator has this.

---

**5. The Dateline Typography Swap**

In light mode, datelines and metadata labels use DM Sans (a clean geometric sans-serif)
in small caps with wide letter-spacing. In dark mode, the same elements switch to
JetBrains Mono with even wider letter-spacing. The content is identical; the typeface
changes the entire personality.

Light mode dateline: `WASHINGTON — 3 HOURS AGO` in DM Sans small caps
Dark mode dateline: `WASHINGTON — 3 HOURS AGO` in JetBrains Mono

What makes it proprietary: this per-element font swap between themes creates two
genuinely different products that share one codebase. The light mode feels like
a prestigious broadsheet newspaper. The dark mode feels like a terminal feed.
No other product commits this deeply to dual personality.

---

## 8. Implementation Plan

### Phase 1: Token Foundation (app.css rewrite)

1. Restructure `app.css` into the three-tier model described in section 1
2. Add all new tokens: spacing, typography scale, elevation, radius, timing
3. Add data visualization tokens: bias tier colors, convergence grades, region colors
4. Add density mode tokens and `[data-density]` selectors
5. Add animation keyframes and transition utility classes
6. Add reduced-motion media query
7. Verify all existing components still render correctly (no visual regression)

### Phase 2: Component API Refactors

1. Refactor `Button.tsx` to use Tier 2/3 tokens instead of raw Tailwind colors
2. Refactor `Card.tsx` into a compound component (Card, Card.Header, Card.Body)
3. Refactor `Badge.tsx` to use semantic token colors instead of inline hex `style` props
4. Build `Panel` compound component (shell/Panel.tsx)
5. Build `DensityProvider` and `ThemeProvider`

### Phase 3: New Components

1. `ConvergenceGauge` (SVG arc)
2. `BiasSpectrumBar` (7-segment)
3. `StoryRow` (compact Wire row)
4. `CommandPalette` (Cmd+K overlay)
5. `AppShell` (fixed layout with HeaderBar, StatusBar, three panels)
6. `FilterBar` with all filter sub-components

### Phase 4: Visual Polish

1. Add light-mode paper texture (CSS noise SVG)
2. Add dark-mode CRT vignette
3. Add glow effects on data viz components
4. Tune all transition timings
5. Add stagger animations to story list and claim list
6. Accessibility audit: contrast ratios, focus indicators, reduced motion

---

## Appendix: Token-to-Tailwind Mapping

Since Tailwind v4 uses `@theme` to register custom properties, all tokens defined
in the `@theme` block are automatically available as Tailwind utilities:

| Token | Tailwind class |
|-------|---------------|
| `--color-ink` | `text-ink`, `bg-ink`, `border-ink` |
| `--color-surface` | `bg-surface` |
| `--color-action-primary` | `text-action-primary`, `bg-action-primary` |
| `--color-bias-far-left` | `text-bias-far-left`, `bg-bias-far-left` |
| `--color-convergence-75` | `text-convergence-75`, `bg-convergence-75` |
| `--shadow-md` | `shadow-md` |
| `--radius-sm` | `rounded-sm` |
| `--duration-fast` | `duration-fast` |

Components use these Tailwind utilities directly. They never use raw CSS
custom property references in `className`. The `style` prop is used only for
truly dynamic values (gauge offsets, spectrum bar widths, scores).
