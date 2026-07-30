# Prompt: Build a Liquid Section from Spec

## Before starting

1. Read `docs/component-inventory.md` — find the component and confirm it's been extracted
2. Read the relevant extraction log in `design-system/extractions/` — this has all values, responsive deltas, states, and behaviour
3. Read `design-system/tokens.css` — check which tokens are populated
4. Check `src/capsize-v3.js` — see which text styles already exist

## Steps

1. **Review the extraction log.** Understand the component's structure, responsive behaviour across all breakpoints, states, and transitions. Ask George to clarify anything ambiguous.

2. **Determine Liquid vs React.** Default to Liquid. If interactivity suggests React may be warranted, discuss with George before proceeding.

3. **Identify text styles.** Cross-reference the extraction log's typography values against existing Capsize text styles in `src/capsize-v3.js`. If new text styles are needed, define them with responsive font-size/line-height per breakpoint and regenerate `assets/capsize-v3.css`.

4. **Plan the section schema.** For each setting: type, id, label, default, info text. Blocks for repeating elements. At least one preset. Present the schema plan to George for approval before writing code.

5. **Write the Liquid section file.** Schema at the bottom. Clean, commented markup. Tailwind utility classes for styling. Capsize classes for text. Mobile-first responsive classes. Assign complex logic to variables before markup.

6. **Write any supporting snippets.** Reusable sub-components go in `snippets/`. Use `render` to include them.

7. **Run `shopify theme check`.** Fix any errors. Report warnings.

## For React island sections

Only when agreed with George that React is warranted:

1. Write the Liquid container section (mount point + data attributes)
2. Write the React component
3. Verify build compilation

## Quality checks

- [ ] Section is fully customisable from theme editor
- [ ] All values reference Tailwind config / design system — no hardcoded hex or px
- [ ] Text styles use Capsize classes — no raw font-size/line-height
- [ ] Schema has typed settings with labels and defaults
- [ ] Responsive behaviour matches extraction log (all breakpoints)
- [ ] States and transitions match behaviour documentation
- [ ] `shopify theme check` passes with 0 errors
- [ ] Accessibility: semantic markup, ARIA, keyboard navigation, focus management
- [ ] Canadian English in all copy and labels
- [ ] Component inventory updated with build status
