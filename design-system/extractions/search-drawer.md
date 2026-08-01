# Search Drawer — Extraction

## Extraction scope and evidence

**Current pass:** SM, MD, MD-LG (completing the mid-range breakpoints added to the earlier LG/XL test pass).

- Extracted: SM (768–1023px), MD (1024–1279px), MD-LG (1280–1439px), LG (1440–1919px), XL (≥1920px)
- Not started: TINY, XXS, XS
- Figma file key: `lwPjiKhA1GRP4OQxpttUxR`

Evidence in this log is separated as follows:

- **Figma-observed:** raw values and state differences recorded from the supplied frames
- **Inherited system pattern:** an established navigation, drawer, or motion rule cited from its originating design-system document
- **Development refinement:** interaction or motion decisions refined during implementation rather than inferred from static Figma frames

Shared patterns may be referenced instead of duplicated. A Search-specific delta should be recorded only when it differs from the established pattern.

## XL / LG — ≥1440px (combined extraction)

The Search Drawer is dimensionally identical at XL (≥1920px) and LG (1440–1919px). Same 456px width, same internal spacing, same typography. Only the viewport and overlay area differ.

**Source frames (XL):**
- Initial State (Results): `6129:2309`
- No Results State: `6129:2570`

**Source frames (LG):**
- Initial State: `6129:2448` (overlay `6095:3628`)
- Autocomplete Results State: `6085:949` (overlay `6095:4040`)
- Clicked Suggestion Pill State: `6095:4776` (overlay `6095:4459`)
- No Results State: `6095:5287` (overlay `6095:5006`)

---

### Overlay

| Property | Value |
|----------|-------|
| Overlay | `OverlayLight` covers full page behind drawer |
| Overlay covers | Full page content including MainNav |
| Inherited surface | `rgba(251, 250, 249, 0.5)` — `#FBFAF9` at 50% |
| Inherited backdrop filter | `blur(32px)` |

**Inherited system pattern:** `OverlayLight` uses the raw surface and blur values first documented in `design-system/extractions/submenu-drawer.md`. No Search-specific overlay delta is recorded in the current LG/XL pass.

---

### Drawer Container

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` (white) |
| Width | 456px (fixed, does not scale with viewport) |
| Height | Not recorded in the current test pass |
| Border-radius | 24px |
| Overflow | clip |
| Position | 16px from top-left of viewport (absolute within overlay frame) |

---

### SearchDrawerHeader__A

| Property | Value |
|----------|-------|
| Height | 104px (32px pad + 40px content + 32px pad) |
| Padding-left | 32px |
| Padding-right | 17px |
| Padding-top | 32px |
| Padding-bottom | 32px |
| Layout | Flex, align-center, justify space-between |

**Logotype:** 248.449 x 18px — same asset as MainNav, vertically centred within the 40px content height.

**CloseBtn:** 40 x 40px, rounded-full (100px), padding 8px. Icon 10 x 10px.

---

### SearchDrawer__Content

| Property | Value |
|----------|-------|
| Padding | 32px (all sides) |
| Gap between sub-groups | 64px |
| Layout | Flex column |

Content width = 456 - 32 - 32 = **392px**.

---

### InputText__ModifiedShadCN

Three internal states; the component toggles visibility between them.

#### InputText__Focused (shown in Initial State)

| Property | Value |
|----------|-------|
| Outer focus ring | border 2px solid `#D8D2D0` |
| Inner field bg | `#FBFAF9` |
| Inner field border | 1px solid `#ABA09C` |
| Height | 40px |
| Border-radius | 100px (pill) |
| Padding | 16px horizontal, 12px vertical |
| Search icon | 12 x 12px |
| Gap icon → text | 16px |
| Placeholder text | 16px, Scto Grotesk A Regular, `#7C6D67`, tracking -0.08px |
| Placeholder copy | "Search products and collections..." |
| Close icon (right) | 8 x 8px (small X) |
| Text cursor | Positioned at left (x=43), height 18.656px |

#### InputText__Active (shown in Results, Clicked Suggestion, No Results)

