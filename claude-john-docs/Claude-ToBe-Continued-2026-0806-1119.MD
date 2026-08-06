# triageRush — To Be Continued (2026-08-06 11:19 PDT)

## State: doc 10 BUILT, then a day of refinements. All tested, uncommitted → committed this session.

Cache version: **`2026-0806-review9k`** (index.html x5 + assets.js — bump BOTH).

## What this session did

### 1. Built all seven doc 10 items (the Shift Review changes)

- **Scoring**: `RUSH_WAITING_PENALTY_PER_PATIENT` deleted; score = assignment
  points only, in every mode; starting live RUSH score is now 0.
- **Direction**: one acuity ladder `ROOM_ACUITY_RANK` (esi-1..5 = 1-5,
  psych = 6, discharge = 7). Compares ROOM ranks, never `correctEsi`. Every
  miss moves exactly one counter; UNDER + OVER reconcile with all misses.
- **Review presentation**: variant B "LEGIBLE" lifted from
  `_mockups/shift-review-mockups.html` into styles.css section 9 (renamed
  `clean-*` → `review-*`). CLOSE row always present (NA + empty cells under
  Strict); LEFT WAITING displayed nowhere.
- **16-case Node harness passed** (all doc 10 worked examples) — rebuild it
  from doc 9's tables if needed; it lived in the session scratchpad.

### 2. Refinements John made after seeing it (all built + verified)

- Title → `TRIAGE Shift Report` / `TriageRUSH Shift Report`; "Shift Report"
  is serif small-caps (Georgia stack) like a report masthead. NEVER
  text-transform that element (TriageRUSH mixed case).
- Mode line beneath, prominent (gap + larger font):
  `MODE: TriageRUSH, Strict, 60 seconds` — configured length, worded exactly
  as its Settings radio (RUSH seconds, Triage minutes).
- Meta 2x2 grid, uneven columns (0.82fr/1.18fr) so DATE fits one line.
- DURATION marks an early stop inline: `0:42 * ended shift early`
  (endReason === "stop" only; "timer" no note; "quit" never reaches review).
- Direction counters: ONE boxed section, disclaimer always visible inside:
  `* not used in scoring. These count which way you missed.`
  Hover/tap swaps the counter's OWN text for its explanation in place
  (label kept as first line, no scoring-guidance sentences). Tap pins;
  pin auto-releases after 5s (`DIRECTION_PIN_TIMEOUT_MS`, app.js); hover is
  CSS scoped under `@media (hover: hover)` because iOS sticks :hover after
  a tap (that bug was found on John's iPhone and fixed).
- Blue button → `Review the Patients Seen (n)`.
- **Wrong glyph is now a red MINUS `−` U+2212** (was ✕ — confused with the
  red close box once the review photo became tappable). Changed in
  `OUTCOME_MARK_GLYPHS` + `OUTCOME_FEEDBACK_TEXT` (ui.js). U+2212 has no
  emoji form — safe on iPhone without retesting. ✕ remains ONLY as the
  close-box glyph.
- Photo badge shrunk to ~1.4x the Answer mark (was 2x).
- Scoring table rows open with their glyphs: ✓ CORRECT / △ CLOSE / − WRONG,
  glyph in accent color, word in ink; NA row recedes whole.

### 3. Patients Seen browser (patient review)

- Red X was partly painted over by the pinned nameplate's paper-colored
  shadow slab (same z-index 4, later in DOM). `.chart-close` is now
  **z-index 5**; the photo-zoom scrim (also 5, later in DOM) still covers it
  by design.
- **Photo zoom added to the review chart** (reverses Phase 8's "no zoom"
  decision — docs record the reversal). Same specs as the Chart's lightbox;
  shared builder `buildPortraitZoomCard`; `renderSeenPortraitZoom` +
  `seenZoomView` element; Escape peels zoom → browser; nav/close auto-close
  it. The zoomed photo deliberately has NO outcome badge.
- Verified with a REAL playthrough (start shift → assign → end early →
  review → browse → zoom), plus a second shift confirming the in-game
  Chart zoom still works (shared code).

## Hard-won lessons (recorded in docs, do not re-learn)

- iOS sticks `:hover` after a tap → hover-driven UI must be scoped under
  `@media (hover: hover)`; the pin class is the only driver on touch.
- Text-fit checks: measure the TEXT against its BOX, not the viewport, and
  leave ~30% headroom — iOS system fonts run wider than Windows fonts.
  (The disclaimer line wrapped twice on the iPhone before this was learned.)

## Immediate next work

1. John may want purely cosmetic Shift Report tweaks (he said so 2026-08-06).
2. Phase 9: persistence and recovery.
3. Phase 10 planning must address the asset-loading strategy (blocks READY
   on 160 JSON fetches + full image decode — memory + tech notes).

## Longer-term ToDo (unchanged)

"RUSH must never leave an empty waiting room"; RUSH arrival pacing revision;
review the last shift from ER ENTRANCE (needs `lastCompletedShift` snapshot);
sound volume control; ambient ER soundscape; music options; lo-fi filter;
confirm-dialog button redesign; countdown numerals over the Chart; scorecard
hover magnification (same iOS no-hover constraint); six missing vital icons;
Settings/About placeholder text; favicon (the only console 404).

Do NOT re-propose: the patient-limit redesign (ABANDONED), the nav-arrow
fade on scroll, a review grade (no score ceiling → no percentage basis).

## Docs

Docs 1, 3, 7, 8, 9 are authoritative and current. Doc 10 is a decision
record (ALL BUILT 2026-08-06, with same-day refinement addendum). The
psych/discharge authoring rule lives in doc 5.
