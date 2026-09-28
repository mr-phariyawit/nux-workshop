# ADR-001 — The remote design-system MCP server exposes read-only tools only

Status: accepted · Date: 2026-09-22 · Deciders: Aeternix UX Lead, SiteOps tech lead

## Context

The course's Wallet_Widgetbook_3.0 reference publishes a remote MCP server with a
bearer token per student and only `readOnlyHint: true` tools; generation tools
exist but run locally. We had to decide whether SiteOps' server should also let
agents *write* — generate a component's five files, add a token, update a spec —
over HTTP.

Forces:

- Agents in Figma Make, Cursor and Claude Code all want the same context; a remote server is the only way to serve all three without vendoring Markdown into each.
- The bearer token is a shared secret in each student's or engineer's environment. It will leak eventually (`.env` in a screenshot, a pasted MCP config).
- The repo rule is "spec first, tests with every behaviour change, branch + PR always". A write tool bypasses review by construction.
- `DESIGN.md` and `components/*.md` are the source of truth. Two writers (PR and MCP) to one source of truth means drift.

## Decision

The remote server exposes only read tools (`get_design_system_info`,
`get_design_tokens`, `list_components`, `get_component_spec`,
`search_components`, `check_contrast`). Every tool declares
`readOnlyHint: true` and a test fails if one does not.

Writes happen the way everything else does: an agent proposes (a PR, or a
"Proposed additions" block in `DESIGN.md`), a human approves, CI runs the gates.
Local-only generation (uSpec `uspec-sync`, story scaffolding) may exist as
scripts or local MCP tools, never on the remote endpoint.

The bearer token protects confidentiality only. It is read from
`SITOPS_MCP_BEARER_TOKEN`, compared in constant time, never logged, and the HTTP
mode refuses to start without it.

## Consequences

Positive:

- A leaked token exposes the design system, not the ability to change it.
- One writer to the source of truth; the PR history is the spec's changelog.
- Tool surface is small enough to test completely.

Negative:

- Agents cannot "fix" a spec in the same session they discover a gap; they must file it. The `Known gaps` section and the `[GAP]` convention exist to make that cheap.
- Generation remains a local, per-tool concern (Claude Code skill, Cursor rule), so the three agent hosts can differ in how well they generate.

## Alternatives considered

1. **Read-write with an allowlist of safe writes** (append to `Known gaps` only). Rejected: "safe" grows, and the test that proves read-only becomes a policy document.
2. **Per-user tokens with write scope for leads.** Rejected for now: no identity provider in scope; revisit when SiteOps has SSO (`[AMBIGUOUS]` AD vs local login in Session 1).
3. **No remote server; vendor Markdown into each tool.** Rejected: guarantees drift across Figma Make, Cursor, Claude Code.

## Amendment 1 — 2026-09-28: anonymous health and info endpoints, loopback default

Operators and agents need to know whether the server is up and *which snapshot*
of the contracts it serves (course-map lesson 9: make freshness observable)
without holding the token. HTTP mode therefore answers two anonymous `GET`
routes besides the bearer-guarded `/mcp`:

| Route | Returns | Never returns |
|---|---|---|
| `/health` | `200 {status:"ok"}` when DESIGN.md and every spec parse; `503 {status:"catalog-error"}` otherwise | the parser error text |
| `/info` | server name + version, DESIGN.md version, component count, commit (`SITOPS_COMMIT_SHA`, else `"unknown"`) | tokens, spec sections, file paths |

The version and component count are judged non-confidential; everything a tool
returns stays behind the bearer. Any other path is 404; a non-`GET` on these
two routes is 405.

HTTP mode binds `127.0.0.1` unless started with `--host`. Serving remote agents
is an explicit `--host 0.0.0.0` (or a reverse proxy in front of loopback), so a
developer testing remote mode on a laptop does not expose it to the network by
accident.
