# Session 2 — vibe-coded screens: SiteOps Field

> The course's Session 2 ends with a working screen generated from the Markdown
> contracts, not only with the prompts. This is that screen, built by an agent
> from `prompts/figma-make-technician-home.md` (My Work) and
> `prompts/stitch-work-order-detail.md` (Work Order Detail), reading `DESIGN.md`
> v1.2, `UX.md`, `A11Y.md` and `03-PRD.md` as the source of truth.

Code: `src/session-2/siteops-app/index.html` (single file, no build step).
Gate: `tests/session-2/siteops-app.test.ts` (`npm run test:e2e`).

## What the screens must do

| Behaviour | Contract |
|---|---|
| Field surface is dark by default; a light theme exists and follows the OS setting | DESIGN.md §2.2, prompt Constraints |
| Work orders sorted P1 first; P1 shows a live SLA countdown, turns "เกินกำหนด" when breached | RULE-009, DESIGN.md §6 SlaCountdown, FR-SOPS-006 |
| Every status and priority shows icon + label | RULE-006, A11Y-003 |
| One primary action per screen, in the bottom thumb zone; label follows FLOW-SOPS-001: รับงาน → เริ่มงาน → ปิดงาน (secondary: แก้ชั่วคราว) | RULE-003, UX.md §6 glossary |
| รับงาน / เริ่มงาน / แก้ชั่วคราว are undoable from a toast | RULE-004 |
| ปิดงาน asks for confirmation in a sheet | RULE-004, AC-SOPS-012 |
| ปิดงาน is disabled (not hidden) until at least one evidence photo is attached, with the reason shown | RULE-005, A11Y-014, AC-SOPS-008 |
| Offline is a state, not an error: banner with queued count; actions and photos queue as "รอส่ง" and send when back online | RULE-001, RULE-008, DESIGN.md §6 OfflineBanner |
| Photos can be removed only before they are sent | DESIGN.md §6 PhotoTile |
| All interactive targets ≥ 56 px on the field surface; visible focus; Thai `lang` | A11Y-007, A11Y-009, A11Y-005 |

## Decisions and gaps

- Photos come from a file input (`accept="image/*" capture="environment"`), which opens the camera on phones. A "sample photo" control exists only in the demo bar.
- Status labels for `assigned`, `acknowledged`, `in-progress`, `temp-fix`, `done` are not in the UX.md glossary: GAP carried from `status-badge.md`. Used: มอบหมายแล้ว, รับงานแล้ว, กำลังทำ, แก้ชั่วคราวแล้ว, ปิดงานแล้ว.
- SLA for P2/P3 is unknown (GAP-001): only P1 shows a countdown.
- Data is example data held in the page; nothing is sent to a server.

## Verification

`tests/session-2/siteops-app.test.ts` checks, in both colour schemes: zero axe violations (WCAG 2.x A/AA); P1 first; SLA timer present; ปิดงาน blocked without a photo and enabled after one; confirm sheet before closing; undo after รับงาน; offline banner and "รอส่ง" badge; 56 px targets.
