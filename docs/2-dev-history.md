# Development History

**Last modified:** 2026-08-04

**Latest change:** Recorded the official single-presentation direction and the
new recall, Coach, timer, sound, title, RUSH-arrival, and accepted-door decisions.

## Purpose

This is a concise record of durable milestones and direction changes. It does
not inventory superseded code or assets. Historical detail remains in
`archive/`.

## Milestones

### Initial concept and seven destinations

- triageRush began as an emergency-department triage teaching game.
- The educational loop is to present patient evidence, ask the player to choose
  a destination, and provide explanation after the decision.
- The destination model became ESI 1 through ESI 5, Psych, and Discharge.
- Psych and Discharge retain an underlying ESI, allowing the special destination
  and clinically matching ESI room to receive full credit.
- The waiting queue, center patient panel, and treatment-room rail became the
  stable three-column composition.

### HOME and mobile composition

- HOME established the emergency-department lobby, Start Shift and Resume Shift
  states, settings boards, About, and sound controls.
- The game established queue selection and swapping, assignment, immediate
  feedback, room opening, recall, detailed charts, and Shift Review.
- The mobile-derived 9:16 frame became the enduring visual design.

### Patient library evolution

- The library grew to 160 matched schema 2.2 JSON records and portraits.
- Schema 2.2 separates Presentation, Clinical, and Answer; protects the
  pre-answer information boundary; and defines detailed-chart content.
- A full 2026-08-01 schema, writing, vital-color, and clinical-fidelity review
  passed the current validators.

### Mode, scoring, and review direction

- Triage and TriageRUSH became the two modes.
- Strict and Forgiving became the two evaluation choices.
- `Shift` replaced `round` in player-facing language.
- Both modes adopted +100 Correct, +50 Close, and -50 Wrong.
- RUSH added a live -10 penalty for each patient currently waiting.
- Shift Review adopted explicit formulas, a separate direction summary, and a
  Patients Seen browser using the complete detailed chart.

### Timing and responsive-shell refinement

- RUSH adopted 60- and 120-second arrival curves, a five-slot visual minimum,
  two starting patients, a ten-patient maximum, timing sounds, a full-queue
  shake, and a final countdown.
- The header adopted a numbers-only scorecard and enlarged timer.
- The shell retained an exact 9:16 ratio and began using roughly 5% of viewport
  height above and below on height-limited larger displays.

### 2026-08-04 product-specification revision

- Every device now uses the same responsive mobile composition. HOME, GAME, and
  Shift Review are separate player-selected views.
- Recall changed to one replaceable result per patient. Reassignment removes the
  earlier result and applies the new one without adding another patient seen.
- Coach moved to the occupied patient panel. It is available for new and recalled
  patients, keeps Answer locked, and remembers Clinical expansion during a shift.
- Triage changed to five- or ten-minute countdowns, defaulting to five minutes,
  with ten-second ticks, minute emphasis, and the RUSH final sequence.
- RUSH gained an approved three-beat emphasis at each ten-second boundary before
  its final-ten countdown.
- Every successful runtime patient insertion gained a `doink`; recall does not.
- RUSH scheduled arrivals gained a 20% chance of a two-patient burst, capped at
  ten waiting patients.
- `Intern` joined the player-title choices.
- All 14 current open/closed room-door images in both active asset trees were
  corrected, accepted, and made the only door assets documented going forward.
- The documentation expanded with UI, state/algorithm, and acceptance references
  so a new helper can rebuild the intended application from the current set.

## Historical lookup

Use [the archive index](archive/README.md) only when older rationale is needed.
Historical files explain their era; they do not override current numbered docs.
