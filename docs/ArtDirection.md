# ART.md — Visual Design and UX Direction

> **UPDATE FREQUENCY: SET ONCE, REVISIT RARELY**
> Establish the visual direction during planning. This file guides both AI agents (generating UI code) and the human (making design decisions). Consistency is the goal — once the direction is set, every screen should feel like it belongs to the same product. Revisit only if the brand direction fundamentally changes.
>
> **Depends on:** CONTEXT.md (brand personality), SPEC.md (what screens/views exist)
> **Feeds into:** All UI code, component development, marketing materials

---

## Design Philosophy

Triangulate should feel like a broadsheet newspaper crossed with a Bloomberg Terminal. Light mode evokes the authority and gravitas of old printing press journalism — aged paper, serif headlines, rule lines. Dark mode transforms into a cyberpunk war room terminal — neon accents, scanline overlays, CRT glows. The product communicates: "This is serious. This is trustworthy. This is unlike anything else."

---

## Brand Personality

| This | Not This |
|------|----------|
| Authoritative | Preachy |
| Precise | Sterile |
| Gravitas | Stuffy |
| Revelatory | Sensational |

---

## Color System

### Primary Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Brand Green | #2D6A4F | Convergence, positive signals, CTAs |
| Primary Hover | Green Dark | #1B4332 | Hover states |
| Secondary | Brand Teal | #264653 | Center bias, primary sources, data |

### Neutral Palette (Light Mode)

| Role | Hex | Usage |
|------|-----|-------|
| Background (Paper) | #FAF9F6 | Page background (aged newsprint) |
| Surface | #FFFFFF | Cards, panels, elevated elements |
| Paper Aged | #F5F0E8 | Alternating rows, secondary backgrounds |
| Border | rgba(26,26,46,0.08) | Dividers, separators |
| Text Primary (Ink) | #1A1A2E | Headlines, body text |
| Text Secondary (Ink Light) | #3D3D56 | Secondary content |
| Text Muted (Ink Muted) | #6B6B82 | Captions, labels |
| Text Faint (Ink Faint) | #7A7A92 | Placeholders (CORRECTED from #9E9EB0 for WCAG) |

### Semantic / Feedback Colors (Light Mode)

| Role | Hex | Usage |
|------|-----|-------|
| Success (Converged) | #2D6A4F | Convergence, confirmed claims |
| Warning (Contested) | #E9C46A | Developing stories, contested claims (NEVER as text color on paper bg) |
| Error (Single Source) | #E76F51 | Low convergence, contradicting sources |
| Info (Teal) | #264653 | Center bias, primary source docs |
| Evaluative (Purple) | #6C63FF | Evaluative claims |

### Dark Mode

- [x] Supported — ships with v1

| Role | Hex | Usage |
|------|-----|-------|
| Background (Paper) | #0A0A12 | Deep space background |
| Surface | #12121F | Cards, panels |
| Ink | #E8E6F0 | Primary text (bright lavender) |
| Ink Muted | #8A87A0 | Secondary text |
| Ink Faint | #706D88 | Placeholders (CORRECTED for WCAG) |
| Border | rgba(255,255,255,0.18) | Dividers (CORRECTED from 0.06) |
| Neon Green | #00FF88 | Convergence, positive |
| Neon Amber | #FFD166 | Developing, caution |
| Neon Red | #FF6B6B | Low signal, contradicting |
| Neon Cyan | #00D4FF | Data, neutral accents |
| Neon Purple | #A78BFA | Evaluative claims |

### Bias Tier Colors (Data Viz — both themes)

| Tier | Hex |
|------|-----|
| FAR_LEFT | #1E40AF |
| LEFT | #2563EB |
| CENTER_LEFT | #60A5FA |
| CENTER | #6B7280 |
| CENTER_RIGHT | #F97316 |
| RIGHT | #DC2626 |
| FAR_RIGHT | #991B1B |

### Region Colors

| Region | Hex |
|--------|-----|
| US | #3B82F6 |
| UK | #8B5CF6 |
| EUROPE | #06B6D4 |
| MIDDLE_EAST | #F59E0B |
| ASIA_PACIFIC | #10B981 |
| CANADA | #EF4444 |
| GLOBAL | #6B7280 |

---

## Typography

