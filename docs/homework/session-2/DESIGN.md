---
name: SiteOps Design System
version: 1.2.0
status: draft
source: hand-authored for the course homework (no Figma file exists; a real project would export this with the DesignOps plugin)
platforms: [web-dashboard, mobile-pwa]
implementation: [react, shadcn-ui, tailwind]
owner: Aeternix UX Lead
last_reviewed: 2026-09-22
---

# SiteOps — DESIGN.md

> **AI AGENT INSTRUCTIONS — READ FIRST, APPLY TO ALL OUTPUT**
>
> 1. This file is the only source of visual truth. Do not invent colours, fonts, radii, or spacing.
> 2. Use semantic tokens (`--color-bg-*`, `--color-fg-*`, `--color-status-*`), never primitive hex values, in generated UI.
> 3. Every interactive element on the **field** surface uses the `lg` size tier (56 px) by default. `md` is for the dashboard only.
> 4. Every status is expressed by colour **and** icon **and** text. Never colour alone.
> 5. Light and dark themes are both mandatory; the field surface defaults to dark.
> 6. Reuse the components in §6 before creating a new one. If a new component is unavoidable, name it and list it under "Proposed additions" in your output.
> 7. Behaviour, copy, and interaction rules live in `UX.md`, accessibility rules in `A11Y.md`. On conflict about visuals this file wins; on conflict about behaviour `UX.md` wins.
> 8. **Unknowns**: if a visual decision is not defined here, ask before inventing it.

## 1. Brand personality

**Calm authority in a noisy building.** SiteOps is used while a pump is leaking and a tenant is on the phone. The interface must feel like a competent colleague: unhurried, unambiguous, never decorative. Three principles:

- **Legible under stress** — large type, high contrast, generous targets. If it is hard to read in a dim B3 corridor on a cracked phone, it is wrong.
- **Status first** — the state of a work order (and how close it is to its SLA) is the most important thing on any screen.
- **One obvious action** — each field screen has one primary action. Secondary actions are visually quieter.

Tone words: steady, clear, direct. Not: playful, techy, dense.

## 2. Colour

### 2.1 Primitives (do not use directly in UI)

| Token | Value | Notes |
|---|---|---|
| `slate.50` | `#F6F8FA` | |
| `slate.100` | `#E9EEF3` | |
| `slate.200` | `#D2DBE4` | |
| `slate.400` | `#8A98A8` | |
| `slate.600` | `#4F5E70` | |
| `slate.800` | `#22303F` | |
| `slate.900` | `#141C26` | |
| `slate.950` | `#0B1017` | |
| `teal.500` | `#0F8B8D` | brand accent (decorative only: logo, fills). 4.1:1 on white — **not** for text |
| `teal.600` | `#0B6F71` | brand primary (light theme). 6.0:1 on white |
| `teal.700` | `#085456` | primary hover (light) |
| `teal.300` | `#6FCBCB` | dark-theme primary |
| `red.500` | `#D63C3C` | P1 |
| `red.300` | `#F08A8A` | P1 on dark |
| `amber.500` | `#BD7708` | P2. 3.6:1 on white (was `#D98A0B`, 2.8:1, see changelog 1.2) |
| `amber.300` | `#F5C56B` | P2 on dark |
| `blue.500` | `#2F6FD6` | P3 |
| `blue.300` | `#8DB4F2` | P3 on dark |
| `green.500` | `#1E9E5A` | done / synced |
| `green.300` | `#7BD5A2` | |
| `white` | `#FFFFFF` | |

### 2.2 Semantic tokens

