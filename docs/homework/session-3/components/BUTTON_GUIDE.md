# BUTTON_GUIDE.md (hand-written)

Companion to the generated `button.md`. This file explains *why*; the spec says *what*.

## When to use which variant

- `primary` — the one thing the technician should do on this screen. If you are adding a second primary, you are on the wrong screen (RULE-003).
- `secondary` — safe alternatives: "บันทึกร่าง", "ย้อนกลับ".
- `destructive` — irreversible things only: delete a queued photo before sync. The Button does not confirm; the caller opens a confirm dialog (RULE-004).
- `ghost` — icon-only toolbar actions on the dashboard. Never on the field surface: gloves.

## Gotchas learned

- `disabled` uses `aria-disabled`, not the `disabled` attribute, so the reason copy stays reachable and the Button keeps its place in tab order (A11Y-014). Click handlers must early-return on `aria-disabled`.
- `loading` must keep the label and the width. A Button that shrinks to a spinner shifts the layout and loses its accessible name.
- `sm` exists only for dense dashboard tables. It pads its hit area to 44 px; do not "fix" that padding because it looks loose.
- Contrast: white on `teal.500` fails. Use the token, not the swatch you like (MEM-002).

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-09-22 | No `xs` size | DESIGN.md §5; field users wear gloves |
| 2026-09-22 | `iconOnly` requires `aria-label` at the type level | A11Y-004 cannot be enforced by review alone |
