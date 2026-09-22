# AGENTS.md — SiteOps (homework instance)

> This is what the SiteOps product repository's `AGENTS.md` would be. In this
> workshop repo it lives under `docs/homework/session-2/` so the course artifacts
> stay together. `CLAUDE.md` in a real SiteOps repo would contain one line:
> `@AGENTS.md`.

## Purpose

Tell any coding or design agent what SiteOps is, which files are binding, in what
order to read them, and what it must never do.

## Required read order

1. This file.
2. `MEMORY.md` (Session 3 folder) — verified facts, do not re-derive them.
3. The task's scope: which screen, component, or flow.
4. The nearest source of truth for that scope (see trust order).
5. Before finishing: update `MEMORY.md` if you verified a new fact, and cite rule IDs (`RULE-###`, `A11Y-###`, `AC-SOPS-###`) in your summary.

## Trust order for context

When documents conflict, trust in this order:

1. `AGENTS.md` (this file)
2. `MEMORY.md`
3. `PRD.md` (`docs/homework/session-1/03-PRD.md`) for **what** exists and its acceptance criteria
4. `UX.md` for **behaviour**, hierarchy, states, copy, glossary
5. `DESIGN.md` for **visuals**, tokens, size tiers, icons
6. `A11Y.md` for accessibility constraints on both of the above
7. Component specs in `docs/homework/session-3/components/`
8. Live code

Precedence between contracts, as the course teaches it: `UX.md` beats `PRD.md`
on flow; `DESIGN.md` is binding on visuals; `A11Y.md` constrains both and cannot
be overridden by either.

## Guardrails

- Never invent a requirement, a token, a term, or a research finding. If it is not in a contract, ask, or output it under a heading "Proposed additions" and stop.
- Never present `inferred` or `suggested` context from `UX.md` as fact in generated copy or docs.
- Never use a primitive colour value in UI code; semantic tokens only.
- Never make anything interactive smaller than the size tier for its surface.
- Never remove focus styles, add `tabindex` > 0, or hide content from assistive technology to pass a check.
- Never write evidence photos to the device gallery or any storage outside the central bucket.
- Never enable `Done` without an attached photo (RULE-005).
- Never store or echo secrets. MCP bearer tokens come from the environment.

## Conventions

- Language: Thai UI copy; identifiers, code, and commit messages in English.
- IDs: `UC-`, `FR-SOPS-`, `AC-SOPS-`, `BR-SOPS-`, `FLOW-SOPS-` from the PRD; `USER-`, `WORLD-`, `INS-`, `RULE-`, `GAP-` from `UX.md`; `A11Y-` from `A11Y.md`. Reference them; do not renumber.
- Components: shadcn/ui primitives wrapped as SiteOps components; one folder per component with the five-file set described in `docs/homework/session-3/CONVENTIONS.md`.
- Tests accompany every behaviour change; accessibility gate runs on every screen.
- Branch + PR always; never push to `main`; never force-push or amend.

## Playbooks

### Generate a screen (Stitch / Figma Make / code)
1. Read PRD section for the screen → list the FRs and ACs it must satisfy.
2. Read `UX.md` rules that apply; note their strength.
3. Read `DESIGN.md` components you must reuse.
4. Use the prompt in `docs/homework/session-2/prompts/` as the template.
5. After generation, self-check against RULE-001/003/005/006 and A11Y-007; list violations before showing the result.

### Fix accessibility
1. Run the axe gate; collect rule IDs.
2. For each violation, find the `A11Y-###` rule and fix per its text.
3. Re-run the gate; re-run the target-size check.
4. Summarise per rule ID.

### Add or change a component
Follow `docs/homework/session-3/CONVENTIONS.md`. Spec first (`<component>.md`), then guide, then code, then test.

## Definition of done for agent output

- Cites the FR/AC and RULE/A11Y IDs it satisfies.
- Lists anything it could not satisfy and why, instead of silently omitting it.
- Adds no new terms outside the glossary.
- Leaves `MEMORY.md` updated if a fact was verified.
