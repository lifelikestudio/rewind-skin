# Cart Drawer — Extraction

## Scope

- **Pass:** complete — all available breakpoints and states
- **Extracted breakpoints:** XL, LG (base), MD-LG, MD, SM, XS, XXS, TINY
- **Extracted states:** Items (with products), Empty
- **Not started:** Quantity +/- interaction states, Remove link interaction, product card hover/press states (no frames provided)
- **Figma file key:** `lwPjiKhA1GRP4OQxpttUxR`

---

## LG — 1440–1919px (base extraction)

**Source frames:**

- Cart with items (isolated): `6143:9002` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6095:5714`
- Empty state (isolated): `6124:481` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6095:5539`

---

### Overlay

**Inherited system pattern:** `OverlayLight` covers the full page including MainNav — same surface and blur as established in `design-system/extractions/submenu-drawer.md`. No cart-specific overlay delta.

---

### Drawer Container

| Property      | Value                                  |
| ------------- | -------------------------------------- |
| Background    | `#FFFFFF` (white)                      |
| Width         | 456px (fixed — same as Search Drawer)  |
| Border-radius | 24px                                   |
| Overflow      | clip                                   |
| Position      | 16px inset from viewport **top-right** |

**Delta from sub-menu/search (Figma-observed):** The cart drawer is **right-aligned** — it pins to the top-right corner of the viewport. Sub-menu and search drawers pin to the top-left. **Interpretation:** the right-alignment likely follows the cart icon's position in the nav's SupportingLinks (right group), but this rationale is inferred, not stated in the design.

**Height behaviour:**

- Items state: viewport-constrained (`viewport_height - (2 × inset)`) — the product list scrolls within the drawer, same as other drawers
- Empty state: content-height — the drawer is only as tall as its content, not viewport-constrained

---

### CartDrawerHeader\_\_B

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Height        | 104px (32px pad + 40px content + 32px pad) |
| Padding-left  | 32px                                       |
| Padding-right | 17px                                       |
| Padding-Y     | 32px                                       |
| Layout        | Flex, align-center, justify space-between  |

**Inherited:** Header shell dimensions are identical to the sub-menu and search drawer headers at LG (104px height, same padding). CloseBtn is established (40 × 40px, p-8, 10 × 10px icon, rounded-full).

**Delta:** The left content swaps from logotype + ActionGroup to a DrawerTitleGroup:

#### DrawerTitleGroup

| Property | Value              |
| -------- | ------------------ |
| Layout   | Flex, align-center |
| Gap      | 8px                |

#### Title ("Bag")

| Property | Value                         |
| -------- | ----------------------------- |
| Font     | Scto Grotesk A, Regular (400) |
| Size     | 24px                          |
| Tracking | -0.12px (-0.005em)            |
| Leading  | 0 (cap-height trim)           |
| Colour   | `#0C0A09`                     |

#### CartQuantity badge (items state only)

| Property      | Value                         |
| ------------- | ----------------------------- |
| Background    | `#F3F1F1`                     |
| Border-radius | 100px (pill)                  |
| Padding       | 10px horizontal, 6px vertical |

| Property | Value                        |
| -------- | ---------------------------- |
| Font     | Scto Grotesk A, Medium (500) |
| Size     | 12px                         |
| Tracking | -0.06px (-0.005em)           |
| Colour   | `#5B4F4B`                    |
| Content  | "30" (item count)            |

The badge is absent in the empty state — only the "Bag" title shows.

---

### CartDrawer\_\_Content (items state)

| Property | Value            |
| -------- | ---------------- |
| Padding  | 32px (all sides) |
| Layout   | Flex column      |

Content width = 456 − 32 − 32 = **392px** — same as Search Drawer at LG.

#### Drawer**SubGroup**ProductsListings

| Property | Value                        |
| -------- | ---------------------------- |
| Layout   | Flex column                  |
| Gap      | 20px (between product cards) |

---

### ProductCardCart**HorizontalLayout**SquareAsset

| Property | Value                            |
| -------- | -------------------------------- |
| Layout   | Flex row, gap 20px, align-center |
| Width    | 392px (fills content area)       |

The cart product card extends the search product card (`ProductCardSearch`) with a quantity control row. Image and metadata share the same base styling.

#### ProductImage\_\_1-1

**Inherited:** Same as Search Drawer — aspect 1:1, `#F3F1F1` bg, rounded 16px, overflow clip, flex 1 0 0. Badge\_\_ProductFeature positioning and styling identical (absolute, top-right, 8px inset, `#FFFFFF` bg, pill, 12px Medium `#0C0A09`).

Badge values observed: "Subscription", "Sale". Products without a badge show no badge element (third and fourth cards).

#### ProductData

| Property | Value                                              |
| -------- | -------------------------------------------------- |
| Layout   | Flex column                                        |
| Gap      | 16px (between ProductMeta, variant, QuantityField) |
| Width    | flex 1 0 0 (fills remaining space)                 |

#### ProductMeta

**Inherited:** Same as Search Drawer — flex column, gap 12px.

| Element         | Font    | Size | Tracking | Colour    | Leading |
| --------------- | ------- | ---- | -------- | --------- | ------- |
| Vendor          | Regular | 14px | -0.07px  | `#0C0A09` | 1.3     |
| Product name    | Regular | 14px | -0.07px  | `#0C0A09` | 1.3     |
| Price (regular) | Regular | 14px | -0.07px  | `#0C0A09` | 1       |

#### Pricing variants (cart-specific observations)

Four pricing patterns are present across the four product cards:

**1. Recurring (subscription):**

| Element                 | Size | Colour    | Tracking |
| ----------------------- | ---- | --------- | -------- |
| Price ("$590 cad")      | 14px | `#0C0A09` | -0.07px  |
| Frequency ("/12 weeks") | 12px | `#5B4F4B` | -0.06px  |

Layout: flex row, gap 4px, baseline-aligned. The frequency text is a subordinate label.

**2. Markdown (sale):**

**Inherited:** Same as Search Drawer — strikethrough original (`#0C0A09`) + sale price (`#E7000B`), gap 4px.

**3. Regular:**

Single price text, 14px, `#0C0A09`. No additional elements.

**4. Range:**

Single text node "$42 - $45 usd", 14px, `#0C0A09`. The range is rendered as one text element, not separate nodes.

#### Variant text

**Inherited:** Same as Search Drawer — 12px, Regular, `#5B4F4B`, tracking -0.06px. Examples: "6 x 5ml", "5 masks", "60ml", "Single mask".

#### QuantityField (cart-specific)

| Property | Value                                    |
| -------- | ---------------------------------------- |
| Layout   | Flex row, align-center                   |
| Gap      | 14px (between QuantitySelect and Remove) |

#### QuantitySelect (–/count/+ pill)

| Property      | Value                                     |
| ------------- | ----------------------------------------- |
| Background    | `#FBFAF9`                                 |
| Height        | 40px                                      |
| Width         | 96px                                      |
| Padding       | 0 16px                                    |
| Border-radius | 100px (pill)                              |
| Layout        | Flex, justify space-between, align-center |

| Property | Value                   |
| -------- | ----------------------- |
| Font     | Scto Grotesk A, Regular |
| Size     | 14px                    |
| Tracking | -0.07px (-0.005em)      |
| Colour   | `#5B4F4B`               |
| Leading  | 0 (cap-height trim)     |

The –/+ controls and the count value share the same typography.

#### Remove link

| Property   | Value                   |
| ---------- | ----------------------- |
| Font       | Scto Grotesk A, Regular |
| Size       | 12px                    |
| Tracking   | -0.06px (-0.005em)      |
| Colour     | `#7C6D67`               |
| Text-align | right                   |

---

### FooterPlaceholder

| Property | Value |
| -------- | ----- |
| Height   | 168px |
| Width    | 456px |

