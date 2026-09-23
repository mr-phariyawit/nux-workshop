# NUX Design Course — Course Map

Course: **AI-Driven Design** (NUX Design, Niwat Yah). Three sessions.
This document is the repo's synthesis of the course: what each session teaches, the
artifacts it produces, and how the whole thing composes into one pipeline.
Resource links and access status live in [resources.md](resources.md).

Status of this synthesis: Sessions 1–2 are reconstructed from the captured prompt docs
and the UX.md skill repo. Session 3 is reconstructed from the Wallet_Widgetbook_3.0
repo. Slide decks were not readable from this environment, so anything that only
lives in a slide is marked **[slide-only, unverified]**.

---

## 0. The one-line thesis

> **Markdown files are the interface between humans and AI agents.**
> Every session adds one more `*.md` contract to the repo, and every AI tool
> (Figma Make, Stitch, Claude Code, Codex, MCP servers) reads those contracts as
> its source of truth.

The full pipeline the course builds:

```
Meeting audio
  └─ Prompt_Transcript ──────► Transcript + Summary + Action Items
       └─ Convert_Requirement ─► Raw requirements (UC / FR-R / NFR / [AMBIGUOUS])
            └─ Convert_to_PRD ──► PRD.md  (FR / AC Given-When-Then / [DRAFT])
                 ├─ MCP prompt ──► Jira / Linear / Notion  (Epic > Story > Task)
                 │
                 ├─ DESIGN.md   (visual tokens: colour, type, spacing, radius, components)
                 ├─ UX.md       (users, context of use, research, interaction rules, glossary)
                 ├─ A11Y.md     (accessibility rules the AI must satisfy)
                 ├─ AGENTS.md   (how an agent must work inside this repo)
                 │
                 └─ Vibe Design ─► Figma Make / Stitch screens
                      └─ Vibe Code ─► Frontend via agent skills
                           └─ Design-system handoff
                                ├─ component.md per widget (uSpec: anatomy/property/api/color/motion/voice)
                                ├─ MCP server exposing the component library to agents
                                └─ Agentic UI test (Playwright MCP / Maestro MCP)
```

Compare with Aeternix's own "Markdown is the Source of Truth, AI is the Engine": the
course is the design-side instantiation of the same principle. See §5.

---

## 1. Session 1 — PRD to AI Design

**Goal.** Turn unstructured discovery input (meeting audio) into a PRD that both humans
and AI can act on, then push it into a work tracker without inventing anything.

### 1.1 Concepts

| Concept | What the course teaches | Source |
|---|---|---|
| LLM tokens and "Smart Zone Context" | Context windows are finite; put the decisive context (PRD, DESIGN.md, UX.md) in the "smart zone" the model attends to best, and keep raw archives out. | [slide-only, unverified] |
| Agent Skills | A skill is a folder with `SKILL.md` (frontmatter `name`, `description` + procedure), optional `references/`, `assets/`, `agents/`. The description is the trigger; the body is the procedure. | Verified against the UX.md skill repo layout |
| Markdown and MDX as AI context | Markdown is the lingua franca for agent context because it is diffable, reviewable, and readable by every tool. | [slide-only, unverified] |

### 1.2 The four-prompt chain (captured verbatim in spirit)

**Prompt 1 — Transcript.** Role: professional transcriber + meeting summariser.
Output structure is fixed:

```
# Transcript            [mm:ss] Speaker N: ... (timestamp on every speaker change, plus every 30–60s)
# Executive Summary     1–2 paragraphs
# Key Discussion Points ## 1) topic … ## 2) topic …
# Decisions Made
# Action Items          | งาน | ผู้รับผิดชอบ | กำหนดส่ง | สถานะ |
# Open Issues / Risks / Follow-ups
```

Rules worth copying: never guess speaker names, mark `[ฟังไม่ชัด]`, never add or drop
content, write "ไม่ระบุ" for missing fields.

**Prompt 2 — Convert to Requirement.** Role: Senior PM + BA. Extracts only
product-requirement content into 12 numbered sections:
`0 Meeting context · 1 Problems · 2 Goals · 3 Personas · 4 Use cases (UC-001, "As a … I want … so that …") · 5 FR (raw, FR-R-001) · 6 NFR · 7 Constraints/Deps/Risks · 8 Business rules · 9 Edge cases · 10 Out-of-scope · 11 Open questions`.
Rule: anything unclear is tagged `[AMBIGUOUS]` and moved to section 11. Never invent.

