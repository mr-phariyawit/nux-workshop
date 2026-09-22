# Session 1 · Step 4 — PRD → tracker (dry run)

> The course's final Session 1 step pushes `PRD.md` into Jira, Linear, or Notion via
> MCP. All three course prompts share the same guardrails: use PRD data only, keep
> `[AMBIGUOUS]`/`[DRAFT]` markers, search for duplicates first, **propose the
> structure and wait for approval before creating anything**.
>
> This file is that proposal step. It is what the agent would show before touching
> the tracker. No tracker was written to; this is intentional (the course's Linear
> prompt makes step 2 "show me the structure, do not create yet").
>
> Mapping used (Linear convention from the course): Project = Epic, Issue = Story,
> Sub-issue = Task. The same tree maps to Jira Epic > Story > Task and to the Notion
> Backlog DB with Type = Epic / Story / Task.

## Duplicate check (would run first)

Search terms: `SiteOps`, `work order`, `PRD-SOPS-001`. Expected result on a fresh
workspace: none. If anything matches, stop and ask before creating.

## Proposed structure

### Team Document
- **PRD-SOPS-001 — SiteOps Work Order Management** (full text of `03-PRD.md`, linked from every Project below)

### Project 1 (Epic): Work-order intake and assignment
Source: FR-SOPS-001, 002, 003, 010

| Issue (Story) | Source | Acceptance criteria | Sub-issues (Tasks) |
|---|---|---|---|
| Create work order from any intake channel | FR-SOPS-001 | AC-SOPS-001 | Intake form; channel field; location/asset picker; priority field |
| P1 SLA clock | FR-SOPS-002 | AC-SOPS-002 | SLA config model; deadline computation; countdown display; near-breach alert `[DRAFT]` |
| Assign to on-shift technician | FR-SOPS-003 | AC-SOPS-003 | Shift roster; assignment action; technician "my work" list |
| Merge duplicate reports | FR-SOPS-010 | AC-SOPS-011 | Similarity hint; merge action; Merged status; reporter aggregation |

Open question carried on the Project: SLA for P2/P3 `[AMBIGUOUS]`; merge permission `[AMBIGUOUS]`.

### Project 2 (Epic): Offline-first field app
Source: FR-SOPS-004, 005, 006, 011

| Issue (Story) | Source | Acceptance criteria | Sub-issues (Tasks) |
|---|---|---|---|
| Status updates while offline | FR-SOPS-004 | AC-SOPS-004, AC-SOPS-005 `[DRAFT]` | Local event queue; device-time stamping; ordered sync; queue persistence across app restart |
| In-app photo capture bound to work order | FR-SOPS-005 | AC-SOPS-007 | Camera capture; no gallery write; upload on sync; retake before sync |
| Block close without evidence | FR-SOPS-006 | AC-SOPS-006 | Guard on Done; explanatory message |
| Field-friendly UI | FR-SOPS-011 | AC-SOPS-012 `[DRAFT]` | 48px targets; icon per action; dark-environment contrast; Thai-first copy |

Open question carried on the Project: Burmese UI vs icons `[AMBIGUOUS]`.

### Project 3 (Epic): Evidence governance (PDPA)
Source: FR-SOPS-005, 007; BR-SOPS-004

| Issue (Story) | Source | Acceptance criteria | Sub-issues (Tasks) |
|---|---|---|---|
| Central evidence storage | FR-SOPS-005, BR-SOPS-004 | AC-SOPS-007 | Storage bucket; retention rule; access control |
| Delete evidence on tenant request | FR-SOPS-007 | AC-SOPS-008 | Delete action with reason; audit log entry |

### Project 4 (Epic): Operations dashboard and asset history
Source: FR-SOPS-008, 009

| Issue (Story) | Source | Acceptance criteria | Sub-issues (Tasks) |
|---|---|---|---|
| Backlog and P1 SLA dashboard | FR-SOPS-008 | AC-SOPS-009 | Backlog by priority; P1 near/over SLA; closed today |
| Asset repair history | FR-SOPS-009 | AC-SOPS-010 | Asset entity; link work order to asset; history view |

### Not created (blocked on decisions)
- Login / SSO: waiting on IT (A-001, `[AMBIGUOUS]`). Would become its own Project once decided.
- LINE integration: out of scope until format is chosen.

## What the agent would say before creating

> โครงสร้างข้างต้นแตกจาก PRD-SOPS-001 เท่านั้น มี 4 Project, 12 Issue, 30 Sub-issue
> ยังไม่ได้สร้างจริง 2 จุดที่ยังไม่ชัดพอจะแตกเป็น Story ถูกกันไว้ (login, LINE)
> ตรวจ duplicate แล้วไม่พบ ให้ approve แล้วผมจะสร้างทีละรายการและรอผลก่อนไปตัวถัดไป