| Token | Light | Dark (field default) | Use |
|---|---|---|---|
| `--color-bg-canvas` | `slate.50` | `slate.950` | page background |
| `--color-bg-surface` | `white` | `slate.900` | cards, sheets |
| `--color-bg-surface-raised` | `white` | `slate.800` | modals, menus |
| `--color-fg-primary` | `slate.900` | `slate.50` | body text |
| `--color-fg-secondary` | `slate.600` | `slate.200` | meta text (min 4.5:1 on its surface) |
| `--color-fg-muted` | `slate.400` | `slate.400` | disabled text only |
| `--color-border` | `slate.200` | `slate.800` | dividers, input borders |
| `--color-primary` | `teal.600` | `teal.300` | primary button, links, focus |
| `--color-primary-hover` | `teal.700` | `teal.500` | |
| `--color-on-primary` | `white` | `slate.950` | text on primary |
| `--color-status-p1` | `red.500` | `red.300` | P1 badge, SLA breach |
| `--color-status-p2` | `amber.500` | `amber.300` | |
| `--color-status-p3` | `blue.500` | `blue.300` | |
| `--color-status-done` | `green.500` | `green.300` | Done, synced |
| `--color-on-status-p1` | `white` | `slate.950` | text on a P1 fill |
| `--color-on-status-p2` | `slate.900` | `slate.950` | text on a P2 fill (white fails 4.5:1 on amber) |
| `--color-on-status-p3` | `white` | `slate.950` | text on a P3 fill |
| `--color-on-status-done` | `slate.900` | `slate.950` | text on a Done fill (white is only 3.5:1 on green) |
| `--color-status-pending-sync` | `amber.500` | `amber.300` | offline queue indicator |
| `--color-focus-ring` | `teal.600` | `teal.300` | 3 px outline, 2 px offset |

Contrast commitments: all `fg-primary`/`fg-secondary` on their surfaces ≥ 4.5:1; status colours on their surfaces ≥ 3:1 for non-text and are always paired with an icon and label (see `A11Y.md`).

## 3. Typography

| Token | Family | Size / line | Weight | Use |
|---|---|---|---|---|
| `--font-sans` | `"Noto Sans Thai", "Inter", system-ui, sans-serif` | | | everything |
| `--text-display` | | 32 / 40 px | 700 | dashboard KPI numbers |
| `--text-title` | | 22 / 30 px | 600 | screen titles |
| `--text-heading` | | 18 / 26 px | 600 | card titles, work-order IDs |
| `--text-body` | | 16 / 24 px | 400 | default |
| `--text-body-strong` | | 16 / 24 px | 600 | labels |
| `--text-caption` | | 14 / 20 px | 400 | meta; never below 14 px anywhere |

Thai text: line-height never below 1.5; do not use letter-spacing on Thai; allow long strings (Thai labels run ~1.3× English).

## 4. Spacing, radius, elevation