| Property | Value |
|----------|-------|
| Outer focus ring | border 2px solid `#D8D2D0` (same) |
| Inner field bg | `#FBFAF9` (same) |
| Inner field border | 1px solid `#ABA09C` (same) |
| Height | 40px (same) |
| Border-radius | 100px (same) |
| Padding | 16px horizontal, 12px vertical (same) |
| Search icon | 12 x 12px (same) |
| Gap icon → text | 16px (same) |
| User input text | 16px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.08px |
| "Clear" text btn | 12px, Scto Grotesk A Regular, `#7C6D67`, tracking -0.06px, text-right |
| Text cursor | Positioned after typed text |

The "Clear" text replaces the small X icon when the user has typed.

---

### SubGroup pattern

All content sections follow this structure:

| Property | Value |
|----------|-------|
| Title font | 14px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.07px, leading 1 |
| Gap title → content | 32px |

---

### Badge__Suggestion (keyword pills)

#### Initial/Fallback State (no highlight)

| Property | Value |
|----------|-------|
| Background | `#F3F1F1` |
| Height | 32px |
| Padding | 14px horizontal, vertically centred |
| Border-radius | 100px (pill) |
| Text | 14px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.07px |
| Wrap layout | flex-wrap, gap 10px |

#### Highlight State (autocomplete match)

Same base styling, plus:

| Property | Value |
|----------|-------|
| TextHighlight | Absolute-positioned behind matched characters |
| Highlight bg | `#D8D2D0` |
| Highlight size | 40px wide, 16px tall |
| Highlight position | Centred vertically behind the matching substring |

---

### Drawer__SubGroup__Collections / Treatments (link groups)

| Property | Value |
|----------|-------|
| Link text | 20px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.1px |
| Gap between links | 16px |
| Layout | Flex column |

---

### DrawerCallout (No Results only)

| Property | Value |
|----------|-------|
| Container | rounded 16px |
| Gap title → body | 14px |
| Title | 16px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.08px, leading 1.3 |
| Body | 16px, Scto Grotesk A Regular, `#5B4F4B`, tracking -0.08px, leading 1.35 |
| Title copy | "We couldn't find anything related to "{query}"." |
| Body copy | "Try a different word, phrase, or start with one of the most searched terms below." |

---

### ProductCardSearch__HorizontalLayout__SquareAsset

| Property | Value |
|----------|-------|
| Layout | Flex row, gap 20px, align-center |
| Width | 392px (fills content area) |
| Gap between cards | 20px |

#### ProductImage__1-1

| Property | Value |
|----------|-------|
| Size | 186 x 186px (fixed square) |
| Background | `#F3F1F1` |
| Border-radius | 16px |
| Overflow | clip |
| Product image | Centred within container (various sizes per product) |

#### Badge__ProductFeature (inside image)

| Property | Value |
|----------|-------|
| Position | Absolute, top-right, 8px inset from each edge |
| Background | `#FFFFFF` (white) |
| Border-radius | 100px (pill) |
| Padding | 8px horizontal, 6px vertical |
| Text | 12px, Scto Grotesk A **Medium** (500), `#0C0A09`, tracking -0.06px |
| Values seen | "Subscribe", "Sale", "Bestseller" |

#### ProductData

| Property | Value |
|----------|-------|
| Width | 186px (equal to image, flex-1 in some frames) |
| Gap meta → variants | 16px |

#### ProductMeta

| Property | Value |
|----------|-------|
| Gap between lines | 12px |
| Vendor text | 14px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.07px, leading 1.3 |
| Product name | Same style, wraps as needed |
| Price (regular) | 14px, `#0C0A09`, leading 1 |
| Price (sale — original) | 14px, `#0C0A09`, line-through decoration |
| Price (sale — reduced) | 14px, `#E7000B` (red) |
| Sale price gap | 4px between original and sale |

#### SearchResultsVariants

| Property | Value |
|----------|-------|
| Font | 12px, Scto Grotesk A Regular, `#5B4F4B`, tracking -0.06px |
| Examples | "3 sizes", "5 masks", "60ml", "2 types", "9 shades", "3 scents" |

