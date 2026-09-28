# MCP_TASKS.md — execution checklist for `plans/MCP_PLAN.md`

Status: ☐ todo · ☑ done · ⊘ dropped (with reason)

## T1 Catalog parser
- [x] T1.1 Parse `DESIGN.md` front matter (name, version, status, platforms)
- [x] T1.2 Parse `DESIGN.md` §9 CSS custom properties into light and dark token maps
- [x] T1.3 Parse `components/*.md`: front matter, `##` sections by exact heading, `render-meta` JSON
- [x] T1.4 Fail loudly (typed error naming the file and the missing part)

## T2 Tools
- [x] T2.1 `get_design_system_info`
- [x] T2.2 `get_design_tokens` with `theme` and `prefix` filters
- [x] T2.3 `list_components` with `status` filter
- [x] T2.4 `get_component_spec` (unknown id → `isError` result, not a throw)
- [x] T2.5 `search_components` (case-insensitive, section-aware ranking)
- [x] T2.6 `check_contrast` (WCAG 2.x relative luminance; accepts token names or hex)
- [x] T2.7 Every tool: `readOnlyHint: true`, zod input schema, one-paragraph description that tells an agent *when* to call it

## T3 Server wiring
- [x] T3.1 stdio transport (`npm run mcp:sitops`)
- [x] T3.2 Streamable HTTP transport (`npm run mcp:sitops -- --http --port 3333`)
- [x] T3.3 Bearer check from `SITOPS_MCP_BEARER_TOKEN`; refuse to start HTTP mode without it; constant-time compare
- [x] T3.4 No secrets in logs or tool results

## T4 Tests
- [x] T4.1 `catalog.test.ts`: real specs parse, token count, dark overrides, render-meta ids match front matter
- [x] T4.2 `tools.test.ts`: each handler; contrast known pairs (white on `#0F8B8D` ≈ 4.1 fails AA text; white on `#0B6F71` ≈ 6.0 passes)
- [x] T4.3 `server.test.ts`: in-memory transport; `tools/list` has 6 tools all read-only; `tools/call` round-trips; unknown id is `isError`
- [x] T4.4 `npm run typecheck` clean

## T5 Docs
- [x] T5.1 `CONVENTIONS.md` five-file set and heading contract
- [x] T5.2 `MEMORY.md` entries MEM-008, MEM-009
- [x] T5.3 `adr/ADR-001-remote-mcp-read-only.md`
- [ ] T5.4 Agent skill (`skills/sitops-design-system/SKILL.md`) that tells Claude Code when to call which tool — ⊘ dropped for the homework; the tool descriptions carry the same guidance

## T6 Hardening (post-review, 2026-09-28)
- [x] T6.1 HTTP mode binds `127.0.0.1` by default; `--host` opts in to wider exposure; the log prints the bound address. `--port` is validated (integer 0–65535).
- [x] T6.2 Bearer compare hashes both sides with SHA-256 before `timingSafeEqual`, so a length mismatch returns in the same time as a content mismatch
- [x] T6.3 Anonymous `GET /health` (catalog parses → 200, else 503) and `GET /info` (server version, DESIGN.md version, component count, commit from `SITOPS_COMMIT_SHA`), no spec content; ADR-001 amendment
- [x] T6.4 `check_contrast` accepts only 3- or 6-digit hex tokens; a 4/5-digit value is a soft `not a colour` failure, not a thrown exception
- [x] T6.5 Spec body starts where the front-matter match ends, so mixed line endings or a `---` rule in the body cannot shift the section split
- [x] T6.6 Entry-point check uses `pathToFileURL`, so the server starts from a path containing `#`, `?` or `%` (a raw `file://` string reads those as fragment, query or escape)
- [x] T6.7 A request target `new URL()` cannot parse (e.g. `GET http://[`) gets 400 before any auth check; any other failure in the handler becomes 500, never an unhandled rejection that stops the process (found by Codex review on PR #9)

## Dropped
- Figma tools — no file exists (every spec has the GAP).
- Storybook MCP bridge — no Storybook in this repo; the `render-meta` block is the contract Storybook stories would be generated from.
