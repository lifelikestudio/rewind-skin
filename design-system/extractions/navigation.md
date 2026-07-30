# Navigation — MainNav Extraction

## LG — 1440–1919px (base extraction)

**Source frame:** `[Seed] [LG] 1440-1919px - Navigation [Initial State] [Taupe Theme]`
**Node:** `6276:2768` → MainNav `6276:2769`

### Container

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Height | 104px (content-driven: 32px pad + 40px content + 32px pad) |
| Padding-top | 32px |
| Padding-bottom | 32px |
| Padding-left | 32px |
| Padding-right | 18px |
| Layout | Flex, align-center, justify space-between |

Right padding is 18px at container level, but the rightmost link has 14px internal padding — visual text edge sits at 32px from frame edge, optically matching the left.

### PriorityNav (left group)

| Property | Value |
|----------|-------|
| Layout | Flex, align-center |
| Gap | 40px |

**Logotype:** 248.45 x 18px (image asset)

### PriorityLinks

| Property | Value |
|----------|-------|
| Layout | Flex, align-center |
| Gap | 8px |
| Height | 40px |

#### MainPathsGroup (Shop / Studio toggle)

| Property | Value |
|----------|-------|
| Background | `#F3F1F1` |
| Padding | 4px |
| Gap | 4px |
| Border-radius | 100px (pill) |

#### SwitchBtn (each toggle option)

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 0 14px |
| Border-radius | 100px (pill) |
| Background | none (initial state) |

#### NavBtnIcon (Search button)

| Property | Value |
|----------|-------|
| Background | `#F3F1F1` |
| Height | 40px |
| Padding-left | 18px |
| Padding-right | 6px |
| Gap | 8px |
| Border-radius | 100px (pill) |

**BtnIcon (icon circle):** 28 x 28px, bg `#E8E4E3`, pill, icon 11 x 11px

### SupportingLinks (right group)

| Property | Value |
|----------|-------|
| Layout | Flex, align-center, justify-end |
| Gap | 4px |

#### NakedNavBtnLink (Bag, Wishlist, Account)

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 0 14px |
| Border-radius | 100px (pill) |
| Background | none (initial state) |

### Typography (uniform across all nav text)

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A |
| Weight | Regular (400) |
| Size | 16px |
| Tracking | -0.08px (-0.005em at 16px) |
| Leading | 0 (cap-height trim) |
| Color | `#0C0A09` |

### Interaction states

The nav uses a "highlight + demote siblings" model: hovering one element highlights it AND fades its siblings.

#### SwitchBtn states

| Property | Initial | Hover | Pressed | Demoted |
|----------|---------|-------|---------|---------|
| Background | none | `#E8E4E3` | `#FFFFFF` | none |
| Text color | `#0C0A09` | `#0C0A09` | `#0C0A09` | `#7C6D67` |

#### NavBtnIcon states

| Property | Initial | Hover | Pressed | Demoted |
|----------|---------|-------|---------|---------|
| Pill bg | `#F3F1F1` | `#E8E4E3` | `#FBFAF9` | `#F3F1F1` |
| Icon circle bg | `#E8E4E3` | `#F3F1F1` | `#F3F1F1` | `#E8E4E3` |
| Text color | `#0C0A09` | `#0C0A09` | `#0C0A09` | `#7C6D67` |

On hover the pill and icon circle backgrounds swap. On pressed the pill lightens further.

#### NakedNavBtnLink states

| Property | Initial | Hover | Pressed | Demoted |
|----------|---------|-------|---------|---------|
| Background | none | `#F3F1F1` | `#FBFAF9` | none |
| Text color | `#0C0A09` | `#0C0A09` | `#0C0A09` | `#7C6D67` |

**State source frames:**
- Priority Link A Hover: `6276:2818`
- Priority Link A Pressed: `6276:2868`
- Search Hover: `6280:4317`
- Search Pressed: `6280:4367`
- Supporting Link Hover: `6280:4417`
- Supporting Link Pressed: `6280:4467`

**Naming note:** In the "Supporting Link Pressed State" frame, the active link is labeled `NakedNavBtnLink__HoverState` rather than `__PressedState` — but the background value (`#FBFAF9` vs `#F3F1F1`) confirms it is the pressed appearance.

---

## XL — >=1920px

**Source frame:** `[XL] >=1920px - Navigation [Initial State]`
**Node:** `6276:459` → MainNav `6276:460`

### Diff from LG

Only the container padding changes. All internal components, typography, colours, and spacing are identical to LG.

