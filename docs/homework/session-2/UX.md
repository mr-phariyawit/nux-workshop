---
schema_version: "1.0"
document_status: "prototype-ready"
product: "SiteOps — work-order management for Sathorn Prime Tower facility team"
scope: "Phase 1: intake, assignment, offline field updates, evidence, SLA dashboard. Excludes procurement, tenant billing, IoT, LINE integration."
version: "0.1.0"
last_reviewed: "2026-09-22"
owners: ["Aeternix UX Lead"]
design_spec: "docs/homework/session-2/DESIGN.md"
context_index_refs: []
component_refs: ["docs/homework/session-3/components/"]
research_refs: ["docs/homework/session-1/01-transcript.md"]
mcp_or_skill_refs: ["src/mcp/sitops-design-system/"]
---

# UX Context

> **Simulated.** Built with the course's `create-ux-md` skill format from a single
> source: the simulated discovery transcript. There is no usability study, no
> analytics, no support log. Consequently almost every claim is `E1`
> (stakeholder report) and labelled `inferred` or `suggested`. That is the honest
> state of most real Phase-1 projects, and the readiness table at the end says so.

## 1. Product context

- Product: SiteOps, a work-order system for a 14-person building facility team; web dashboard for managers and directors, mobile PWA for technicians.
- Core value: every repair request has one record, one owner, evidence, and a provable SLA clock.
- Scope and exclusions: Phase 1 per `PRD-SOPS-001` §3 and §12.
- Platforms and lifecycle stage: web (desktop Chrome/Edge) + mobile PWA (Android Chrome, iOS Safari); discovery → prototype.
- Key objects and relationships: **Work order** (has priority, status, assignee, location, evidence photos, SLA deadlines) → belongs to an **Asset** (optional) → reported by one or more **Reporters**. **Shift** groups technicians available for assignment.
- Business, policy, privacy, safety, or compliance constraints: company PDPA policy (evidence stored centrally, deletable on tenant request); P1 SLA is contractual with tenants on floors 20–28 and carries penalties.
- Visual-design boundary: colours, type, spacing, component visuals live in `DESIGN.md`. This file owns behaviour, hierarchy, states, and language.

## 2. User models

### USER-001 — Facility Manager (dispatcher)

- Status: `confirmed`
- Evidence level: `E1`
- Role and expertise: one person; runs the counter; expert in the building, novice in software beyond Excel/LINE
- Goals and missions: capture every request, assign fast, prove SLA, answer the director without a two-day spreadsheet exercise
- Concerns and expectations: fear of losing a request; fear of blame when a P1 is late; interrupted constantly (phone, walk-ups)
- Mental model: "a request is a slip of paper that must land on a technician"; thinks in floors and tenants, not ticket numbers
- Constraints and access needs: desktop at counter; frequent context switches; Thai-only
- Exclusions or non-users: does not perform repairs; does not need mobile flows
- Source and freshness: transcript 2026-09-15

### USER-002 — Field Technician

- Status: `confirmed`
- Evidence level: `E1`
- Role and expertise: nine technicians across shifts; some outsourced; some Burmese speakers who read some Thai and little English; expert in equipment, low tolerance for software friction
- Goals and missions: know today's jobs, do them, record what was done with a photo, not get blamed for late updates caused by no signal
- Concerns and expectations: "the app will not work in B2 and I will end up back on LINE"; mis-taps with gloves; phone battery
- Mental model: job list for today; status is "I've seen it / I'm on it / it's fixed for now / it's done"
- Constraints and access needs: small phone screens, gloves, dim spaces, no connectivity in B2–B3, limited Thai/English reading
- Exclusions or non-users: does not create or reassign work orders
- Source and freshness: transcript 2026-09-15

### USER-003 — Building Operations Director

- Status: `confirmed`
- Evidence level: `E1`
- Role and expertise: accountable to the building owner and to tenant contracts; uses the system a few minutes a day
- Goals and missions: instant answer to "how much is open, how many P1, are we in breach"; evidence for insurers
- Concerns and expectations: numbers must reconcile; nothing "looks good" but is wrong
- Mental model: a monthly report, now live
- Constraints and access needs: desktop and occasionally phone; low patience for setup
- Exclusions or non-users: does not dispatch
- Source and freshness: transcript 2026-09-15

## 3. World models / context of use

### WORLD-001 — Technician in basement or plant room

