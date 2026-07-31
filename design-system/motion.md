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
