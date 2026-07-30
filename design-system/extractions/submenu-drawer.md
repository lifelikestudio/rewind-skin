# Sub-menu Drawer — MenuDrawerOverlay Extraction

## LG — 1440–1919px (base extraction)

**Source frames:**
- Shop L1: `6276:2918` → MenuDrawerOverlay `6276:2970`
- Shop L1 + hover states: `6276:2918` → right panel `6276:3021`
- Close hover: `6276:3174`
- Shop L2 Skincare: `6276:3277`
- Shop L2 Brands: `6276:4166`
- L2 link hover: `6276:4051`
- Studio L1: `6276:3071`
- Studio L2 Facials: `6276:3392`
- Studio L2 Body Contouring: `6276:3505`
- Studio L2 Hair Removal: `6276:3614`
- Studio L2 Injectables: `6276:3722`
- Studio L2 Skin Improvement: `6276:3831`
- Studio L2 Skin Tightening: `6276:3941`

---

### Page Overlay (OverlayLight)

Covers the full viewport behind the drawer. Anchored to `PageContent`, not the drawer.

| Property | Value |
|----------|-------|
| Background | `rgba(251, 250, 249, 0.5)` — `#FBFAF9` at 50% |
| Backdrop filter | `blur(32px)` |
| Size | Full viewport (extends well beyond visible area — 2560 x 10265px in Figma) |

---

### MenuDrawerOverlay (drawer panel)

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border-radius | 24px |
| Overflow | clip |
| Position | 16px inset from viewport top-left |
| Width | 571.45px |
| Height | 868px (viewport 900 - 16px top - 16px bottom) |
| Layout | Flex column |

The drawer pins to top-left with a 16px gap on all sides. Width is content-driven by the logotype + action group + heading padding.

---

### MenuDrawerHeading

| Property | Value |
|----------|-------|
| Height | 104px |
| Layout | Flex, align-center |
| Padding-left | 32px |
| Padding-right | 17px |
| Padding-top | 32px |
| Padding-bottom | 32px |
| Gap | 40px (between logotype and ActionGroup) |

Same height as the MainNav at this breakpoint (104px). Logotype is the same asset/size (248.45 x 18px) — the drawer header aligns with the nav behind it.

#### ActionGroup

| Property | Value |
|----------|-------|
| Layout | Flex, align-center, justify-center |
| Gap | 40px (between MainPathsGroup and CloseBtn) |

#### MainPathsGroup (Shop / Studio toggle)

Identical to MainNav toggle. Same `#F3F1F1` bg, 4px padding, 4px gap, pill radius.

**SwitchBtn states within the sub-menu context:**

| State | Background | Text color |
|-------|------------|------------|
| ActiveState (current menu) | `#FFFFFF` | `#0C0A09` |
| DemotedState (other menu) | none | `#7C6D67` |

When the Shop sub-menu is open, Shop is ActiveState and Studio is DemotedState (and vice versa).

#### CloseBtn

| Property | Initial | Hover |
|----------|---------|-------|
| Size | 40 x 40px | 40 x 40px |
| Background | none | `#F3F1F1` |
| Border-radius | 100px | 100px |
| Icon size | 10 x 10px | 10 x 10px |

---

### MenuDrawerNavigation

| Property | Value |
|----------|-------|
| Layout | Flex column, flex-1 |
| Children | NavigationLevels (flex-1), UtilityLinks (fixed footer) |

#### NavigationLevels

| Property | Value |
|----------|-------|
| Layout | Flex column, justify space-between |
| Padding-bottom | 20px |
| Children | PrimaryLinks area (top, flex-1), QuickActions (bottom) |

---

### PrimaryLinks — First Level (L1)

| Property | Value |
|----------|-------|
| Padding | 32px all sides (left 32px, right 40px) |
| Gap between SubGroups | 64px |
| Width | 255px (when L2 is visible — otherwise auto within drawer width) |

#### L1 link typography

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 20px |
| Tracking | -0.1px (-0.005em) |
| Leading | 0 (cap-height trim) |
| Color | `#0C0A09` |
| Gap between links | 16px |

#### SubGroup__Title ("Featured")

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 14px |
| Tracking | -0.07px (-0.005em) |
| Color | `#0C0A09` |
| Gap to links below | 32px |

---

### PrimaryLinks — Second Level (L2)

Appears adjacent to FirstLevel when an L1 link is hovered. No visible divider between L1 and L2 panels.

| Property | Value |
|----------|-------|
| Position | Right of FirstLevel, x = 255px |
| Width | Remaining drawer width (316.45px) |
| Height | Full NavigationLevels height (637px to QuickActions) |
| Padding | 35px top, 32px bottom, 40px left, 32px right |

#### L2 link typography

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 16px |
| Tracking | -0.08px (-0.005em) |
| Leading | 0 (cap-height trim) |
| Color | `#0C0A09` |
| Gap between links | 14px |

Note: L2 uses 16px/14px gap vs L1's 20px/16px gap — a deliberate hierarchy step-down.

---

### L1/L2 interaction model — "highlight + demote siblings"

Same model as the MainNav, applied at both link levels.

#### L1 hover (reveals L2)

| Element | Resting | Hovered L1 link | Sibling L1 links |
|---------|---------|-----------------|-------------------|
| Text color | `#0C0A09` | `#0C0A09` | `#ABA09C` |

When an L1 link is hovered:
1. The hovered link retains `#0C0A09`
2. All sibling L1 links (including "Featured" section links) demote to `#ABA09C`
3. The L2 panel appears with that category's sub-links

#### L2 hover (within the L2 panel)

| Element | L2 resting | Hovered L2 link | Sibling L2 links |
|---------|-----------|-----------------|-------------------|
| Text color | `#0C0A09` | `#0C0A09` | `#ABA09C` |

Same pattern: hovered link stays at `#0C0A09`, siblings demote to `#ABA09C`. L1 links remain in their demoted state during L2 hover.