- Spacing scale (4-base): `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 20 · `--space-6` 24 · `--space-8` 32 · `--space-10` 40 · `--space-12` 48
- Radius: `--radius-sm` 6 · `--radius-md` 10 · `--radius-lg` 16 · `--radius-full` 9999
- Elevation: `--shadow-1` `0 1px 2px rgb(11 16 23 / .08)` · `--shadow-2` `0 4px 12px rgb(11 16 23 / .12)`; on dark theme prefer a 1 px `--color-border` over shadow
- Field screen page padding: `--space-4`; dashboard: `--space-6`

## 5. Size tiers

| Tier | Height | Min target | Where |
|---|---|---|---|
| `lg` | 56 px | 56 × 56 | field surface, all actions |
| `md` | 44 px | 44 × 44 | dashboard |
| `sm` | 36 px | 44 × 44 (padding compensates) | dense tables on dashboard only |

There is no `xs`. Nothing interactive is smaller than 44 × 44 anywhere.

## 6. Components

Each component lists variants, states, and its platform mapping. Detailed per-component specs live in `docs/homework/session-3/components/`.

### Button
- Variants: `primary`, `secondary`, `destructive`, `ghost`
- Sizes: `lg`, `md`, `sm`
- States: default, hover, focus-visible, active, disabled, loading
- Anatomy: optional leading icon (24 px on `lg`, 20 px on `md`), label; icon-only buttons require `aria-label`
- Platform mapping: shadcn `Button` with `variant` and `size` props; Tailwind classes derived from tokens above

### StatusBadge
- Variants by status: `new`, `assigned`, `acknowledged`, `in-progress`, `temp-fix`, `done`, `merged`, `pending-sync`
- Priority variants: `p1`, `p2`, `p3`
- Always icon + label. Colour from `--color-status-*`
- Platform mapping: shadcn `Badge` wrapped as `StatusBadge`

### WorkOrderCard
- Content: ID, title, location, priority badge, status badge, SLA countdown (P1 only), assignee avatar, pending-sync indicator
- Variants: `field` (lg tier, one primary action visible), `dashboard` (md tier, compact)
- Platform mapping: shadcn `Card` composition

### SlaCountdown
- Shows remaining time to the next P1 deadline; turns `--color-status-p1` plus a "breached" icon and label once negative
- Platform mapping: custom component, `role="timer"`

### Input, Select, Textarea
- `lg` on field, `md` on dashboard; visible label above, helper/error text below; error state uses icon + text + border, never colour alone
- Platform mapping: shadcn `Input`, `Select`, `Textarea` with `Label`

### PhotoTile
- Thumbnail with capture time, delete affordance (before sync only), upload state (queued / uploading / uploaded)
- Platform mapping: custom

### OfflineBanner
- Persistent bar at top of field surface when offline: icon + "ออฟไลน์ · จะส่งเมื่อมีสัญญาณ" + queued count
- Platform mapping: custom, `role="status"`

### Proposed additions
_None. Add here when a generator needs something not listed._

## 7. Iconography

Lucide icons, 24 px on field, 20 px on dashboard, stroke 2. Every primary action has a fixed icon:

| Action | Icon |
|---|---|
| Acknowledge | `hand` |
| Start | `play` |
| Temporary fix | `wrench` |
| Done | `check-circle-2` |
| Take photo | `camera` |
| Assign | `user-plus` |
| Merge | `git-merge` |
| Offline | `wifi-off` |
| Synced | `cloud-check` |

## 8. Motion

Reduced by default. Transitions ≤ 150 ms ease-out for state changes; no motion on the field surface beyond opacity and the SLA countdown tick. Respect `prefers-reduced-motion`.

## 9. CSS custom properties (excerpt)

```css
:root {
  --color-bg-canvas: #F6F8FA;
  --color-bg-surface: #FFFFFF;
  --color-fg-primary: #141C26;
  --color-fg-secondary: #4F5E70;
  --color-border: #D2DBE4;
  --color-primary: #0B6F71;
  --color-primary-hover: #085456;
  --color-on-primary: #FFFFFF;
  --color-status-p1: #D63C3C;
  --color-status-p2: #BD7708;
  --color-status-p3: #2F6FD6;
  --color-status-done: #1E9E5A;
  --color-status-pending-sync: #BD7708;
  --color-on-status-p1: #FFFFFF;
  --color-on-status-p2: #141C26;
  --color-on-status-p3: #FFFFFF;
  --color-on-status-done: #141C26;
  --color-focus-ring: #0B6F71;
  --radius-md: 10px;
  --space-4: 16px;
  --font-sans: "Noto Sans Thai", "Inter", system-ui, sans-serif;
}
[data-theme="dark"] {
  --color-bg-canvas: #0B1017;
  --color-bg-surface: #141C26;
  --color-fg-primary: #F6F8FA;
  --color-fg-secondary: #D2DBE4;
  --color-border: #22303F;
  --color-primary: #6FCBCB;
  --color-primary-hover: #0F8B8D;
  --color-on-primary: #0B1017;
  --color-status-p1: #F08A8A;
  --color-status-p2: #F5C56B;
  --color-status-p3: #8DB4F2;
  --color-status-done: #7BD5A2;
  --color-status-pending-sync: #F5C56B;
  --color-on-status-p1: #0B1017;
  --color-on-status-p2: #0B1017;
  --color-on-status-p3: #0B1017;
  --color-on-status-done: #0B1017;
  --color-focus-ring: #6FCBCB;
}
```

## 10. Known gaps

- `[medium]` No Figma source yet; token values were chosen by hand and must be re-exported once the Figma file exists.
- `[low]` Burmese typography untested; Noto Sans Myanmar fallback to be added if `[AMBIGUOUS]` language question in the PRD resolves to a Burmese UI.

## 11. Changelog

| Version | Change | Reason |
|---|---|---|
| 1.0 | Initial | — |
| 1.1 | Light `--color-primary` moved from `teal.500` to `teal.600`; `teal.700` added for hover; `teal.500` demoted to decorative | The Session 2 axe gate (`npm run test:e2e`) measured white on `teal.500` at 4.1:1, below A11Y-001. `A11Y.md` constrains `DESIGN.md`, so the token changed, not the rule. |
| 1.2 | `amber.500` darkened to `#BD7708`; `--color-on-status-*` tokens added; `--color-primary-hover` and `--color-status-pending-sync` added to §9 (they were in the table but not the CSS) | The Session 3 `check_contrast` tests measured amber at 2.8:1 on white (A11Y-002 needs 3:1) and white on green at 3.5:1 (A11Y-001 needs 4.5:1 for badge text). Text-on-fill needs its own token per status because dark-theme fills are pale. |