**Prompt 3 — Requirement to PRD.** Maps the raw summary onto a fixed 16-section PRD
template with stable IDs:

| ID family | Meaning |
|---|---|
| `PRD-<XXX>-001` | the document |
| `UC-00X` | use case / JTBD |
| `FR-<XXX>-00X` | functional requirement, states WHAT not HOW, links back to UC + problem IDs |
| `FLOW-<XXX>-00X` | high-level user flow, no UI detail |
| `AC-<XXX>-00X` | acceptance criteria per FR, `GIVEN / WHEN / THEN`, tagged `[DRAFT]` if not explicit in input |
| `BR-<XXX>-00X` | business rule |

PRD template sections: 1 Product Context · 2 Problem Statement · 3 Goals & Non-goals ·
4 Personas · 5 Use Cases · 6 Assumptions/Constraints/Deps · 7 FR · 8 NFR ·
9 Business Rules · 10 User Flows · 11 Edge Cases · 12 Out-of-scope · 13 Success Metrics ·
14 Acceptance Criteria · 15 Open Questions · 16 Changelog.

**Prompt 4 — PRD to tracker (via MCP).** Three variants, same guardrails:

- **Jira** (Atlassian MCP): PRD → Confluence page → Epic > Story > Task, each Epic links back to the page.
- **Linear** (Linear MCP): PRD → Team Document, then *propose* Project(=Epic) > Issue(=Story) > Sub-issue(=Task), wait for approval, then create.
- **Notion** (Notion MCP): PRD → Page, then Backlog DB rows: Epic → Story per FR (with AC in body) → Task.

Shared guardrails: use PRD data only, keep `[AMBIGUOUS]`/`[DRAFT]` markers, search for
duplicates before creating, wait for each write to succeed before the next, stop and
report on any schema mismatch instead of guessing.

### 1.3 Artifacts produced

- `transcript.md`, `requirements.md`, `PRD.md`
- Tracker structure (Epic/Story/Task) linked back to the PRD
- The `convert-prd` skill packages prompts 2–3 as one agent skill [repo not readable from here].

---

## 2. Session 2 — Vibe Design & Vibe Coding

**Goal.** Generate screens and frontend code with AI while keeping the output *on-brand,
on-research, and accessible*, by feeding the generator three contracts instead of a
one-off prompt.

### 2.1 The three context files

| File | Owns | Must not contain |
|---|---|---|
| `DESIGN.md` | Visual system: primary/secondary colours, heading/body fonts, radius, button style, spacing scale, card patterns, brand personality / design principles. Can be exported from Figma via the DesignOps plugin or picked from the refero gallery. | User research, interaction rules |
| `UX.md` | Who the users are, the world they operate in, what research established, and how the product must behave (interaction rules per state, glossary). | Visual tokens, raw transcripts, invented evidence |
| `A11Y.md` | Accessibility rules the generated code must satisfy (WCAG 2.2 AA baseline, touch targets, focus, screen-reader semantics). | [slide-only, unverified] |
| `AGENTS.md` | How an agent must work in this repo: where the contracts live, what to read first, conventions. | [slide-only, unverified] |

### 2.2 UX.md in depth (from the `create-ux-md` skill, fully captured)

The skill follows the Nielsen Norman Group "UX context" model. It is a **living,
machine-readable UX source of truth kept beside the code**, refined whenever the AI
gets something wrong.

Output order (8 sections + 2 appendices):

1. Product context (incl. explicit boundary to `DESIGN.md`)
2. User models `USER-00X`
3. World models / context of use `WORLD-00X`
4. Research synthesis `INS-00X` as *finding → evidence → implication → rule*
5. Interaction standards `RULE-00X` with strength `must / should / may / must not`, plus required coverage for navigation, forms, loading, empty, validation, failure, success, permissions, destructive/undo, autosave
6. Glossary (preferred term / meaning / use when / forbidden synonyms)
7. Related artifacts (DESIGN.md, tokens, components, code, research, MCP/skills)
8. Context validation and maintenance (baseline without UX.md vs with, known AI mistakes, update triggers, owner)
9. Provenance and open questions (`GAP-00X`)
10. Readiness summary per domain (0/1/2/N/A)

Two orthogonal labels on every claim:

| Provenance status | Evidence level |
|---|---|
| `confirmed` — supplied or cited | `E3` direct, recent, traceable → "Finding" |
| `inferred` — derived, awaiting confirmation | `E2` indirect / small / old → "Indicative finding" |
| `suggested` — best-practice default, not evidence | `E1` stakeholder anecdote / benchmark → "Signal" or "Assumption" |
| `unknown` — must not be assumed | `E0` none → "Hypothesis" / "Suggested default" |