| Role | Family | Weight | Size (rem) | Line Height | Letter Spacing |
|------|--------|--------|-----------|-------------|---------------|
| Display / Hero | Playfair Display | 700 | 2rem (32px) | 1.1 | — |
| H1 | Playfair Display | 700 | 1.25rem (20px) | 1.25 | — |
| H2 | Playfair Display | 600 | 1rem (16px) | 1.3 | — |
| H3 | Playfair Display | 600 | 0.875rem (14px) | 1.3 | — |
| Body | DM Sans | 400 | 0.875rem (14px) | 1.5 | — |
| Body Small | DM Sans | 400 | 0.8125rem (13px) | 1.45 | — |
| Caption / Dateline | DM Sans | 500 | 0.6875rem (11px) | 1.35 | 0.06em, uppercase |
| Code / Data | JetBrains Mono | 600–700 | 0.875rem (14px) | 1.0 | tabular-nums |
| Micro | DM Sans | 600 | 0.625rem (10px) | 1.3 | — |

- **Font Source:** Google Fonts (Playfair Display, DM Sans) + self-hosted fallback
- **Fallback Stack:** Georgia for serif, system-ui for sans, ui-monospace for mono
- **Scale System:** Tailwind default

---

## Layout and Spacing

- **App Shell:** Fixed frame, zero page-level scrolling
- **TopBar:** 48px fixed top
- **Sidebar:** 56px collapsed / 240px expanded
- **StatusBar:** 28px fixed bottom
- **Panel System:** Resizable columns within content area
- **Max Content Width:** Fluid (panels fill available space)
- **Grid System:** Tailwind grid + flexbox
- **Spacing Unit:** 4px / 0.25rem (Tailwind default)
- **Spacing Scale:** Tailwind default (4, 8, 12, 16, 24, 32, 48, 64, 96)
- **Mobile:** Bottom tab bar (56px) replaces sidebar

### Breakpoints

| Name | Min Width | Target |
|------|----------|--------|
| xs | 0 | Phones |
| sm | 768px | Tablets |
| md | 1024px | Laptops |
| lg | 1280px | 3-panel with sidebar collapsed |
| xl | 1440px+ | Full 3-panel with sidebar expanded |

- **Approach:** Desktop-first for command center, responsive down to mobile

### Density Modes

| Mode | Row Height | Body Size | Label Size | Icon Size |
|------|-----------|-----------|-----------|-----------|
| Compact | 32px | 13px | 10px | 14px |
| Comfortable (default) | 40px | 14px | 11px | 16px |
| Spacious | 52px | 16px | 13px | 20px |

---

## Component Design Tokens

### Buttons

| Variant | Background | Text | Border | Radius | Padding |
|---------|-----------|------|--------|--------|---------|
| Primary | ink | paper | none | 2px | 12–16px |
| Secondary | transparent | ink | 1px ink | 2px | 12–16px |
| Ghost | transparent | ink-muted | none | 2px | 8–12px |

- **Hover:** Subtle bg change, enhanced border
- **Disabled:** opacity-40, cursor-not-allowed
- **Focus:** ring-2 ring-brand-green ring-offset-2

### Cards

