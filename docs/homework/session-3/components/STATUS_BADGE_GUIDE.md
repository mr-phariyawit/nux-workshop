# STATUS_BADGE_GUIDE.md (hand-written)

## Why a wrapper around shadcn Badge

shadcn `Badge` accepts any child. SiteOps needs the label to be the glossary term
and the icon to be fixed per value, otherwise two screens end up calling the same
status "กำลังทำ" and "กำลังดำเนินการ". The wrapper takes an enum, not text.

## Rules that are easy to break

- Never render a badge with colour only. Even the tiny `sm` size shows the icon and label (RULE-006, A11Y-003).
- `pending-sync` is a status badge, not a toast. It stays on the card until the queue drains (RULE-001).
- Priority badges say the kind: "ความสำคัญ P1", so a screen reader user hears what P1 means.

## Open item

`merged` label is inferred. If the facility manager says "ยุบรวม" instead of
"รวมใบงานแล้ว", change the glossary in `UX.md`, regenerate `status-badge.md`, then
change the code. Not the other way round.
