---
name: token-audit
description: "Audits Liquid templates for hardcoded values that should reference the design system."
tools:
  - bash
  - read_file
---

# Token Audit Agent

Scan template files for hardcoded values that should be design system references.

## Flag

- Hex colour values in Liquid templates or inline styles
- Pixel values for spacing/sizing in inline styles
- Tailwind arbitrary values like `text-[16px]` or `bg-[#000000]`
- Raw `font-size` or `line-height` declarations that should be Capsize classes
- Raw font-family, font-weight declarations

## Acceptable

- Tailwind classes referencing the custom config (`@theme inline` values)
- CSS custom properties in component CSS files
- Values in `src/v3.input.css` itself (that's where tokens are defined)
- Values in `src/capsize-v3.js` (that's where text styles are defined)
- SVG-specific attributes

## Scope

Scan `sections/` and `snippets/`. Report findings grouped by file with line numbers. For each finding, suggest the correct token/class if one exists in the design system, or flag as missing from the token set.
