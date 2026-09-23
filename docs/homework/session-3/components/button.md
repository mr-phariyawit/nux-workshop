---
id: CMP-button
name: Button
status: ready
source: hand-authored
generated_at: 2026-09-22
generator: hand
design_md_version: 1.2.0
---

# Button

## Overview

The single action primitive for SiteOps. Wraps shadcn/ui `Button`. On the field
surface it is always tier `lg` (56 px) and every screen shows exactly one
`primary` Button (RULE-003). Icon-only Buttons must carry an accessible name.

**Variant axes**

| Axis | Values | Default |
|---|---|---|
| `variant` | `primary`, `secondary`, `destructive`, `ghost` | `primary` |
| `size` | `lg`, `md`, `sm` | `lg` |
| `state` | `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading` | `default` |
| `icon` | `none`, `leading`, `only` | `none` |

## Known gaps

- [GAP] No Figma node exists; visual values come from `DESIGN.md` only. Elevation on `active` is undefined.
- [GAP] `loading` spinner asset not specified; using Lucide `loader-circle` with `animate-spin` until DESIGN.md §8 says otherwise.

## Follow-ups

- [ ] Export from Figma once the DesignOps plugin has a SiteOps file; regenerate this spec with `source: figma:<node-id>`.
- [ ] Decide `destructive` confirm pattern (RULE-004 says confirm irreversible; the Button itself does not confirm).

## API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "destructive" \| "ghost"` | `"primary"` | no | Visual emphasis. Only one `primary` per field screen. |
| `size` | `"lg" \| "md" \| "sm"` | `"lg"` | no | Size tier from DESIGN.md §5. `sm` pads its hit area to 44 px. |
| `icon` | `LucideIcon` | — | no | Leading icon. 24 px on `lg`, 20 px on `md`/`sm`. |
| `iconOnly` | `boolean` | `false` | no | Hides the label visually; `aria-label` becomes required. |
| `aria-label` | `string` | — | when `iconOnly` | Accessible name for icon-only Buttons (A11Y-004). |
| `loading` | `boolean` | `false` | no | Shows spinner, sets `aria-busy`, keeps width, blocks clicks. |
| `disabled` | `boolean` | `false` | no | Disabled, still focusable-visible per A11Y-014 (uses `aria-disabled`). |
| `children` | `ReactNode` | — | yes unless `iconOnly` | Label text from the UX.md glossary. |

## Structure

- `root` — `<button type="button">` (or `type="submit"` inside forms)
- `icon` — optional, `aria-hidden="true"`
- `label` — text node; visually hidden when `iconOnly`
- `spinner` — replaces `icon` when `loading`

## Color

| Element | Token (light and dark share the name) |
|---|---|
| primary background | `--color-primary` |
| primary foreground | `--color-on-primary` |
| primary hover | `--color-primary-hover` |
| secondary border/text | `--color-fg-primary` on `--color-bg-surface` |
| destructive background | `--color-status-p1` |
| destructive foreground | `--color-on-status-p1` |
| ghost text | `--color-fg-secondary` |
| focus ring | `--color-focus-ring`, 3 px, offset 2 px |
| disabled | same tokens at 50 % opacity plus `aria-disabled` |

## Voice / Screen reader

- Role: `button`.
- Accessible name: visible label, or `aria-label` when `iconOnly`.
- `loading`: `aria-busy="true"`; label stays so the name does not change mid-action.
- `disabled`: `aria-disabled="true"`; a `title` or adjacent text says why (RULE-005 "แนบรูปก่อนปิดงาน").
- Never announce colour or icon shape.

## Cross-references

- RULE-003 one primary action per field screen
- RULE-005 evidence gate (disabled state copy)
- A11Y-004 accessible names for icon-only controls
- A11Y-007 target size 56 / 44
- A11Y-009 visible focus
- A11Y-014 disabled controls remain perceivable
- AC-SOPS-008 close requires photo

## Provenance

| Fact | Source |
|---|---|
| variants, sizes, states | `DESIGN.md` §6 Button |
| size tier heights | `DESIGN.md` §5 |
| one primary per screen | `UX.md` RULE-003 (confirmed, E1) |
| disabled-not-hidden | `A11Y.md` A11Y-014 |
| spinner icon | inferred (GAP above) |

## render-meta

```json
{
  "id": "CMP-button",
  "primitive": "shadcn/button",
  "axes": {
    "variant": ["primary", "secondary", "destructive", "ghost"],
    "size": ["lg", "md", "sm"],
    "icon": ["none", "leading", "only"]
  },
  "states": ["default", "hover", "focus-visible", "active", "disabled", "loading"],
  "tokens": ["--color-primary", "--color-on-primary", "--color-primary-hover", "--color-status-p1", "--color-on-status-p1", "--color-fg-primary", "--color-fg-secondary", "--color-bg-surface", "--color-focus-ring"],
  "minTarget": { "lg": 56, "md": 44, "sm": 44 },
  "role": "button",
  "contracts": ["RULE-003", "RULE-005", "A11Y-004", "A11Y-007", "A11Y-009", "A11Y-014", "AC-SOPS-008"]
}
```