Reserves space at the bottom of the scrollable content area so the last product card is not hidden behind the fixed footer.

---

### CartDrawer\_\_Footer

| Property   | Value                                                |
| ---------- | ---------------------------------------------------- |
| Position   | Absolute, bottom 0, left 0                           |
| Width      | 456px (full drawer width)                            |
| Background | `#FFFFFF`                                            |
| Border-top | 1px solid `#E8E4E3`                                  |
| Padding    | 32px (all sides)                                     |
| Layout     | Flex column                                          |
| Gap        | 24px (between Callout\_\_Subtotal and PrimaryButton) |

**Delta from Search footer (Figma-observed):** The search footer uses `backdrop: blur(4px)` with no solid background. The cart footer uses a solid white background with an `#E8E4E3` top border. **Interpretation:** the solid background may relate to the cart footer's multi-line content (subtotal + shipping note) requiring full opacity for readability, while the search footer's single button works with the translucent backdrop — but this rationale is inferred from the visual difference, not stated in the design.

#### Callout\_\_Subtotal

| Property  | Value                                                |
| --------- | ---------------------------------------------------- |
| Container | rounded 16px (visual grouping, no visible bg/border) |
| Layout    | Flex column                                          |
| Gap       | 14px                                                 |

#### SubtotalText

| Property | Value                                      |
| -------- | ------------------------------------------ |
| Layout   | Flex row, justify space-between            |
| Font     | 16px, Regular, `#0C0A09`, tracking -0.08px |
| Leading  | 0 (cap-height trim)                        |

Both "Subtotal" and the price ("$1,085 cad") share the same styling, space-between justified.

#### Shipping note

| Property | Value                                        |
| -------- | -------------------------------------------- |
| Font     | 16px, Regular, `#5B4F4B`, tracking -0.08px   |
| Leading  | 1.35                                         |
| Copy     | "Taxes and shipping calculated at checkout." |

#### PrimaryButton\_\_MultiLabel ("Checkout")

| Property      | Value                              |
| ------------- | ---------------------------------- |
| Background    | `#0C0A09`                          |
| Height        | 44px                               |
| Border-radius | 100px (pill)                       |
| Width         | 100% (full footer width)           |
| Layout        | Flex, align-center, justify-center |
| Gap           | 10px (between labels)              |

| Property | Value                   |
| -------- | ----------------------- |
| Font     | Scto Grotesk A, Regular |
| Size     | 20px                    |
| Tracking | -0.1px (-0.005em)       |
| Colour   | `#FFFFFF`               |
| Leading  | 0 (cap-height trim)     |

Two text labels: "Checkout" and "$1,085 cad", separated by 10px gap. The PrimaryButton dimensions and typography match the established pattern from the Search Drawer. The multi-label layout and full-width behaviour are cart-specific.

---

## Empty state

**Source frames:**

- Isolated: `6124:481` → `CartDrawer__Empty__HeaderB`
- In context: `6095:5539`

### Diff from items state

The drawer shell (container, header, overlay) is identical. Differences:

| Property            | Items state                           | Empty state                         |
| ------------------- | ------------------------------------- | ----------------------------------- |
| CartQuantity badge  | Present ("30")                        | Absent                              |
| Content padding gap | — (single product list)               | 24px gap between callout and button |
| Footer              | Fixed bottom with subtotal + checkout | None                                |
| Drawer height       | Viewport-constrained                  | Content-height (shorter)            |

### CartDrawer\_\_Content (empty)

| Property | Value            |
| -------- | ---------------- |
| Padding  | 32px (all sides) |
| Layout   | Flex column      |
| Gap      | 24px             |

#### DrawerCallout

| Property | Value       |
| -------- | ----------- |
| Layout   | Flex column |
| Gap      | 14px        |

| Element | Font    | Size | Tracking | Colour    | Leading |
| ------- | ------- | ---- | -------- | --------- | ------- |
| Title   | Regular | 16px | -0.08px  | `#0C0A09` | 1.3     |
| Body    | Regular | 16px | -0.08px  | `#5B4F4B` | 1.35    |

Title: "Your shopping bag is empty."
Body: "Already have an account? Log in to checkout faster."

**Inherited:** DrawerCallout structure and typography match the Search Drawer's no-results callout exactly. Same font sizes, colours, leading, and gap.

**"Log in" inline link:**

| Property         | Value                             |
| ---------------- | --------------------------------- |
| Decoration       | underline, solid                  |
| Underline offset | 6% (from font)                    |
| Colour           | inherits `#5B4F4B` from body text |

#### PrimaryButton ("Start shopping")

| Property       | Value                                 |
| -------------- | ------------------------------------- |
| Background     | `#0C0A09`                             |
| Height         | 44px                                  |
| Padding        | 14px horizontal                       |
| Border-radius  | 100px (pill)                          |
| Mix-blend-mode | darken                                |
| Width          | auto (wraps content — not full-width) |

| Property | Value                   |
| -------- | ----------------------- |
| Font     | Scto Grotesk A, Regular |
| Size     | 20px                    |
| Tracking | -0.1px (-0.005em)       |
| Colour   | `#FFFFFF`               |

**Delta:** The empty state button is auto-width (wraps label), unlike the items-state checkout button which is full-width. The `mix-blend-mode: darken` is present on the empty state button. It was not recorded on the items-state checkout button — may be an inconsistency in Figma; on a white background both render identically.

---

## Colours (no new values)

All colours in the cart drawer are established in prior extractions:

| Hex       | Role in cart                                                   | Established in              |
| --------- | -------------------------------------------------------------- | --------------------------- |
| `#0C0A09` | Title text, meta text, subtotal, button bg                     | Nav — primary text          |
| `#5B4F4B` | CartQuantity text, frequency text, shipping note, variant text | Sub-menu — QuickAction text |
| `#7C6D67` | Remove link, placeholder                                       | Nav — demoted text          |
| `#E8E4E3` | Footer border                                                  | Nav — hover surface, border |
| `#F3F1F1` | Image bg, CartQuantity badge bg                                | Nav — resting surface       |
| `#FBFAF9` | QuantitySelect bg                                              | Nav — pressed surface       |
| `#E7000B` | Sale price                                                     | Search — sale price         |
| `#FFFFFF` | Drawer bg, badge bg, footer bg, button text                    | Established                 |

No new colour candidates.

---

## Structural comparison with other drawers at LG

| Property            | Sub-menu Drawer   | Search Drawer                    | Cart Drawer                          |
| ------------------- | ----------------- | -------------------------------- | ------------------------------------ |
| Position            | Top-left          | Top-left                         | **Top-right**                        |
| Width               | 571px             | 456px                            | 456px                                |
| Border-radius       | 24px              | 24px                             | 24px                                 |
| Viewport inset      | 16px              | 16px                             | 16px                                 |
| Header height       | 104px             | 104px                            | 104px                                |
| Header left content | Logotype + toggle | Logotype                         | **Title "Bag" + badge**              |
| Content padding     | 32px              | 32px                             | 32px                                 |
| Footer              | None              | Sticky blur, button only         | **Sticky opaque, subtotal + button** |
| Empty state         | N/A               | DrawerCallout + fallback content | **DrawerCallout + CTA button**       |

---

## XL — ≥1920px

**Source frames:**

- Cart with items (isolated): `6129:3647` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6129:3257` → `OverlayLight` (overlay node only; drawer is sibling)
- Empty state (isolated): `6129:3829` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6129:3013`

---

### Delta from LG: none

The cart drawer is a **fixed-width component** (456px) that does not scale between LG and XL. Every measured property — container, header, content, product cards, footer, empty state — is identical to the LG extraction.

#### Verified identical properties