**`#ABA09C` is a new colour** — distinct from the `#7C6D67` used for the switch toggle demoted state. This is a lighter demote, consistent with the link text being larger and the demoted state needing to read as more clearly receded.

---

### QuickActions

| Property | Value |
|----------|-------|
| Layout | Flex, justify-center |
| Gap | 8px |
| Padding | 0 32px (horizontal) |
| Position | Bottom of NavigationLevels, above UtilityLinks |

#### QuickActionBtn (each pill)

| Property | Initial | Hover |
|----------|---------|-------|
| Height | 32px | 32px |
| Padding | 0 14px | 0 14px |
| Background | `#F3F1F1` | `#E8E4E3` |
| Border-radius | 100px | 100px |
| Font | Scto Grotesk A, Regular | same |
| Size | 14px | 14px |
| Tracking | -0.07px | -0.07px |
| Text color | `#5B4F4B` | `#5B4F4B` |
| Text-align | center | center |

**`#5B4F4B` is a new colour** — used exclusively for QuickAction text. Darker than the `#7C6D67` demoted switch text, but not as dark as the primary `#0C0A09`.

---

### UtilityLinks (footer)

| Property | Value |
|----------|-------|
| Border-top | 1px solid `#E8E4E3` |
| Padding | 32px |
| Layout | Flex row |
| Gap | 16px |

#### UtilityLink text

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 16px |
| Tracking | -0.08px (-0.005em) |
| Color | `#0C0A09` |

**Hover model:** Same "highlight + demote siblings" pattern. In the hover-states panel (frame 1, right side), "Shipping & Returns" is hovered at `#0C0A09` while sibling "Account" demotes to `#ABA09C`. The node labeled `TextLink__HoverState` is the demoted sibling, not the hovered element — naming is from that link's perspective of being in a hover context.

| Element | Resting | Hovered | Sibling (demoted) |
|---------|---------|---------|-------------------|
| Text color | `#0C0A09` | `#0C0A09` | `#ABA09C` |

---

## Shop vs Studio — content and structural differences

The drawer shell (header, QuickActions, UtilityLinks) is structurally identical across both menus. Only the content and the UtilityLinks labels change.

### Shop L1 content

**SubGroup 1 (no title):**
- Skincare
- Hair & Body
- Tools & Accessories
- Brands
- Shop All

**SubGroup 2 ("Featured"):**
- Concierge
- Bestsellers
- Subscribe & Save
- Gifting
- Sales & Offers

**UtilityLinks:** Account, Shipping & Returns

### Studio L1 content

**SubGroup 1 (no title):**
- Facials
- Body Contouring
- Hair Removal
- Injectables
- Skin Improvement
- Skin Tightening
- All Treatments

**SubGroup 2 ("Featured"):**
- Virtual Consult
- Gifting
- Your Therapist

**UtilityLinks:** Manage Appointments, FAQ

### Structural note

Studio L1 has 7 primary links vs Shop's 5, and 3 featured links vs Shop's 5. The layout handles this with auto-sizing — no fixed heights. The first SubGroup takes whatever vertical space its content needs, and the 64px gap to "Featured" stays constant.

---

## Shop L2 content

Each L1 link that supports drill-down reveals a second-level panel.

### Skincare
Cleansers, Toners and Mists · Creams and Moisturizers · Exfoliants · Eyes & Lips · Masks and Treatments · Serums and Oils · Suncare · Travel · All Skincare

### Brands
Adipeau · Biologique Recherche · Calecim Professional · Colorescience · Ecotao · Elta MD · Future 5 Elements · L'oeuvre de Beauté · Laboratoires Mansard · The Light Salon · Manta · Monika Heiligmann · Nemat · NuFACE · All Brands

Hair & Body, Tools & Accessories, and Shop All are direct links — no L2 sub-menu.

---

## Studio L2 content

### Facials
Light Facial · Essential Facial · Bespoke Advanced Facial · Aya's Touch Facial · Microcurrent Facial · Forma Facial · All Facials

### Body Contouring
BodyFX · Forma Plus · All Body Contouring

### Hair Removal
Diolaze · All Hair Removal

### Injectables
Dermal Fillers · Neuromodulators · All Injectables

### Skin Improvement
Lumecca IPL · Morpheus8 · SkinPen® · All Skin Improvement

### Skin Tightening
Forma Plus · Morpheus8 · SkinPen® · All Skin Tightening

---

## Colours — updated tonal scale

Previous scale (from MainNav): `#0C0A09` > `#7C6D67` > `#E8E4E3` > `#F3F1F1` > `#FBFAF9` > `#FFFFFF`

Expanded with sub-menu values:

| Hex | Role | New? |
|-----|------|------|
| `#0C0A09` | Primary text, active links | no |
| `#5B4F4B` | QuickAction pill text | **yes** |
| `#7C6D67` | Switch toggle demoted text | no |
| `#ABA09C` | Nav link demoted text (hover sibling) | **yes** |
| `#E8E4E3` | Hover surface, icon circle bg, border, QuickAction hover bg | no |
| `#F3F1F1` | Resting surface (pill bg, toggle group bg, CloseBtn hover) | no |
| `#FBFAF9` | Pressed surface, overlay bg at 50% | no |
| `#FFFFFF` | Backgrounds, active switch bg | no |

Full tonal scale (dark → light):
`#0C0A09` > `#5B4F4B` > `#7C6D67` > `#ABA09C` > `#E8E4E3` > `#F3F1F1` > `#FBFAF9` > `#FFFFFF`

---

---

## XL — >=1920px

**Source frames:**
- Shop L1: `6276:509` → MenuDrawerOverlay `6276:561`
- Shop L2 Skincare: `6276:612` → MenuDrawerOverlay `6276:664`

### Diff from LG

**No changes.** The drawer is pixel-identical to LG — every dimension, padding, gap, font size, colour, and radius is the same. The drawer is a fixed-width (571px) overlay positioned at a fixed 16px inset from the viewport edge. It does not scale with the viewport.

