# Rewind Skin — Motion Reference

## How this brand moves

Motion on this site is quiet, deliberate, and warm. Elements appear gradually, land precisely, and stay still. The animation itself should never be the point — it serves orientation and comprehension, then gets out of the way.

Three behaviours define the motion vocabulary:

**Reveal** — the primary entrance behaviour. Things become visible with unhurried pacing, as if they were always there and you're just now seeing them. The appearance is the event. Think opacity and subtle position settling, not sliding in from somewhere else.

**Place** — how things resolve. Elements arrive at their position with quiet precision. There's no searching, no overshoot, no negotiation. They land exactly where they belong, and the stillness afterward is part of the design.

**Glow** — the warmth layer. Used sparingly for moments of positive feedback or emphasis. Not a literal glow effect — more a tonal shift that makes something feel warm after being precise. This is what keeps the motion from reading as cold.

## Character

- Unhurried but not slow — there's confidence in the pacing, not lethargy
- Things surface in place rather than travelling from somewhere else
- Entrances are slower and more ceremonial than exits
- Stillness is on-brand — most of the page should be still at any given moment
- Staggered sequences follow reading order and resolve quickly
- Motion happens once and resolves — nothing loops or repeats

## What to avoid

- Bounce, spring, or elastic easing — no overshoot, no playful settle
- Slide-ins from off-screen edges — content doesn't arrive from elsewhere
- Scale transforms as entrances or exits — elements don't grow in or shrink out
- Rotation of any kind
- Blur transitions
- Parallax or scroll-linked movement
- Pulsing, blinking, or looping animations
- Hover states that move elements from their position (lift, scale, translate)
- Playful or whimsical timing — no wobble, no squash-and-stretch

## Decision rule

When unsure whether to animate something: don't. Stillness is on-brand. If the motion doesn't help the visitor understand where they are or what just changed, it shouldn't exist.

---

## Implementation notes

### Timing model (as implemented)

| Behaviour | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Drawer reveal (open) | 380ms | ease-out | 40ms after overlay |
| Drawer disappear (close) | 180ms | ease-out | Decisive, no ceremony |
| Overlay reveal | 250ms | ease-out | Begins immediately |
| Overlay disappear | 200ms | ease-out | |
| L2 panel reveal | 250ms | ease-out | Pure opacity |
| L2 panel disappear | 200ms | ease-out | Stays in position during fade |
| Link de-emphasis onset | 220ms | ease-out | After 150ms JS intent gate |
| Link de-emphasis recovery | 180ms | ease-out | Intentionally quicker than onset |
| Toggle pill morph | 200ms | ease-out | After 120ms hover intent delay |
| Toggle pill snap-back | 200ms | ease-out | |

### Principles applied

- All entrances are **Reveal** (opacity surfacing in place)
- All exits are quicker than entrances (decisive reset)
- Hover intent gates (JS-based) prevent partial/phantom transitions on pass-through
- No transforms used for show/hide — elements are already positioned, they just become visible
- `prefers-reduced-motion: reduce` zeroes all durations

---

## Tier 2 vision: Drawer entrance choreography (not yet implemented)

George's vision for an elevated drawer open transition — to be refined iteratively:

### The idea

The main nav bar and the sub-menu drawer share two elements: the **logotype** and the **Shop/Studio toggle pill**. Both exist in the nav bar (the trigger state) and again in the drawer heading (the open state). The vision is a seamless interplay between these two states — something reminiscent of motion graphics keyframing where one state dissolves into the next with shared elements creating visual continuity.

### Reinterpreted through the motion reference

A literal FLIP morph (elements travelling from nav-bar position to drawer position) violates "things surface in place rather than travelling from somewhere else." The brand-aligned interpretation:

1. **Nav bar elements still/fade** — when the drawer begins opening, the logo and toggle in the nav bar fade to invisible (they're about to be "replaced" by the drawer's versions).
2. **Drawer reveals in sequence** — the overlay appears, then the drawer surfaces, then the heading elements (logo + toggle) reveal with slightly staggered timing. The logo reveals first (it's the anchor), the toggle follows.
3. **Continuity through alignment** — the impression of morphing comes from the elements being in corresponding positions and the timing creating a visual "hand-off" rather than from actual spatial interpolation.
4. **Body content follows** — after the heading settles, the link groups reveal (reading order, quick stagger).

### Why this feels like a morph without being one

The trick is that the nav bar elements disappear at the same moment the drawer elements appear — the viewer's eye interpolates continuity even though nothing actually moved. The timing creates the connection, not the transform.

### Technical approach when ready

- `openDrawer()` adds a class to the nav bar that fades out the logo + toggle (opacity → 0, ~200ms)
- Drawer reveals after a brief offset (~100ms) so there's a moment of the nav elements dimming before the drawer surfaces
- Drawer heading elements get a staggered reveal (logo at 0ms, toggle at 80ms, relative to drawer appearing)
- Link body content reveals after heading resolves (~150ms offset from heading)
- `closeDrawer()` reverses: drawer fades, nav bar elements fade back in
- Total choreography: ~500–600ms open, ~300ms close

### Status

Placeholder implemented (pure opacity reveal, no choreography). Tier 2 is a refinement pass to be explored when the static QA is complete and George is ready to art-direct the sequencing in real time.
