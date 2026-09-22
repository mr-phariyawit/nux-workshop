# MCP_PLAN.md — SiteOps design-system MCP server

> Plan → Tasks → ADR, as the Wallet_Widgetbook_3.0 repo does it. This plan is the
> "what and why"; `tasks/MCP_TASKS.md` is the checklist; `adr/ADR-001` records
> the one decision that needed arguing.

## Goal

Give any agent (Claude Code, Cursor, Codex, Figma Make via MCP) the SiteOps
design system as **queryable context** instead of pasted Markdown, so that:

1. Check-before-write is cheap: `search_components` before proposing a new one, `get_design_tokens` before inventing a colour.
2. Contracts stay single-sourced: the server reads `DESIGN.md` and `components/*.md` at request time; it holds no copy.
3. Handoff is testable: `check_contrast` turns A11Y-001 into a tool call.

## Scope

In:

- Read-only tools over the Session 2 `DESIGN.md` and Session 3 `components/*.md`.
- stdio transport for local agents; Streamable HTTP transport for remote agents behind a bearer token.
- Unit tests over the catalog parser and every tool; an in-memory MCP client test that proves `readOnlyHint` on every tool.

Out (and why):

- Any write tool (`generate_component`, `update_token`). See ADR-001.
- Figma access. There is no SiteOps Figma file; the DesignOps export is a follow-up in every spec.
- Caching, rate limits, observability. Worth doing for a real deployment; noise for the homework.

## Tools

| Tool | Input | Output | Reads |
|---|---|---|---|
| `get_design_system_info` | — | name, version, status, platforms, component count, contract precedence | DESIGN.md front matter |
| `get_design_tokens` | `theme?: light\|dark`, `prefix?: string` | `{ name, value }[]` | DESIGN.md §9 CSS |
| `list_components` | `status?: draft\|ready\|deprecated` | id, name, status, source, axes | components/*.md front matter + render-meta |
| `get_component_spec` | `id` | front matter, sections map, render-meta | one components/*.md |
| `search_components` | `query` | ranked ids with the matching section | all components/*.md |
| `check_contrast` | `foreground`, `background` (token name or hex), `theme?` | ratio, passes for text AA / non-text | DESIGN.md §9 CSS |

All tools carry `annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }`.

## Architecture

```
src/mcp/sitops-design-system/
  catalog.ts   pure: read + parse DESIGN.md and components/*.md → typed Catalog
  tools.ts     pure: tool definitions (name, description, zod schema, annotations) and handlers over a Catalog
  server.ts    wiring: McpServer + stdio | Streamable HTTP with bearer check from env
tests/session-3/
  catalog.test.ts   parser facts (tokens, front matter, render-meta, headings)
  tools.test.ts     each handler, including contrast maths against known pairs
  server.test.ts    in-memory client ↔ server: tools/list annotations, tools/call round-trip
```

`catalog.ts` and `tools.ts` never touch the transport, so they are testable
without a process. `server.ts` is the only file that reads `process.env`.

## Security model (remote mode)

- HTTP mode starts only when `SITOPS_MCP_BEARER_TOKEN` is set; the token is never logged, echoed in a tool result, or written to disk.
- Every request must carry `Authorization: Bearer <token>`; mismatch → 401, no body detail.
- Tools are read-only, so a leaked token exposes the design system, not the ability to change it. That is the trade the ADR makes.
- Token comparison is constant-time (`timingSafeEqual`).

## Risks

| Risk | Mitigation |
|---|---|
| Spec Markdown drifts from the heading contract → parser returns partial data | Parser fails loudly per file; `catalog.test.ts` checks every real spec parses |
| Agents treat `inferred` facts as truth | `get_component_spec` returns the Provenance section verbatim; Known gaps are first in the section order |
| Someone adds a write tool "just for generation" | `server.test.ts` fails if any tool lacks `readOnlyHint: true` |
