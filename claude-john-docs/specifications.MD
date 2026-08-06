# triageRush — specifications (pointer file)

**Last modified:** 2026-08-05

## The next work is doc 10 (approved, not built)

`docs/10-approved-pending-changes.md` holds six DECIDED but UNBUILT changes,
all landing in the Shift Review and its scoring: drop the left-waiting penalty
from every mode; always show CLOSE (NA under Strict); new header wording and
case; one acuity ladder for triage direction so Psych and Discharge misses
count; adopt mockup variant B for the review; and make the direction counters
explain themselves on hover AND tap. Docs 3-9 carry `PENDING CHANGE` markers
pointing there.

Doc 5 also gained an AUTHORING RULE for when Psych or Discharge may be the
correct room — recovered from the archive, where it had been sitting
unreferenced since July and had been misremembered twice as a result.

## A redesign was explored and ABANDONED (2026-08-05)

A finite patient pool per shift — patient limits, a win state, a score
ceiling — was designed in full and then abandoned the same day. John chose to
continue with the game as originally conceived, WITHOUT patient limits: the
game as it now stands. Nothing was built; docs 1-9 were never in question.

Both files are in `docs/archive/design-notes/` marked ABANDONED. They are
kept only so the idea is not rediscovered and re-pitched. Do not build from
them.

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

2026-08-05 (late): that reshaping was explored as MOCKUPS ONLY, in
`_mockups/shift-review-mockups.html` — six variants, nothing in `triageRush/`
touched. John prefers variant A2 ("FORM ED-7", lite) pending a look on his
iPhone. Two rulings from that session are permanent: the review must make NO
claim about performance "for level of training" (we are not medically
qualified to set that bar, so the grade prints its own basis instead), and it
must NEVER fault the player for patients left in the waiting room. Those two
rulings are about the game and survive the abandonment of the pool redesign.

NOTE the consequence of that abandonment for this work: the score still has
NO ceiling, so a BELOW/MEETS/EXCEEDS grade cannot be a percentage of anything
achievable. Any grade must therefore rest on a plain, self-explaining number
(the mockups use "% correct placement") rather than an invented threshold.