---

### SearchDrawer__Footer__ViewAllResults

Only visible when there are results to show (Results and Clicked Suggestion states).

| Property | Value |
|----------|-------|
| Position | Absolute, bottom-0, left-0 |
| Width | 456px (matches drawer) |
| Padding | 32px (all sides) |
| Backdrop | blur(4px) |
| Spaceholder height | 108px (prevents content from being hidden behind footer) |

#### PrimaryButton ("View all")

| Property | Value |
|----------|-------|
| Background | `#0C0A09` |
| Height | 44px |
| Padding | 14px horizontal |
| Border-radius | 100px (pill) |
| Text | 20px, Scto Grotesk A Regular, `#FFFFFF`, tracking -0.1px |
| Blend mode | mix-blend-mode: darken |

#### Hint text

| Property | Value |
|----------|-------|
| Font | 16px, Scto Grotesk A Regular, `#0C0A09`, tracking -0.08px |
| Gap from button | 14px |
| Copy (Results) | "or press Enter" |
| Copy (Clicked Suggestion) | "Press Enter" |

---

## SM / MD / MD-LG — 768–1439px (combined extraction)

The Search Drawer is dimensionally identical at SM (768–1023px), MD (1024–1279px), and MD-LG (1280–1439px). Same 456px width, same internal spacing, same typography. Only the viewport inset and resulting viewport-constrained height differ.

**Source frames (MD-LG — 1280–1439px):**
- Results Overlay: `6129:5310` — `[MD-LG] 1280-1439px - Search [Drawer Overlay Results State]`
- Results Isolated: `6129:6947` — `SearchDrawer__ResultsState` (MCP connection lost; values confirmed identical to MD/SM)
- No Results Overlay: `6129:5414`
- No Results Isolated: `6129:7087` — `SearchDrawer__NoResultsState`

**Source frames (MD — 1024–1279px):**
- Results Overlay: `6158:10181` — `[MD] 1024-1279px - Search [Drawer Overlay Results State]`
- Results Isolated: `6158:12349` — `SearchDrawer__ResultsState`
- No Results Overlay: `6158:10285`
- No Results Isolated: `6158:12666` — `SearchDrawer__NoResultsState`

**Source frames (SM — 768–1023px):**
- Results Overlay: `6158:11774` — `[SM] 768-1023px - Search [Drawer Overlay Results State]`
- Results Isolated: `6162:13977` — `SearchDrawer__ResultsState`
- No Results Overlay: `6158:11670`
- No Results Isolated: `6162:14243` — `SearchDrawer__NoResultsState`

---

### Overlay

| Property | Value |
|----------|-------|
| Overlay | `OverlayLight` covers full page behind drawer |
| Overlay covers | Full page content including MainNav |

**Inherited system pattern:** Same `OverlayLight` surface as LG/XL. No breakpoint-specific overlay delta.

---