This contrasts with the MainNav behind it, which steps up its container padding from 32px to 40px at XL. The drawer's own internal padding (32px) stays constant.

| Property | LG | XL |
|----------|----|----|
| Drawer width | 571px | 571px |
| Drawer height | 868px | 868px |
| Drawer inset | 16px | 16px |
| Header height | 104px | 104px |
| Header padding | 32px L, 17px R, 32px Y | 32px L, 17px R, 32px Y |
| L1 font | 20px / -0.1px | 20px / -0.1px |
| L2 font | 16px / -0.08px | 16px / -0.08px |
| All other values | identical | identical |

---

## MD-LG — 1280–1439px

**Source frames:**
- Shop L1: `6276:777` → MenuDrawerOverlay `6276:829`
- Shop L2 Brands: `6276:880` → MenuDrawerOverlay `6276:932`

### Diff from LG

The drawer **scales down** at MD-LG — the first breakpoint where it changes. Every spatial dimension tightens, typography steps down, but colours, content, and interaction model are unchanged.

#### Drawer shell

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Width | 571px | 522px | -49px |
| Height | 868px | 740px | -128px |
| Border-radius | 24px | 20px | -4px |
| Viewport inset | 16px | 14px | -2px |
| Background | `#FFFFFF` | `#FFFFFF` | — |

#### MenuDrawerHeading

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Height | 104px | 86px | -18px |
| Padding-left | 32px | 24px | -8px |
| Padding-right | 17px | 10px | -7px |
| Padding-Y | 32px | 24px | -8px |
| Gap (logotype → ActionGroup) | 40px | 40px | — |

Header height matches MainNav at this breakpoint (86px), same as LG (both 104px). Padding deltas also mirror the MainNav step-down.

#### Logotype

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Width | 248.45px | 220.84px | -27.6px |
| Height | 18px | 16px | -2px |

Same asset/size as the MainNav logotype at this breakpoint — the drawer header continues to mirror the nav behind it.

#### CloseBtn

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Size | 40 × 40px | 38 × 38px | -2px |
| Padding | — | 8px | — |
| Icon size | 10 × 10px | 10 × 10px | — |
| Border-radius | 100px | 100px | — |

#### SwitchBtn text

| Property | LG | MD-LG |
|----------|----|----|
| Font size | — (mirrors MainNav) | 15px |
| Tracking | — | -0.075px |
| Active colour | `#0C0A09` | `#0C0A09` |
| Demoted colour | `#7C6D67` | `#7C6D67` |

Switch toggle itself is structurally identical — same `#F3F1F1` bg, 4px padding, 4px gap, pill radius, 30px pill height. Text scales with the MainNav toggle at this breakpoint.

#### PrimaryLinks__FirstLevel

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Padding-left | 32px | 24px | -8px |
| Padding-right | 40px | 32px | -8px |
| Padding-Y | 32px | 24px | -8px |
| Gap between SubGroups | 64px | 56px | -8px |
| Width (when L2 visible) | 255px | 221px | -34px |

#### L1 link typography

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Font size | 20px | 18px | -2px |
| Tracking | -0.1px | -0.09px | +0.01px |
| Gap between links | 16px | 15px | -1px |
| Colour | `#0C0A09` | `#0C0A09` | — |

Tracking ratio stays at -0.005em (18 × -0.005 = -0.09).

#### SubGroup__Title ("Featured")

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Font size | 14px | 13px | -1px |
| Tracking | -0.07px | -0.065px | +0.005px |
| Gap to links below | 32px | 30px | -2px |

Tracking ratio stays at -0.005em (13 × -0.005 = -0.065).

#### PrimaryLinks__SecondLevel

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Position x | 255px | 221px | -34px |
| Width | 316px | 301px | -15px |
| Padding-left | 40px | 32px | -8px |
| Padding-right | 32px | 24px | -8px |

L2 panel top-padding is not a fixed value — the baseline of the first L2 link aligns with the baseline of the L1 link that triggered it. The padding shifts per-link to land on that shared baseline. At LG with Skincare (first link) hovered: 35px. At MD-LG with Brands (fourth link) hovered: 107px. The font sizes differ between levels (e.g. 18px L1 vs 15px L2 at MD-LG), so this is true baseline alignment, not top/bounding-box alignment.

#### L2 link typography

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Font size | 16px | 15px | -1px |
| Tracking | -0.08px | -0.075px | +0.005px |
| Gap between links | 14px | 13px | -1px |
| Colour | `#0C0A09` | `#0C0A09` | — |

Tracking ratio stays at -0.005em (15 × -0.005 = -0.075).

#### NavigationLevels

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Padding-bottom | 20px | 18px | -2px |

#### QuickActions

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Pill height | 32px | 30px | -2px |
| Font size | 14px | 13px | -1px |
| Tracking | -0.07px | -0.065px | +0.005px |
| Pill padding-X | 14px | 14px | — |
| Gap | 8px | 8px | — |
| Container padding-X | 32px | 32px | — |
| Pill bg | `#F3F1F1` | `#F3F1F1` | — |
| Text colour | `#5B4F4B` | `#5B4F4B` | — |

#### UtilityLinks

| Property | LG | MD-LG | Delta |
|----------|----|----|-------|
| Padding | 32px | 24px | -8px |
| Font size | 16px | 15px | -1px |
| Tracking | -0.08px | -0.075px | +0.005px |
| Gap | 16px | 14px | -2px |
| Border | 1px `#E8E4E3` | 1px `#E8E4E3` | — |

#### Interaction model

Unchanged. L2 frame confirms the same "highlight + demote siblings" pattern:
- L1 links named `TextLink__NotHoveredState` → colour `#ABA09C`
- Hovered L1 link ("Brands") named `TextLink` → retains `#0C0A09`
- L2 links all at `#0C0A09` (no L2 hover state shown in this frame)