| Category       | Property        | XL value                          | LG value                     |
| -------------- | --------------- | --------------------------------- | ---------------------------- |
| Container      | Width           | 456px                             | 456px                        |
| Container      | Border-radius   | 24px                              | 24px                         |
| Container      | Viewport inset  | 16px (top-right)                  | 16px (top-right)             |
| Header         | Padding         | 32px / 17px / 32px                | 32px / 17px / 32px           |
| Header         | Height          | 104px                             | 104px                        |
| Title          | Font            | 24px, Regular, -0.12px            | 24px, Regular, -0.12px       |
| CartQuantity   | Badge           | `#F3F1F1`, pill, 12px Medium      | `#F3F1F1`, pill, 12px Medium |
| CloseBtn       | Size            | 40 × 40px, icon 10 × 10px         | 40 × 40px, icon 10 × 10px    |
| Content        | Padding         | 32px                              | 32px                         |
| Product list   | Gap             | 20px                              | 20px                         |
| Product card   | Width / gap     | 392px / 20px                      | 392px / 20px                 |
| Product image  | Radius / bg     | 16px / `#F3F1F1`                  | 16px / `#F3F1F1`             |
| ProductMeta    | Typography      | 14px, -0.07px, gap 12px           | 14px, -0.07px, gap 12px      |
| QuantitySelect | Size            | 96 × 40px, pill                   | 96 × 40px, pill              |
| QuantityField  | Gap             | 14px                              | 14px                         |
| Remove link    | Typography      | 12px, `#7C6D67`                   | 12px, `#7C6D67`              |
| Footer         | Width / padding | 456px / 32px                      | 456px / 32px                 |
| Footer         | Border-top      | 1px `#E8E4E3`                     | 1px `#E8E4E3`                |
| Footer         | Gap             | 24px                              | 24px                         |
| Subtotal       | Typography      | 16px, -0.08px                     | 16px, -0.08px                |
| Shipping note  | Typography      | 16px, `#5B4F4B`, 1.35             | 16px, `#5B4F4B`, 1.35        |
| Checkout btn   | Size / font     | 44px / 20px, full-width           | 44px / 20px, full-width      |
| Empty callout  | Typography      | 16px, gap 14px                    | 16px, gap 14px               |
| Empty button   | Size / font     | 44px / 20px, auto-width           | 44px / 20px, auto-width      |
| Overlay        | Surface         | `rgba(251,250,249,0.5)` blur 32px | Same (inherited)             |

#### Pricing patterns confirmed

All four pricing variants (recurring, markdown, regular, range) use the same typography and layout as LG. Sale colour `#E7000B` confirmed on the markdown card.

#### In-context positioning confirmed

From the empty in-context frame (`6129:3013`): the drawer sits at `right: 16px; top: 16px` with `min-width: 456px`, positioned absolutely over the `OverlayLight` backdrop — matching the LG pattern exactly. The viewport frame is 2560 × 1440px.

---

### Breakpoint scaling note

The cart drawer (and the search drawer at 456px) appears to be a **viewport-independent fixed-width panel** at LG and XL. The wider XL viewport only affects the page content behind the overlay, not the drawer itself. This is consistent with the sub-menu drawer, which also uses fixed widths per breakpoint (571px at LG). The question is whether smaller breakpoints (MD and below) introduce dimensional changes — that's where deltas are expected.

---

## MD-LG — 1280–1439px

**Source frames:**

- Cart with items (isolated): `6149:9286` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6141:8122`
- Empty state (isolated): `6143:8691` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6141:7930`

---

### Delta from LG

MD-LG is the first breakpoint where the drawer changes. The pattern: padding tightens from 32px → 24px throughout, the drawer narrows from 456px → 440px (content area stays 392px), and footer/button typography scales down one step.

#### Drawer container

| Property       | LG    | MD-LG | Delta |
| -------------- | ----- | ----- | ----- |
| Border-radius  | 24px  | 20px  | -4px  |
| Width          | 456px | 440px | -16px |
| Viewport inset | 16px  | 14px  | -2px  |

Width change is a consequence of the padding reduction — content area remains 392px: `24 + 392 + 24 = 440`.

#### Header

| Property          | LG        | MD-LG     | Delta |
| ----------------- | --------- | --------- | ----- |
| Padding-left      | 32px      | 24px      | -8px  |
| Padding-right     | 17px      | 10px      | -7px  |
| Padding-Y         | 32px      | 24px      | -8px  |
| Height (computed) | 104px     | 86px      | -18px |
| CloseBtn size     | 40 × 40px | 38 × 38px | -2px  |

Close icon remains 10 × 10px. Title "Bag" remains 24px / -0.12px. CartQuantity badge unchanged.

#### Content area

| Property | LG   | MD-LG | Delta |
| -------- | ---- | ----- | ----- |
| Padding  | 32px | 24px  | -8px  |

Product list gap (20px), product card width (392px), card gap (20px), ProductImage radius (16px), ProductData gap (16px), ProductMeta gap (12px), all product typography (14px), QuantitySelect (96 × 40px), QuantityField gap (14px), Remove link (12px `#7C6D67`) — all unchanged.

#### Footer

| Property                 | LG            | MD-LG         | Delta |
| ------------------------ | ------------- | ------------- | ----- |
| Width                    | 456px         | 440px         | -16px |
| Padding                  | 32px          | 24px          | -8px  |
| Gap                      | 24px          | 24px          | —     |
| FooterPlaceholder height | 168px         | 146px         | -22px |
| Border-top               | 1px `#E8E4E3` | 1px `#E8E4E3` | —     |

#### Footer typography

| Property               | LG             | MD-LG          | Delta |
| ---------------------- | -------------- | -------------- | ----- |
| Subtotal font          | 16px / -0.08px | 14px / -0.07px | -2px  |
| Subtotal gap           | 14px           | 12px           | -2px  |
| Shipping note font     | 16px / -0.08px | 14px / -0.07px | -2px  |
| Shipping note leading  | 1.35           | 1.35           | —     |
| Checkout button height | 44px           | 42px           | -2px  |
| Checkout button font   | 20px / -0.1px  | 18px / -0.09px | -2px  |
| Checkout button gap    | 10px           | 10px           | —     |

---

### Empty state delta from LG

| Property                       | LG             | MD-LG          | Delta |
| ------------------------------ | -------------- | -------------- | ----- |
| DrawerCallout gap              | 14px           | 12px           | -2px  |
| Callout title font             | 16px / -0.08px | 14px / -0.07px | -2px  |
| Callout body font              | 16px / -0.08px | 14px / -0.07px | -2px  |
| "Start shopping" button height | 44px           | 42px           | -2px  |
| "Start shopping" button font   | 20px / -0.1px  | 18px / -0.09px | -2px  |

Content padding (24px), content gap (24px), button px (14px), mix-blend-mode (darken), "Log in" underline — all match the items-state changes.

---

### In-context positioning

| Property | Items state                                  | Empty state              |
| -------- | -------------------------------------------- | ------------------------ |
| Inset    | `right: 14px; top: 14px`                     | `right: 14px; top: 14px` |
| Viewport | 1280 × 768px                                 | 1280 × 768px             |
| Height   | 740px (viewport-constrained: `768 - 2 × 14`) | Content-height           |
| Overflow | `overflow-x: clip; overflow-y: auto`         | clip                     |

**Empty state min-width (Figma-observed):** The empty state in-context frame has `min-width: 456px`. **Interpretation:** this likely enforces the LG-era width as a floor so the drawer doesn't collapse to a narrower size when there are no product cards to drive the width — but this rationale is inferred. The items-state width (440px) is derived from content (`24 + 392 + 24`).

**Shared drawer conventions:** Container positioning (viewport inset), border-radius, padding scale, CloseBtn sizing, and overlay are shared patterns established in the sub-menu and search drawer extractions. The cart drawer follows the same system — the only cart-specific positioning difference is right-alignment (vs left for sub-menu/search).

---

### Scaling pattern emerging