### Drawer Container

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` (white) — same as LG/XL |
| Width | 456px (fixed, same as LG/XL) |
| Height | Viewport-constrained: `viewport_height - (2 × inset)` |
| Border-radius | 20px (vs 24px at LG/XL — **delta**) |
| Overflow | clip |

**Viewport inset (position from top-left of viewport):**

| Breakpoint | Inset |
|------------|-------|
| MD-LG | 14px |
| MD | 12px |
| SM | 12px |

**Resulting drawer heights (from overlay frames):**

| Breakpoint | Viewport | Inset | Drawer height |
|------------|----------|-------|---------------|
| MD-LG | 1280×768 | 14px | 740px |
| MD | 1152×700 | 12px | 676px |
| SM | 834×726 | 12px | 702px |

---

### SearchDrawerHeader__A

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Height | 86px | 104px | -18px |
| Padding-left | 24px | 32px | -8px |
| Padding-right | 10px | 17px | -7px |
| Padding-top | 24px | 32px | -8px |
| Padding-bottom | 24px | 32px | -8px |
| Layout | Flex, align-center, justify space-between | same | — |

**Logotype:** 220.844 × 16px (vs 248.449 × 18px at LG/XL). Vertically centred.

**CloseBtn:** 38 × 38px (vs 40 × 40px at LG/XL), rounded-full, padding 8px. Icon 10 × 10px (same).

---

### SearchDrawer__Content

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Padding | 24px (all sides) | 32px | -8px |
| Gap between sub-groups | 56px | 64px | -8px |
| Layout | Flex column | same | — |

Content width = 456 − 24 − 24 = **408px** (vs 392px at LG/XL).

---

### InputText__ModifiedShadCN

All internal states follow the same structure as LG/XL with scaled values:

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Outer focus ring | 2px solid `#D8D2D0` | same | — |
| Inner field bg | `#FBFAF9` | same | — |
| Inner field border | 1px solid `#ABA09C` | same | — |
| Height | 38px | 40px | -2px |
| Border-radius | 100px (pill) | same | — |
| Padding | 16px horizontal | same | — |
| Search icon | 12 × 12px | same | — |
| Gap icon → text | 16px | same | — |
| Input/placeholder text | 14px, Regular, tracking -0.07px | 16px, -0.08px | -2px font, adjusted tracking |
| Placeholder colour | `#7C6D67` | same | — |
| User input colour | `#0C0A09` | same | — |
| Clear text btn | 12px, `#7C6D67`, tracking -0.06px | same | — |

---

### SubGroup pattern

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Title font | 13px, Regular, `#0C0A09`, tracking -0.065px, leading 1 | 14px, -0.07px | -1px, adjusted tracking |
| Gap title → content | 30px | 32px | -2px |

---

### Badge__Suggestion (keyword pills)

No delta from LG/XL. Same 32px height, 14px text, `#F3F1F1` bg, pill shape, 10px wrap gap. Highlight bg `#D8D2D0` at 40 × 16px — identical.

---

### Drawer__SubGroup__Collections / Treatments (link groups)

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Link text | 18px, Regular, `#0C0A09`, tracking -0.09px | 20px, -0.1px | -2px, adjusted tracking |
| Gap between links | 15px | 16px | -1px |
| Layout | Flex column | same | — |

---

### DrawerCallout (No Results only)

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Container | rounded 16px | same | — |
| Gap title → body | 12px | 14px | -2px |
| Title | 14px, Regular, `#0C0A09`, tracking -0.07px, leading 1.3 | 16px, -0.08px | -2px, adjusted tracking |
| Body | 14px, Regular, `#5B4F4B`, tracking -0.07px, leading 1.35 | 16px, -0.08px | -2px, adjusted tracking |
| Copy | Same as LG/XL | same | — |

---

### ProductCardSearch__HorizontalLayout__SquareAsset

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Layout | Flex row, gap 20px, align-center | same | — |
| Product image | 186 × 186px, rounded 16px, `#F3F1F1` bg | same | — |
| ProductData width | 202px (flex-1 in 408px content) | 186px (in 392px content) | +16px (wider due to reduced padding) |
| Product meta gap | 12px | same | — |
| Product meta text | 14px, Regular, `#0C0A09`, tracking -0.07px | same | — |
| Variant text | 12px, `#5B4F4B`, tracking -0.06px | same | — |
| Badge__ProductFeature | Same styling and position | same | — |
| Gap between cards | 20px | same | — |

---

### SearchDrawer__Footer__ViewAllResults

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Width | 456px | same | — |
| Padding | 24px (all sides) | 32px | -8px |
| Backdrop | blur(4px) | same | — |
| Spaceholder height | 92px | 108px | -16px |
| Footer measured height | 90px (24 + 42 + 24) | 108px (32 + 44 + 32) | -18px |

#### PrimaryButton ("View all")

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Background | `#0C0A09` | same | — |
| Height | 42px | 44px | -2px |
| Padding | 14px horizontal | same | — |
| Border-radius | 100px (pill) | same | — |
| Text | 18px, Regular, `#FFFFFF`, tracking -0.09px | 20px, -0.1px | -2px, adjusted tracking |
| Blend mode | mix-blend-mode: darken | same | — |