#### Content

Identical to LG. Same Shop L1/L2 link lists and UtilityLinks labels.

---

## MD — 1024–1279px

**Source frames:**
- Shop L1: `6276:1051` → MenuDrawerOverlay `6276:1103`
- Shop L2 Brands: `6276:1154` → MenuDrawerOverlay `6276:1206`

### Diff from MD-LG

**Internally identical.** Every typography value, padding, gap, colour, radius, and internal dimension is the same as MD-LG. The drawer content does not change between these two breakpoints.

Only the drawer shell changes — driven by viewport height (700px at MD vs 768px at MD-LG) and a tighter inset:

| Property | MD-LG | MD | Delta |
|----------|-------|----|-------|
| Drawer width | 522px | 522px | — |
| Drawer height | 740px | 676px | -64px |
| Viewport inset | 14px | 12px | -2px |
| Border-radius | 20px | 20px | — |

Height formula: viewport height − (inset × 2). At MD: 700 − 24 = 676. At MD-LG: 768 − 28 = 740.

The height difference is absorbed by the flex layout — NavigationLevels has `flex-1` and `justify: space-between`, so the gap between PrimaryLinks and QuickActions compresses while all content and fixed-height regions stay the same.

| Internal property | MD-LG | MD |
|-------------------|-------|----|
| Header height | 86px | 86px |
| L1 font | 18px / -0.09px | 18px / -0.09px |
| L2 font | 15px / -0.075px | 15px / -0.075px |
| Utility font | 15px / -0.075px | 15px / -0.075px |
| All padding/gaps | identical | identical |
| All colours | identical | identical |

This mirrors the MainNav behaviour at this transition — the MainNav extraction also noted MD is identical to MD-LG.

---

## SM — 768–1023px

**Source frames:**
- Shop L1: `6276:1325` → MenuDrawerOverlay `6276:1377`
- Shop L2 Brands: `6276:1428` → MenuDrawerOverlay `6276:1480`

### Diff from MD

**Internally identical.** Same typography, padding, gaps, colours, radius, and drawer width as MD (and MD-LG). Only the drawer height changes — driven by viewport height.

| Property | MD | SM | Delta |
|----------|----|----|-------|
| Drawer width | 522px | 522px | — |
| Drawer height | 676px | 702px | +26px |
| Viewport inset | 12px | 12px | — |

Height formula: viewport height − (inset × 2). SM viewport is 726px → 726 − 24 = 702px.

Note: the SM drawer is actually *taller* than MD (702 > 676) because the Figma frame's viewport height is taller at SM (726px) than MD (700px). This is a viewport dimension difference, not a design change — the drawer fills available height.

All internal values confirmed identical via design context extraction.

---

## Responsive summary (desktop breakpoints — drawer)

| Property | SM | MD | MD-LG | LG | XL |
|----------|----|----|-------|----|----|
| Drawer width | 522px | 522px | 522px | 571px | 571px |
| Drawer height | 702px | 676px | 740px | 868px | 868px |
| Drawer radius | 20px | 20px | 20px | 24px | 24px |
| Viewport inset | 12px | 12px | 14px | 16px | 16px |
| Header height | 86px | 86px | 86px | 104px | 104px |
| L1 font | 18px | 18px | 18px | 20px | 20px |
| L2 font | 15px | 15px | 15px | 16px | 16px |
| Utility font | 15px | 15px | 15px | 16px | 16px |
| QuickAction pill | 30px | 30px | 30px | 32px | 32px |
| CloseBtn | 38px | 38px | 38px | 40px | 40px |

Two stable plateaus across all five desktop breakpoints:

- **LG / XL:** 571px wide, r24, 16px inset, 104px header, 20px L1, 16px L2
- **SM / MD / MD-LG:** 522px wide, r20, 12–14px inset, 86px header, 18px L1, 15px L2

Within each plateau, typography, padding, gaps, and colours are identical. Only the drawer shell height varies (driven by viewport height × inset formula). The inset tightens once within the lower plateau (14→12 at MD).

All desktop breakpoints now extracted. Mobile remaining.

---

### Pattern: tracking ratio

All text in the sub-menu uses a consistent -0.005em tracking ratio. The absolute value changes with font size, but the em ratio is constant:

| Size | Tracking (px) | Ratio |
|------|--------------|-------|
| 20px | -0.100px | -0.005em |
| 18px | -0.090px | -0.005em |
| 16px | -0.080px | -0.005em |
| 15px | -0.075px | -0.005em |
| 14px | -0.070px | -0.005em |
| 13px | -0.065px | -0.005em |

---

## XS — 428–767px (Mobile Menu Overlay)

**Source frames:**
- Shop L1: `6276:2506` → MobileMenuOverlay `6276:2551`
- Studio L1: `6276:2386` → MobileMenuOverlay `6276:2431` (also shows CloseBtn hover state)
- Shop L2 Skincare: `6276:1978` → MobileMenuOverlay `6276:2023`
- Studio L2 Facials: `6276:2185` → MobileMenuOverlay `6276:2230`

### Fundamental change from desktop

The desktop sub-menu is a **drawer panel** (white, ~522–571px wide, positioned at the top-left corner). On mobile it becomes a **full-screen frosted glass overlay** — the content container *is* the overlay. There is no separate page-level backdrop; the MobileMenuOverlay fills nearly the entire viewport.

The navigation model also changes: desktop shows L1 and L2 **side-by-side** (hover to reveal L2 column). Mobile uses a **drill-in/drill-out** pattern — tapping an L2-enabled link replaces the L1 content with L2, and a back button returns to L1.

---

### MobileMenuOverlay (container)

| Property | Value |
|----------|-------|
| Width | 414px |
| Height | 804px |
| Viewport inset | 8px (from all edges of 430 × 820 viewport) |
| Background | `rgba(251, 250, 249, 0.5)` — `#FBFAF9` at 50% |
| Backdrop filter | `blur(32px)` |
| Border-radius | 20px |
| Overflow | clip |
| Layout | Flex column |