| Property | LG | XL | Delta |
|----------|----|----|-------|
| Padding-top | 32px | 40px | +8px |
| Padding-bottom | 32px | 40px | +8px |
| Padding-left | 32px | 40px | +8px |
| Padding-right | 18px | 26px | +8px |
| Container height | 104px | 120px | +16px (from padding) |

Optical balancing holds: right container padding 26px + rightmost link padding 14px = 40px, matching left.

---

## MD-LG — 1280–1439px

**Source frame:** `[MD-LG] 1280-1439px - Navigation [Initial State]`
**Node:** `6276:727` → MainNav `6276:728`

### Diff from LG

A step down in container padding, typography size, and component heights. Colours unchanged.

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Padding-top | 32px | 24px | -8px |
| Padding-bottom | 32px | 24px | -8px |
| Padding-left | 32px | 24px | -8px |
| Padding-right | 18px | 10px | -8px |
| Container height | 104px | 86px | -18px |
| Font size | 16px | 15px | -1px |
| Tracking | -0.08px | -0.075px | (both -0.005em) |
| Logotype | 248.45 x 18px | 220.84 x 16px | smaller |
| SwitchBtn height | 32px | 30px | -2px |
| NavBtnIcon height | 40px | 38px | -2px |
| NavBtnIcon pr | 6px | 5px | -1px |
| NakedNavBtnLink height | 32px | 30px | -2px |
| Icon (search) | 11 x 11px | 10 x 10px | -1px |
| BtnIcon circle | 28 x 28px | 28 x 28px | same |

Unchanged from LG: PriorityNav gap (40px), PriorityLinks gap (8px), MainPathsGroup padding/gap (4px), SwitchBtn px (14px), NavBtnIcon pl (18px), NavBtnIcon gap (8px), SupportingLinks gap (4px), NakedNavBtnLink px (14px). All colours identical.

Optical balancing holds: right container padding 10px + rightmost link padding 14px = 24px, matching left.

---

## MD — 1024–1279px

**Source frame:** `[MD] 1024-1279px - Navigation [Initial State]`
**Node:** `6276:1001` → MainNav `6276:1002`

### Diff from MD-LG

Identical to MD-LG. No changes to any property — only viewport width differs.

---

## SM — 768–1023px

**Source frame:** `[SM] 768-1023px - Navigation [Initial State]`
**Node:** `6276:1275` → MainNav `6276:1276`

### Diff from MD

Only the container padding changes. All internal components, typography (15px), and colours identical to MD.

| Property | MD | SM | Delta |
|----------|----|----|-------|
| Padding-left | 24px | 20px | -4px |
| Padding-right | 10px | 6px | -4px |
Padding top/bottom remain 24px. Container height unchanged at 86px.

Optical balancing holds: right container padding 6px + rightmost link padding 14px = 20px, matching left.

Background is `#FFFFFF` (same as all other breakpoints — omission in Figma confirmed as oversight).

---

## Colours (Taupe Theme — flagged, not yet in tokens)

| Hex | Role |
|-----|------|
| `#0C0A09` | Primary text (near-black, warm) |
| `#7C6D67` | Demoted/muted text (warm brown) |
| `#E8E4E3` | Hover surface / icon circle bg |
| `#F3F1F1` | Resting surface (pill bg, toggle group bg) |
| `#FBFAF9` | Pressed surface (very light warm off-white) |
| `#FFFFFF` | Nav background / SwitchBtn pressed bg |

Tonal scale (dark to light):
`#0C0A09` > `#7C6D67` > `#E8E4E3` > `#F3F1F1` > `#FBFAF9` > `#FFFFFF`

---

## Responsive summary (desktop breakpoints)

| Property | SM (768) | MD (1024) | MD-LG (1280) | LG (1440) | XL (1920) |
|----------|----------|-----------|--------------|-----------|-----------|
| Container pad-L | 20px | 24px | 24px | 32px | 40px |
| Container pad-R | 6px | 10px | 10px | 18px | 26px |
| Container pad-Y | 24px | 24px | 24px | 32px | 40px |
| Container height | 86px | 86px | 86px | 104px | 120px |
| Font size | 15px | 15px | 15px | 16px | 16px |
| Tracking | -0.075px | -0.075px | -0.075px | -0.08px | -0.08px |
| Logotype | 220.84x16 | 220.84x16 | 220.84x16 | 248.45x18 | 248.45x18 |
| SwitchBtn h | 30px | 30px | 30px | 32px | 32px |
| NavBtnIcon h | 38px | 38px | 38px | 40px | 40px |
| NakedNavBtnLink h | 30px | 30px | 30px | 32px | 32px |
| BtnIcon circle | 28px | 28px | 28px | 28px | 28px |
| Icon (search) | 10px | 10px | 10px | 11px | 11px |