| Token                                | XL/LG     | MD-LG     | Pattern                   |
| ------------------------------------ | --------- | --------- | ------------------------- |
| Drawer border-radius                 | 24px      | 20px      | -4px step                 |
| Drawer/header/content/footer padding | 32px      | 24px      | -8px step                 |
| Viewport inset                       | 16px      | 14px      | -2px step                 |
| CloseBtn                             | 40px      | 38px      | -2px step                 |
| Footer/callout typography            | 16px      | 14px      | -2px step                 |
| Button height                        | 44px      | 42px      | -2px step                 |
| Button typography                    | 20px      | 18px      | -2px step                 |
| Product card internals               | unchanged | unchanged | Stable across breakpoints |

Product cards (image, meta, pricing, quantity, remove) are immune to breakpoint scaling so far — they hold at the same dimensions from XL through MD-LG. The drawer shell and footer absorb the viewport changes.

---

## MD — 1024–1279px

**Source frames:**

- Cart with items (isolated): `6158:11291` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6158:11004` → `[MD] 1024-1279px - Cart [Drawer Overlay with Products State]`
- Empty state (isolated): `6158:11182` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6158:10812` → `[MD] 1024-1279px - Cart [Drawer Overlay Empty State]`

---

### Delta from MD-LG: viewport inset only

The drawer interior is **identical** to MD-LG. The sole change is the viewport inset tightening by 2px.

#### Viewport inset

| Property       | MD-LG | MD   | Delta |
| -------------- | ----- | ---- | ----- |
| Viewport inset | 14px  | 12px | -2px  |

#### In-context positioning

| Property          | Items state                                                  | Empty state    |
| ----------------- | ------------------------------------------------------------ | -------------- |
| Right inset       | `right: 12px`                                                | `right: 12px`  |
| Top inset         | vertically centred (`top: 50%; transform: translateY(-50%)`) | `top: 12px`    |
| Viewport          | 1152 × 700px                                                 | 1152 × 700px   |
| Height            | 676px (`700 - 2 × 12`) — viewport-constrained                | Content-height |
| Overflow          | `overflow-x: clip; overflow-y: auto`                         | clip           |
| min-width (empty) | —                                                            | 456px          |

The items-state drawer uses vertical centering in Figma, but the computed result is equivalent to `top: 12px; bottom: 12px` — the drawer fills the viewport minus 12px inset on each side (`700 - 24 = 676px`). For CSS, this resolves to the same inset pattern as all other breakpoints.

#### Verified identical to MD-LG

| Category          | Property          | MD value                          | MD-LG value                  |
| ----------------- | ----------------- | --------------------------------- | ---------------------------- |
| Container         | Width             | 440px                             | 440px                        |
| Container         | Border-radius     | 20px                              | 20px                         |
| Header            | Padding           | 24px / 10px / 24px                | 24px / 10px / 24px           |
| Header            | Height (computed) | 86px                              | 86px                         |
| CloseBtn          | Size              | 38 × 38px, icon 10 × 10px         | 38 × 38px, icon 10 × 10px    |
| Title             | Font              | 24px, Regular, -0.12px            | 24px, Regular, -0.12px       |
| CartQuantity      | Badge             | `#F3F1F1`, pill, 12px Medium      | `#F3F1F1`, pill, 12px Medium |
| Content           | Padding           | 24px                              | 24px                         |
| Product list      | Gap               | 20px                              | 20px                         |
| Product card      | Width / gap       | 392px / 20px                      | 392px / 20px                 |
| Product image     | Radius / bg       | 16px / `#F3F1F1`                  | 16px / `#F3F1F1`             |
| ProductMeta       | Typography        | 14px, -0.07px, gap 12px           | 14px, -0.07px, gap 12px      |
| ProductData       | Gap               | 16px                              | 16px                         |
| QuantitySelect    | Size              | 96 × 40px, pill, `#FBFAF9`        | 96 × 40px, pill, `#FBFAF9`   |
| QuantityField     | Gap               | 14px                              | 14px                         |
| Remove link       | Typography        | 12px, `#7C6D67`                   | 12px, `#7C6D67`              |
| FooterPlaceholder | Height            | 146px                             | 146px                        |
| Footer            | Width / padding   | 440px / 24px                      | 440px / 24px                 |
| Footer            | Border-top        | 1px `#E8E4E3`                     | 1px `#E8E4E3`                |
| Footer            | Gap               | 24px                              | 24px                         |
| Subtotal          | Typography        | 14px, -0.07px, gap 12px           | 14px, -0.07px, gap 12px      |
| Shipping note     | Typography        | 14px, `#5B4F4B`, 1.35             | 14px, `#5B4F4B`, 1.35        |
| Checkout btn      | Size / font       | 42px / 18px, full-width           | 42px / 18px, full-width      |
| Empty callout     | Typography        | 14px, gap 12px                    | 14px, gap 12px               |
| Empty button      | Size / font       | 42px / 18px, auto-width           | 42px / 18px, auto-width      |
| Overlay           | Surface           | `rgba(251,250,249,0.5)` blur 32px | Same (inherited)             |

All four pricing variants (recurring, markdown, regular, range) confirmed identical.

---

### Scaling pattern updated

| Token                                | XL/LG     | MD-LG     | MD        | Pattern                   |
| ------------------------------------ | --------- | --------- | --------- | ------------------------- |
| Drawer border-radius                 | 24px      | 20px      | 20px      | Step at MD-LG, holds      |
| Drawer/header/content/footer padding | 32px      | 24px      | 24px      | Step at MD-LG, holds      |
| Viewport inset                       | 16px      | 14px      | 12px      | -2px per step             |
| CloseBtn                             | 40px      | 38px      | 38px      | Step at MD-LG, holds      |
| Footer/callout typography            | 16px      | 14px      | 14px      | Step at MD-LG, holds      |
| Button height                        | 44px      | 42px      | 42px      | Step at MD-LG, holds      |
| Button typography                    | 20px      | 18px      | 18px      | Step at MD-LG, holds      |
| Product card internals               | unchanged | unchanged | unchanged | Stable across breakpoints |

The viewport inset is the only property that continues stepping at MD. All other drawer properties that changed at MD-LG have plateaued — the next round of changes is expected at SM or below when the drawer likely goes full-width.

---

## SM — 768–1023px

**Source frames:**

- Cart with items (isolated): `6162:13607` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6162:13392` → `[SM] 768-1023px - Cart [Drawer Overlay with Products State]`
- Empty state (isolated): `6162:13498` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6162:13445` → `[SM] 768-1023px - Cart [Drawer Overlay Empty State]`

---

### Delta from MD: none

The cart drawer at SM is **identical** to MD in every measured property — container, header, content, product cards, footer, empty state, and viewport inset.

#### In-context positioning

| Property          | Items state                                                  | Empty state    |
| ----------------- | ------------------------------------------------------------ | -------------- |
| Right inset       | `right: 12px`                                                | `right: 12px`  |
| Top inset         | vertically centred (`top: 50%; transform: translateY(-50%)`) | `top: 12px`    |
| Viewport width    | 834px (`min-w: 768px; max-w: 1023px`)                        | 834px          |
| Drawer height     | 702px — viewport-constrained                                 | Content-height |
| Overflow          | `overflow-x: clip; overflow-y: auto`                         | clip           |
| min-width (empty) | —                                                            | 456px          |

#### Verified identical to MD