Desktop comparison: desktop uses a white (`#FFFFFF`) opaque drawer over a *separate* frosted glass page overlay. Mobile merges both into one frosted glass surface. Same blur and tint values — the overlay treatment from desktop's page backdrop is now the container's own surface.

---

### MobileMenuOverlay__Heading

| Property | Value |
|----------|-------|
| Height | 86px |
| Padding-left | 24px |
| Padding-right | 10px (visual; TouchTarget extends to 7px on Shop L1 initial) |
| Padding-Y | 24px |
| Layout | Flex, align-center, justify space-between |

#### Logotype

| Property | Value |
|----------|-------|
| Width | 220.84px |
| Height | 16px |

Same as desktop SM–MD-LG. The heading continues to mirror the MainNav at this breakpoint.

#### CloseBtn

| Property | Initial | Hover |
|----------|---------|-------|
| Size | 38 × 38px | 38 × 38px |
| Background | none | `#F3F1F1` |
| Border-radius | 100px | 100px |
| Padding | 8px | 8px |
| Icon size | 10 × 10px | 10 × 10px |

Same as desktop SM–MD-LG. The Shop L1 frame wraps CloseBtn in a 44 × 44px TouchTarget for mobile tap area; the Studio L1 frame shows the hover state with `#F3F1F1` background on CloseBtn directly.

---

### MainPathsGroup (Shop / Studio toggle)

Identical to desktop SM–MD-LG in every value:

| Property | Value |
|----------|-------|
| Container padding | 8px horizontal |
| Track background | `#F3F1F1` |
| Track height | 40px |
| Track padding | 2px |
| Track gap | 4px |
| Track radius | 100px |
| Button height | 36px |
| Button padding-X | 14px |
| Button radius | 100px |
| Active bg | `#FFFFFF` |
| Active text | 15px, -0.075px, `#0C0A09` |
| Demoted text | 15px, -0.075px, `#7C6D67` |

---

### PrimaryLinks — First Level (L1)

| Property | Value |
|----------|-------|
| Padding-X | 24px |
| Padding-bottom | 24px |
| Gap between SubGroups | 56px |
| Width | full overlay width (414px) |

Same internal padding and gap as desktop SM–MD-LG.

#### L1 link typography

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 18px |
| Tracking | -0.09px (-0.005em) |
| Color | `#0C0A09` |
| Gap between links | 15px |

Same as desktop SM–MD-LG.

#### L2-enabled links (chevron indicator)

Links that drill into L2 show a right-pointing chevron, full-width between label and chevron:

| Property | Value |
|----------|-------|
| Layout | Flex, align-center, justify space-between, full width |
| Chevron container | 12 × 12px, radius 100px |
| Chevron icon | 6 × 6px |

**Shop L1 L2-enabled links:** Skincare, Brands (2 of 5)
**Studio L1 L2-enabled links:** Facials, Body Contouring, Hair Removal, Injectables, Skin Improvement, Skin Tightening (6 of 7)

Same links as desktop — Hair & Body, Tools & Accessories, Shop All, and All Treatments remain direct links.

#### SubGroup__Title ("Featured")

| Property | Value |
|----------|-------|
| Font size | 13px |
| Tracking | -0.065px (-0.005em) |
| Color | `#0C0A09` |
| Gap to links below | 30px |

Same as desktop SM–MD-LG.

---

### PrimaryLinks — Second Level (L2) — drill-in view

On mobile, L2 **replaces** L1 content. The overlay shows only one level at a time. The toggle remains at the top for context; below it, a `LinksGroup` container replaces the L1 SubGroups.

| Property | Value |
|----------|-------|
| Gap (switch → LinksGroup) | 32px |
| LinksGroup internal gap | 30px (between ReturnLevel and Links) |

#### ReturnLevel (back button)

| Property | Value |
|----------|-------|
| Layout | Flex row, align-center, gap 24px |
| Left chevron container | 12 × 12px, radius 100px |
| Left chevron icon | 6 × 6px |
| Label font | 13px, -0.065px, `#0C0A09` |
| Label text-align | right |

The ReturnLevel label shows the parent category name (e.g. "Skincare", "Facials"). Font size matches SubGroup__Title — it occupies the same visual tier as the group heading it replaces. The 24px gap between chevron and label is generous for a tap target.

#### L2 link typography

| Property | Value |
|----------|-------|
| Font | Scto Grotesk A, Regular |
| Size | 18px |
| Tracking | -0.09px (-0.005em) |
| Color | `#0C0A09` |
| Gap between links | 15px |

**Same size as L1 links.** On desktop, L2 is smaller (15–16px) to create hierarchy against the adjacent L1 column. On mobile, since L2 *replaces* L1 (not shown alongside it), there's no need for visual subordination — both levels use 18px.

#### "Featured" SubGroup disappears on L2

When drilling into L2, the second SubGroup ("Featured") is removed entirely. The overlay shows only: toggle → ReturnLevel → L2 links → QuickActions → UtilityLinks. This keeps the mobile view focused on the drill-in category.

---

### QuickActions

| Property | Value | Desktop SM–MD-LG |
|----------|-------|-------------------|
| Pill height | 30px | 30px |
| Padding-X | 14px | 14px |
| Background | `rgba(251, 250, 249, 0.3)` | `#F3F1F1` |
| Border-radius | 100px | 100px |
| Font | 13px, -0.065px | 13px, -0.065px |
| Text color | `#5B4F4B` | `#5B4F4B` |
| Container padding-X | 32px | 32px |
| Gap | 8px | 8px |
| Position | Bottom of NavigationLevels | same |

**Pill background changes:** opaque `#F3F1F1` on desktop → translucent `rgba(251, 250, 249, 0.3)` on mobile. The frosted glass surface needs translucent pills to read correctly; opaque pills would block the blur effect behind them.

