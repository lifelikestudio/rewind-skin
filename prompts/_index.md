# Prompt Library — Rewind Skin V3

Reusable prompt templates for agent workflows. Reference by @-mentioning in Cursor or using `/` commands in Claude Code.

## Available prompts

| Prompt | File | Purpose |
|--------|------|---------|
| Extract Tokens | `extract-tokens.md` | Extract design values from a Figma frame (component or page-level) |
| Build Section | `build-section.md` | Build a Shopify 2.0 Liquid section from an extracted component spec |

## Slash commands (Claude Code)

| Command | File | Purpose |
|---------|------|---------|
| `/extract-section` | `.claude/commands/extract-section.md` | Runs the extraction workflow |
| `/build-section` | `.claude/commands/build-section.md` | Builds a section from a component spec |

## Agents (Claude Code)

| Agent | File | Purpose |
|-------|------|---------|
| theme-lint | `.claude/agents/theme-lint.md` | Runs `shopify theme check`, reports by severity |
| token-audit | `.claude/agents/token-audit.md` | Scans templates for hardcoded values that should reference the design system |
