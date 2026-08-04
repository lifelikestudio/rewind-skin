# Prompt: Extract Design Tokens

Extract design values from V3 Figma frames for the Rewind Skin design system. Supports two modes: component-level (default) and page-level.

## Before starting

1. Read `design-system/tokens.css` — know what's already been extracted
2. Read `design-system/tokens.json` — understand existing patterns
3. Confirm Figma MCP is connected (or Paper MCP if using Paper)

---

## Component-Level Extraction (default)

### Step 1: Read the page

George shares a full-page frame URL or node ID.

- Call `get_metadata` on the frame
- Present the top-level layer structure to George
- Ask: "Which component are we extracting?"

### Step 2: Extract the target component

George names a component (e.g., "MainNav").

- Call `get_design_context` on that node ID
- Record all applied values:
  - **Typography:** font family, weight, size (px), line-height, letter-spacing, colour (hex + opacity)
  - **Spacing:** padding (top/right/bottom/left), gap, margins
  - **Colour:** background fills, border colours, text colours
  - **Layout:** auto-layout direction, width mode (fixed/fill/hug), height mode, alignment, dimensions
  - **Borders:** width, colour, radius
- Log raw values to `design-system/extractions/{component-name}.md`

### Step 3: Repeat across breakpoints

George shares the same page at other breakpoints.

- Extract the same component at each breakpoint
- Append to the same extraction log
- After all breakpoints are collected, produce a **responsive delta table**:

```markdown
## Responsive Comparison: {Component Name}

| Property | SM (360px) | MD (768px) | LG (1440px) | XL (1920px) |
|----------|-----------|-----------|-------------|-------------|
| Padding  | 16px      | 24px      | 32px        | 32px        |
| Gap      | 8px       | 12px      | 16px        | 16px        |
| Direction| column    | row       | row         | row         |
| ...      | ...       | ...       | ...         | ...         |

### Constants (same across all breakpoints)
- Font family: Scto Grotesk A
- Font weight: 500
- Letter-spacing: -0.005em

### Breakpoint-specific changes
- **SM → MD:** Direction changes column → row, padding increases 16 → 24
- **MD → LG:** Padding increases 24 → 32, gap increases 12 → 16
- **LG → XL:** No changes
```

### Step 4: State inventory

Identify all state frames for this component in the Figma file (using the naming convention: `[State]` in the frame name).

For each state frame:
- Extract the visual differences from the initial/default state
- Log which properties change (colour, visibility, position, size)

Then ask George:
- "What triggers the transition from [State A] to [State B]?"
- "Does it animate? If so, what property, duration, easing?"
- "Any behaviour not captured in the static frames?"

Log George's answers in the extraction file under a **Behaviour** section.

```markdown
## States: {Component Name}

### Initial State
[Extracted values — or reference to the main extraction above]

### Hover State
- BtnLabel colour: #000000 → #B5B5B5
- Background: transparent → #F8F8F8
- Border-bottom: none → 1px solid #000000

### Open State
- Drawer height: 0 → 480px
- Overlay: none → #000000 at 40% opacity

## Behaviour

| Transition | Trigger | Animation | Duration | Easing |
|-----------|---------|-----------|----------|--------|
| Initial → Hover | Mouse enter | Colour, background | 200ms | ease-out |
| Initial → Open | Click on Search | Height, opacity | 300ms | ease-in-out |
| Open → Initial | Click outside / Esc | Height, opacity | 200ms | ease-out |

### Notes from George
- [Any additional behaviour, edge cases, conditional logic]
```

### Step 5: Compare and propose

- Compare extracted values against existing tokens in `tokens.css`
- Categorise:
  - **Confirmed:** matches an existing token
  - **New candidate:** not in the system yet — propose a token name and value
  - **Conflict:** different from an existing token — flag for decision
- Present proposals to George. Nothing gets added to `tokens.css` or `tokens.json` without approval.

### Step 6: Capsize implementation handoff

After George accepts the extraction:

- Compare every extracted text treatment with `src/capsize-v3.js`
- Record which existing Capsize classes match exactly and which new classes are required
- Add missing component text styles before building Liquid templates
- Run `npm run capsize:v3` and verify the generated classes in `assets/capsize-v3.css`
- Never approximate a text treatment with a near match

---

## Page-Level Extraction

For structural and layout values that apply across the page, not to a specific component.

### What to extract
- Container max-width
- Container horizontal padding (per breakpoint)
- Section vertical spacing / rhythm (gap between top-level sections)
- Grid columns and gutter (if a grid system is used)
- Page-edge padding (per breakpoint)
- Overall page background

### Process
1. George shares a full-page frame
2. Call `get_metadata` — read the top-level structure
3. Call `get_design_context` on the root frame (may need `forceCode: true` for large frames, or extract top-level auto-layout values from metadata)
4. Record container and spacing values
5. Repeat across breakpoints
6. Produce a responsive delta table for layout values
7. Log to `design-system/extractions/page-layout.md`

---

## Quality checks

- [ ] All values are raw from the design — nothing assumed
- [ ] Responsive delta table produced (not single-breakpoint)
- [ ] All state frames identified and extracted
- [ ] Behaviour section completed with George's input
- [ ] Comparison against existing tokens completed
- [ ] New tokens proposed but not committed without approval
- [ ] Capsize coverage audited and implementation handoff recorded
- [ ] Extraction log saved to `design-system/extractions/`
- [ ] Component inventory updated in `docs/component-inventory.md`