Two tiers: SM/MD/MD-LG share one set of component sizes, LG/XL share another. The step happens at the LG breakpoint (1440px).

---

## Mobile breakpoints

Below SM (768px), the nav switches to a completely different structure:
- **Desktop:** Logotype + PriorityLinks (Shop/Studio toggle, Search pill) + SupportingLinks (text links)
- **Mobile:** Logotype + Triggers (bare icon buttons + hamburger pill)

No Shop/Studio toggle, no text links. Navigation collapses into a hamburger menu.

---

## XS — 428–767px (base mobile extraction)

**Source frame:** `[XS] 428-767px - Navigation [Initial State]`
**Node:** `6276:1549` → MainNav `6276:1550`

### Container

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Height | 80px (fixed — content centred vertically) |
| Padding-left | 16px |
| Padding-right | 12px |
| Layout | Flex, align-center, justify space-between |

### Logotype

193.238 x 14px (image asset), positioned at left padding edge.

### Triggers (right group)

| Property | Value |
|----------|-------|
| Layout | Flex, align-center, justify-end |
| Visual gap | ~16px between icon edges (see note below) |

**TouchTargets:** In the initial-state frame, each trigger is wrapped in a TouchTarget providing a 44px-tall hit area. The visual gap between icons is ~16px regardless of whether TouchTargets are present (state frames omit them but use gap: 16px directly).

| Element | TouchTarget size | Visual size |
|---------|-----------------|-------------|
| SearchBtn | 32 x 44px | 26 x 26px icon |
| CartBtn | 32 x 44px | 26 x 26px icon |
| MobileMenuBtn | 55 x 44px | 52 x 32px pill |

#### SearchBtn / CartBtn

Bare Lucide icons, no background, no pill. Icon colour: `#0C0A09`.

#### MobileMenuBtn (hamburger pill)

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 0 16px |
| Background | `#F3F1F1` |
| Border-radius | 100px (pill) |

**Hamburger icon:** Two horizontal lines, each 20px wide × 1.2px tall, `#0C0A09`, rounded ends (border-radius: 100px), vertical gap 5px between lines, 2px vertical padding.

### Padding note

Container pad-L is 16px, pad-R is 12px. Unlike desktop where optical balancing aligns text edges, mobile has the pill button sitting flush at the right padding edge — the asymmetry is likely intentional given the pill provides its own visual weight.

---

## XS — Hamburger Pressed State

**Source frame:** `[XS] 428-767px - Navigation [Hamburger Pressed State]`
**Node:** `6276:1596` → MainNav `6276:1597`

### Diff from XS Initial

| Property | Initial | Pressed |
|----------|---------|---------|
| MobileMenuBtn bg | `#F3F1F1` | `#FBFAF9` |

The MobileMenuBtn lightens on press — same pressed-surface colour as desktop components.

### Resolved: icon pressed approach

The Figma frame showed a shrink variant (`CartBtn__TappedStateB` at 23.4px) — this was design exploration. **Decision: colour change, not shrink.** Exact pressed appearance TBD — George is exploring whether a background circle/pill fills behind the icon or the icon itself tints. Icons stay at their resting size (26/25/24px depending on breakpoint).

---

## XS — Cart Items State

**Source frame:** `[XS] 428-767px - Navigation [Cart Items State]`
**Node:** `6276:1640` → MainNav `6276:1641`

### Diff from XS Initial

Structure identical to initial state. The only addition is the CartAmount badge.

#### CartAmount badge

| Property | Value |
|----------|-------|
| Size | 26 x 18px |
| Background | `#0C0A09` (near-black) |
| Border | 2px solid `#FFFFFF` |
| Border-radius | 100px (pill) |
| Position | Absolute, top-right of CartBtn (offset: left ~56px from Triggers origin, top -4px — overlaps cart icon) |

#### CartAmount text

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A |
| Weight | Medium (500) |
| Size | 10px |
| Tracking | -0.05px (-0.005em at 10px) |
| Leading | 0 (cap-height trim) |
| Color | `#FFFFFF` |
| Content | "9+" |

---

## XXS — 375–427px

**Source frame:** `[XXS] 375-427px - Navigation [Initial State]`
**Node:** `6276:1686` → MainNav `6276:1687`