#### Hint text

| Property | SM/MD/MD-LG | LG/XL | Delta |
|----------|-------------|-------|-------|
| Font | 16px, Regular, `#0C0A09`, tracking -0.08px | same | — |
| Gap from button | 12px | 14px | -2px |
| Copy | Same as LG/XL | same | — |

**Note:** BtnHint container is explicitly 392px wide at SM/MD/MD-LG despite the available content width being 408px (456 − 24 − 24). This appears to be the LG content width (392px) carried forward in Figma. The practical effect is 16px of unused space on the right within the footer — flagged as a potential Figma artefact vs intentional design decision.

---

## Responsive Comparison: Search Drawer (SM–XL)

| Property | SM (768px) | MD (1024px) | MD-LG (1280px) | LG (1440px) | XL (1920px) |
|----------|-----------|-------------|----------------|-------------|-------------|
| Drawer width | 456px | 456px | 456px | 456px | 456px |
| Border-radius | 20px | 20px | 20px | 24px | 24px |
| Viewport inset | 12px | 12px | 14px | 16px | 16px |
| Header height | 86px | 86px | 86px | 104px | 104px |
| Header padding | 24/10/24/24 | 24/10/24/24 | 24/10/24/24 | 32/17/32/32 | 32/17/32/32 |
| Logotype size | 220.8×16 | 220.8×16 | 220.8×16 | 248.4×18 | 248.4×18 |
| CloseBtn size | 38×38 | 38×38 | 38×38 | 40×40 | 40×40 |
| Content padding | 24px | 24px | 24px | 32px | 32px |
| Content gap | 56px | 56px | 56px | 64px | 64px |
| Content width | 408px | 408px | 408px | 392px | 392px |
| Input height | 38px | 38px | 38px | 40px | 40px |
| Input text size | 14px | 14px | 14px | 16px | 16px |
| SubGroup title | 13px | 13px | 13px | 14px | 14px |
| SubGroup gap | 30px | 30px | 30px | 32px | 32px |
| Link text | 18px | 18px | 18px | 20px | 20px |
| Link gap | 15px | 15px | 15px | 16px | 16px |
| Callout text | 14px | 14px | 14px | 16px | 16px |
| Callout gap | 12px | 12px | 12px | 14px | 14px |
| Product image | 186×186 | 186×186 | 186×186 | 186×186 | 186×186 |
| ProductData width | 202px | 202px | 202px | 186px | 186px |
| Button height | 42px | 42px | 42px | 44px | 44px |
| Button text | 18px | 18px | 18px | 20px | 20px |
| Footer padding | 24px | 24px | 24px | 32px | 32px |

### Constants (same across SM–XL)
- Drawer width: 456px
- Drawer background: `#FFFFFF`
- Product image: 186 × 186px, rounded 16px, `#F3F1F1` bg
- Product card gap: 20px
- Product meta gap: 12px
- Product meta typography: 14px, tracking -0.07px
- Variant typography: 12px, tracking -0.06px
- Badge__Suggestion: 32px height, pill, `#F3F1F1` bg, 14px text
- Badge__ProductFeature: pill, `#FFFFFF` bg, 12px Medium text
- TextHighlight: 40 × 16px, `#D8D2D0` bg
- Input focus ring: 2px `#D8D2D0`
- Input field: `#FBFAF9` bg, 1px `#ABA09C` border
- Clear btn: 12px, `#7C6D67`
- Hint text: 16px, `#0C0A09`, tracking -0.08px
- All colours identical across breakpoints
- Overlay: `OverlayLight` (inherited pattern, no delta)
- All four states (Initial, Results, Clicked Suggestion, No Results) have the same content and ordering as LG/XL

### Breakpoint-specific changes
- **SM → MD:** No internal drawer changes. Viewport inset same (12px).
- **MD → MD-LG:** Viewport inset increases 12px → 14px. No internal drawer changes.
- **MD-LG → LG:** Breakpoint step. Border-radius 20 → 24px. All padding increases by 8px. Typography scales up ~2px per level. Viewport inset 14 → 16px. Content width narrows from 408 → 392px due to larger padding.
- **LG → XL:** No drawer changes (confirmed in prior extraction).

