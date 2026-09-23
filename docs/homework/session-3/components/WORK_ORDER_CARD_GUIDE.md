# WORK_ORDER_CARD_GUIDE.md (hand-written)

## Composition, not configuration

The card composes `StatusBadge`, `SlaCountdown` and `Button`. It does not accept
colour or size overrides; it accepts a `surface`. If a screen needs a different
card, it is a different component with its own five files.

## The one action

The inline Button's label is derived from status (see `work-order-card.md`
§Structure). The card decides the label; the screen decides what happens. This
keeps FLOW-SOPS-001 in one place.

## Whole-card tap plus inline button

Two tap targets on one row is a known trap: the Button must stop propagation so
"รับงาน" does not also open the detail screen. Test it (there is a test case for
this in the five-file set).

## Offline

`pendingSync` shows the "รอส่ง" badge and disables nothing. Technicians keep
working; the queue drains later (RULE-001, RULE-008).