Operating modes: **Create · Synthesize · Audit · Update**. The skill onboards the user
first, inventories `AGENTS.md`/`UX.md`/`DESIGN.md`/PRD before asking anything, asks one
high-impact question at a time (priority = decision impact × uncertainty × risk), and
accepts "ยังไม่ทราบ" by converting it into a labelled gap with a validation action.

Readiness labels: Discovery → Prototype-ready → Delivery-ready → Production-governed.

### 2.3 Prompt structures for generators

**Figma Make** prompt skeleton (captured):

```
Task:        สร้าง [screen/feature] เพื่อให้ผู้ใช้ [primary goal]
Context:     product, target users, the problem this screen solves
Elements:    3+ key elements; use components from [Design System]
Behavior:    primary action; Loading/Empty/Error/Success; Default/Hover/Focus/Disabled; Desktop/Tablet/Mobile
Constraints: Auto Layout + responsive constraints; read [guideline path] first; semantic tokens only;
             no hard-coded colour/spacing; WCAG 2.2 AA; Thai + long text; reuse before create;
             touch target ≥ 44px; light + dark mode
```

**Google Stitch** prompt (captured) is the more advanced pattern: it attaches
`PRD.md` + `DESIGN.md` + `UX.md` and tells the model exactly how to weigh them:

- `DESIGN.md` is binding for colour, font, radius, button style, spacing.
- `PRD.md` is binding for content, business flow, functional elements.
- `UX.md` is binding for interaction pattern, navigation, hierarchy, per-state rules, error recovery, research findings (`confirmed`/`inferred` only).
- `UX.md` confidence levels are interpreted differently: `confirmed` → fact; `inferred` → assumption, pick the safest option; `suggested` → optional if not conflicting; `unknown` → pick the most standard pattern **and flag it**.
- Conflict rule: **if PRD.md and UX.md disagree on flow, UX.md wins.**
- First screen becomes the baseline; every later screen is "สร้างหน้า [X] ในสไตล์เดียวกัน".

### 2.4 Workshop

Clone `login-page-a11y-project`, hand the agent `A11Y.md`, and have it fix the code to
meet accessibility rules. This is the "contract → agent → verified fix" loop in
miniature. [Repo not readable from here.]

### 2.5 Tools introduced

Google Stitch (design generation), Figma Make, Lazyweb MCP (design research from an
agent), a frontend agent skill for vibe coding [slide-only].

---

## 3. Session 3 — AI Design System Handoff

**Goal.** Make a real component library consumable by AI agents: per-component
Markdown specs, an MCP server that serves them, agent skills that drive
install → search → build → audit → preview, and agentic UI tests.

Reference implementation: `NUX-Design/Wallet_Widgetbook_3.0` (Flutter). The same
pattern applies to a React/shadcn library with Storybook MCP.

### 3.1 Layers of the reference repo

