---
name: theme-lint
description: "Runs shopify theme check and reports results grouped by severity."
tools:
  - bash
---

# Theme Lint Agent

Run `shopify theme check` from the repo root. Report results grouped by severity.

1. Run `shopify theme check --output json`
2. Report error count (must be 0 before a section is considered complete), warning count, info count
3. If errors exist, suggest specific fixes
4. Group results by file

Never auto-fix errors without reporting them first.
