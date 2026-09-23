# Session 2 workshop — fix a login page against A11Y.md

> The course workshop clones `NUX-Design/login-page-a11y-project` and asks the
> agent to fix it using `A11Y.md`. That repo was not reachable, so this homework
> recreates the exercise: a login page with planted defects, the contract, the
> prompt given to the agent, the fixed page, and a test gate that proves the fix.

Files:

| Role | Path |
|---|---|
| Contract | `docs/homework/session-2/A11Y.md` |
| Before | `src/session-2/login-a11y/login.before.html` |
| After | `src/session-2/login-a11y/login.after.html` |
| Gate | `tests/session-2/login-a11y.test.ts` (`npm run test:e2e`) |

## 1. Planted defects in `login.before.html`

| # | Defect | Violates | Detected by axe? |
|---|---|---|---|
| 1 | No `lang` on `<html>` | A11Y-005 | yes (`html-has-lang`) |
| 2 | No `<title>` | A11Y-016 | yes (`document-title`) |
| 3 | Logo `<img>` without `alt` | A11Y-004 | yes (`image-alt`) |
| 4 | Inputs use placeholder as the only label | A11Y-012 | **no** — axe's `label` rule accepts `placeholder` as an accessible name; caught by the "no `<label>`" structural check and `getByLabel` |
| 5 | Body text `#777` on white, title `#999`, link `#aaa` | A11Y-001 | yes (`color-contrast`) |
| 6 | Login "button" is a `<div onclick>` | A11Y-016, A11Y-008 | partly (`button-name` not raised because it is not a button at all; caught by the role test) |
| 7 | Help "?" and "Forgot password" are `<span onclick>` | A11Y-016, A11Y-008 | same as 6 |
| 8 | `outline: none` on focus | A11Y-009 | no (manual / focus test) |
| 9 | Error shown as a pink border only, no text, no `aria-invalid` | A11Y-003, A11Y-013 | no (structural test) |
| 10 | Targets 32 px inputs, ~28 px button, 18 px help icon | A11Y-007 | no (bounding-box test) |
| 11 | No `autocomplete` | A11Y-018 | no |
| 12 | 13 px font on inputs and button | DESIGN.md §3 (min 14 px) | no |
| 13 | No `<main>`, no `<h1>` | A11Y-016 | yes (`landmark-one-main`, `page-has-heading-one` are best-practice rules, not in the AA tag set; caught by the structural test) |

Lesson the course wants here: **axe catches roughly a third.** Four of thirteen defects raise an axe violation (1, 2, 3, 5). The contract must carry
the other half as explicit rules with a verification method, or the agent will
declare victory at "0 axe violations".

## 2. Prompt given to the agent

```
อ่าน docs/homework/session-2/A11Y.md, DESIGN.md และ UX.md ก่อน
แก้ src/session-2/login-a11y/login.before.html ให้ผ่านทุกกฎใน A11Y.md
บันทึกผลเป็น login.after.html โดย:
- ใช้ token จาก DESIGN.md เท่านั้น (surface นี้เป็น field surface → size tier lg)
- คง layout และเนื้อหาเดิม แต่เปลี่ยน element ให้ถูก semantic
- ทุกการแก้ให้อ้าง A11Y-### ที่แก้
- ห้ามซ่อน content จาก assistive technology เพื่อให้ผ่าน
- แล้วรัน npm run test:e2e และรายงานผล
```

## 3. What changed and why (per rule)

- A11Y-005: `<html lang="th">`
- A11Y-016: `<main>`, one `<h1>`, real `<button>` and `<a>` elements, `<form>`; decorative SVGs `aria-hidden`
- A11Y-004: logo `alt="SiteOps"`; icon-only help button has `aria-label="วิธีใช้"`
- A11Y-012: visible `<label for>` on both inputs, required marked in text (sr-only "(จำเป็น)")
- A11Y-001: tokens `--color-fg-primary #141C26` on `#FFFFFF` (≈15:1), secondary `#4F5E70` (≈7:1), primary button `#FFFFFF` on `#0B6F71` (6.0:1). The first run of the gate flagged `color-contrast` on the button and the link: `DESIGN.md` v1.0 had `--color-primary` = `teal.500` `#0F8B8D`, which is only 4.1:1 on white. Fixed in the token (DESIGN.md v1.1), not in the page, because `A11Y.md` constrains `DESIGN.md`
- A11Y-009: `:focus-visible` 3 px ring, 2 px offset; no `outline: none`
- A11Y-013 / A11Y-003: error has icon + text, `role="alert"`, `aria-invalid="true"`, `aria-describedby`; border colour is an addition, not the carrier
- A11Y-007: inputs and buttons 56 px; link 44 px min height
- A11Y-018: `autocomplete="username"` / `"current-password"`
- DESIGN.md: Noto Sans Thai stack, 16 px body, 22 px h1, radius 10, spacing scale, Lucide-style log-in and help icons per §7 spirit
- UX.md glossary: button reads "เข้าสู่ระบบ", link "ลืมรหัสผ่าน"; error text tells the user what to do next

## 4. Verification

`npm run test:e2e` runs six checks:

1. **before fails**: axe flags `html-has-lang`, `document-title`, `image-alt`, `color-contrast`; the page has no `<label>` element at all (the placeholder-only defect axe lets through)
2. **after passes**: zero axe violations on WCAG 2.x A/AA tags
3. accessible names resolve every control (A11Y-004/012/016)
4. error is tied to its field and announced (A11Y-013)
5. target sizes: 56 px controls, 44 px link (A11Y-007)
6. tab order and visible focus (A11Y-008/009)

Manual rules still open after the gate: A11Y-006 (reflow at 320 px/200%), A11Y-010
(reduced motion, n/a on this page), A11Y-017 (no live regions on this page).