| Category          | Property        | SM value                          | MD value                  |
| ----------------- | --------------- | --------------------------------- | ------------------------- |
| Container         | Width           | 440px                             | 440px                     |
| Container         | Border-radius   | 20px                              | 20px                      |
| Viewport inset    | Right/top       | 12px                              | 12px                      |
| Header            | Padding         | 24px / 10px / 24px                | 24px / 10px / 24px        |
| CloseBtn          | Size            | 38 × 38px, icon 10 × 10px         | 38 × 38px, icon 10 × 10px |
| Title             | Font            | 24px, Regular, -0.12px            | 24px, Regular, -0.12px    |
| CartQuantity      | Badge           | `#F3F1F1`, pill, 12px Medium      | Same                      |
| Content           | Padding         | 24px                              | 24px                      |
| Product list      | Gap             | 20px                              | 20px                      |
| Product card      | Width / gap     | 392px / 20px                      | 392px / 20px              |
| Product image     | Radius / bg     | 16px / `#F3F1F1`                  | Same                      |
| ProductMeta       | Typography      | 14px, -0.07px, gap 12px           | Same                      |
| ProductData       | Gap             | 16px                              | 16px                      |
| QuantitySelect    | Size            | 96 × 40px, pill, `#FBFAF9`        | Same                      |
| QuantityField     | Gap             | 14px                              | 14px                      |
| Remove link       | Typography      | 12px, `#7C6D67`                   | Same                      |
| FooterPlaceholder | Height          | 146px                             | 146px                     |
| Footer            | Width / padding | 440px / 24px                      | Same                      |
| Footer            | Border-top      | 1px `#E8E4E3`                     | Same                      |
| Footer            | Gap             | 24px                              | 24px                      |
| Subtotal          | Typography      | 14px, -0.07px, gap 12px           | Same                      |
| Shipping note     | Typography      | 14px, `#5B4F4B`, 1.35             | Same                      |
| Checkout btn      | Size / font     | 42px / 18px, full-width           | Same                      |
| Empty callout     | Typography      | 14px, gap 12px                    | Same                      |
| Empty button      | Size / font     | 42px / 18px, auto-width           | Same                      |
| Overlay           | Surface         | `rgba(251,250,249,0.5)` blur 32px | Same                      |

All four pricing variants confirmed identical. Sale colour `#E7000B` confirmed.

#### Viewport coverage note

At SM's narrowest (768px), the drawer (440px + 12px right inset = 452px from right edge) covers ~59% of the viewport width. The drawer still operates as a side panel — the full-width takeover expected at XS and below hasn't happened yet.

---

### Scaling pattern updated (through SM)

| Token                     | XL/LG     | MD-LG     | MD        | SM        | Pattern                         |
| ------------------------- | --------- | --------- | --------- | --------- | ------------------------------- |
| Drawer border-radius      | 24px      | 20px      | 20px      | 20px      | Step at MD-LG, holds through SM |
| Drawer padding            | 32px      | 24px      | 24px      | 24px      | Step at MD-LG, holds through SM |
| Viewport inset            | 16px      | 14px      | 12px      | 12px      | Step at MD-LG/MD, holds at SM   |
| CloseBtn                  | 40px      | 38px      | 38px      | 38px      | Step at MD-LG, holds through SM |
| Footer/callout typography | 16px      | 14px      | 14px      | 14px      | Step at MD-LG, holds through SM |
| Button height             | 44px      | 42px      | 42px      | 42px      | Step at MD-LG, holds through SM |
| Button typography         | 20px      | 18px      | 18px      | 18px      | Step at MD-LG, holds through SM |
| Product card internals    | unchanged | unchanged | unchanged | unchanged | Stable across all breakpoints   |

The MD-LG values have held stable for three breakpoints (MD-LG → MD → SM). The drawer remains a fixed-width 440px side panel through SM (768px). XS (below 768px) is where the layout model is expected to shift — likely full-width or near-full-width with structural changes to the product cards.

---

## XS — 428–767px

**Source frames:**

- Cart with items (isolated): `6208:9323` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6208:5997` → `[XS] 428-767px - Cart [Drawer Overlay with Products State A]`
- Empty state (isolated): `6208:9307` → `CartDrawer__Empy__HeaderB`
- Empty state (in context): `6208:5816` → `[XS] 428-767px - Cart [Drawer Overlay Empty State]`

---

### Layout model shift: side panel → centred modal

XS is the breakpoint where the cart drawer changes from a **right-aligned side panel** to a **horizontally centred near-full-width modal**. This is the most significant layout change in the cart drawer's responsive behaviour.

| Property            | SM (768–1023px)               | XS (428–767px)                                     | Delta                      |
| ------------------- | ----------------------------- | -------------------------------------------------- | -------------------------- |
| Horizontal position | `right: 12px` (right-aligned) | `left: 50%; transform: translateX(-50%)` (centred) | **Alignment model change** |
| Vertical position   | `top: 12px`                   | `top: 8px`                                         | -4px                       |
| Drawer width        | 440px                         | **414px**                                          | -26px                      |
| Content width       | 392px                         | **366px**                                          | -26px                      |
| Viewport inset      | 12px                          | **8px**                                            | -4px                       |
| Viewport coverage   | ~53% (440/834)                | **~96%** (414/430)                                 | Near-full-width            |

At a 430px viewport, the drawer (414px) leaves only 8px on each side — effectively full-width with minimal breathing room. The overlay still covers the full page.

---

### Drawer container

| Property      | SM        | XS        | Delta |
| ------------- | --------- | --------- | ----- |
| Width         | 440px     | **414px** | -26px |
| Border-radius | 20px      | 20px      | —     |
| Background    | `#FFFFFF` | `#FFFFFF` | —     |
| Overflow      | clip      | clip      | —     |

#### In-context positioning (items state)

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Position      | `left: 50%; transform: translateX(-50%); top: 8px` |
| Viewport      | 430 × 820px                                        |
| Drawer height | 804px (`820 - 2 × 8`) — viewport-constrained       |
| Overflow      | `overflow-x: clip; overflow-y: auto`               |

#### In-context positioning (empty state)

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Position      | `left: 50%; transform: translateX(-50%); top: 8px` |
| Viewport      | 430 × 820px                                        |
| Drawer height | Content-height                                     |
| Overflow      | clip                                               |

The empty state no longer carries a `min-width: 456px` floor — the viewport is too narrow for that. The drawer is simply `w: 414px` in both states.

---

### Header

Identical to SM/MD/MD-LG:

| Property           | XS value                                |
| ------------------ | --------------------------------------- |
| Padding-left       | 24px                                    |
| Padding-right      | 10px                                    |
| Padding-Y          | 24px                                    |
| Height (computed)  | 86px                                    |
| CloseBtn           | 38 × 38px, icon 10 × 10px               |
| Title "Bag"        | 24px, Regular, -0.12px, `#0C0A09`       |
| CartQuantity badge | `#F3F1F1`, pill, 12px Medium, `#5B4F4B` |

No header delta from SM.

---

### Content area

| Property      | XS value                |
| ------------- | ----------------------- |
| Padding       | 24px                    |
| Content width | 366px (`414 - 24 - 24`) |

Content width is 366px, down from 392px at SM. This is the sole driver of product card size changes — the cards use `flex-[1_0_0]` for both image and data, so both columns narrow proportionally.

---

### Product cards

Product card internals are **identical** to SM/MD/MD-LG. The cards themselves are narrower because of the reduced content width, but all spacing, typography, and component dimensions are unchanged:

| Property            | XS value                                     | SM value |
| ------------------- | -------------------------------------------- | -------- |
| Card layout         | flex row, gap 20px, align-center             | Same     |
| ProductImage        | aspect 1:1, `#F3F1F1`, rounded 16px, flex-1  | Same     |
| Badge               | `#FFFFFF`, pill, 12px Medium, `#0C0A09`      | Same     |
| ProductMeta gap     | 12px                                         | Same     |
| Meta typography     | 14px, -0.07px, leading 1.3, `#0C0A09`        | Same     |
| Pricing (recurring) | 14px + 12px frequency, gap 4px, baseline     | Same     |
| Pricing (markdown)  | strikethrough `#0C0A09` + `#E7000B`, gap 4px | Same     |
| Pricing (regular)   | 14px, `#0C0A09`                              | Same     |
| Pricing (range)     | 14px, `#0C0A09`, single text node            | Same     |
| Variant text        | 12px, `#5B4F4B`, -0.06px                     | Same     |
| ProductData gap     | 16px                                         | Same     |
| QuantitySelect      | 96 × 40px, pill, `#FBFAF9`, 14px `#5B4F4B`   | Same     |
| QuantityField gap   | 14px                                         | Same     |
| Remove link         | 12px, `#7C6D67`, -0.06px                     | Same     |
| Product list gap    | 20px                                         | Same     |

