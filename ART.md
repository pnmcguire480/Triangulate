# ART.md — Visual Design and UX Direction

> 📌 **UPDATE FREQUENCY: SET ONCE, REVISIT RARELY**
> Establish the visual direction during planning. This file guides both AI agents (generating UI code) and the human (making design decisions). Consistency is the goal — once the direction is set, every screen should feel like it belongs to the same product. Revisit only if the brand direction fundamentally changes.
>
> **Depends on:** CONTEXT.md (brand personality), SPEC.md (what screens/views exist)
> **Feeds into:** All UI code, component development, marketing materials

---

## Design Philosophy

<!-- 2-4 sentences. What should this product FEEL like? What emotional response should a user have? Think adjectives, not features. -->

---

## Brand Personality

<!-- Pick 3-5 traits. For each, name its opposite — the thing you're actively avoiding. This creates a design corridor: stay between the traits and their opposites. -->

| This | Not This |
|------|----------|
|      |          |
|      |          |
|      |          |
|      |          |

---

## Color System

### Primary Palette

| Role | Name | Hex | RGB | Usage |
|------|------|-----|-----|-------|
| Primary | | | | Main actions, links, brand identity |
| Primary Hover | | | | Hover/focus state for primary |
| Secondary | | | | Supporting elements, secondary actions |

### Neutral Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | | Page background |
| Surface | | Cards, panels, elevated elements |
| Border | | Dividers, input borders, separators |
| Text Primary | | Headings, body text |
| Text Secondary | | Captions, labels, helper text |
| Text Muted | | Disabled, placeholder |

### Semantic / Feedback Colors

| Role | Hex | Usage |
|------|-----|-------|
| Success | | Confirmations, completed states |
| Warning | | Caution states, approaching limits |
| Error | | Validation errors, failures |
| Info | | Informational messages, tips |

### Dark Mode

- [ ] Supported — ships with v1
- [ ] Planned — post-MVP
- [ ] Not planned

**If supported:**
- **Method:** <!-- CSS custom properties, Tailwind dark:, class toggle, system preference -->
- **Default:** <!-- Light, dark, or system preference -->

---

## Typography

| Role | Family | Weight | Size (rem) | Line Height | Letter Spacing |
|------|--------|--------|-----------|-------------|---------------|
| Display / Hero | | | | | |
| H1 | | | | | |
| H2 | | | | | |
| H3 | | | | | |
| Body | | | | | |
| Body Small | | | | | |
| Caption / Label | | | | | |
| Code / Monospace | | | | | |

- **Font Source:** <!-- Google Fonts, self-hosted WOFF2, system font stack -->
- **Fallback Stack:**
- **Scale System:** <!-- Tailwind default, custom modular scale, fluid type -->

---

## Layout and Spacing

- **Max Content Width:** <!-- e.g., 1280px, 72rem -->
- **Grid System:** <!-- CSS Grid, Tailwind grid, flexbox -->
- **Spacing Unit:** <!-- Base unit, e.g., 4px / 0.25rem (Tailwind default) -->
- **Spacing Scale:** <!-- Which increments: 4, 8, 12, 16, 24, 32, 48, 64, 96 -->

### Breakpoints

| Name | Min Width | Target |
|------|----------|--------|
| Mobile | 0 | Phones (portrait) |
| Tablet | | Tablets, large phones (landscape) |
| Desktop | | Laptops, desktops |
| Wide | | Large monitors |

- **Approach:** [ ] Mobile-first (min-width) [ ] Desktop-first (max-width)

---

## Component Design Tokens

### Buttons

| Variant | Background | Text | Border | Radius | Padding | Shadow |
|---------|-----------|------|--------|--------|---------|--------|
| Primary | | | | | | |
| Secondary | | | | | | |
| Ghost / Outline | | | | | | |
| Destructive | | | | | | |
| Disabled | | | | | | |

### Cards

- Background:
- Border:
- Border Radius:
- Shadow:
- Padding:
- Hover state:

### Inputs and Forms

- Input height:
- Border:
- Border radius:
- Focus ring:
- Error state:
- Label position: <!-- above, inline, floating -->
- Placeholder style:
- Required indicator:

### Navigation

- Type: <!-- Top bar, side nav, bottom tabs, hamburger, combination -->
- Background:
- Active state:
- Mobile behavior:
- Sticky: [ ] Yes [ ] No

### Modals / Dialogs

- Overlay:
- Width:
- Border radius:
- Animation:
- Close mechanism:

---

## Iconography

- **Icon Set:** <!-- Lucide, Heroicons, Phosphor, Tabler, custom SVG -->
- **Default Size:**
- **Style:** <!-- Outline, filled, duotone -->
- **Color:** <!-- Inherit text color, fixed color, contextual -->
- **Accessibility:** <!-- aria-hidden on decorative, aria-label on functional -->

---

## Imagery and Media

- **Photography Style:**
- **Illustration Style:**
- **AI-Generated Art:** <!-- If applicable: model, style prompts, aesthetic notes -->
- **Preferred Formats:** <!-- WebP for photos, SVG for icons/illustrations -->
- **Aspect Ratios:**
- **Lazy Loading:** [ ] Yes [ ] No
- **Placeholder Strategy:** <!-- Blur hash, skeleton, solid color -->

---

## Animation and Motion

- **Philosophy:** <!-- Minimal/functional, playful/bouncy, cinematic, none -->
- **Default Duration:** <!-- e.g., 150ms for micro, 300ms for transitions -->
- **Default Easing:** <!-- ease-out, cubic-bezier, spring -->
- **Loading States:** <!-- Skeleton screens, spinners, progress bars, shimmer -->
- **Page Transitions:** <!-- Fade, slide, none -->
- **Reduced Motion:** <!-- Always respect prefers-reduced-motion: reduce -->

---

## Accessibility Requirements

- **Target:** WCAG 2.1 Level AA (minimum)
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators:** Visible focus ring on ALL interactive elements — never `outline: none` without replacement
- **Keyboard Navigation:** All interactive elements reachable and operable via keyboard
- **Screen Reader:** Semantic HTML (nav, main, section, article, aside, footer) + ARIA where needed
- **Skip Navigation:** "Skip to content" link for keyboard users
- **Alt Text:** Every `<img>` gets an alt attribute — descriptive or empty (`alt=""`) for decorative
- **Touch Targets:** Minimum 44x44px for mobile tap targets
- **Reduced Motion:** Respect `prefers-reduced-motion` — disable animations, provide static alternatives

---

## Anti-Patterns (Do NOT Do These)

<!-- Specific visual and UX mistakes to avoid in this project. Be as specific as possible. -->

-
-
-
-

---

## Reference / Inspiration

<!-- Links to sites, apps, Dribbble shots, screenshots, or anything that captures the target aesthetic. -->

| Reference | What to Take From It | Link |
|-----------|---------------------|------|
|           |                     |      |

---

## AI Agent UI Instructions

When any AI agent generates UI code for this project, follow these rules:

1. **Use the design tokens above.** Do not invent new colors, spacing values, or font sizes.
2. **Mobile-first.** Start with the smallest screen. Add complexity at larger breakpoints.
3. **Semantic HTML.** Use `nav`, `main`, `section`, `article`, `aside`, `footer`, `header`. Divs are a last resort.
4. **Tailwind utilities only** (if using Tailwind). No custom CSS unless there is no Tailwind equivalent.
5. **Every interactive element gets a focus state.** No exceptions.
6. **Every image gets an alt attribute.** No exceptions.
7. **No fixed heights on text containers.** Content length varies. Use min-height if needed.
8. **No `!important`** unless overriding third-party CSS.
9. **Test with content twice as long as expected.** Names, descriptions, and titles overflow.
10. **White space is not wasted space.** When in doubt, add breathing room.
