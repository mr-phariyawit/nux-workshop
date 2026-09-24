# Homework — NUX Design "AI-Driven Design" course

Every session's homework runs on **one scenario** so that the artifacts chain by ID
the way the course intends: the PRD from Session 1 is the input to Session 2's
contracts, and Session 2's `DESIGN.md` is the input to Session 3's component specs
and MCP server.

## The scenario (simulated)

**Client:** Sathorn Prime Tower Co., Ltd. — operator of a 38-floor office tower in
Bangkok with a 14-person facility team.
**Product:** **SiteOps** — a work-order management system for the facility team.
**Engagement:** Aeternix discovery → PRD → design → design-system handoff.

Why this scenario: it forces every hard case the course is about.

| Course concern | Where SiteOps exercises it |
|---|---|
| Never-invent, `[AMBIGUOUS]` | Client has not defined SLA per priority, SSO is undecided |
| World models / context of use | Technicians work in basements with no signal, wearing gloves, interrupted by radio calls |
| Consequences of error | Closing a P1 (water leak, power) work order without evidence has legal and insurance impact |
| A11Y | Field devices are outdoor-brightness phones; older technicians; Thai + Burmese-speaking staff |
| Design-system handoff | A small shadcn-based Next.js library that both a web dashboard and a mobile PWA consume |

Everything with a date, name, number, or quote in these files is **invented for the
exercise** and labelled as such in each document's header.

## Layout

```
docs/homework/
├── README.md                     ← this file
├── session-1/                    PRD to AI Design
│   ├── 01-transcript.md          Prompt_Transcript output (simulated meeting)
│   ├── 02-requirements.md        Convert_Requirement output
│   ├── 03-PRD.md                 Convert_to_PRD output, PRD-SOPS-001
│   └── 04-tracker-plan.md        Epic > Story > Task proposal (dry run of the MCP step)
├── session-2/                    Vibe Design & Vibe Coding
│   ├── DESIGN.md                 visual contract
│   ├── UX.md                     UX-context contract (create-ux-md skill format)
│   ├── A11Y.md                   accessibility contract
│   ├── AGENTS.md                 agent operating contract for the SiteOps repo
│   ├── prompts/                  filled Stitch + Figma Make prompts
│   ├── a11y-workshop.md          the login-page workshop: defects, fix, verification
│   └── vibe-coding.md            the vibe-coded SiteOps Field and Intake screens and the rules they satisfy
└── session-3/                    AI Design System Handoff
    ├── CONVENTIONS.md            five-file set, naming, token rules, spec heading contract
    ├── MEMORY.md                 verified-facts ledger (MEM-001…)
    ├── components/
    │   ├── button.md             uSpec-style generated spec (+ BUTTON_GUIDE.md, hand-written)
    │   ├── status-badge.md       (+ STATUS_BADGE_GUIDE.md)
    │   └── work-order-card.md    (+ WORK_ORDER_CARD_GUIDE.md)
    ├── plans/MCP_PLAN.md         plan
    ├── tasks/MCP_TASKS.md        execution checklist
    └── adr/ADR-001-remote-mcp-read-only.md
```

Code for the homework lives in `src/` and `tests/`:

- `src/session-2/login-a11y/` — the a11y workshop page, before and after.
- `src/session-2/siteops-app/` — SiteOps Field, the vibe-coded My Work + Work Order Detail screens (open `index.html` in a browser).
- `src/session-2/siteops-intake/` — SiteOps Intake, the dispatcher dashboard: intake form, KPIs, P1 near-breach banner, queue with assign and merge (open `index.html` in a browser).
- `src/mcp/sitops-design-system/` — read-only MCP server over `DESIGN.md` and the Session 3 specs (`catalog.ts` parser, `contrast.ts` WCAG maths, `tools.ts` handlers, `server.ts` stdio / Streamable HTTP wiring).
- `tests/session-2/`, `tests/session-3/` — Playwright + axe checks and MCP unit tests.

```sh
npm install
npm run typecheck
npm test                                   # unit (session-3) + e2e (session-2, needs Chromium)
npm run mcp:sitops                         # MCP over stdio for a local agent
SITOPS_MCP_BEARER_TOKEN=<32+ chars> npm run mcp:sitops -- --http --port 3333   # remote mode, bearer required
```

## What the gates caught (the point of the exercise)

| Gate | Finding | Fix |
|---|---|---|
| axe `color-contrast` (SS2) | `DESIGN.md` v1.0 primary `teal.500` was 4.1:1 on white | token moved to `teal.600`; DESIGN.md 1.1 |
| axe `label` (SS2) | placeholder-only inputs **pass** axe | A11Y-012 needs a structural test, not axe |
| `check_contrast` (SS3) | `amber.500` 2.8:1 on white; white on `green.500` 3.5:1 | amber darkened, `--color-on-status-*` tokens added; DESIGN.md 1.2 |
| catalog parser (SS3) | `--color-primary-hover` in the token table but not in the CSS excerpt | CSS excerpt completed |
