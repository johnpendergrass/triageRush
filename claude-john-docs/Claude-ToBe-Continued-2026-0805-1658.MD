# triageRush — To Be Continued (2026-08-05 16:58 PDT)

> ## AMENDED — THE PATIENT-LIMIT REDESIGN WAS ABANDONED
>
> Later the same day John decided to abandon that direction entirely and
> continue with the game as originally conceived, WITHOUT patient limits —
> the game exactly as it stands. Nothing was built, so there is nothing to
> undo in code. Both design files now live in `docs/archive/design-notes/`
> marked ABANDONED. **Do not build from them; do not re-propose the idea.**
>
> The active work is the SHIFT REVIEW's presentation.

## Read these next session, in this order

1. `docs/99-ai-handoff--2026-08-05-1658.md` — this session in full,
   including the abandonment amendment.
2. Docs 1-9 — current and fully authoritative for the game (Phases 1-8).
3. `_mockups/shift-review-mockups.html` — the six Shift Review treatments.

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

  That objection led to a redesign proposal, which John then abandoned. THE
  RULING SURVIVES the abandonment and applies to any screen or wording.

### 4. A patient-limit redesign — explored in full, then ABANDONED

Most of the session went into designing a finite patient pool per shift (a
win state, a score ceiling, an untimed sandbox replacing TRIAGE 600s). John
then decided against it: the game continues as originally conceived, without
patient limits.

Nothing was built. Both files are archived in `docs/archive/design-notes/`
marked ABANDONED, kept only so the idea is not rediscovered and re-pitched.

## Immediate next work

1. **The Shift Review's presentation** — John's words: "the first thing i
   want to do is figure out the correct chart presentation in the review
   screen."
2. **John views the form mockups on his iPhone** and picks between A / A2 /
   A3. His concern is that the full form is too dense for a phone.
3. Then Phase 9 (persistence and recovery).

## The constraint the abandonment leaves behind

The score has **no ceiling**, so a BELOW / MEETS / EXCEEDS band cannot be "a
percentage of what was achievable" — that was the whole appeal of the pool
design. If the review carries a grade at all, it must rest on a plain,
self-explaining number (the mockups use `% correct placement`, printed
beneath the grade). Otherwise any threshold is invented, which is exactly
what John objected to.

Reminder: the mockups' patient counts (11 seen in 5:00, 5 in 2:00) were
INVENTED for layout and are not evidence about real play.

## Longer-term ToDo (unchanged)

Sound volume control; ambient ER soundscape; music options beyond the single
KING-FM stream; lo-fi music filter; confirm-dialog button redesign; countdown
numerals over the Chart; scorecard hover magnification; Phase 9 persistence;
Phase 10 asset-loading rework; layered room rendering; six missing vital
icons; Settings/About placeholder text; favicon.

Do NOT re-propose the nav-arrow fade on scroll — offered and declined.