- Status: `confirmed`
- Evidence level: `E1`
- Frequency and session length: many short sessions per shift (30 s to 3 min), triggered by arriving at or finishing a job
- Physical, social, and operational environment: B2–B3 and rooftop plant rooms; dim, noisy, wet floors possible; gloves on; often holding a tool or torch in the other hand
- Devices and input modes: personal or shared Android phones of varying age; one-handed; camera used constantly
- Network and connectivity: **none** in B2–B3; intermittent in stairwells; fine on office floors
- Interruptions and recovery needs: radio calls, another technician asking for help; the app may be backgrounded or killed mid-task
- Stress, time pressure, or attention constraints: high during P1; attention is on the equipment, not the phone
- Compliance or audit conditions: evidence photo required to close; device time is the record of truth
- Consequences of error: wrong status → SLA penalty dispute; missing photo → insurance dispute; accidental "Done" → job believed finished when it is not
- Design implications: offline-first is a hard requirement; one primary action per screen; large targets; icon + label; explicit pending-sync state; destructive/irreversible actions need confirmation; timestamps come from the device at the moment of action
- Source and freshness: transcript 2026-09-15

### WORLD-002 — Facility Manager at the counter

- Status: `confirmed`
- Evidence level: `E1`
- Frequency and session length: all day, dozens of short interactions between phone calls and walk-ups
- Physical, social, and operational environment: front counter; tenants present; constant interruption
- Devices and input modes: desktop with keyboard and mouse
- Network and connectivity: reliable
- Interruptions and recovery needs: half-completed intake forms are common; drafts must survive navigation away
- Stress, time pressure, or attention constraints: spikes when a P1 arrives
- Compliance or audit conditions: acknowledgement time for P1 is contractual
- Consequences of error: request not recorded → job never done; wrong priority → SLA clock wrong
- Design implications: intake in ≤ 5 fields; autosave drafts; P1 visually dominant on the queue; near-breach alerts
- Source and freshness: transcript 2026-09-15

### WORLD-003 — Director reviewing status

- Status: `inferred`
- Evidence level: `E1`
- Frequency and session length: daily glance; monthly deep-dive
- Design implications: dashboard opens on the answer (open count, P1 count, breaches) with no configuration; export for management deck is a Phase-2 candidate
- Source and freshness: inferred from director's statements in transcript

## 4. Research synthesis

### INS-001 — Connectivity gaps cause status lag of hours

- Status: `confirmed`
- Evidence level: `E1`
- Finding, signal, assumption, or hypothesis: Signal. Technicians complete work at ~10:00 in B2 and can only report in the afternoon.
- Evidence: Head Technician statement, transcript [02:05]
- Source and freshness: 2026-09-15
- Limitations or conflicting evidence: single informant; no measurement of actual lag distribution
- Design implication: device-time stamping and an offline queue are not optional; the UI must show what is queued so technicians trust it
- Related user/world models and rules: USER-002, WORLD-001, RULE-001, RULE-002

### INS-002 — Gloves and darkness cause mis-taps

- Status: `confirmed`
- Evidence level: `E1`
- Finding: Signal. Technicians mis-tap and mis-photograph while gloved in dim spaces.
- Evidence: Head Technician, transcript [02:58]
- Limitations: anecdotal
- Design implication: 56 px targets on field surface, dark theme default, retake before sync, confirm irreversible actions
- Related: USER-002, WORLD-001, RULE-003, RULE-004

### INS-003 — Evidence lives in personal devices and is lost

- Status: `confirmed`
- Evidence level: `E1`
- Finding: Signal. An insurance query could not be answered because photos were on a departed technician's phone.
- Evidence: Director, transcript [04:25]
- Design implication: in-app capture only, central storage, evidence gate on Done
- Related: USER-003, RULE-005, BR-SOPS-003/004

### INS-004 — Duplicate reports create duplicate work

- Status: `confirmed`
- Evidence level: `E1`
- Finding: Signal. One issue is reported by several tenants and becomes several work orders.
- Evidence: Head Technician, transcript [09:45]
- Design implication: similarity hint on intake; merge flow that preserves all reporters
- Related: USER-001, RULE-007

### INS-005 — Some technicians cannot rely on Thai or English text

- Status: `confirmed`
- Evidence level: `E1`
- Finding: Signal. Burmese-speaking technicians read some Thai and little English; manager suggests icon buttons.
- Evidence: Facility Manager, transcript [07:50]
- Limitations: no assessment of actual literacy levels; "icons will help" is a stakeholder hypothesis, not tested
- Design implication: fixed icon per action (see `DESIGN.md` §7), icon + label everywhere, minimal text on field surface; a Burmese locale is a `suggested` follow-up pending GAP-003
- Related: USER-002, RULE-006

### INS-006 — Dispatcher is interrupt-driven

- Status: `inferred`
- Evidence level: `E1`
- Finding: Assumption. Because intake arrives by phone, LINE, and walk-up, the manager frequently abandons a form mid-way.
- Evidence: transcript [01:20]; inference about interruption pattern
- Design implication: autosave drafts; resume banner
- Related: USER-001, WORLD-002, RULE-008

## 5. Interaction standards

### RULE-001 — Offline is a first-class state, not an error

