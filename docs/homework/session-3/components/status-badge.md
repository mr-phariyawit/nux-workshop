---
id: CMP-status-badge
name: StatusBadge
status: ready
source: hand-authored
generated_at: 2026-09-22
generator: hand
design_md_version: 1.2.0
---

# StatusBadge

## Overview

Shows a work-order status or priority as icon + label. Wraps shadcn/ui `Badge`.
It is never interactive and never colour-only (RULE-006, A11Y-003). The label
text is the glossary term, not the enum value.

**Variant axes**

| Axis | Values | Default |
|---|---|---|
| `kind` | `status`, `priority` | `status` |
| `value` (status) | `new`, `assigned`, `acknowledged`, `in-progress`, `temp-fix`, `done`, `merged`, `pending-sync` | — |
| `value` (priority) | `p1`, `p2`, `p3` | — |
| `size` | `md`, `sm` | `md` |

## Known gaps

- [GAP] Thai label for `merged` (`รวมใบงานแล้ว`) is `inferred` in UX.md glossary; confirm with the facility manager.
- [GAP] Dark-theme colours for `new`, `assigned`, `acknowledged` are not in DESIGN.md §2.2; using `--color-fg-secondary` on `--color-bg-surface` until added.

## Follow-ups

- [ ] Add `--color-status-new/assigned/acknowledged` to DESIGN.md "Proposed additions" and re-run `check_contrast`.
- [ ] Confirm `merged` label.

## API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `kind` | `"status" \| "priority"` | `"status"` | no | Which vocabulary `value` belongs to. |
| `value` | `Status \| Priority` | — | yes | Enum from PRD FR-SOPS-003/004. |
| `size` | `"md" \| "sm"` | `"md"` | no | 20 px icon on `md`, 16 px on `sm`. Badge is non-interactive so no 44 px rule. |
| `label` | `string` | glossary term | no | Override only for tests; product code uses the glossary. |

## Structure

- `root` — `<span>` with `data-kind` and `data-value`
- `icon` — Lucide icon per value, `aria-hidden="true"`
- `label` — visible text

## Color

| Value | Token (fg on bg) |
|---|---|
| `p1` | `--color-on-status-p1` on `--color-status-p1` |
| `p2` | `--color-on-status-p2` on `--color-status-p2` |
| `p3` | `--color-on-status-p3` on `--color-status-p3` |
| `done` | `--color-on-status-done` on `--color-status-done` |
| `in-progress`, `temp-fix` | `--color-primary` text, `--color-border` outline |
| `pending-sync` | `--color-status-pending-sync` icon, `--color-fg-secondary` text, dashed `--color-border` outline |
| `new`, `assigned`, `acknowledged`, `merged` | `--color-fg-secondary` on `--color-bg-surface` (GAP) |

## Voice / Screen reader

- Role: none (`<span>`); the visible label is the announcement.
- Priority badges prefix the label with the kind in Thai: "ความสำคัญ P1".
- `pending-sync` label is "รอส่ง" and is followed by the queued count when inside a list (RULE-001).

## Cross-references

- RULE-001 offline is first-class (`pending-sync`)
- RULE-006 icon + label, never colour alone
- RULE-009 P1 is loud
- A11Y-003 colour is not the only carrier
- A11Y-001 text contrast
- FR-SOPS-003 status model, FR-SOPS-004 priority model

## Provenance

| Fact | Source |
|---|---|
| status and priority vocabularies | `03-PRD.md` FR-SOPS-003/004 (confirmed) |
| icon + label rule | `UX.md` RULE-006 (confirmed, E1) |
| colour tokens | `DESIGN.md` §2.2 v1.2 (`--color-on-status-*` added after `check_contrast` failed white-on-green) |
| Thai labels | `UX.md` glossary (`merged` is inferred) |

## render-meta

```json
{
  "id": "CMP-status-badge",
  "primitive": "shadcn/badge",
  "axes": {
    "kind": ["status", "priority"],
    "status": ["new", "assigned", "acknowledged", "in-progress", "temp-fix", "done", "merged", "pending-sync"],
    "priority": ["p1", "p2", "p3"],
    "size": ["md", "sm"]
  },
  "states": ["default"],
  "tokens": ["--color-status-p1", "--color-status-p2", "--color-status-p3", "--color-status-done", "--color-on-status-p1", "--color-on-status-p2", "--color-on-status-p3", "--color-on-status-done", "--color-status-pending-sync", "--color-primary", "--color-border", "--color-fg-secondary", "--color-fg-primary", "--color-on-primary", "--color-bg-surface"],
  "role": null,
  "contracts": ["RULE-001", "RULE-006", "RULE-009", "A11Y-001", "A11Y-003", "FR-SOPS-003", "FR-SOPS-004"]
}
```
