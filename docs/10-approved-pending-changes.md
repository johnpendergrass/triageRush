# Approved Changes — ALL BUILT 2026-08-06

**Last modified:** 2026-08-06

**Status: IMPLEMENTED.** All seven items below were built together on
2026-08-06 (cache version `2026-0806-review9a`) and folded into documents
`3`, `7`, `8` and `9`, which are again authoritative. This file is kept as
the decision record — the "why" behind each item — not as a spec.

Decisions settled at build time: the mode line uses mixed units (RUSH in
seconds, Triage in minutes, echoing each Settings radio verbatim); the
ended-early note is a plain `*` plus the words `ended shift early` inline on
the DURATION value line (wording finalized later on 2026-08-06).

Refined the same day after John saw it (2026-08-06, superseding details of
items 3 and 6 below — docs 3 and 7 carry the current wording): the title
became `TRIAGE Shift Report` / `TriageRUSH Shift Report` with "Shift Report"
in serif small-caps; the mode line gained prominence (gap + larger font);
and the two counters merged into ONE boxed section with the disclaimer
always visible inside it — hover/tap swaps a counter's own text for its
explanation in place, replacing the separate help line.

---

## 1. Drop LEFT WAITING from scoring entirely

**Decision (John, 2026-08-05):** the left-waiting penalty is removed from ALL
modes. `RUSH_WAITING_PENALTY_PER_PATIENT` stops being applied.

**Why:** the waiting room can never be emptied — arrivals keep coming and
`MAX_WAITING` is 10 — so charging the player for a full room penalises them
for the game's premise rather than their play. John: "since there is no way to
empty the waiting room, it is just an undeserved penalty."

This was reinforced by, but does not depend on, the abandoned patient-pool
redesign. It stands on its own.

**Score becomes exactly:** `correct x 100 + close x 50 + wrong x -50`.

**Touches:**
- `game.js selectScoreTotals` — drop `waitingPenalty`;
  `score = assignmentPoints`.
- `GAME_CONSTANTS.RUSH_WAITING_PENALTY_PER_PATIENT` becomes unused; remove it
  rather than leaving a dead constant.
- `ui.js renderReview` — remove the LEFT WAITING formula row.
- `index.html` — nothing (rows are built in JS).
- **Doc 3** — the RUSH scoring section and any mention of a waiting penalty.
- **Doc 9** — the acceptance rows "RUSH x -10 Left Waiting" and "Triage x 0".

**The count is also NOT DISPLAYED** (John, 2026-08-05, closing the open
question): left-waiting is dropped from the scoring AND from the review
screen entirely. No row, no stat, no neutral mention. There is nothing to
word carefully because there is nothing to show.

---

## 2. CLOSE always appears; NA under Strict

**Decision (John, 2026-08-05):** the Shift Review scoring table always shows
the same three rows — **CORRECT, CLOSE, WRONG** — in that order. Under Strict,
where Close does not score, the CLOSE row keeps its place and shows **NA** in
the total column, with the count and multiplier cells EMPTY (no "0", no
"x 50").

**Why:** the table never changes shape between modes or difficulties, so the
page is predictable and the difficulty's effect is visible rather than
implied by an absent row.

**Touches:**
- `ui.js renderReview` — always append the Close row; branch on difficulty for
  NA vs a scored row.
- **Doc 3** currently says: *"Strict has no Close count or Close field in the
  header or review scorecard."* That is now WRONG for the review scorecard.
  The in-game header is unchanged — this decision is about the review only.
- **Doc 7** — the review's scoring table description.
- **Doc 9** — the acceptance row "Strict omitting Close" becomes "Strict shows
  Close as NA".

---

## 3. Shift Review header wording and case

**Decision (John, 2026-08-05):**

| Mode | Title |
|---|---|
| Triage | `TRIAGE SHIFT COMPLETE` |
| TriageRUSH | `TriageRUSH COMPLETE` |

**The mixed case on `TriageRUSH` is deliberate and must be preserved.** Never
apply `text-transform: uppercase` to that element — it destroys the intended
casing. Leave a comment in the CSS saying so.