The Search pill has a 44 × 44px TouchTarget wrapper in the Shop L1 initial state frame, providing a larger tap area on mobile.

**Content:** "Search rewindskinco.com" and "Bag (0)" — same across all views.

---

### UtilityLinks (footer)

| Property | Value | Desktop SM–MD-LG |
|----------|-------|-------------------|
| Border-top | `rgba(251, 250, 249, 0.3)` | 1px `#E8E4E3` |
| Padding | 24px | 24px |
| Font | 15px, -0.075px, `#0C0A09` | 15px, -0.075px, `#0C0A09` |
| Gap | 14px | 14px |

**Border changes:** opaque `#E8E4E3` on desktop → translucent `rgba(251, 250, 249, 0.3)` on mobile. Same reasoning as QuickAction pills — translucent borders for the frosted glass surface.

The Shop L1 initial state wraps UtilityLinks items in 44px-tall touch targets (`py-[7px]` on the container, each link has `h-full` at 44px). Other frames use standard text with `p-[24px]`.

**Content is context-dependent (same as desktop):**

| Context | Links |
|---------|-------|
| Shop active | Wishlist, Account, Shipping & Returns |
| Studio active | Manage Appointments, FAQ |

---

### Shop vs Studio — L1 content (same as desktop)

**Shop L1:**
- SubGroup 1: Skincare (→L2), Hair & Body, Tools & Accessories, Brands (→L2), Shop All
- SubGroup 2 ("Featured"): Concierge, Bestsellers, Subscribe & Save, Gifting, Sales & Offers

**Studio L1:**
- SubGroup 1: Facials (→L2), Body Contouring (→L2), Hair Removal (→L2), Injectables (→L2), Skin Improvement (→L2), Skin Tightening (→L2), All Treatments
- SubGroup 2 ("Featured"): Virtual Consult, Gifting, Your Therapist

### L2 content (same as desktop)

**Shop L2 Skincare:** Cleansers, Toners and Mists · Creams and Moisturizers · Exfoliants · Eyes & Lips · Masks and Treatments · Serums and Oils · Suncare · Travel · All Skincare

**Studio L2 Facials:** Light Facial · Essential Facial · Bespoke Advanced Facial · Aya's Touch Facial · Microcurrent Facial · Forma Facial · All Facials

---

### Diff summary: mobile (XS) vs desktop (SM–MD-LG plateau)

Typography, toggle, and internal spacing are **identical** to the SM–MD-LG desktop plateau. Every font size, tracking value, gap, and button dimension matches. The differences are purely structural and surface-level:

| Property | Desktop (SM–MD-LG) | Mobile (XS) |
|----------|---------------------|-------------|
| Container type | White drawer panel | Frosted glass overlay |
| Container bg | `#FFFFFF` | `rgba(251, 250, 249, 0.5)` + blur(32px) |
| Container size | 522px wide | 414 × 804px (near full-screen) |
| Container inset | 12–14px | 8px |
| Container radius | 20px | 20px |
| L2 model | Side-by-side reveal | Drill-in/drill-out (replaces L1) |
| L2 font size | 15px (subordinate) | 18px (same as L1) |
| QuickAction pill bg | `#F3F1F1` (opaque) | `rgba(251, 250, 249, 0.3)` (translucent) |
| UtilityLinks border | 1px `#E8E4E3` (opaque) | `rgba(251, 250, 249, 0.3)` (translucent) |
| Touch targets | Not present | 44px wrappers on buttons |
| Hover states | Highlight + demote siblings | N/A (touch — no hover) |

---

## Full responsive summary (all breakpoints)

| Property | XS (Mobile) | SM | MD | MD-LG | LG | XL |
|----------|-------------|----|----|-------|----|----|
| Container type | Frosted glass overlay | White drawer | White drawer | White drawer | White drawer | White drawer |
| Container width | 414px | 522px | 522px | 522px | 571px | 571px |
| Container radius | 20px | 20px | 20px | 20px | 24px | 24px |
| Viewport inset | 8px | 12px | 12px | 14px | 16px | 16px |
| Header height | 86px | 86px | 86px | 86px | 104px | 104px |
| L1 font | 18px | 18px | 18px | 18px | 20px | 20px |
| L2 font | 18px (same as L1) | 15px | 15px | 15px | 16px | 16px |
| L2 model | Drill-in/out | Side-by-side | Side-by-side | Side-by-side | Side-by-side | Side-by-side |
| Utility font | 15px | 15px | 15px | 15px | 16px | 16px |
| QuickAction pill | 30px | 30px | 30px | 30px | 32px | 32px |
| CloseBtn | 38px | 38px | 38px | 38px | 40px | 40px |
| QuickAction pill bg | translucent | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` |
| Border style | translucent | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` |

Three design regimes across the full breakpoint range:

1. **LG / XL:** White drawer, 571px, r24, 20px L1, 16px L2, side-by-side
2. **SM / MD / MD-LG:** White drawer, 522px, r20, 18px L1, 15px L2, side-by-side
3. **XS (Mobile):** Frosted glass overlay, 414px (near full-screen), r20, 18px L1, 18px L2, drill-in/out

---

## XXS — 375–427px (Mobile Menu Overlay)

**Source frames:**
- Shop L1: `6276:1728` → MobileMenuOverlay `6276:1771`

### Diff from XS

XXS is a scaled-down version of the XS mobile overlay. Same frosted glass surface, same content, same interaction model (drill-in/drill-out). Typography, spacing, and container dimensions all step down.

#### MobileMenuOverlay (container)

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Container width | 414px | 374px | -40px |
| Container height | 804px | 704px | -100px |
| Viewport inset | 8px | 8px | — |
| Border-radius | 20px | 19px | -1px |
| Background | `rgba(251, 250, 249, 0.5)` + blur(32px) | same | — |

Viewport is 390 × 720. Inset remains 8px.

