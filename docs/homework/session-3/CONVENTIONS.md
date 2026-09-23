# CONVENTIONS.md — SiteOps design-system handoff

> Session 3 homework. Adapts the Wallet_Widgetbook_3.0 conventions (five-file
> widget set, generated spec vs hand-written guide, MCP trust rules) to a React +
> shadcn/ui code base. Agents read this before touching `components/`.

## 1. One component, five files

Every SiteOps component lives in one folder and has exactly these files. Missing
files mean the component is not done; extra files need a reason in the GUIDE.

| # | File | Written by | Purpose |
|---|---|---|---|
| 1 | `<name>.tsx` | human or agent | Implementation. shadcn/ui primitive wrapped with SiteOps props. |
| 2 | `<name>.stories.tsx` | agent | Storybook stories: one per variant axis value, plus every state. |
| 3 | `<name>.test.tsx` | agent | Behaviour + a11y test (axe, roles, names, target size). |
| 4 | `<name>.md` | **generated** (uSpec `/uspec` from Figma via MCP, or `uspec-sync` from code) | Machine-readable spec: API, structure, colour, voice, provenance, `render-meta`. Never edit by hand; regenerate. |
| 5 | `<NAME>_GUIDE.md` | **hand-written** | Why it exists, when to use which variant, gotchas, decisions. May contradict nothing in `<name>.md`; if it does, regenerate the spec and fix the code. |

In this homework repo the two Markdown files live under
`docs/homework/session-3/components/` because there is no product code base.
The MCP server reads them from there.

## 2. Naming

- Folder and file names: `kebab-case` (`work-order-card/`, `work-order-card.tsx`).
- Component export: `PascalCase` (`WorkOrderCard`).
- Guide: `SCREAMING_SNAKE_GUIDE.md` (`WORK_ORDER_CARD_GUIDE.md`) so it is visibly not generated.
- Spec IDs inside `<name>.md`: `CMP-<kebab>` (`CMP-work-order-card`). Cross-reference contract IDs (`RULE-`, `A11Y-`, `AC-SOPS-`) verbatim.
- Variant axis names match the prop names one-to-one.

## 3. Token rules

1. Components consume **semantic tokens only** (`--color-primary`, `--color-status-p1`). A primitive (`teal.600`, `#0B6F71`) in component code is a review blocker.
2. The token source of truth is `docs/homework/session-2/DESIGN.md` §2.2 and §9. The MCP `get_design_tokens` tool reads that file; it does not carry a copy.
3. A token missing from `DESIGN.md` is proposed under "Proposed additions" in `DESIGN.md` §6 or §10, reviewed, then used. Never invent a token in a component.
4. Sizes come from the size tier (`lg` 56, `md` 44, `sm` 36) in `DESIGN.md` §5. A component takes a `size` prop; it never hard-codes a height.
5. Contrast is enforced by test, not by promise: any new fg/bg pair must pass `check_contrast` (MCP tool) at 4.5:1 for text, 3:1 for non-text.

## 4. Spec file (`<name>.md`) contract

Front matter is YAML with these keys, in this order:

```yaml
id: CMP-button
name: Button
status: draft | ready | deprecated
source: figma:<node-id> | code:<path> | hand-authored
generated_at: <ISO date>
generator: uspec@<version> | hand
design_md_version: <DESIGN.md front-matter version the spec was generated against>
```

Body sections, in this order (headings are matched by the MCP parser, keep them exact):

1. `## Overview` — one paragraph and the **Variant axes** table
2. `## Known gaps` — what the source could not answer (`[GAP]` lines)
3. `## Follow-ups` — checklist for humans
4. `## API` — props table: name, type, default, required, description
5. `## Structure` — anatomy list, slot names
6. `## Color` — token table: element → token (light/dark are the same token name)
7. `## Voice / Screen reader` — role, accessible name rule, announcements
8. `## Cross-references` — contract IDs this component satisfies
9. `## Provenance` — where each fact came from (`figma`, `code`, `DESIGN.md`, `UX.md`, `inferred`)
10. `## render-meta` — one fenced `json` block the MCP server returns as structured data

## 5. Trust order for agents (mirrors `AGENTS.md`)

`AGENTS.md` → `MEMORY.md` → live contracts (`PRD`, `UX.md`, `DESIGN.md`, `A11Y.md`) → `<name>.md` (generated) → `<NAME>_GUIDE.md` → code.

Check before write: before adding a component, call `search_components` on the MCP
server. Before adding a token, call `get_design_tokens`. Propose, then wait for
approval; the tools are read-only on purpose (see `adr/ADR-001-remote-mcp-read-only.md`).

## 6. Definition of done for a component

- Five files present; spec regenerated after the last code change.
- Stories cover every variant axis value and every state.
- Test passes axe (WCAG 2.x A/AA tags), checks roles and names, checks target size per tier.
- `Cross-references` lists at least one `A11Y-` and one `RULE-` or `AC-SOPS-` ID.
- `MEMORY.md` updated if a fact was verified while building it.