Beneath the title, the mode line reads (FINAL, John 2026-08-05):

    MODE: <Mode>, <Difficulty>, <configured shift length>

e.g. `MODE: TriageRUSH, Strict, 60 seconds` or
`MODE: Triage, Forgiving, 5 minutes`. This replaces the current
`TRIAGERUSH · FORGIVING`.

Three changes from the first draft: the repeated word "Mode" after each item
is gone, the leading label is uppercase `MODE:`, and **the configured shift
length is added**.

**Length is the CONFIGURED setting, not time elapsed** — a RUSH 60s shift
ended at 0:42 still reads "60 seconds". Suggested wording: RUSH uses seconds
("60 seconds" / "120 seconds"), Triage uses minutes ("5 minutes" /
"10 minutes"), since "300 seconds" reads badly. Confirm with John if he wants
one unit throughout.

**CONSEQUENCE — the meta grid must not also claim a shift length.** Variant B
labelled a meta cell "SHIFT LENGTH", but it is fed by `state.shift.elapsedMs`
(time actually RUN), so a shift ended early would print
`MODE: ... 60 seconds` beside `SHIFT LENGTH 0:42` — two contradictory
labels. That cell reverts to **DURATION**, which is what the shipped build
calls it and what the value actually is.

**Touches:** `ui.js renderReview`, `styles.css` section 9, doc 7.

---

## 4. Triage direction: one ladder, Psych and Discharge included

**Decision (John, 2026-08-05):** Psych and Discharge stop being
direction-less. Every room gets an acuity rank and direction is a comparison:

| Room | Rank |
|---|---|
| esi-1 | 1 |
| esi-2 | 2 |
| esi-3 | 3 |
| esi-4 | 4 |
| esi-5 | 5 |
| psych | 6 |
| discharge | 7 |

**Rule:**
1. Full credit → `correct`, no direction.
2. selected rank **<** correct rank → **over**-triage (higher acuity than
   required).
3. selected rank **>** correct rank → **under**-triage (lower acuity than
   required).

**There are no ties.** A tie would mean the selected room IS the correct room,
which is full credit and returns at step 1.

**The correct side uses the ROOM's rank, never the underlying ESI.** This is
deliberate and load-bearing: it means direction never consults
`answer.correctEsi`, so the rule cannot break when a Psych or Discharge
patient is authored at a different ESI. An earlier draft that mapped
psych→4 and discharge→5 was rejected for exactly that fragility — it worked
only because every psych patient currently happens to be ESI-4.

Worked examples, all confirmed by John:
- correct `esi-3`, picked `psych` (6>3) → under
- correct `esi-3`, picked `discharge` (7>3) → under
- correct `discharge` (7), picked `psych` (6<7) → **over**
- correct `psych` (6), picked `discharge` (7>6) → **under**
- correct `esi-5` (5), picked `psych` (6>5) → under
- correct `esi-3`, picked `esi-1` (1<3) → over

**Why:** distance already never mattered (the shipped code compares ESI
numbers with no adjacency test), so the only real gain is that Psych and
Discharge misses stop vanishing. After this, **under + over account for every
miss**, so the two counters reconcile with the non-correct calls instead of
silently under-reporting.

Still scoring-neutral: direction earns no points.

**Also confirmed:** the counters fill in EVERY difficulty. Difficulty changes
scoring, not counting — direction is assigned to anything that is not
`correct`, so under Forgiving a CLOSE call also moves a counter, and under
Strict the counters fill normally. Player-facing wording must therefore say
"misses", not "wrong calls".

**Touches:**
- `game.js classifyTriageDirection` — replaced by the rank lookup; the
  `parseEsiRoomNumber` null branch disappears.
- **Doc 3, "Triage direction"** currently says: *"An incorrect Psych or
  Discharge selection: `wrong` with neither direction counter incremented."*
  That line is replaced.
- **Doc 9** — acceptance rows for direction counting.

---

## 5. Shift Review presentation: variant B

**Decision (John, 2026-08-05):** the Shift Review adopts variant **B
("LEGIBLE")** from `_mockups/shift-review-mockups.html`. The
supervisor-evaluation motif (FORM ED-7, grade band, comments box, signature,
grunge) is NOT adopted.