- **Background:** surface (white light, #12121F dark)
- **Border:** 1px border-border
- **Border Radius:** 2px (deliberately sharp — newspaper aesthetic)
- **Shadow:** 0 1px 2px rgba(26,26,46,0.04) light, none dark (glow instead)
- **Dark mode:** card-glow class (border glow + subtle box-shadow)
- **Padding:** p-3 to p-6
- **Hover state:** Slightly enhanced border

### Inputs and Forms

- **Input height:** 40px (comfortable density)
- **Border:** 1px border-border
- **Border radius:** 2px
- **Focus ring:** ring-2 ring-brand-green ring-offset-2
- **Error state:** border-error (#E76F51), error message text below
- **Label position:** Above
- **Placeholder style:** ink-faint (#7A7A92 light, #706D88 dark)
- **Required indicator:** Asterisk (*) in error color

### Navigation

- **Type:** Fixed sidebar (collapsed 56px / expanded 240px) + top bar (48px)
- **Background:** surface
- **Active state:** 3px left accent bar in brand-green, 6% bg fill
- **Mobile behavior:** Bottom tab bar (56px, 5 icons)
- **Sticky:** Yes (fixed positioning on all shell elements)

### Modals / Dialogs

- **Overlay:** rgba(26,26,46,0.5) light, rgba(10,10,18,0.7) dark
- **Width:** 480px default, 640px wide variant
- **Border radius:** 2px (matches card aesthetic)
- **Animation:** 250ms ease-out fade + scale from 95%
- **Close mechanism:** X button top-right, Escape key, overlay click

---

## Iconography

- **Icon Set:** Lucide React
- **Default Size:** 16px (shell), 14px (status bar), 18px (sidebar expanded)
- **Style:** Outline
- **Color:** Inherit text color
- **Accessibility:** aria-hidden on decorative, aria-label on functional

---

## Imagery and Media

- **Photography Style:** N/A (data-driven product, minimal photography)
- **Illustration Style:** N/A
- **AI-Generated Art:** N/A
- **Preferred Formats:** SVG for icons
- **Lazy Loading:** Yes
- **Placeholder Strategy:** Skeleton screens

---

## Animation and Motion

- **Micro:** 150ms, ease-default (button hover, tooltips)
- **Transition:** 250ms, ease-out (panel tabs, story selection)
- **Structural:** 400ms, ease-sharp (panel collapse, filter expand)
- **Data:** 600ms, cubic-bezier(0.16,1,0.3,1) (gauge fill, spectrum bar)
- **Loading States:** Skeleton screens for feed/story, progressive loading text for search
- **Page Transitions:** None
- **Reduced Motion:** ALL animations respect prefers-reduced-motion

---

## Five Signature Visual Elements

1. **The Convergence Gauge** — Semicircular SVG arc dial
2. **The Bias Spectrum Bar** — 7-segment colored equalizer
3. **Newspaper Rule Lines** — Single, thick, and double-line dividers
4. **CRT Scanline Overlay** — Dark mode only, 2px-spaced green lines at 1.5% opacity
5. **Dateline Typography Swap** — DM Sans small caps (light) / JetBrains Mono (dark)

---

## Accessibility Requirements

- **Target:** WCAG 2.2 Level AA (minimum), AAA where practical
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators:** Visible focus ring on ALL interactive elements — never `outline: none` without replacement
- **Keyboard Navigation:** All interactive elements reachable and operable via keyboard
- **Screen Reader:** Semantic HTML (nav, main, section, article, aside, footer) + ARIA where needed
- **Skip Navigation:** "Skip to content" link for keyboard users
- **Alt Text:** Every `<img>` gets an alt attribute — descriptive or empty (`alt=""`) for decorative
- **Touch Targets:** Minimum 44x44px for mobile tap targets
- **Reduced Motion:** Respect `prefers-reduced-motion` — disable animations, provide static alternatives
- **Trust Signals:** Use icons + labels + color (never color alone) for accessibility

---

## Anti-Patterns (Do NOT Do These)

- Never rely on color alone for trust signals — always include icon + text label
- Never hide or dim fringe sources differently from mainstream sources
- Never use fixed heights on text containers (article titles and claims vary in length)
- Never add editorial commentary or judgment labels to any outlet
- Never use #E9C46A (warning yellow) as a text color on paper background — insufficient contrast

---

## Reference / Inspiration

| Reference | What to Take From It | Link |
|-----------|---------------------|------|
| Bloomberg Terminal | Information density, panel layout, fixed frame | bloomberg.com/professional |
| Ground News | Spectrum visualization, bias chart | groundnews.com |
| VS Code | Panel system, command palette, keyboard shortcuts | code.visualstudio.com |
| New York Times | Typography authority, broadsheet layout | nytimes.com |
| Linear | Command palette UX, keyboard-first design | linear.app |

---

## AI Agent UI Instructions

When any AI agent generates UI code for this project, follow these rules:

1. **Use the design tokens above.** Do not invent new colors, spacing values, or font sizes.
2. **Desktop-first, responsive down.** Panels collapse gracefully on smaller screens.
3. **Semantic HTML.** Use `nav`, `main`, `section`, `article`, `aside`, `footer`, `header`. Divs are a last resort.
4. **Tailwind utilities only** (if using Tailwind). No custom CSS unless there is no Tailwind equivalent.
5. **Every interactive element gets a focus state.** No exceptions.
6. **Every image gets an alt attribute.** No exceptions.
7. **No fixed heights on text containers.** Content length varies. Use min-height if needed.
8. **No `!important`** unless overriding third-party CSS.
9. **Test with content twice as long as expected.** Names, descriptions, and titles overflow.
10. **White space is not wasted space.** When in doubt, add breathing room.
11. **Prefer CSS Grid for page layout, Flexbox for component-level alignment.**
12. **Match the color palette above exactly — do not invent new colors.**
13. **When in doubt, simpler is better.**
