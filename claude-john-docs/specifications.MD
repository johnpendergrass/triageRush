# triageRush — specifications (pointer file)

**Last modified:** 2026-08-05

## Where the real specifications live

This project keeps its full design/gameplay specification in the numbered
`docs/` set — do NOT duplicate it here:

- `docs/3-gameplay-rules-and-specs.md` — rules, scoring, evaluation order
- `docs/7-mobile-ui-and-interaction-spec.md` — 9:16 shell, screens, input
- `docs/4-coding-contracts-and-specs.md` — architecture contracts
- `docs/8-implementation-blueprint.md` — state shape, actions, algorithms
- `docs/9-implementation-plan-and-acceptance.md` — phase order + tests

Read `docs/1-start-here-toc.md` first; historical files never override
the numbered set.

## Sweep status

The 2026-08-05 documentation sweep is DONE: all 2026-08-04/05 amendments
(Chart rename incl. code identifiers, ER Entrance, QUIT THIS SHIFT / END
SHIFT EARLY, three-toggle sound model, recall sound, door halo, flat green
rails, no PRESENTATION header, photo zoom lightbox, empty-state hints,
nameplate chip) are folded into docs 1-9. The loose amendment notes moved to
`docs/archive/design-notes/`. There is no pending amendment layer.

Phase 7 (2026-08-05 afternoon) folded its decisions into docs 3/4/7/8/9 as
they were made: Chart does not pause, 2-second acclimation delay, last-two-
seconds countdown run-in, numerals centered on the patient image with an
expand-dissolve exit, and the clipboard header row (PATIENT CHART + live
clock + red X, metal clamp retired but kept commented in styles.css).

Phase 8 (2026-08-05 evening) is folded into docs 1/3/5/7/8/9: the shift-over
acknowledgement (TIME'S UP / SHIFT ENDED, waits for a tap), the Patients Seen
browser (position in the header slot, no name banner, fixed arrows beside the
photo, scrolled fraction carried between patients, pinned nameplate, outcome
mark plus photo badge, no photo zoom), and the correction that
`answer.otherAcceptableRooms` is dead data - full credit is derived by
`fullCreditRoomKeys`.

ONE THING IS DELIBERATELY NOT WRITTEN DOWN AS FINAL: the Shift Review's
printed-discharge-summary LOOK. Doc 7 marks it provisional because John has
an open backlog item to reshape it as a supervisor's evaluation form.
