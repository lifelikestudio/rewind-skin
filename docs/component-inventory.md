# Component Inventory

Tracks what's been identified in the V3 designs and the extraction status of each.

## Status

- ⬜ **Not started** — identified but not yet extracted
- 🔄 **In progress** — extraction underway (some breakpoints or states remaining)
- ✅ **Extracted** — all breakpoints and states captured, tokens proposed

## Components

| Component | Breakpoints extracted | States extracted | Behaviour documented | Status |
|-----------|----------------------|-----------------|---------------------|--------|
| MainNav | TINY, XXS, XS, SM, MD, MD-LG, LG, XL | Desktop: Hover, Pressed, Demoted (at LG). Mobile: Hamburger pressed, Cart badge | Desktop: sliding pill toggle, sibling demote on hover. Mobile: no hover, press-only, no demote | ✅ One open item |
| SubMenu Drawer | TINY, XXS, XS, SM, MD, MD-LG, LG, XL | Desktop: L1 initial, L1 hover (link demote), L2 reveal, L2 hover (link demote), CloseBtn hover, QuickAction hover, UtilityLink hover. Mobile: L1 initial, L2 drill-in, CloseBtn hover | Desktop: side-by-side reveal, highlight+demote at L1 and L2, overlay blur. Mobile: drill-in/drill-out (L2 replaces L1), frosted glass surface, translucent pill/border surfaces | ✅ Transition timing TBD in dev; active states undecided |

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
