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

---

# Intake (dashboard)

> Built from the last line of `prompts/stitch-work-order-detail.md`:
> "สร้างหน้า **Intake (dashboard)** ในสไตล์เดียวกัน โดยใช้ size tier `md` และ light theme".
> User: USER-001 Facility Manager (dispatcher, desktop, constantly interrupted, afraid of losing requests).

Code: `src/session-2/siteops-intake/index.html` (single file, no build step).
Gate: `tests/session-2/siteops-intake.test.ts` (`npm run test:e2e`).

## What the screen must do

| Behaviour | Contract |
|---|---|
| Light theme by default; dark follows the OS setting or `data-theme="dark"` | prompt line, DESIGN.md §2.2 |
| Size tier `md`: every interactive target ≥ 44 × 44 px, including table rows (density `sm` shrinks text and padding, not targets); page padding `--space-6`; icons 20 px | DESIGN.md §4, §5, §7, A11Y-007 |
| KPI header shows open, P1 and over-SLA counts; merged and done orders are not open | FR-SOPS-008, AC-SOPS-009 |
| Intake form: channel (โทร / LINE / กระดาษ), reporter, floor, zone, equipment (optional), details, priority. Labels above; floor uses `inputmode="numeric"` | FR-SOPS-001, UX.md §5 forms |
| Saving creates a work order with status ใหม่ (New), a timestamp and a new ID; the only `primary` button on the page is บันทึกใบงาน | AC-SOPS-001, RULE-003 |
| Choosing P1 shows both deadlines before saving (รับงานภายใน T + 15 นาที, แก้ชั่วคราวภายใน T + 4 ชม.); the P1 row shows both deadlines and a live countdown to the next one | FR-SOPS-002, AC-SOPS-002 |
| Validation is inline under each field with icon + text, `aria-invalid`, and focus moves to the first invalid field; never a red border alone | UX.md §5 validation, A11Y.md |
| The form autosaves a draft on every change; on reload the page offers "มีแบบร่างค้าง" with ใช้แบบร่างต่อ / ทิ้งแบบร่าง | RULE-008 |
| Queue is a table: P1 first, then P2, P3; done and merged at the bottom; every priority and status shows icon + label; each row shows its last-synced time | RULE-009, RULE-006, GAP-006 |
| Skeleton rows while the queue loads (`aria-busy`) | UX.md §5 loading |
| มอบหมาย (`user-plus`) assigns a New order to an on-shift technician; status becomes มอบหมายแล้ว; undo from the toast | FR-SOPS-003, AC-SOPS-003, RULE-004 |
| รวมใบงาน (`git-merge`) folds a duplicate into another open order after a confirmation dialog that states the consequence; the survivor lists every reporter and channel; the merged row stays visible as รวมใบงานแล้ว with a "รวมเข้า SOPS-…" link to the survivor | FR-SOPS-010, AC-SOPS-011, RULE-007, RULE-004 |
| A P1 that is not yet acknowledged and is ≤ 5 min from (or past) its acknowledge deadline raises a banner with no dismiss control; it clears only when the order is acknowledged | RULE-009 |
| Dialogs are modal (`aria-modal`, background `inert`), close on Escape and return focus | A11Y.md keyboard, DESIGN.md §6 |

## Decisions and gaps

- **Over SLA** is counted against the next P1 deadline: acknowledge (T + 15 min) while the order is ใหม่ / มอบหมายแล้ว, then temporary fix (T + 4 h) until แก้ชั่วคราว or ปิดงาน. P2/P3 have no SLA (GAP-001), so they are never over SLA.
- **Assigning does not clear the near-breach banner.** Acknowledge is the technician's action (FR-SOPS-004); the dispatcher's job while the banner shows is to chase the technician. The demo bar has "จำลองช่างรับงาน" to show the banner clearing.
- **Floor** accepts `1`–`45`, `B1`–`B3` and `RF`. `inputmode="numeric"` gives the keypad on touch devices; basements and roof need the full keyboard, which the desktop dispatcher has.
- **Status label ใหม่** for `new` is not in the UX.md glossary; `รวมใบงานแล้ว` for `merged` is `inferred` (status-badge.md GAP). Both used as-is.
- **Components not in DESIGN.md §6** (KPI tile, near-breach banner, dashboard table) are proposed under DESIGN.md "Proposed additions", as the design-system MCP instructs.
- Only on-shift technicians are listed for assignment. The roster is example data; a real build reads the shift roster.
- English appears only as a secondary line on the title and KPI labels (UX.md voice: "English secondary on dashboard"), marked `lang="en"`.
- Data is example data held in the page. The draft is kept in `localStorage` only when the browser allows it; the page works without it.

## Verification

`tests/session-2/siteops-intake.test.ts` checks, in both colour schemes: zero axe violations (WCAG 2.x A/AA) with the form showing errors and with a dialog open. It also checks: KPI counts before and after changes; P1 first; near-breach banner present with no dismiss control, and gone after acknowledge; inline validation with icon + text and focus on the first invalid field; saving creates a ใหม่ row with a timestamp; P1 shows both deadlines; assign → มอบหมายแล้ว → undo; merge confirmation, survivor reporters and the "รวมเข้า" link; draft restore after reload; every interactive target ≥ 44 px.