#### MobileMenuOverlay__Heading

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Height | 86px | 80px | -6px |
| Padding-left | 24px | 22px | -2px |
| Padding-right | 10px | 9px | -1px |
| Padding-Y | 24px | 22px | -2px |

#### Logotype

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Width | 220.84px | 207.04px | -13.8px |
| Height | 16px | 15px | -1px |

#### CloseBtn

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Size | 38 × 38px | 36 × 36px | -2px |
| Padding | 8px | 8px | — |
| Icon size | 10 × 10px | 10 × 10px | — |

#### MainPathsGroup (Shop / Studio toggle)

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Container padding-X | 8px | 8px | — |
| Track height | 40px | 40px | — |
| Track padding | 2px | 2px | — |
| Track gap | 4px | 4px | — |
| Button height | 36px | 36px | — |
| Button padding-X | 14px | 14px | — |
| Active text | 15px, -0.075px | 15px, -0.075px | — |
| Demoted text | 15px, -0.075px | 15px, -0.075px | — |

**Toggle is identical to XS.** First mobile element that holds size while everything around it shrinks.

#### PrimaryLinks__FirstLevel

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Padding-X | 24px | 22px | -2px |
| Padding-bottom | 24px | 23px | -1px |
| Gap between SubGroups | 56px | 52px | -4px |

#### L1 link typography

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Font size | 18px | 17px | -1px |
| Tracking | -0.09px | -0.085px | +0.005px |
| Gap between links | 15px | 14px | -1px |
| Colour | `#0C0A09` | `#0C0A09` | — |

Tracking ratio stays at -0.005em (17 × -0.005 = -0.085).

#### First SubGroup internal gap (toggle → links)

| Property | XS | XXS |
|----------|-----|-----|
| Gap | — (not separately recorded) | 30px |

#### SubGroup__Title ("Featured")

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Font size | 13px | 13px | — |
| Tracking | -0.065px | -0.065px | — |
| Gap to links below | 30px | 28px | -2px |

#### Featured link typography

Same as L1 links: 17px, -0.085px, gap 14px.

#### NavigationLevels

| Property | XS | XXS |
|----------|-----|-----|
| Padding-bottom | — (not separately recorded) | 17px |

#### QuickActions

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Pill height | 30px | 29px | -1px |
| Pill padding-X | 14px | 13px | -1px |
| Font size | 13px | 13px | — |
| Tracking | -0.065px | -0.065px | — |
| Pill bg | `rgba(251, 250, 249, 0.3)` | same | — |
| Text colour | `#5B4F4B` | `#5B4F4B` | — |
| Container padding-X | 32px | 32px | — |
| Gap | 8px | 8px | — |

#### UtilityLinks

| Property | XS | XXS | Delta |
|----------|-----|-----|-------|
| Border-top | `rgba(251, 250, 249, 0.3)` | same | — |
| Padding-X | 24px | 22px | -2px |
| Padding-Y | 24px | 23px | -1px |
| Font size | 15px | 14px | -1px |
| Tracking | -0.075px | -0.07px | +0.005px |
| Gap | 14px | 14px | — |

#### Content

Identical to XS. Same Shop L1 links, same Featured links, same UtilityLinks labels.

---

## TINY — <375px (Mobile Menu Overlay)

**Source frames:**
- Shop L1: `6276:1873` → MobileMenuOverlay `6276:1916`

### Diff from XXS

TINY is the smallest breakpoint — another full step-down from XXS. The switch toggle now scales down (it held at XS/XXS), and the border-radius holds at 19px.

#### MobileMenuOverlay (container)

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Container width | 374px | 346px | -28px |
| Container height | 704px | 626px | -78px |
| Viewport inset | 8px | 7px | -1px |
| Border-radius | 19px | 19px | — |
| Background | `rgba(251, 250, 249, 0.5)` + blur(32px) | same | — |

Viewport is 360 × 640. Inset tightens to 7px.

#### MobileMenuOverlay__Heading

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Height | 80px | 72px | -8px |
| Padding-left | 22px | 20px | -2px |
| Padding-right | 9px | 8px | -1px |
| Padding-Y | 22px | 20px | -2px |

#### Logotype

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Width | 207.04px | 193.24px | -13.8px |
| Height | 15px | 14px | -1px |

#### CloseBtn

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Size | 36 × 36px | 32 × 32px | -4px |
| Padding | 8px | 8px | — |
| Icon size | 10 × 10px | 9 × 9px | -1px |

First breakpoint where the close icon itself scales down.

#### MainPathsGroup (Shop / Studio toggle)

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Container padding-X | 8px | 6px | -2px |
| Track height | 40px | 38px | -2px |
| Track padding | 2px | 2px | — |
| Track gap | 4px | 4px | — |
| Button height | 36px | 34px | -2px |
| Button padding-X | 14px | 14px | — |
| Active text | 15px, -0.075px | 14px, -0.07px | -1px |
| Demoted text | 15px, -0.075px | 14px, -0.07px | -1px |

**Toggle scales down for the first time.** It held constant from SM through XXS. At TINY, the track, buttons, and text all step down.

#### PrimaryLinks__FirstLevel

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Padding-X | 22px | 20px | -2px |
| Padding-bottom | 23px | 22px | -1px |
| Gap between SubGroups | 52px | 48px | -4px |

#### L1 link typography

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Font size | 17px | 16px | -1px |
| Tracking | -0.085px | -0.08px | +0.005px |
| Gap between links | 14px | 13px | -1px |
| Colour | `#0C0A09` | `#0C0A09` | — |

Tracking ratio stays at -0.005em (16 × -0.005 = -0.08).

#### First SubGroup internal gap (toggle → links)

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Gap | 30px | 28px | -2px |

#### SubGroup__Title ("Featured")

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Font size | 13px | 12px | -1px |
| Tracking | -0.065px | -0.06px | +0.005px |
| Gap to links below | 28px | 27px | -1px |