The product card is confirmed stable across all breakpoints from XL through XS — only the available width changes.

---

### Footer

| Property                 | SM            | XS            | Delta                        |
| ------------------------ | ------------- | ------------- | ---------------------------- |
| Width                    | 440px         | **414px**     | -26px (follows drawer width) |
| Padding                  | 24px          | 24px          | —                            |
| Gap                      | 24px          | 24px          | —                            |
| Border-top               | 1px `#E8E4E3` | 1px `#E8E4E3` | —                            |
| FooterPlaceholder height | 146px         | 146px         | —                            |

#### Footer typography (no delta from SM)

| Property           | XS value                                                        |
| ------------------ | --------------------------------------------------------------- |
| Subtotal font      | 14px, Regular, -0.07px, `#0C0A09`                               |
| Subtotal gap       | 12px                                                            |
| Shipping note      | 14px, Regular, -0.07px, `#5B4F4B`, leading 1.35                 |
| Checkout button    | h-42px, 18px, -0.09px, full-width, `#0C0A09` bg, `#FFFFFF` text |
| Checkout label gap | 10px                                                            |

---

### Empty state

Identical to SM in every property. The only change is the drawer width (414px → centred positioning).

| Property                | XS value                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| Content padding         | 24px                                                                   |
| Content gap             | 24px                                                                   |
| DrawerCallout gap       | 12px                                                                   |
| Callout title           | 14px, Regular, -0.07px, `#0C0A09`, leading 1.3                         |
| Callout body            | 14px, Regular, -0.07px, `#5B4F4B`, leading 1.35                        |
| "Log in" underline      | solid, offset 6%, inherits `#5B4F4B`                                   |
| "Start shopping" button | h-42px, 18px, -0.09px, auto-width, `#0C0A09` bg, mix-blend-mode darken |
| CartQuantity badge      | Absent                                                                 |

---

### Overlay

Same `OverlayLight` as all breakpoints — `rgba(251,250,249,0.5)` with `backdrop-filter: blur(32px)`. Covers the full page including MainNav.

---

### Scaling pattern updated (through XS)

| Token                     | XL/LG         | MD-LG         | MD/SM         | XS          | Pattern                       |
| ------------------------- | ------------- | ------------- | ------------- | ----------- | ----------------------------- |
| Drawer position           | right-aligned | right-aligned | right-aligned | **centred** | Side panel → modal at XS      |
| Drawer width              | 456px         | 440px         | 440px         | **414px**   | Steps at MD-LG and XS         |
| Drawer border-radius      | 24px          | 20px          | 20px          | 20px        | Step at MD-LG, holds          |
| Drawer padding            | 32px          | 24px          | 24px          | 24px        | Step at MD-LG, holds          |
| Viewport inset            | 16px          | 14px          | 12px          | **8px**     | Continuous stepping           |
| CloseBtn                  | 40px          | 38px          | 38px          | 38px        | Step at MD-LG, holds          |
| Footer/callout typography | 16px          | 14px          | 14px          | 14px        | Step at MD-LG, holds          |
| Button height             | 44px          | 42px          | 42px          | 42px        | Step at MD-LG, holds          |
| Button typography         | 20px          | 18px          | 18px          | 18px        | Step at MD-LG, holds          |
| Content width             | 392px         | 392px         | 392px         | **366px**   | First change at XS            |
| Product card internals    | unchanged     | unchanged     | unchanged     | unchanged   | Stable across all breakpoints |
| Empty min-width floor     | —             | 456px         | 456px         | **none**    | Dropped at XS                 |

The XS breakpoint introduces two interrelated changes: the drawer narrows (-26px) and repositions to centre. All interior dimensions (header, content padding, footer, typography, product cards) remain at their MD-LG plateau values. The next breakpoints (XXS, TINY) may introduce further narrowing or potentially full-bleed (no border-radius) behaviour.

---

## XXS — 375–427px

**Source frames:**

- Cart with items (isolated): `6260:3196` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6260:2905` → `[XXS] 375-427px - Cart [Drawer Overlay with Products State A]`
- Empty state (isolated): `6260:2828` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6260:2494` → `[XXS] 375-427px - Cart [Drawer Overlay Empty State]`

---

### Delta from XS: shell tightens, product cards stable

XXS continues the centred modal pattern from XS. The drawer shell takes a second round of tightening — padding drops from 24px → 22px, border-radius from 20px → 19px, CloseBtn from 38px → 36px, and the drawer narrows from 414px → 374px.

#### Drawer container

| Property       | XS      | XXS       | Delta |
| -------------- | ------- | --------- | ----- |
| Width          | 414px   | **374px** | -40px |
| Border-radius  | 20px    | **19px**  | -1px  |
| Position       | centred | centred   | —     |
| Viewport inset | 8px     | 8px       | —     |

Content width = 374 − 22 − 22 = **330px** (was 366px at XS, -36px).

#### In-context positioning (items state)

| Property           | Value                                              |
| ------------------ | -------------------------------------------------- |
| Position           | `left: 50%; transform: translateX(-50%); top: 8px` |
| Viewport           | 390 × 720px                                        |
| Drawer height      | 704px (`720 - 2 × 8`) — viewport-constrained       |
| Left/right margins | 8px each (`(390 - 374) / 2`)                       |
| Viewport coverage  | ~96% (374/390)                                     |
| Overflow           | `overflow-x: clip; overflow-y: auto`               |

#### In-context positioning (empty state)

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Position      | `left: 50%; transform: translateX(-50%); top: 8px` |
| Viewport      | 390 × 720px                                        |
| Drawer height | Content-height                                     |
| Overflow      | clip                                               |

---

### Header

| Property           | XS            | XXS           | Delta |
| ------------------ | ------------- | ------------- | ----- |
| Padding-left       | 24px          | **22px**      | -2px  |
| Padding-right      | 10px          | **9px**       | -1px  |
| Padding-Y          | 24px          | **22px**      | -2px  |
| CloseBtn           | 38 × 38px     | **36 × 36px** | -2px  |
| CloseBtn icon      | 10 × 10px     | 10 × 10px     | —     |
| Title "Bag"        | 24px, -0.12px | 24px, -0.12px | —     |
| CartQuantity badge | unchanged     | unchanged     | —     |

---

### Content area

| Property         | XS    | XXS       | Delta |
| ---------------- | ----- | --------- | ----- |
| Padding          | 24px  | **22px**  | -2px  |
| Content width    | 366px | **330px** | -36px |
| Product list gap | 20px  | 20px      | —     |

---

### Product cards

All product card internals are **identical** to XS and every prior breakpoint. The cards narrow naturally because of the reduced content width (330px), but every dimension, gap, and typography value is unchanged:

| Property             | XXS value                                   | XS value |
| -------------------- | ------------------------------------------- | -------- |
| Card layout          | flex row, gap 20px, align-center            | Same     |
| ProductImage         | aspect 1:1, `#F3F1F1`, rounded 16px, flex-1 | Same     |
| Badge                | `#FFFFFF`, pill, 12px Medium, `#0C0A09`     | Same     |
| ProductMeta gap      | 12px                                        | Same     |
| Meta typography      | 14px, -0.07px, leading 1.3, `#0C0A09`       | Same     |
| All pricing variants | unchanged                                   | Same     |
| Variant text         | 12px, `#5B4F4B`, -0.06px                    | Same     |
| ProductData gap      | 16px                                        | Same     |
| QuantitySelect       | 96 × 40px, pill, `#FBFAF9`, 14px `#5B4F4B`  | Same     |
| QuantityField gap    | 14px                                        | Same     |
| Remove link          | 12px, `#7C6D67`, -0.06px                    | Same     |