- Strength: `must`
- Status: `confirmed`
- Applies when: field surface, any time connectivity is absent or degraded
- Rule: all status changes and photo captures succeed locally and are queued; the UI shows a persistent offline banner with the queued count; nothing is greyed out because of connectivity
- Rationale and evidence: INS-001, WORLD-001
- Exceptions: actions that need server data not cached (e.g., asset history not yet loaded) show an explicit "not available offline" message, not a spinner
- Verification: AC-SOPS-004, AC-SOPS-005

### RULE-002 — Device time is the event time

- Strength: `must`
- Status: `confirmed`
- Applies when: any status change or capture on the field surface
- Rule: the timestamp shown and stored is when the technician acted, not when the server received it; sync time is stored separately and shown as secondary meta
- Rationale and evidence: INS-001, BR-SOPS-005
- Exceptions: none
- Verification: AC-SOPS-004

### RULE-003 — One primary action per field screen

- Strength: `must`
- Status: `inferred`
- Applies when: field surface
- Rule: each screen has exactly one `primary` button reflecting the next status; other actions are `secondary` or in an overflow; the primary sits in the bottom thumb zone
- Rationale and evidence: INS-002, WORLD-001 (one-handed, gloved)
- Exceptions: work-order detail may show "Take photo" as a second large button because it precedes Done
- Verification: design review checklist; A11Y.md target-size test

### RULE-004 — Confirm irreversible or high-consequence actions; make the rest undoable

- Strength: `must`
- Status: `inferred`
- Applies when: `Done`, `Merge`, evidence deletion
- Rule: these require an explicit confirmation sheet stating the consequence; ordinary status moves (Acknowledge, Start, Temporary fix) are immediate with a 5 s undo toast
- Rationale and evidence: WORLD-001 consequences of error; INS-002
- Exceptions: none
- Verification: manual test script; AC-SOPS-006

### RULE-005 — Evidence gate

- Strength: `must`
- Status: `confirmed`
- Applies when: transitioning to `Done`
- Rule: `Done` is disabled until at least one photo is attached; the disabled button shows the reason inline ("แนบรูปก่อนปิดงาน")
- Rationale and evidence: INS-003, BR-SOPS-003
- Exceptions: none in Phase 1
- Verification: AC-SOPS-006

### RULE-006 — Icon + label, never one without the other

- Strength: `must`
- Status: `confirmed`
- Applies when: all surfaces; especially field
- Rule: every action and every status shows its fixed icon (`DESIGN.md` §7) and its text label; colour is never the sole carrier of meaning
- Rationale and evidence: INS-005; A11Y.md
- Exceptions: icon-only in dense dashboard tables only with `aria-label` and tooltip
- Verification: axe (colour-only), design review

### RULE-007 — Merging preserves everyone

- Strength: `must`
- Status: `confirmed`
- Applies when: duplicate merge
- Rule: the surviving work order lists all reporters and their channels; merged records remain viewable with a "Merged into #…" link
- Rationale and evidence: INS-004
- Verification: AC-SOPS-011

### RULE-008 — Drafts survive interruption

- Strength: `should`
- Status: `inferred`
- Applies when: intake form on dashboard
- Rule: intake autosaves on every field change; returning to the intake shows "มีแบบร่างค้าง" with resume/discard
- Rationale and evidence: INS-006
- Verification: manual

### RULE-009 — P1 is loud, everything else is calm

- Strength: `should`
- Status: `inferred`
- Applies when: dashboard queue and field list
- Rule: P1 rows carry the P1 badge, SLA countdown, and sort to the top; near-breach (≤ 5 min to acknowledge) triggers a non-dismissable banner for the dispatcher
- Rationale and evidence: WORLD-002, BR-SOPS-001
- Exceptions: none
- Verification: AC-SOPS-002, AC-SOPS-009

### Required behavioral coverage

- Navigation and information density: field = one work order per screen, list is cards; dashboard = table with density `sm` allowed
- Forms and input: labels above; Thai copy; numeric keypad for floor field
- Loading and latency: skeletons on dashboard; field surface shows cached data instantly with a "last synced" line
- Empty and first-use: "ยังไม่มีงานวันนี้" with icon; no onboarding tour in Phase 1
- Validation and user error: inline, icon + text; never only red border
- System and partial failure: sync failure per item with retry; never lose the queue
- Success and confirmation: undo toast for reversible moves; confirmation sheet for irreversible
- Permissions and unavailable actions: technician cannot reassign; show as absent, not disabled
- Destructive actions, undo, and recovery: RULE-004
- Autosave, sync, and interruption: RULE-001, RULE-008

## 6. Glossary

### Voice and language

- Primary language and locales: Thai (th-TH) primary; English secondary on dashboard; Burmese `suggested` (GAP-003)
- Tone: plain, short, imperative on buttons ("รับงาน", "เริ่มงาน", "ปิดงาน")
- Reading level or expertise assumptions: assume limited reading on the field surface; never rely on a sentence to explain a button

