---
id: CMP-work-order-card
name: WorkOrderCard
status: draft
source: hand-authored
generated_at: 2026-09-22
generator: hand
design_md_version: 1.2.0
---

# WorkOrderCard

## Overview

List item for a work order (ใบงาน). Composes shadcn/ui `Card` with
`StatusBadge`, `SlaCountdown` and one `Button`. The `field` variant is the
technician's home-screen row: tier `lg`, one visible primary action whose label
depends on status (รับงาน → เริ่มงาน → ปิดงาน). The `dashboard` variant is compact
and has no inline action.

**Variant axes**

| Axis | Values | Default |
|---|---|---|
| `surface` | `field`, `dashboard` | `field` |
| `priority` | `p1`, `p2`, `p3` | — |
| `sync` | `synced`, `pending` | `synced` |
| `state` | `default`, `focus-visible`, `pressed` | `default` |

## Known gaps

- [GAP] Avatar for assignee: no asset or fallback rule in DESIGN.md; using initials on `--color-border`.
- [GAP] What the card shows when the P1 SLA clock has not started (`[AMBIGUOUS]` in `02-requirements.md`): currently hides `SlaCountdown`.
- [GAP] Long titles: truncation vs wrap not decided; wrapping to 2 lines for now (A11Y-006 favours wrap).

## Follow-ups

- [ ] Resolve SLA clock start with the facility manager, then update `SlaCountdown` visibility.
- [ ] Figma export.

## API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `workOrder` | `WorkOrderSummary` | — | yes | `{ id, title, location, priority, status, assignee?, slaDueAt?, pendingSync }` |
| `surface` | `"field" \| "dashboard"` | `"field"` | no | Size tier and whether the inline action shows. |
| `onPrimaryAction` | `(id: string, action: "accept" \| "start" \| "close") => void` | — | field only | Called from the one inline Button. |
| `onOpen` | `(id: string) => void` | — | yes | Whole card opens the detail screen. |

## Structure

- `root` — `<article aria-labelledby={titleId}>`; whole surface is a 56 px+ tap target that calls `onOpen`
- `header` — `id` (monospace, `--color-fg-secondary`) + `StatusBadge kind="priority"`
- `title` — `<h3 id={titleId}>`; 2-line wrap
- `meta` — location text + `StatusBadge kind="status"`
- `sla` — `SlaCountdown` when `priority === "p1"` and `slaDueAt` is set
- `sync` — `StatusBadge value="pending-sync"` when `pendingSync`
- `action` — one `Button size="lg"` on `field` only; label by status: `new|assigned → "รับงาน"`, `acknowledged → "เริ่มงาน"`, `in-progress|temp-fix → "ปิดงาน"`; none for `done|merged`

## Color

| Element | Token |
|---|---|
| background | `--color-bg-surface` |
| border | `--color-border`; `--color-status-p1` 2 px when `priority === "p1"` and SLA breached (RULE-009) |
| id, location | `--color-fg-secondary` |
| title | `--color-fg-primary` |
| focus ring | `--color-focus-ring` |

## Voice / Screen reader

- Role: `article` named by the title.
- Reading order: priority, title, status, location, SLA, sync, action.
- The action Button's name is its label plus the work-order id via `aria-describedby` so "รับงาน" is unambiguous in a list.
- SLA breached: `SlaCountdown` announces "เกินกำหนด" (A11Y-017 handles the live region, not the card).

## Cross-references

- RULE-001 offline first-class (pending badge)
- RULE-003 one primary action
- RULE-006 icon + label
- RULE-009 P1 loud
- A11Y-006 reflow / wrap
- A11Y-007 target size
- A11Y-016 semantic structure
- FLOW-SOPS-001 accept → start → close
- AC-SOPS-003, AC-SOPS-005, AC-SOPS-008

## Provenance

| Fact | Source |
|---|---|
| card content list | `DESIGN.md` §6 WorkOrderCard |
| action label per status | `UX.md` glossary + FLOW-SOPS-001 (confirmed) |
| P1 border rule | `UX.md` RULE-009 (confirmed, E1) |
| avatar fallback, truncation, SLA-not-started | inferred (GAPs above) |

## render-meta

```json
{
  "id": "CMP-work-order-card",
  "primitive": "shadcn/card",
  "composes": ["CMP-status-badge", "CMP-button"],
  "axes": {
    "surface": ["field", "dashboard"],
    "priority": ["p1", "p2", "p3"],
    "sync": ["synced", "pending"]
  },
  "states": ["default", "focus-visible", "pressed"],
  "tokens": ["--color-bg-surface", "--color-border", "--color-status-p1", "--color-fg-secondary", "--color-fg-primary", "--color-focus-ring"],
  "minTarget": { "field": 56, "dashboard": 44 },
  "role": "article",
  "contracts": ["RULE-001", "RULE-003", "RULE-006", "RULE-009", "A11Y-006", "A11Y-007", "A11Y-016", "FLOW-SOPS-001", "AC-SOPS-003", "AC-SOPS-005", "AC-SOPS-008"]
}
```