#### Featured link typography

Same as L1 links: 16px, -0.08px, gap 13px.

#### NavigationLevels

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Padding-bottom | 17px | 16px | -1px |

#### QuickActions

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Pill height | 29px | 28px | -1px |
| Pill padding-X | 13px | 13px | — |
| Font size | 13px | 12px | -1px |
| Tracking | -0.065px | -0.06px | +0.005px |
| Pill bg | `rgba(251, 250, 249, 0.3)` | same | — |
| Text colour | `#5B4F4B` | `#5B4F4B` | — |
| Container padding-X | 32px | 32px | — |
| Gap | 8px | 8px | — |

#### UtilityLinks

| Property | XXS | TINY | Delta |
|----------|------|------|-------|
| Border-top | `rgba(251, 250, 249, 0.3)` | same | — |
| Padding-X | 22px | 20px | -2px |
| Padding-Y | 23px | 22px | -1px |
| Font size | 14px | 13px | -1px |
| Tracking | -0.07px | -0.065px | +0.005px |
| Gap | 14px | 14px | — |

#### Content

Identical to XS and XXS.

---

## Full responsive summary — mobile overlay (all mobile breakpoints)

| Property | TINY | XXS | XS |
|----------|------|-----|-----|
| Viewport | 360 × 640 | 390 × 720 | 430 × 820 |
| Container width | 346px | 374px | 414px |
| Container height | 626px | 704px | 804px |
| Viewport inset | 7px | 8px | 8px |
| Border-radius | 19px | 19px | 20px |
| Header height | 72px | 80px | 86px |
| Logotype height | 14px | 15px | 16px |
| CloseBtn size | 32px | 36px | 38px |
| Close icon size | 9px | 10px | 10px |
| Toggle track height | 38px | 40px | 40px |
| Toggle button height | 34px | 36px | 36px |
| Toggle text | 14px | 15px | 15px |
| L1 font | 16px | 17px | 18px |
| L2 font (drill-in) | 16px | 17px | 18px |
| SubGroup__Title font | 12px | 13px | 13px |
| UtilityLinks font | 13px | 14px | 15px |
| QuickAction pill height | 28px | 29px | 30px |
| QuickAction text | 12px | 13px | 13px |
| Gap between links | 13px | 14px | 15px |
| Gap between SubGroups | 48px | 52px | 56px |
| Content padding-X | 20px | 22px | 24px |

Two scaling regimes across mobile:

1. **XS / XXS:** Border-radius 19–20px, toggle holds at 40px/36px/15px. XS and XXS are close — XXS is a tight linear step-down of XS.
2. **TINY:** Everything scales down including the toggle (38px/34px/14px) and the close icon (9px). Tightest possible layout for sub-375px screens.

The -0.005em tracking ratio is constant across every font size at every breakpoint.

---

## Full responsive summary — all breakpoints (combined)

| Property | TINY | XXS | XS | SM | MD | MD-LG | LG | XL |
|----------|------|-----|-----|----|----|-------|----|----|
| Container type | Glass | Glass | Glass | Drawer | Drawer | Drawer | Drawer | Drawer |
| Container width | 346px | 374px | 414px | 522px | 522px | 522px | 571px | 571px |
| Container radius | 19px | 19px | 20px | 20px | 20px | 20px | 24px | 24px |
| Viewport inset | 7px | 8px | 8px | 12px | 12px | 14px | 16px | 16px |
| Header height | 72px | 80px | 86px | 86px | 86px | 86px | 104px | 104px |
| L1 font | 16px | 17px | 18px | 18px | 18px | 18px | 20px | 20px |
| L2 font | 16px | 17px | 18px | 15px | 15px | 15px | 16px | 16px |
| L2 model | Drill | Drill | Drill | Side | Side | Side | Side | Side |
| Utility font | 13px | 14px | 15px | 15px | 15px | 15px | 16px | 16px |
| QuickAction pill | 28px | 29px | 30px | 30px | 30px | 30px | 32px | 32px |
| CloseBtn | 32px | 36px | 38px | 38px | 38px | 38px | 40px | 40px |
| Toggle track | 38px | 40px | 40px | 40px | 40px | 40px | — | — |
| Pill bg | translucent | translucent | translucent | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` | `#F3F1F1` |
| Border style | translucent | translucent | translucent | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` | `#E8E4E3` |

Four design regimes across the full range:

1. **LG / XL:** White drawer, 571px, r24, 20px L1, 16px L2, side-by-side
2. **SM / MD / MD-LG:** White drawer, 522px, r20, 18px L1, 15px L2, side-by-side
3. **XS / XXS:** Frosted glass overlay, r19–20, 17–18px L1/L2, drill-in/out, toggle holds
4. **TINY:** Frosted glass overlay, r19, 16px L1/L2, drill-in/out, toggle scales down

---

## Resolved

- [x] Utility link hover — same demote-siblings model as all other nav links. Hovered link stays `#0C0A09`, sibling demotes to `#ABA09C`.
- [x] Hair & Body, Tools & Accessories, Shop All — direct links, no L2 sub-menu.
- [x] "All Treatments" and all "All [Category]" links — direct links, no L2 sub-menu.
- [x] Transition/animation timing — TBD in development, not extracted here.
- [x] L2 top-padding alignment — first L2 link baseline aligns with the hovered L1 link's baseline. Padding is dynamic per-link, not a fixed value.
- [x] Mobile (XS) breakpoint extracted — full overlay structure, L1/L2 drill-in model, translucent surface adaptations.
- [x] TINY and XXS breakpoints — confirmed as separate frames with distinct values (not duplicates of XS). Both extracted.

## Open items

- [ ] Mobile L2 drill-in/out transition — TBD in development. George unsure of timing and easing.
- [ ] Mobile active/press states — George undecided on active states for links and buttons.
- [ ] Search/Cart pressed background shape — George exploring in Figma.
