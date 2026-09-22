# MEMORY.md — verified facts for SiteOps agents

> Second in the trust order after `AGENTS.md`. Only facts that were **verified**
> (by a test, a measurement, or a stakeholder decision recorded in Session 1) go
> here, each with how it was verified and when. Agents read this so they do not
> re-derive or re-argue settled facts. Remove a line when its source changes.

| ID | Fact | Verified by | Date |
|---|---|---|---|
| MEM-001 | Field surface size tier is `lg` = 56 px; dashboard is `md` = 44 px. There is no `xs`. | `DESIGN.md` §5; stakeholder decision in `01-transcript.md` (gloves, sunlight) | 2026-09-22 |
| MEM-002 | `teal.500 #0F8B8D` on white is 4.1:1 and fails A11Y-001 for text. Light `--color-primary` is `teal.600 #0B6F71` (6.0:1). | axe `color-contrast` in `tests/session-2/login-a11y.test.ts`; `check_contrast` unit test in `tests/session-3/` | 2026-09-22 |
| MEM-003 | axe's `label` rule accepts `placeholder` as an accessible name. A11Y-012 (visible label) needs a structural check. | `tests/session-2/login-a11y.test.ts` "before" case | 2026-09-22 |
| MEM-004 | `@axe-core/playwright` must share the same `playwright-core` version as `playwright`, and the page must come from `browser.newContext()`. | Repo `package.json` pins `playwright-core@1.56.1`; test `before()` hook | 2026-09-22 |
| MEM-005 | Status vocabulary is fixed: `new, assigned, acknowledged, in-progress, temp-fix, done, merged, pending-sync`. Priority is `p1, p2, p3`. | `03-PRD.md` FR-SOPS-003/004; `DESIGN.md` §6 StatusBadge | 2026-09-22 |
| MEM-006 | `Done` requires at least one evidence photo (RULE-005, AC-SOPS-008). The button is disabled, not hidden, without one. | `UX.md` RULE-005; `A11Y.md` A11Y-014 | 2026-09-22 |
| MEM-007 | Every status and priority colour is paired with an icon and a label; colour is never the only carrier. | `UX.md` RULE-006; `A11Y.md` A11Y-003 | 2026-09-22 |
| MEM-008 | The design-system MCP server exposes read-only tools only. Writes go through PR. | `adr/ADR-001-remote-mcp-read-only.md`; `tests/session-3/server.test.ts` asserts `readOnlyHint` on every tool | 2026-09-22 |
| MEM-010 | Badge text needs its own `--color-on-status-*` token per status. White on `green.500` is 3.5:1 and white on the old `amber.500` was 2.8:1; dark-theme fills are pale so the same fg token cannot serve both themes. | `tests/session-3/tools.test.ts` contrast cases; DESIGN.md changelog 1.2 | 2026-09-22 |
| MEM-009 | The bearer token for remote MCP mode comes from `SITOPS_MCP_BEARER_TOKEN` in the environment. It is never in a file in this repo. | `src/mcp/sitops-design-system/server.ts` refuses to start HTTP mode without it | 2026-09-22 |

## Open (not yet facts)

- SLA for P2/P3 — `[AMBIGUOUS]` in `02-requirements.md`; do not assume.
- Whether LINE notifications are in scope — `[AMBIGUOUS]`.
- No Figma file exists; `source:` in every spec is `hand-authored` until DesignOps export happens (`GAP` in each spec).