### Diff from XS

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Container height | 80px | 76px | -4px |
| Padding-left | 16px | 14px | -2px |
| Padding-right | 12px | 11px | -1px |
| Logotype | 193.24 x 14px | 179.44 x 13px | smaller |
| Icon size (Search, Cart) | 26px | 25px | -1px |
| Triggers gap | ~16px (via TouchTargets) | 15px | -1px |
| MobileMenuBtn px | 16px | 15px | -1px |

Unchanged from XS: MobileMenuBtn height (32px), bg (`#F3F1F1`), hamburger specs (20px wide, 1.2px lines, 5px gap), all colours.

No TouchTarget wrappers at this breakpoint — icons sit directly in the Triggers flex container.

---

## TINY — <375px

**Source frame:** `[TINY] <375px - Navigation [Initial State]`
**Node:** `6276:1831` → MainNav `6276:1832`

### Diff from XXS

| Property | XXS | TINY | Delta |
|----------|-----|------|-------|
| Logotype | 179.44 x 13px | 165.63 x 12px | smaller |
| Icon size (Search, Cart) | 25px | 24px | -1px |
| Triggers gap | 15px | 14px | -1px |

Unchanged from XXS: Container height (76px), padding (14/11/22), MobileMenuBtn (32px, px 15px, `#F3F1F1`), hamburger specs, all colours.

---

## Colours (mobile — no new values)

All mobile breakpoints use the same Taupe Theme colour scale documented in the desktop extraction. No new colours introduced:
- `#0C0A09` — icon colour, hamburger lines, cart badge bg
- `#F3F1F1` — MobileMenuBtn resting bg
- `#FBFAF9` — MobileMenuBtn pressed bg
- `#FFFFFF` — nav bg, cart badge border, cart badge text

---

## Responsive summary (all breakpoints)

### Desktop (text links + toggle)

| Property | SM (768) | MD (1024) | MD-LG (1280) | LG (1440) | XL (1920) |
|----------|----------|-----------|--------------|-----------|-----------|
| Container height | 86px | 86px | 86px | 104px | 120px |
| Container pad-L | 20px | 24px | 24px | 32px | 40px |
| Container pad-R | 6px | 10px | 10px | 18px | 26px |
| Container pad-Y | 24px | 24px | 24px | 32px | 40px |
| Font size | 15px | 15px | 15px | 16px | 16px |
| Logotype | 220.84×16 | 220.84×16 | 220.84×16 | 248.45×18 | 248.45×18 |
| SwitchBtn h | 30px | 30px | 30px | 32px | 32px |
| NavBtnIcon h | 38px | 38px | 38px | 40px | 40px |

### Mobile (icon triggers + hamburger)

| Property | TINY (<375) | XXS (375) | XS (428) |
|----------|-------------|-----------|----------|
| Container height | 76px | 76px | 80px |
| Container pad-L | 14px | 14px | 16px |
| Container pad-R | 11px | 11px | 12px |
| Logotype | 165.63×12 | 179.44×13 | 193.24×14 |
| Icon size | 24px | 25px | 26px |
| Triggers gap | 14px | 15px | 16px* |
| MobileMenuBtn h | 32px | 32px | 32px |
| MobileMenuBtn px | 15px | 15px | 16px |
| Hamburger w | 20px | 20px | 20px |
| Hamburger line h | 1.2px | 1.2px | 1.2px |

*XS visual gap is ~16px (10px between 44px TouchTargets that each add ~3px padding around 26px icons).

### Three responsive tiers

1. **TINY/XXS** — smallest values, identical except logotype size, icon size, and trigger gap step down 1px each
2. **XS** — step up in container height (76→80), padding, icon sizes, and trigger gap; adds TouchTargets for larger hit areas
3. **SM+** — complete structural change to desktop layout (text links, Shop/Studio toggle, search pill)

---

## Resolved decisions

1. **Search/Cart pressed style:** Colour change, not shrink. Exact treatment (bg circle fill vs icon tint) is TBD — George exploring in Figma. Icons stay at resting size across all breakpoints.

2. **TouchTargets are implementation guidance:** All mobile breakpoints should have ~44px touch targets. The visual icon sizes (24–26px) are the design intent; the invisible wrapper provides the accessible hit area. Implementation: transparent `<button>`/`<a>` sized to 44px with the smaller icon centred inside.

3. **Mobile interaction model:** No hover state — touch skips straight to pressed (`:active`). No demoted-sibling model on mobile (unlike desktop). Interaction is Initial → Pressed → Initial.

## Open items

- [x] Search/Cart pressed style — colour change (icon tint), not shrink
- [ ] Search/Cart pressed background shape — George exploring whether a visible enclosing shape (circle, pill, etc.) appears behind the icon on press
