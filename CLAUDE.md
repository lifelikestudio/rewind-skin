# Rewind Skin — V3 Design System & Build

> Boutique luxury skincare studio in North York, Toronto. Two pillars: in-studio treatments and curated e-commerce retail on Shopify. No in-house product line.
> Designer/Developer: George (Lifelike).
> V3 Figma file key: `lwPjiKhA1GRP4OQxpttUxR`

## Purpose

Extract the web design system from V3 Figma designs AND build V3 sections against that system. Extraction populates the design system. Build consumes it.

## Figma reference

- File key: `lwPjiKhA1GRP4OQxpttUxR`
- Frame naming: `[Seed] [BREAKPOINT] [Width Range] - Component/Page [State] [Theme]`
- Example: `[Seed] [LG] 1440-1919px - Navigation [Initial State] [Taupe Theme]`
- Extraction happens in a separate workspace. This repo consumes the output.

## Design system

- `design-system/tokens.css` — CSS custom properties (canonical, populated through extraction)
- `design-system/tokens.json` — structured token data for agent reasoning
- `design-system/extractions/` — raw extraction logs, one per component

### Rules
- Never invent token values. If a token doesn't exist for what's needed, flag it.
- Never populate tokens from brand guidelines. Tokens come from the V3 Figma designs.
- Log raw values first, identify patterns across components, then codify.
- George approves all token additions before they're committed.

## Context

- `docs/component-inventory.md` — tracks what's been identified and extracted.

## Code conventions

### Liquid
- Clean, well-commented Liquid. Follow Shopify 2.0 section/block architecture.
- Every section must be fully customisable from the theme editor — a non-technical merchant controls everything.
- Section schemas: typed settings, meaningful labels, sensible defaults.
- Snippets for reusable sub-components. Sections for top-level page composition.
- Use `render` over `include` for snippets.
- Assign complex logic to variables at top of file before markup.

### Tailwind CSS (v4)
- Utility-first. Custom theme values come from `@theme inline` in the V3 input CSS (`src/v3.input.css`), which references the design system tokens.
- No hardcoded hex, px spacing, or font-size values in templates — use Tailwind classes.
- `@apply` sparingly and only in component-level CSS, never in Liquid templates.
- This project uses Tailwind v4 (CSS-first configuration). There is no `tailwind.config.js`.

### Capsize typography
- All V3 text styles use Capsize-generated classes (`.text-{style-name}`) from `assets/capsize-v3.css`.
- Never set `font-size` or `line-height` directly in Liquid templates — Capsize trims the invisible leading space that browsers add, so spacing around text matches Figma precisely.
- Text styles are defined in `src/capsize-v3.js` with responsive font-size/line-height per breakpoint, using Scto Grotesk A font metrics.
- When a section introduces a new text style, add it to `src/capsize-v3.js` and run `npm run capsize:v3` to regenerate.

### React islands (selective)
- Liquid sections render the container with data attributes.
- React mounts into the container for interactive components only.
- Storefront API for data React needs beyond Liquid context.
- Default to Liquid. React only when interactivity demands it.
- JS bundling currently uses Webpack (`webpack.config.js`). Bundler decisions are made separately.

### Accessibility & performance
- Semantic markup, ARIA attributes, keyboard navigation, and focus management. Follow WCAG 2.1 AA.
- Mobile-first as a performance concern: minimise asset weight, defer non-critical resources, consider render cost. The designs already account for mobile viewports.
- Canadian English throughout (colour, favourite, centre).
- Sentence case for UI copy.

## Critical rules

1. **Never invent or assume.** If unsure, ask George.
2. **Designs are the source of truth** for the web system. Brand guidelines are reference only.
3. **Responsive is mandatory.** Every section must work across all breakpoints documented in the extraction logs.
4. **George approves all token additions and schema decisions.**
5. **Ask before imposing conventions.** The existing theme has patterns — learn them before overriding.
6. **Liquid vs React is a per-feature decision.** Default to Liquid. Evaluate with George when interactivity may warrant React.