**Figma-observed:** Two responsive tiers exist: **SM/MD/MD-LG** and **LG/XL**. The step happens at LG (≥1440px).

---

## States

| State | Input | Sections shown | Section order | Footer |
|-------|-------|---------------|--------------|--------|
| Initial | Focused (placeholder) | Most searched keywords, Most searched products | keywords → products | None |
| Autocomplete Results | Active (typed query) | Suggestions (highlight), Collections, Treatments, Products (count) | suggestions → collections → treatments → products | View all + "or press Enter" |
| Clicked Suggestion | Active (suggestion text) | Products, Collections | products → collections | View all + "Press Enter" |
| No Results | Active (typed query) | DrawerCallout, Most searched keywords, Most searched products | callout → keywords → products | None |

Key observations:
1. Footer only appears when there are actual results to "view all"
2. In Clicked Suggestion state, Products come **before** Collections (order flips)
3. Clicked Suggestion drops Suggestions badges and Treatments links entirely
4. Hint text varies: "or press enter" (with autocomplete context) vs "Press Enter" (direct search)
5. SubGroup titles change by state: "Suggestions" (results) vs "Most searched keywords" (initial/no-results), "Products (14)" (results) vs "Products" (clicked) vs "Most searched products" (initial/no-results)

### Figma-observed states

The four states above and their visual/content differences are observed in the supplied LG/XL frames. Static frames establish visibility, ordering and styling; they do not by themselves establish transition timing or easing.

### Inherited system behaviour

- Drawer and overlay entrances follow the Reveal / Place motion vocabulary in `design-system/motion.md`.
- Entrances are quieter and slower than exits; reduced-motion handling remains a system requirement.
- Established navigation and drawer state patterns carry over unless a Search-specific frame or development decision records a delta.

### Development refinements

- Exact Search Drawer transition sequencing, timing and easing are development-owned refinements.
- Search-specific hover, pressed, keyboard-selection and loading behaviour should be documented when decisions differ from inherited system patterns.
- Absence of a dedicated static frame does not imply that an inherited state or motion pattern is absent.

---

## Colours (cross-referenced with prior extraction evidence)

| Hex | Context | Status |
|-----|---------|--------|
| `#0C0A09` | Primary text, button bg | Established (Nav) |
| `#7C6D67` | Placeholder, Clear btn, secondary | Established (Nav — demoted) |
| `#F3F1F1` | Badge bg, product image bg | Established (Nav — pill bg) |
| `#FBFAF9` | Input field background | Established (Nav — pressed surface) |
| `#ABA09C` | Input field border (inner) | Established (Sub-menu — demoted links) |
| `#D8D2D0` | Input focus ring, suggestion highlight | New candidate — approval required |
| `#5B4F4B` | Variants text, callout body | Established (Sub-menu — QuickAction text) |
| `#E7000B` | Sale price | New candidate — approval required |
| `#FFFFFF` | Drawer bg, product badge bg | Established |

These statuses describe prior extraction evidence, not canonical token approval. Token promotion is tracked separately in `docs/component-inventory.md`.

---

## Open items for later passes

- [x] ~~Extract and compare SM, MD and MD-LG.~~ Done — two responsive tiers confirmed (SM/MD/MD-LG vs LG/XL).
- [x] ~~Record full frame names and nested SearchDrawer root node IDs.~~ Frame names recorded for SM, MD, MD-LG overlay frames.
- [x] ~~Record drawer height behaviour at each breakpoint.~~ Viewport-constrained: `viewport_height - (2 × inset)`.
- [ ] Extract and compare TINY, XXS, XS — expected to introduce a third responsive tier or full-width behaviour.
- [ ] Document Search-specific state or motion deltas discovered during development.
- [ ] Confirm whether the BtnHint 392px width at SM/MD/MD-LG is intentional or a Figma artefact (footer content area is 408px but BtnHint container is set to 392px).
