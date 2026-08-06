# triageRush — To Be Continued (2026-08-05 19:24 PDT)

## Read these next session, in this order

1. **`docs/10-approved-pending-changes.md`** — six approved, UNBUILT items.
   This is the next work, and it is fully specified.
2. `docs/99-ai-handoff--2026-08-05-1924.md` — this session in full.
3. Docs 1-9 — the SHIPPED game (Phases 1-8). They carry `PENDING CHANGE`
   markers pointing at doc 10 wherever an item will contradict them.

## NO CODE CHANGED THIS SESSION

`triageRush/` was not touched. Cache version stays `2026-0805-phase8h`. The
only runnable artefact is the standalone mockup, which imports nothing from
the game.

## What was decided (all six are in doc 10)

1. **LEFT WAITING is dropped from scoring AND from the display, in every
   mode.** John: "since there is no way to empty the waiting room, it is just
   an undeserved penalty." Score becomes `correct x100 + close x50 +
   wrong x-50`, and the count appears nowhere on the review — no row, no
   stat, no neutral mention.
2. **CLOSE always appears in the review table**, reading **NA** under Strict
   with empty count/multiplier cells — so the table is always the same three
   rows and never changes shape.
3. **Header wording and case**: `TRIAGE SHIFT COMPLETE` / `TriageRUSH
   COMPLETE` (the mixed case is deliberate — never `text-transform`), with
   `MODE: TriageRUSH, Strict, 60 seconds` beneath — mode, difficulty, and the
   CONFIGURED shift length. Because the mode line now carries the length, the
   meta cell reverts to **DURATION** (time actually run); labelling both
   "shift length" would contradict itself on a shift ended early.
4. **Direction becomes one acuity ladder** — esi-1..5 = 1-5, psych = 6,
   discharge = 7. Lower rank than correct = OVER, higher = UNDER, no ties.
   Psych and Discharge misses now move a counter, so under + over finally
   account for every miss.
5. **The Shift Review adopts variant B ("LEGIBLE")** — the printed-summary
   content with the legibility fixes, NOT the FORM ED-7 evaluation motif.
6. **The direction counters explain themselves** on hover AND tap, with the
   help line's height reserved so nothing shifts under the user's finger.
7. **A shift stopped short gets its time marked** — an asterisk plus a short
   note inline next to DURATION (e.g. `0:42 * ended early`). Needed because
   item 3 now prints the configured length just above it, so an unexplained
   gap between "60 seconds" and "0:42" would read as a bug.
   `state.shift.endReason` already carries `timer | stop | quit`, so no new
   state is required; `quit` never reaches the review.

## What was decided AGAINST

- **The patient-limit redesign is ABANDONED.** A finite patient pool, a win
  state, a score ceiling, an untimed sandbox — designed in full, then
  dropped. The game continues as originally conceived. Files are in
  `docs/archive/design-notes/` marked ABANDONED. **Do not re-propose it.**
- **The supervisor-evaluation form (FORM ED-7)** — explored across four
  variants, not chosen.

## Two permanent rulings from John

- **Never claim performance "for level of training."** We are not qualified
  to set that bar. Any grade must print its own basis and make no clinical
  claim. (This is also why variant B carries no grade — and with the pool
  redesign abandoned the score has NO ceiling, so a percentage-based grade is
  impossible anyway.)
- **Never fault the player for a full waiting room.** It is the premise of
  the game, not a failure of play.

## The lost rule, now found and written down

John remembered a rule about when Psych may be the correct room and could not
find it. It was real — decided ~2026-07-25, and it never left the archive,
which is why it got misremembered twice. **It is now in doc 5** as an
authoring rule:

- A dangerous psychiatric presentation is **ESI 1-2 and goes to a medical
  room, never Psych**. Medical acuity beats the behavioural label.
- **Psych is correct only at ESI 4-5** — in practice 4, because a psych
  evaluation IS one resource and ESI 5 means none.
- **Discharge is correct only at ESI 5.**
- ESI 3 is excluded from both: multiple resources means a real workup first.

Why the confusion happened: ESI 1-2 are DANGER levels, ESI 3-4-5 are
RESOURCE-COUNT levels. One number scale, two different meanings — which makes
"ESI 4 and above is dangerous" an easy and wrong intuition.

**Lesson: a rule that lives only in `docs/archive/` will be misremembered.**
Archive cannot override the numbered set. Promote rules when they are found.

## A correction recorded so it is not repeated

Claude claimed "Psych is always ESI-4" as if it were a design rule; it was
only a property of the 5 existing records. The direction rule built on it was
fragile and was replaced by the room-rank ladder, which never reads
`correctEsi` and so cannot break when a patient is authored differently.

## Immediate next work

1. Build doc 10's six items together — they all touch the same code
   (`ui.js renderReview`, `styles.css` section 9, `game.js`
   `selectScoreTotals` and `classifyTriageDirection`) and the same docs.
2. Then Phase 9 (persistence and recovery).

## Open questions for John

Both earlier questions were ANSWERED at the end of the session and are folded
into the items above: the mode line is `MODE: TriageRUSH, Strict, 60 seconds`,
and left-waiting is dropped from the display as well as the scoring.

Two small things left to confirm when building:

1. The shift-length UNITS in the mode line. The mockup uses seconds for RUSH
   ("120 seconds") and minutes for Triage ("5 minutes"), because "300
   seconds" reads badly — but John only specified the RUSH form, so he may
   want one unit throughout.
2. The exact wording of the ended-early note in item 7, and whether the
   marker is a plain `*` (anything fancier needs U+FE0E for iPhone).

## Longer-term ToDo (unchanged)

"RUSH must never leave an empty waiting room"; RUSH arrival pacing revision;
review the last shift from ER ENTRANCE (needs a `lastCompletedShift` snapshot
because `resetToLobby` wipes the ledger); sound volume control; ambient ER
soundscape; music options; lo-fi music filter; confirm-dialog button
redesign; countdown numerals over the Chart; scorecard hover magnification
(needs a touch answer — iOS has no hover); Phase 9 persistence; Phase 10
asset-loading rework; layered room rendering; six missing vital icons;
Settings/About placeholder text; favicon.

Do NOT re-propose the nav-arrow fade on scroll — offered and declined.
