# Component Inventory

Tracks what's been identified in the V3 designs and the extraction status of each.

## Status

- ⬜ **Not started** — identified but not yet extracted
- 🔄 **In progress** — declared extraction scope is partial or additional visual frames remain
- ✅ **Extracted** — declared visual scope is captured; implementation refinements may continue

Token approval is tracked separately from visual extraction:

- — **No candidates**
- 🟡 **Review pending** — raw candidates identified but not approved in the canonical token files
- ✅ **Approved** — George approved the canonical token additions

## Components

| Component | Breakpoints extracted | Figma-observed states | System behaviour / development status | Token status | Extraction status |
|-----------|----------------------|-----------------------|---------------------------------------|--------------|-------------------|
| MainNav | TINY, XXS, XS, SM, MD, MD-LG, LG, XL | Desktop: Hover, Pressed, Demoted (at LG). Mobile: Hamburger pressed, Cart badge | Desktop: sliding pill toggle, sibling demote on hover. Mobile: no hover, press-only, no demote. Search/Cart pressed treatment remains a development refinement. | 🟡 Raw candidates identified; canonical review pending | ✅ Declared visual scope extracted |
| SubMenu Drawer | TINY, XXS, XS, SM, MD, MD-LG, LG, XL | Desktop: L1 initial, L1 hover (link demote), L2 reveal, L2 hover (link demote), CloseBtn hover, QuickAction hover, UtilityLink hover. Mobile: L1 initial, L2 drill-in, CloseBtn hover | Desktop: side-by-side reveal, highlight+demote at L1 and L2, overlay blur. Mobile: drill-in/drill-out, frosted glass surface and translucent surfaces. Motion timing and mobile active states continue to be refined in development. | 🟡 Raw candidates identified; canonical review pending | ✅ Declared visual scope extracted |
| Search Drawer | SM, MD, MD-LG, LG, XL (SM/MD/MD-LG identical; LG/XL identical) | Initial (focused/empty), Autocomplete Results, Clicked Suggestion, No Results | Inherits established navigation/drawer state and motion patterns. Two responsive tiers confirmed: SM/MD/MD-LG and LG/XL, step at ≥1440px. Search-specific ordering, result footer, suggestion highlighting and no-results callout are Figma-observed; refinements continue in development. | 🟡 Raw candidates identified; canonical review pending | 🔄 SM–XL extracted; TINY, XXS, XS not started |

## Page-level

| Property | Breakpoints extracted | Status |
|----------|----------------------|--------|
| Container / grid | | ⬜ |
| Section rhythm | | ⬜ |
| Page-edge padding | | ⬜ |

## Notes

- Components are added here as they're identified during extraction sessions
- "Breakpoints extracted" should list which ones (e.g., SM, MD, LG, XL)
- Extraction logs live in `design-system/extractions/`