### Terms

| Preferred term | Meaning | Use when | Avoid / forbidden synonyms |
|---|---|---|---|
| ใบงาน (Work order) | one repair request record | everywhere | ticket, issue, เคส |
| รับงาน (Acknowledge) | technician confirms they have seen and own the job | field action | accept, รับทราบ |
| เริ่มงาน (Start) | technician begins work on site | field action | in progress (as a button) |
| แก้ชั่วคราว (Temporary fix) | hazard contained, permanent fix pending | field action; SLA milestone | patch, workaround |
| ปิดงาน (Done) | work complete with evidence | field action | close, finish, เสร็จสิ้น (as button) |
| P1 / P2 / P3 | priority tiers; only P1 has contractual SLA in Phase 1 | badges | urgent/high/low |
| รวมใบงาน (Merge) | fold a duplicate into the primary record | dispatcher action | delete, ลบซ้ำ |
| รอส่ง (Pending sync) | action recorded on device, not yet on server | field status | offline error, failed |
| หลักฐาน (Evidence) | in-app photo bound to the work order | everywhere | attachment, รูปภาพ (generic) |

## 7. Related artifacts

- `DESIGN.md` and design tokens: `docs/homework/session-2/DESIGN.md`
- Component library and relevant code paths: `docs/homework/session-3/components/`, `src/mcp/sitops-design-system/`
- Research repository and source material: `docs/homework/session-1/01-transcript.md`
- Product requirements and policies: `docs/homework/session-1/03-PRD.md`; company PDPA policy (not yet received, GAP-004)
- Analytics and dashboards: none yet
- Additional context files or indexes: `A11Y.md`, `AGENTS.md`
- MCP servers or agent skills: `sitops-design-system` MCP (Session 3)

## 8. Context validation and maintenance

- AI or design task evaluated: generate "Work Order Detail (field)" screen in Stitch
- Baseline output without `UX.md`: _to be recorded on first run_ (expected: generic ticket UI, "Close" enabled without photo, no offline state)
- Result with `UX.md`: _to be recorded_
- Rule violations or manual corrections: _to be recorded_
- User outcome validation: none yet; first field pilot planned after prototype
- Known AI mistakes to feed back into context: _none recorded yet_
- Next validation action: run the Stitch prompt in `prompts/stitch-work-order-detail.md` twice (with and without this file) and diff against RULE-001, 003, 005, 006
- Update triggers: SLA decisions for P2/P3; login decision; first pilot feedback; any change to `DESIGN.md` §5 size tiers
- Owner, reviewers, and review cadence: Aeternix UX Lead; reviewed at each PRD version bump
- Freshness risks: everything is E1 from one meeting; a single shadowing session in B2 would upgrade WORLD-001 to E2/E3

## 9. Provenance and open questions

### Provenance legend

- `confirmed`: supplied directly or supported by a traceable source.
- `inferred`: derived from confirmed context and awaiting confirmation.
- `suggested`: provisional best-practice or contextual recommendation.
- `unknown`: missing information that must not be assumed.

### Assumptions, unknowns, and conflicts

| ID | Type | Description | Decision at risk | Validation action | Priority |
|---|---|---|---|---|---|
| GAP-001 | unknown | SLA for P2/P3 | queue sorting, countdown scope | Facility Manager to define; until then only P1 has a clock | high |
| GAP-002 | unknown | Login method (AD vs local) | first-run flow, offline auth | IT meeting week of 2026-09-22 | high |
| GAP-003 | unknown | Whether icons suffice for Burmese-speaking technicians | field copy strategy, locale work | 30-min task test with 2 technicians using icon-only prototype | high |
| GAP-004 | unknown | Exact PDPA retention and deletion rules | evidence storage design | obtain policy document | medium |
| GAP-005 | assumption | 4-hour temporary-fix clock counts from report time (A-002) | SLA computation | confirm with Facility Manager | medium |
| GAP-006 | conflict | Director wants "real-time"; technicians are offline for hours | dashboard expectations | set expectation: dashboard shows last-synced time per work order | medium |

## 10. Readiness summary

| Domain | Score (0/1/2/N/A) | Notes |
|---|---:|---|
| Scope and product | 2 | PRD-SOPS-001 approved as draft |
| User models | 1 | three roles confirmed, all E1 |
| World models | 1 | strong on B2 context, single source |
| Evidence | 1 | no direct observation yet |
| Interaction standards | 2 | rules testable against ACs |
| Glossary | 2 | agreed terms from transcript |
| Related artifacts | 1 | PDPA doc missing |
| Context validation and governance | 0 | no baseline run recorded yet |

Readiness label: **Prototype-ready.** Not delivery-ready until GAP-001, GAP-002, GAP-003 close and one field observation is done.
