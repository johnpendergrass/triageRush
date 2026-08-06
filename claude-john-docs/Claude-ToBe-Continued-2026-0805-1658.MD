# triageRush — To Be Continued (2026-08-05 16:58 PDT)

## Read these next session, in this order

1. `docs/10-finite-patient-pool-design.md` — the next piece of work. APPROVED
   BUT NOT BUILT. Read before touching gameplay code.
2. `docs/99-ai-handoff--2026-08-05-1658.md` — this session in full.
3. `claude-john-docs/brainstorm-finite-patient-roster.MD` — the decision log
   behind doc 10: rejected options and the reasoning. Consult before
   re-proposing anything.
4. Docs 1-9 remain current for the SHIPPED game (Phases 1-8).

## NO CODE CHANGED THIS SESSION

Nothing in `triageRush/` was touched. Cache version stays
`2026-0805-phase8h`. The only new runnable artefact is a standalone mockup
file that imports nothing from the game.

## What this session did

### 1. Phases 7 and 8 accepted

John played the build and said it is acceptable. That closes the item that
had been outstanding across three handoffs — Phase 7 had never had a
play-through verdict.

### 2. Shift Review appearance mockups

John wanted the Shift Review to feel like a real medical review and to be
more legible, but explicitly asked to explore it WITHOUT altering the game or
making it hard to revert. So:

**`_mockups/shift-review-mockups.html`** — one self-contained file. Opens
from disk (no fetch) or at
`http://localhost:8090/_mockups/shift-review-mockups.html`. For the iPhone:
`http://192.168.0.200:8090/_mockups/shift-review-mockups.html` with
`start-triageRush.bat` running. **Deleting the `_mockups` folder reverts
everything.**

Six variants, plus a shift-scenario switch (a decent TRIAGE shift / a rough
RUSH one, so negative scores and the Strict no-CLOSE case are both visible)
and a desktop-vs-320px-phone switch, because legibility is worst at the
narrow end:

- 0 CURRENT, A FULL (FORM ED-7), **A2 LITE (John's preferred)**, A3 MINIMAL,
  B LEGIBLE, C COMPETENCY.

All six verified programmatically to fit the 9:16 shell with no scrolling at
both widths.

**John still needs to view A / A2 / A3 on his actual iPhone.** His concern
was that the full form is too much information for a phone screen; A2 and A3
exist to bracket that, and he could not judge it from the desktop preview.

### 3. Two rejections worth remembering

- **Rating "for level of training" was cut.** John: "we are not medically
  trained to really figure that out are we?" He was right — the label claimed
  knowledge we do not have. The grade now makes no clinical claim and prints
  its own basis beneath it.
- **Never fault the player for a full waiting room.** A draft had the grade
  demoting for patients left waiting; John pointed out the game is premised
  on a full room the player cannot empty. Removed everywhere.

  That objection is what generated the whole of doc 10.

### 4. The finite patient pool design

Designed with John over the rest of the session, rule by rule, and written up
as doc 10. In one line: every timed shift gets a finite pool of patients, so
the game gains a WIN STATE and the score gains a CEILING — which is exactly
what the Shift Review grade needed, since a percentage of the achievable
score requires no invented threshold.

| | RUSH 60s | RUSH 120s | TRIAGE 300s | SANDBOX |
|---|---|---|---|---|
| Pool | 12 | 20 | 30 | unlimited |
| Slots | 5 → 10 | 5 → 10 | 5 held | 5 held |
| Not-seen penalty | -10 each | -10 each | none | none |
| Ceiling | 1200 | 2000 | 3000 | none |

TRIAGE 600s is REMOVED, replaced by the untimed sandbox.

## Immediate next work

1. **John plays three shifts and reports patients placed** in a 60s RUSH, a
   120s RUSH and a 300s TRIAGE. The pool sizes 12 / 20 / 30 are guesses, and
   this is the only thing that can confirm them. Nothing an AI has produced
   counts as evidence — the mockup figures were invented for layout.
2. **John views the form mockups on his iPhone** and picks between A / A2 /
   A3.
3. Then build doc 10, together with the RUSH arrival pacing revision (the two
   determine each other).
4. Then the Shift Review form, which doc 10 unblocks.

Phase 9 (persistence) moves BEHIND doc 10, because doc 10 changes what would
have to be persisted and blocks the review's final form.

## Open decisions carried forward

All are listed in doc 10 section 6. The two with teeth:

- **The last-patient recall window.** Assignment is not final in this game —
  a patient behind a door can be recalled and the ledger result replaced. But
  doc 10 ends the shift the instant the final patient is assigned, making
  that one patient uniquely unfixable purely because they were last. Needs a
  ruling.
- **Sandbox ledger keying.** The deck reshuffles when exhausted, but
  `state.ledger.byPatientId` would MERGE a repeated patient into one record —
  the browser would show one patient where two were seen, and the score would
  count one. Provably sandbox-only (no other profile can exceed 30 patients
  against a 160-patient deck), so capping sandbox at 160 is a serious
  alternative to reworking the ledger to be encounter-keyed.

## Longer-term ToDo (unchanged)

Sound volume control; ambient ER soundscape; music options beyond the single
KING-FM stream; lo-fi music filter; confirm-dialog button redesign; countdown
numerals over the Chart; scorecard hover magnification; Phase 9 persistence;
Phase 10 asset-loading rework; layered room rendering; six missing vital
icons; Settings/About placeholder text; favicon.

Do NOT re-propose the nav-arrow fade on scroll — offered and declined.