**What B is:** today's content and structure with the legibility problems
fixed —

- large title over a 2px rule, mode line beneath (item 3);
- meta as a 2 x 2 grid of cells with left rules: PROVIDER, SHIFT LENGTH,
  PATIENTS SEEN, DATE — replacing the dotted-leader rows;
- the one large score;
- the three-row scoring table (item 2);
- two direction counters as boxed buttons (item 6);
- PATIENTS SEEN and RETURN TO ER ENTRANCE unchanged.

**The legibility fixes, which are the point of the variant:**
- secondary ink `#6d7b81` -> `#4b585e` (the old value is too light on the
  cream stock);
- every clamp minimum raised — nothing below 10px;
- **letter-spacing on small-caps labels 0.22em -> ~0.10em.** This mattered
  more than font size did; it was the main cause of the illegibility.

**Touches:** `styles.css` section 9 (replaced), `ui.js renderReview`, doc 7
(whose provisional note is resolved by this).

**NOTE:** with the patient-pool redesign abandoned the score has NO ceiling,
so a BELOW/MEETS/EXCEEDS grade cannot be a percentage of anything achievable.
Variant B carries no grade at all, which sidesteps this — do not reintroduce
one without solving that first.

---

## 6. Direction counters explain themselves

**Decision (John, 2026-08-05):** the UNDER-TRIAGED and OVER-TRIAGED counters
become interactive and explain what they mean.

**Must work on a phone.** iOS has no hover, so a hover-only tooltip would be
invisible on John's primary device. The mockup's approach: real `<button>`
elements (44px minimum per doc 7) that respond to hover on desktop AND toggle
on tap, with a shared help line beneath whose **height is reserved** so
revealing text never shifts the page under the user's finger.

Wording used in the mockup:
- default: "Neither is scored — they show which way your misses went. Counted
  in every mode, including Strict."
- under: "UNDER-TRIAGED: sent to a room less urgent than the patient needed.
  The more dangerous error."
- over: "OVER-TRIAGED: sent to a room more urgent than the patient needed.
  Safer, but it ties up the wrong resources."

**Touches:** `index.html` (the counters become buttons), `ui.js`,
`styles.css` section 9, doc 7.

---

## 7. Mark the DURATION when the shift was stopped short

**Decision (John, 2026-08-05):** if the player ended the shift early, the time
on the review card is marked with an asterisk and a short note sits NEXT TO
the time — inline, not a footnote at the bottom of the card.

    DURATION
    0:42 * ended early

**Why this is needed now:** item 3 puts the CONFIGURED shift length in the
mode line, so the card can show `MODE: TriageRUSH, Strict, 60 seconds`
directly above `DURATION 0:42`. Without a marker that gap looks like a bug or
an unexplained discrepancy. The asterisk is what reconciles the two numbers.

**The state already exists — no new plumbing.** `state.shift.endReason` is
`"timer" | "stop" | "quit" | null` (game.js line ~115), and `ui.js`
`renderShiftOverAcknowledgement` already branches on it for
`TIME'S UP` vs `SHIFT ENDED`. The review just reads the same field:

- `endReason === "timer"` → no mark; the shift ran its full length.
- `endReason === "stop"` → mark it; the player ended early.
- `endReason === "quit"` → unreachable here. A quit shift is never scored and
  never reaches the review at all.

**Still to settle when building:**
- the exact note wording (`ended early` / `shift ended early` / `stopped
  early`);
- whether the asterisk is a literal `*` or a typographic marker — if anything
  other than a plain `*` is used, it needs the U+FE0E treatment, since
  iPhones render some symbol glyphs as boxed emoji;
- how it sits in variant B's meta cell, which is a two-line block (small
  key above, bold value below). The note likely rides on the value line at
  the smaller key size, so it reads as an annotation rather than part of the
  number.

**Touches:** `ui.js renderReview`, `styles.css` section 9, doc 7.

---

## Not included here

The **psych/discharge authoring rule** is NOT a pending change — it describes
what the data already does, so it went straight into doc 5 as current.