| Layer | Files | Role |
|---|---|---|
| Agent context | `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `CODEBASE_CONTEXT.md`, `MEMORY.md`, `WIDGETS_GUIDE.md` | What an agent reads before touching anything |
| Per-widget spec | `lib/widgets/v3/<widget>/<widget>.md` (uSpec component.md) + `V3_<WIDGET>_GUIDE.md` | Machine-readable component contract + human guide |
| uSpec skills | `.agents/skills/create-{anatomy,api,color,component-md,motion,property,structure,voice}` and `extract-{api,color,structure,voice}` | Generate / extract each section of a component spec, from Figma JSON or code |
| Library skills | `skills-v3/{claude-code,codex,kiro}/.../flutter-widget-v3-{install,onboard,search,beginner,adapt,audit,figma-to-code,preview,upgrade}` | Same skill set vendored per agent runtime |
| MCP server | `mcp-server/`, `.mcp.json`, `.codex/config.toml`, `.cursor/mcp.json` | Exposes the library to agents; remote mode with `Authorization: Bearer ${MCP_BEARER_TOKEN}` |
| Figma pipeline | `figma-plugin/`, `figma-context-mcp/`, `docs/v3/FIGMA_LOCAL_VARIABLE_SNAPSHOT_WORKFLOW.md` | Figma variables → token snapshot → audit → code |
| Spec-driven delivery | `docs/V3_*_PLAN.md` → `task/*_TASKS.md` → `docs/v3/adr/` | Plan, tasks, decisions as Markdown |

Detailed findings per layer: see §3.2 (filled from the repo analysis).

### 3.2 Repo analysis (Wallet_Widgetbook_3.0, verified against the clone)

**Context stack and trust order.** `CLAUDE.md` is one line, `@AGENTS.md`, so every
agent host (Claude Code, Codex, Cursor, Gemini, Kilocode) reads one canonical rules
file. `AGENTS.md` declares an explicit precedence when docs conflict:

```
1. AGENTS.md
2. MEMORY.md
3. live source code and build scripts
4. widget-local guide/spec/context markdown next to the widget
5. root overview docs (README.md, CODEBASE_CONTEXT.md, WIDGETS_GUIDE.md)
```

Stated reason: overview docs lag behind the live tree. `AGENTS.md` also fixes a
required read order (AGENTS → MEMORY → scope → nearest source of truth → update
MEMORY before finishing) and ships six named playbooks (widget change, localisation,
token change, theme V3, preview, docs/schema) each ending in "the narrowest relevant
verification command".

`MEMORY.md` (116 KB, the largest file) is the anti-amnesia ledger: dated, evidence-
bearing facts (run IDs, checksums, "19/19 passing") so nothing is re-derived per session.

`DESIGN.md` (72 KB) is generated from the Figma file by the DesignOps/DesignBridge
plugin and conforms to the `google-labs-code/design.md` spec. YAML front matter holds
the normative tokens (262 colour, 112 spacing, 18 radius, 18 typography, light + dark).
It opens with eight "AI agent instructions"; rule 8 is *if a visual decision is not
defined here, ask before inventing*. Each component carries a platform-mapping block
(Flutter class + token names + file path, and React prop signatures), so one design
doc serves two implementation targets.

**Per-widget five-file set** (canonical dir `lib/widgets/v3/button/`):

```
lib/widgets/v3/<category>/
├── <component>-_base.json      uSpec Figma extraction (input, immutable)
├── <component>.md              generated component source-of-truth (uSpec vocabulary)
├── v3_<widget>.dart            implementation
├── preview_v3_<widget>.dart    light/dark preview
└── V3_<WIDGET>_GUIDE.md        hand-written code-side guide (+ required V3 Metadata YAML)
test/widgets/v3/<category>/v3_<widget>_test.dart
```

The basename must match across `_base.json`, `_meta.componentSlug`, the `.md`, and
render metadata; renaming only one artifact is forbidden. The distinction that matters:
`button.md` is *generated, design-side, one per Figma component set* (192 variants,
with `Known gaps` and `Follow-ups` sections); `V3_DEFAULT_BUTTON_GUIDE.md` is
*hand-written, code-side, one per Dart class* with `Public API`, `Accessibility`,
`Token Audit Values`. Four button guides point back at one `button.md`.

**uSpec skills** (`.agents/skills/`, 13 skills). Two families:

- `extract-{api,structure,color,voice}` — read-only interpreters of `_base.json`, zero Figma calls, output `{slug}-<domain>.json`. `extract-api` also emits an API dictionary that steers the other three.
- `create-{anatomy,api,color,motion,property,structure,voice}` — write annotations *into Figma*, take the component `.md` as read-only input, fail fast if it is missing.
- `create-component-md` is the orchestrator: validates the base JSON, runs `extract-api` inline, fans the other three extractors out as parallel subagents keeping only one-line summaries in the parent (explicit context-budget design), then reconciles disagreements into exactly four classes (vocabulary drift → auto-rewrite; coverage gap → one retry; benign extra → log; semantic conflict → `high` Known gap, never auto-resolved). Strict batch mode: never asks questions mid-run. Counter-rule: "never lose quality for token savings; fix the skill, not the orchestrator."

**Library skills** (`skills-v3/{claude-code,codex,kiro}/`, nine skills, identical
across runtimes, installed by copy). Shape: frontmatter → workflow → MCP tool
whitelist → guardrails.

| Skill | Drives |
|---|---|
| `onboard` | Read-only explainer with a fixed order: Figma/DTCG → raw → primitive → semantic → generated Theme → ThemeScope → Widget → icons → previews/tests → remote MCP → skills. Routes intent to the next skill. |
| `beginner` | Bootstrap a host repo: ask → scan → summarise → confirm → execute. Renames V3 out of the consumer API ("V3 is provenance, not a product name"). |
| `search` | `list_v3_categories` → `search_v3_widgets` → `get_v3_widget_metadata`; returns 1–3 candidates with adaptation effort. |
| `install` | Fetch code + preview + guide, place under `lib/widgets/v3/`, rewire theme access to the host's own ThemeScope, run analyzer + targeted test. |
| `adapt` | Make a transplanted widget native; if the host lacks a semantic token, stop and report rather than invent a raw colour. |
| `audit` | `audit_v3_widget` for legacy theme imports, raw `Color(...)`, missing preview/metadata. Findings first. |
| `figma-to-code` | Reuse-before-generate: check the Figma→Flutter mapping for an existing widget, map colours to semantic tokens, then scaffold. |
| `preview` | Two modes gated by a check: source-development (local Flutter build) vs published-consumer (download a commit-addressed web bundle, no Flutter needed). Named failure codes; never hand back a URL before HTTP readiness. |
| `upgrade` | Diff local vs upstream, classify (local customisation / upstream improvement / breaking), selective sync. |

**MCP server** (`mcp-server/`). One dispatcher, two transports:

- Local `stdio` (`node mcp-server/index.js`) reflects the working tree.
- Hosted `streamable-http` on Render, `Authorization: Bearer <token>` validated against an env var; `/health` and `/info` are anonymous and expose commit SHA and catalogue timestamp so an agent can verify which snapshot it is talking to.

Tool surface: 12 legacy + 18 V3 tools (`get_v3_design_system_info`, token list/search/get,
widget list/search/details/metadata/code/preview, `audit_v3_widget`, template, patterns,
Figma mapping, and two generators). Remote publishes **only tools annotated
`readOnlyHint: true`**; generators are local-only. Cache namespace is repo + channel +
commit SHA and callers cannot override it. Student config is environment-backed:

```
export MCP_BEARER_TOKEN="<token from the instructor, never committed>"
claude mcp add --transport http flutter-widget-wallet-mcp <url> \
  --header "Authorization: Bearer ${MCP_BEARER_TOKEN}"
```

The checked-in `.mcp.json` / `.codex/config.toml` / `.cursor/mcp.json` deliberately do
*not* configure this server; each developer adds it from the README so no token ever
lands in a tracked file.

**Figma pipelines.** Three coexist:

1. Component → spec: uSpec Extract plugin walks every variant of a selected component set, asks the *designer* to classify each child (constitutive / referenced / decorative, recorded as `user-selected` evidence), emits `<slug>-_base.json`, which feeds `create-component-md`. Chain: Figma → plugin → `_base.json` → extractors → `<component>.md` → `V3_<WIDGET>_GUIDE.md` → `v3_<widget>.dart`.
2. Variables → token audit: read-only snapshot of all Figma local variables into a dated, append-only JSON; `npm run audit:figma-tokens` diffs it against `tokens/primitive/**` and `tokens/semantic/**` and reports `matched / changed / missingInFigma / figmaOnly`. Rule in `AGENTS.md`: never summarise from DESIGN.md in place of reading Figma live, and never auto-fix drift.
3. Ad-hoc read: third-party Figma context MCP with the PAT injected only via `$FIGMA_API_KEY`.

**Spec-driven delivery.** Every initiative is a pair: `docs/V3_<X>_PLAN.md` (Goal,
Assumptions and Decisions, Non-Goals, Target Architecture, Phases, Validation Gates,
Exit Criteria, Risk/Mitigation, Rollback) and `task/V3_<X>_TASKS.md` (ID'd tasks with
`Depends on:` and `Expected evidence:`, Global Guardrails, Exit Criteria, Current
Status). Rules: take the smallest task whose dependencies are done; tick a checkbox
only with real verification evidence; bump the updated-at stamp on every edit; never
infer progress from the plan. Cross-cutting decisions with external dependencies get an
ADR (`docs/v3/adr/ADR-001-…`: Status, Context, Decision, Responsibility Boundary table,
Consequences). Superseded plans are kept with a `> Status:` banner pointing forward.

**Ten lessons for design-system handoff**

1. One entry-point rules file, imported everywhere (`CLAUDE.md` = `@AGENTS.md`).
2. Declare a trust order and its reason; otherwise a conflicting doc is a coin flip.
3. Separate design truth from code truth and name the owner of each; on conflict reconcile the source, never hardcode around it.
4. Generated spec (`<component>.md`) and hand-written guide are different documents. Conflating them is how design docs rot.
5. A spec must admit what it does not know: `Known gaps`, `Follow-ups`, "ask before inventing".
6. Put the human in the loop at the point of ambiguity (the designer classifies in the plugin) so the downstream agent chain can run unattended.
7. Design the agent pipeline around a context budget: cheap read-only extractors sharing one input, parallel subagents, one-line summaries in the parent, and a counter-rule against trading quality for tokens.
8. Enforce artifact consistency mechanically (shared basename, generated registries that are never hand-edited).
9. Distribute capability read-only and make freshness observable (`readOnlyHint`, commit-pinned cache, `/info`).
10. Secrets get a placeholder mechanism, never a value; plan → tasks → ADR plus a dated `MEMORY.md` is what lets all of this survive the next session.

### 3.3 Supporting tools

- **Figma DesignOps plugin** exports `DESIGN.md` from a Figma file; **uSpec Extract** plugin exports component JSON; uSpec Figma skills (create-property / anatomy / api / color) run inside Figma.
- **shadcn MCP** and **Material 3** as reference component vocabularies.
- **Playwright MCP** (web) and **Maestro MCP** (mobile) for agent-driven UI tests; **serve-sim** to expose an iOS simulator to a browser so the agent can inspect Flutter.
- **Storybook MCP** for a React library [slide-only]; **mcp-builder** skill (Anthropic) for building the MCP server correctly.

---

## 4. Cross-session principles (what actually transfers)

1. **Never invent.** Every prompt in the course ends with "ใช้ข้อมูลจากต้นทางเท่านั้น / ถ้าไม่ชัวร์ให้หยุดถาม". Unknowns get a label (`[AMBIGUOUS]`, `[DRAFT]`, `unknown`, `GAP-00X`), not a guess.
2. **Stable IDs everywhere.** UC / FR / AC / FLOW / BR in the PRD; USER / WORLD / INS / RULE / GAP in UX.md. IDs are what let one Markdown file reference another and let AI trace a screen back to a requirement.
3. **Separate the contracts by concern.** PRD (what), DESIGN.md (how it looks), UX.md (how it behaves and why), A11Y.md (what must be accessible), AGENTS.md (how the agent works). Precedence is explicit: UX.md beats PRD on flow; DESIGN.md is binding on visuals.
4. **Confidence is metadata.** `confirmed / inferred / suggested / unknown` travels with every claim and changes how downstream tools may use it.
5. **Check-before-write, one write at a time.** Every MCP-driven prompt searches for duplicates, waits for confirmation, and halts on schema mismatch.
6. **Package procedures as skills, not chat history.** Anything repeated becomes `SKILL.md` + references + template, vendored per runtime (`.claude/`, `.codex/`, `.kiro/`).
7. **Close the loop.** UX.md's "context validation" section and the audit/test skills exist so the contract is corrected whenever the AI output is wrong.

---

## 5. Mapping to Aeternix SDLC+AI (Spec-Driven Development + TDD)

| Course artifact | Aeternix equivalent / gap |
|---|---|
| Transcript → Requirement → PRD chain | Direct fit for discovery → `docs/spec/*.md`. Adopt the ID scheme (UC/FR/AC) so tests can cite `AC-XXX-00N`. |
| `AC` in Given/When/Then | Maps 1:1 to TDD test names. Each `[DRAFT]` AC is a test that must be confirmed before it is written. |
| `UX.md` with provenance | We have no equivalent today. Highest-leverage addition for client projects: it is where research and business rules live in a form the agent can obey. |
| `DESIGN.md` | Replace ad-hoc Tailwind/shadcn theme comments with an exported DESIGN.md per client. |
| `AGENTS.md` / `CLAUDE.md` | We already keep `CLAUDE.md`; the course's version adds explicit read-order and contract locations. |
| Component `*.md` + MCP server | Applicable to any shared UI library (Next.js + shadcn): Storybook MCP or a thin custom MCP built with `mcp-builder`. |
| Playwright / Maestro MCP | Slots into the TDD gate as agent-run E2E. |

Gaps the course does not cover (and we still need): versioning of contracts across
releases, multi-tenant DESIGN.md, and CI enforcement that code changes cite an FR/AC.

---

## 6. Proposed next steps for this repo

1. `docs/templates/` — vendor the PRD template, requirement template, and the UX.md template as reusable files.
2. `docs/prompts/` — the four Session 1 prompts and the two Session 2 prompts, parameterised.
3. `.claude/skills/` — port `create-ux-md` and (once readable) `convert-prd` as local skills.
4. A worked example: run one Aeternix discovery call through the full chain and commit the outputs under `docs/examples/`.
5. `A11Y.md` and `AGENTS.md` for this repo, once the slide content is exported.

Each step is its own spec + PR per the repo rules.
