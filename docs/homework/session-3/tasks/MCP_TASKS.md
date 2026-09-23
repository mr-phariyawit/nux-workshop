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

## Dropped
- Figma tools — no file exists (every spec has the GAP).
- Storybook MCP bridge — no Storybook in this repo; the `render-meta` block is the contract Storybook stories would be generated from.