---

### Footer

| Property          | XS            | XXS           | Delta                  |
| ----------------- | ------------- | ------------- | ---------------------- |
| Width             | 414px         | **374px**     | -40px (follows drawer) |
| Padding           | 24px          | **22px**      | -2px                   |
| Gap               | 24px          | **22px**      | -2px                   |
| Border-top        | 1px `#E8E4E3` | 1px `#E8E4E3` | —                      |
| FooterPlaceholder | 146px         | **140px**     | -6px                   |

#### Footer typography (no delta from XS)

| Property           | XXS value                                                       |
| ------------------ | --------------------------------------------------------------- |
| Subtotal font      | 14px, Regular, -0.07px, `#0C0A09`                               |
| Subtotal gap       | 12px                                                            |
| Shipping note      | 14px, Regular, -0.07px, `#5B4F4B`, leading 1.35                 |
| Checkout button    | h-42px, 18px, -0.09px, full-width, `#0C0A09` bg, `#FFFFFF` text |
| Checkout label gap | 10px                                                            |

---

### Empty state

| Property                | XS                               | XXS      | Delta |
| ----------------------- | -------------------------------- | -------- | ----- |
| Content padding         | 24px                             | **22px** | -2px  |
| Content gap             | 24px                             | **22px** | -2px  |
| DrawerCallout gap       | 12px                             | 12px     | —     |
| Callout title           | 14px, `#0C0A09`, leading 1.3     | Same     | —     |
| Callout body            | 14px, `#5B4F4B`, leading 1.35    | Same     | —     |
| "Log in" underline      | solid, offset 6%, `#5B4F4B`      | Same     | —     |
| "Start shopping" button | h-42px, 18px, auto-width, darken | Same     | —     |
| CartQuantity badge      | Absent                           | Absent   | —     |

---

### Overlay

Same `OverlayLight` — `rgba(251,250,249,0.5)` with `backdrop-filter: blur(32px)`.

---

### Scaling pattern updated (through XXS)

| Token                     | XL/LG     | MD-LG     | MD/SM     | XS        | XXS       | Pattern                             |
| ------------------------- | --------- | --------- | --------- | --------- | --------- | ----------------------------------- |
| Drawer position           | right     | right     | right     | centred   | centred   | Side panel → modal at XS, holds     |
| Drawer width              | 456px     | 440px     | 440px     | 414px     | **374px** | Steps at MD-LG, XS, XXS             |
| Drawer border-radius      | 24px      | 20px      | 20px      | 20px      | **19px**  | Steps at MD-LG and XXS              |
| Drawer/content padding    | 32px      | 24px      | 24px      | 24px      | **22px**  | Steps at MD-LG and XXS              |
| Footer gap                | 24px      | 24px      | 24px      | 24px      | **22px**  | Holds through XS, steps at XXS      |
| Viewport inset            | 16px      | 14px      | 12px      | 8px       | 8px       | Steps through XS, holds             |
| CloseBtn                  | 40px      | 38px      | 38px      | 38px      | **36px**  | -2px at MD-LG, holds, -2px at XXS   |
| Header pl / pr            | 32/17     | 24/10     | 24/10     | 24/10     | **22/9**  | Tracks padding (pr is padding - 13) |
| Footer/callout typography | 16px      | 14px      | 14px      | 14px      | 14px      | Step at MD-LG, holds                |
| Button height             | 44px      | 42px      | 42px      | 42px      | 42px      | Step at MD-LG, holds                |
| Button typography         | 20px      | 18px      | 18px      | 18px      | 18px      | Step at MD-LG, holds                |
| Content width             | 392px     | 392px     | 392px     | 366px     | **330px** | Steps at XS and XXS                 |
| FooterPlaceholder         | 168px     | 146px     | 146px     | 146px     | **140px** | Steps at MD-LG and XXS              |
| Product card internals    | unchanged | unchanged | unchanged | unchanged | unchanged | Stable across all breakpoints       |

---

## TINY — <375px

**Source frames:**

- Cart with items (isolated): `6260:5285` → `CartDrawer__Products__HeaderB`
- Cart with items (in context): `6260:5377` → `[TINY] <375px - Cart [Drawer Overlay with Products State A]`
- Empty state (isolated): `6260:5151` → `CartDrawer__Empty__HeaderB`
- Empty state (in context): `6260:4839` → `[TINY] <375px - Cart [Drawer Overlay Empty State]`

---

### Delta from XXS: final tightening pass

TINY continues the centred modal pattern and applies a third shell tightening pass. Padding drops from 22px → 20px, and the CloseBtn takes a larger step (-4px) with the icon itself scaling down for the first time (10px → 9px). Border-radius holds at 19px — no full-bleed at any breakpoint.

#### Drawer container

| Property       | XXS     | TINY      | Delta |
| -------------- | ------- | --------- | ----- |
| Width          | 374px   | **346px** | -28px |
| Border-radius  | 19px    | 19px      | —     |
| Position       | centred | centred   | —     |
| Viewport inset | 8px     | **7px**   | -1px  |

Content width = 346 − 20 − 20 = **306px** (was 330px at XXS, -24px).

#### In-context positioning (items state)

| Property           | Value                                              |
| ------------------ | -------------------------------------------------- |
| Position           | `left: 50%; transform: translateX(-50%); top: 7px` |
| Viewport           | 360 × 640px                                        |
| Drawer height      | 626px (`640 - 2 × 7`) — viewport-constrained       |
| Left/right margins | 7px each (`(360 - 346) / 2`)                       |
| Viewport coverage  | ~96% (346/360)                                     |
| Overflow           | `overflow-x: clip; overflow-y: auto`               |

#### In-context positioning (empty state)

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Position      | `left: 50%; transform: translateX(-50%); top: 7px` |
| Viewport      | 360 × 640px                                        |
| Drawer height | Content-height                                     |
| Overflow      | clip                                               |

---

### Header

| Property           | XXS           | TINY          | Delta                         |
| ------------------ | ------------- | ------------- | ----------------------------- |
| Padding-left       | 22px          | **20px**      | -2px                          |
| Padding-right      | 9px           | **8px**       | -1px                          |
| Padding-Y          | 22px          | **20px**      | -2px                          |
| CloseBtn           | 36 × 36px     | **32 × 32px** | -4px                          |
| CloseBtn icon      | 10 × 10px     | **9 × 9px**   | -1px (first icon size change) |
| Title "Bag"        | 24px, -0.12px | 24px, -0.12px | —                             |
| CartQuantity badge | unchanged     | unchanged     | —                             |

The CloseBtn takes a larger step at TINY (-4px vs -2px at prior breakpoints) and the icon itself shrinks for the first time. The `p-[8px]` internal padding remains constant, but the outer size drops from 36px to 32px. The visual button is 32 × 32px, which is below the 44 × 44px WCAG 2.5.5 (AAA) target size recommendation. Surrounding non-interactive whitespace does not increase the interactive hit area. Implementation should consider adding transparent padding or `min-width`/`min-height: 44px` to meet the recommendation.

---

### Content area

| Property         | XXS   | TINY      | Delta |
| ---------------- | ----- | --------- | ----- |
| Padding          | 22px  | **20px**  | -2px  |
| Content width    | 330px | **306px** | -24px |
| Product list gap | 20px  | 20px      | —     |

---

### Product cards

All product card internals remain **identical** — the ninth consecutive breakpoint with zero changes. Cards narrow to fit the 306px content width, but every dimension is unchanged:

| Property             | TINY value                                  |
| -------------------- | ------------------------------------------- |
| Card layout          | flex row, gap 20px, align-center            |
| ProductImage         | aspect 1:1, `#F3F1F1`, rounded 16px, flex-1 |
| Badge                | `#FFFFFF`, pill, 12px Medium, `#0C0A09`     |
| ProductMeta gap      | 12px                                        |
| Meta typography      | 14px, -0.07px, leading 1.3, `#0C0A09`       |
| All pricing variants | unchanged                                   |
| Variant text         | 12px, `#5B4F4B`, -0.06px                    |
| ProductData gap      | 16px                                        |
| QuantitySelect       | 96 × 40px, pill, `#FBFAF9`, 14px `#5B4F4B`  |
| QuantityField gap    | 14px                                        |
| Remove link          | 12px, `#7C6D67`, -0.06px                    |

---

### Footer

| Property          | XXS           | TINY          | Delta                  |
| ----------------- | ------------- | ------------- | ---------------------- |
| Width             | 374px         | **346px**     | -28px (follows drawer) |
| Padding           | 22px          | **20px**      | -2px                   |
| Gap               | 22px          | **20px**      | -2px                   |
| Border-top        | 1px `#E8E4E3` | 1px `#E8E4E3` | —                      |
| FooterPlaceholder | 140px         | **134px**     | -6px                   |

#### Footer typography (no delta from XXS)

| Property           | TINY value                                                      |
| ------------------ | --------------------------------------------------------------- |
| Subtotal font      | 14px, Regular, -0.07px, `#0C0A09`                               |
| Subtotal gap       | 12px                                                            |
| Shipping note      | 14px, Regular, -0.07px, `#5B4F4B`, leading 1.35                 |
| Checkout button    | h-42px, 18px, -0.09px, full-width, `#0C0A09` bg, `#FFFFFF` text |
| Checkout label gap | 10px                                                            |

---

### Empty state

| Property                | XXS                              | TINY     | Delta |
| ----------------------- | -------------------------------- | -------- | ----- |
| Content padding         | 22px                             | **20px** | -2px  |
| Content gap             | 22px                             | **20px** | -2px  |
| DrawerCallout gap       | 12px                             | 12px     | —     |
| Callout title           | 14px, `#0C0A09`, leading 1.3     | Same     | —     |
| Callout body            | 14px, `#5B4F4B`, leading 1.35    | Same     | —     |
| "Log in" underline      | solid, offset 6%, `#5B4F4B`      | Same     | —     |
| "Start shopping" button | h-42px, 18px, auto-width, darken | Same     | —     |
| CartQuantity badge      | Absent                           | Absent   | —     |

---

### Overlay

Same `OverlayLight` — `rgba(251,250,249,0.5)` with `backdrop-filter: blur(32px)`.

---

## Final scaling pattern (all breakpoints)

| Token                         | XL/LG        | MD-LG        | MD/SM        | XS           | XXS          | TINY         |
| ----------------------------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| Drawer position               | right        | right        | right        | centred      | centred      | centred      |
| Drawer width                  | 456px        | 440px        | 440px        | 414px        | 374px        | **346px**    |
| Drawer border-radius          | 24px         | 20px         | 20px         | 20px         | 19px         | 19px         |
| Drawer/content/footer padding | 32px         | 24px         | 24px         | 24px         | 22px         | **20px**     |
| Footer gap                    | 24px         | 24px         | 24px         | 24px         | 22px         | **20px**     |
| Viewport inset                | 16px         | 14px         | 12px         | 8px          | 8px          | **7px**      |
| CloseBtn size                 | 40px         | 38px         | 38px         | 38px         | 36px         | **32px**     |
| CloseBtn icon                 | 10px         | 10px         | 10px         | 10px         | 10px         | **9px**      |
| Header pl / pr                | 32/17        | 24/10        | 24/10        | 24/10        | 22/9         | **20/8**     |
| Footer/callout typography     | 16px         | 14px         | 14px         | 14px         | 14px         | 14px         |
| Button height                 | 44px         | 42px         | 42px         | 42px         | 42px         | 42px         |
| Button typography             | 20px         | 18px         | 18px         | 18px         | 18px         | 18px         |
| Content width                 | 392px        | 392px        | 392px        | 366px        | 330px        | **306px**    |
| FooterPlaceholder             | 168px        | 146px        | 146px        | 146px        | 140px        | **134px**    |
| Title "Bag"                   | 24px         | 24px         | 24px         | 24px         | 24px         | 24px         |
| CartQuantity badge            | 12px         | 12px         | 12px         | 12px         | 12px         | 12px         |
| Product card internals        | unchanged    | unchanged    | unchanged    | unchanged    | unchanged    | unchanged    |
| Overlay                       | OverlayLight | OverlayLight | OverlayLight | OverlayLight | OverlayLight | OverlayLight |

### Responsive behaviour summary

The cart drawer's responsive strategy uses **three tiers**:

1. **LG/XL (≥1440px):** Full-size right-aligned side panel. 456px fixed width, 32px padding, 24px border-radius. The drawer is a companion panel alongside page content.

2. **MD-LG through SM (768–1439px):** Tightened right-aligned side panel. Padding drops to 24px, border-radius to 20px, footer/button typography scales down one step (16→14px, 20→18px). The drawer at 440px still operates as a side panel (covers ~53% of viewport at SM's narrowest).

3. **XS through TINY (<768px):** Centred near-full-width modal. The drawer repositions to horizontal centre, covering ~96% of viewport width at each breakpoint. Padding steps down progressively (24→22→20px), border-radius holds at 19–20px (never goes full-bleed). CloseBtn shrinks through this range (38→36→32px).

Throughout all breakpoints, **product card internals are completely immune to breakpoint changes**. The horizontal layout, typography, spacing, QuantitySelect dimensions, and badge styling never change — only the available content width varies. This means the product cards can be built once and will naturally adapt via flex layout.

### CSS implementation note

For CSS, the drawer shell can be expressed as:

- `width: var(--drawer-width)` where the custom property steps per breakpoint
- `padding: var(--drawer-padding)` with four values (32, 24, 22, 20)
- `border-radius: var(--drawer-radius)` with three values (24, 20, 19)
- Position switches from `right: var(--drawer-inset); top: var(--drawer-inset)` to `left: 50%; transform: translateX(-50%); top: var(--drawer-inset)` at XS
- The header padding-right consistently tracks `padding - 12px` (17=32-15 at LG, 10=24-14, 9=22-13, 8=20-12) — close but not an exact formula; best set explicitly

---

## No new colours

All colours across every breakpoint are established values. No new colour candidates from the cart drawer extraction.

---

## Open items

- [x] Title "Bag" colour confirmed as `#0C0A09` — MCP had rounded to `#000000`
- [x] XL breakpoint — no delta from LG (fixed-width component)
- [x] MD-LG breakpoint — first real deltas: padding tightens, footer/button typography scales down
- [x] Empty state min-width at MD-LG — intentional style choice (456px floor), not a stale constraint
- [x] MD breakpoint — sole delta is viewport inset (14px → 12px); drawer interior identical to MD-LG
- [x] SM breakpoint — no delta from MD; drawer is identical fixed-width side panel
- [x] XS breakpoint — layout model shift: right-aligned → centred; drawer narrows to 414px; inset 8px
- [x] XXS breakpoint — shell tightens (padding 22px, border-radius 19px, CloseBtn 36px); drawer 374px
- [x] TINY breakpoint — final tightening (padding 20px, CloseBtn 32px with 9px icon); drawer 346px
- [ ] Quantity +/- interaction states — no hover/pressed frames provided for this extraction
- [ ] Remove link interaction — underline on hover? colour change?
- [ ] Product card hover/press states within cart context
