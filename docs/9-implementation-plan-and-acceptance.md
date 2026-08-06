# Implementation Plan and Acceptance

**Last modified:** 2026-08-05

**Latest change:** Phase 8 complete (2026-08-05): Shift Review, the
shift-over acknowledgement, and the Patients Seen browser, plus the
session's review decisions (scroll position carried between patients,
pinned nameplate, outcome mark and photo badge).

**Build status (2026-08-05):** Phases 1 through 8 are implemented in
`triageRush/`; Phases 1-6 are visually approved by John. Phase 7 awaits his
play-through. Phase 8's review screens were reviewed and adjusted with him
during the build; the printed-summary LOOK is provisional pending his
supervisor-evaluation backlog item. Phase 9 (persistence) is next.

## Objective

Build the actual application under `triageRush/` using canonical patient data
and the current production assets. Keep the implementation small and readable,
and review material changes to the source map, state shape, or patient-data
boundary with John before they become entrenched.

Use current high-resolution artwork throughout functional implementation and
visual approval. Asset resizing/compression is Phase 10, after final CSS gives
reliable maximum rendered sizes. It must not block work on the game.

A phase is complete only when its automated checks pass and its visible behavior
has been reviewed at the specified viewports.

## Definition of done

The implementation is complete when:

- documents `3`, `4`, `5`, `6`, `7`, and `8` have no known runtime
  contradiction;
- all 160 patients load from the intended manifest with matched portraits;
- all current production assets load; after Phase 10, optimized runtime copies
  remain visually equivalent to their approved high-resolution masters;
- every gameplay, scoring, timing, sound, Chart, and review test below passes;
- HOME, GAME, and SHIFT REVIEW use one 9:16 presentation on every device;
- an active GAME can only be quit to HOME or stopped to SHIFT REVIEW, and no
  primary-view path resumes that GAME;
- keyboard, touch, safe-area, reduced-motion, and audio-failure checks pass;
- no current path depends on a historical/discarded asset or application; and
- John visually accepts the production implementation.

## Phase 0: documentation approval

Deliverables:

- current numbered specification set;
- exact treatment of all approved 2026-08-04 changes;
- John's approval of the compact file map, meaning-oriented naming rules,
  schema-preserving patient boundary, and development-first asset sequence;
- no runtime edits;
- no obsolete asset/code inventories in live docs.

Gate:

- John confirms the documentation represents the intended design.

## Phase 1: manifests, loading, and state foundation

Implement:

- validated asset manifest;
- explicit 160-patient manifest;
- schema 2.2 validation and schema-preserving indexing;
- compact source skeleton using `assets.js`, `game.js`, `ui.js`, and `app.js`,
  with `ui.js`/`app.js` combination allowed when clearer;
- meaning-oriented names, unit suffixes, section dividers, and intent comments;
- serializable state defaults;
- state invariant checks in development;
- injected clock and random source;
- selectors for all totals;
- versioned preference storage.

Automated gate:

- all patient JSON parses and reports version 2.2;
- loaded records retain authored names, casing, nesting, and values;
- queue, active, assigned, and ledger records reference patient IDs rather than
  duplicate or reshape complete patient records;
- all portrait and asset paths exist;
- room keys and answer fields are legal;
- missing or malformed input blocks Start Shift with an actionable error;
- state round-trip serialization preserves legal state;
- invalid snapshots are rejected atomically.

## Phase 2: one responsive shell and primary views

Implement:

- one 9:16 shell;
- separate HOME, GAME, and SHIFT REVIEW views;
- 5% top and bottom height-limited breathing room;
- safe-area handling;
- no page scroll;
- GAME band and column geometry;
- view navigation and pause reasons.

Viewport gate:

| Viewport | Required outcome |
|---|---|
| 390 x 844 | Width-limited exact 9:16 shell; safe mobile fit |
| 430 x 932 | Full compact composition; no clipping |
| 1280 x 720 | Approximately 648px shell height with 36px top/bottom |
| 1600 x 1000 | Approximately 900px shell height with 50px top/bottom |
| 1920 x 1080 | Approximately 972px shell height with 54px top/bottom |
| 3840 x 2160 | Approximately 1944px shell height with 108px top/bottom |

Allow minor border-rounding differences, but aspect ratio must be exact within
normal subpixel rounding. No viewport may reveal multiple primary views.
Every image box is controlled by CSS; changing a source file's pixel dimensions
must not change shell geometry, hit targets, crop rules, or game behavior.

## Phase 3: HOME and settings

Implement:

- registered HOME (ER ENTRANCE) composition;
- Start Shift with no Resume Shift or active-entrance state;
- Player and Shift Settings boards;
- About board;
- the three sound toggles (GLOBAL, GAME SOUNDS, MUSIC) on the shift board;
- player title/initials;
- mode, difficulty, length, and hints preferences.

Acceptance:

- title list includes Intern;
- initials accept one to three A-Z characters and normalize uppercase;
- Triage offers 5 and 10 minutes, default 5;
- RUSH offers 60 and 120 seconds, default 60;
- No Timer is absent;
- music never autoplays;
- stream failure leaves UI honest and game usable;
- HOME never displays Resume Shift or Return to Game;
- every Start Shift creates a new shift and resets shift-local state.

## Phase 4: queue and patient presentation

Implement:

- shuffled non-duplicate deck;
- HOME-time patient-data/shared-art preparation;
- blocking `PATIENTS ARE ARRIVING` Start Shift status;
- initial-queue portrait decode plus a measured reserve before the timer starts;
- rolling portrait preloading ahead of the deck cursor;
- five-patient Triage seed;
- two-patient RUSH seed with five visible slots;
- selection, compaction, and pre-assignment swap;
- waiting-background attachment;
- Triage immediate refill;
- patient portrait, identity, complaint, quote, vitals, and note;
- schema image metadata;
- occupied/empty patient states;
- seven accepted room doors.

Automated gate:

- Start Shift cannot anchor the timer before required initial portraits decode;
- preload failure offers retry or return to HOME without a partial shift;
- the rolling reserve supports the fastest RUSH curve in representative
  throttled-network tests without delaying insertion;
- startup does not require decoding all 160 portraits;
- seed operations are silent;
- Triage selection produces exactly one replacement and one doink;
- RUSH selection does not refill;
- recall and swap never doink;
- active/waiting/assigned IDs remain unique;
- queue never exceeds ten;
- background follows patient through swap/compaction;
- deck exhaustion reshuffles without introducing visible or seen duplicates.

Visual gate:

- five through ten queue rows remain legible;
- both rails sit on the flat dark green (#0f3d2f), not wall artwork;
- the empty panel shows the 9:16 SELECT A PATIENT box with its hint lines and
  fused text arrows (U+FE0E);
- the nameplate shows the cream age/sex wristband chip; long names ellipsize
  while the chip keeps its size;
- all patient-panel text fits or reduces only to the documented floor;
- all seven accepted closed doors are readable;
- room help contains no patient-specific hint.

## Phase 5: evaluation, feedback, recall, and ledger replacement

Implement:

- full-credit sets;
- Strict and Forgiving;
- special-destination dual correctness;
- direction classification;
- one ledger entry per patient;
- room open state and recall;
- atomic reassignment replacement;
- derived scorecard;
- Correct/Close/Wrong visual and audio feedback.

Required unit cases:

| Patient answer | Choice | Strict | Forgiving |
|---|---|---|---|
| ESI 3 | ESI 3 | Correct | Correct |
| ESI 3 | ESI 2 | Wrong | Close |
| ESI 3 | ESI 4 | Wrong | Close |
| ESI 3 | ESI 1 | Wrong | Wrong |
| Psych, ESI 2 | Psych | Correct | Correct |
| Psych, ESI 2 | ESI 2 | Correct | Correct |
| Psych, ESI 2 | ESI 1 | Wrong | Close |
| Discharge, ESI 5 | Discharge | Correct | Correct |
| Discharge, ESI 5 | ESI 5 | Correct | Correct |
| Discharge, ESI 5 | Psych | Wrong | Wrong |

Direction unit cases (the acuity ladder, 2026-08-06 — rank compares the
CORRECT ROOM, never the underlying ESI; any non-correct outcome gets a
direction):

| Correct room | Choice | Direction |
|---|---|---|
| esi-3 | psych | under |
| esi-3 | discharge | under |
| discharge | psych | over |
| psych | discharge | under |
| esi-5 | psych | under |
| esi-3 | esi-1 | over |
| esi-3 | esi-2 (Forgiving Close) | over |

Reassignment gate:

1. Assign a patient Wrong: ledger size 1, score -50.
2. Recall: ledger and score unchanged; patient becomes active.
3. Reassign Correct: ledger size remains 1, score becomes +100.
4. Counts change from Wrong 1 to Correct 1.
5. Direction removes the old contribution.
6. Recall/reassign Close: same record becomes +50 and Close 1.
7. Patient appears once in Patients Seen at its original order position.
8. End while recalled: latest completed assignment remains final.

Feedback gate:

- only selected room pulses (three beats on the outcome-colored ring);
- the ring persists as a halo on the open door until recall or finalization;
- recall plays the C5/E5 recall sound and never a doink;
- Close/Wrong never reveal correct room;
- each outcome has text/symbol/color and distinct optional sound;
- mute suppresses sound without suppressing visual feedback.

## Phase 6: the Chart overlay

Implement:

- full patient-panel hit target;
- no footer Chart button;
- the clipboard setting of the unified chart builder (CSS-drawn clipboard);
- presentation cards with no section header;
- Answer locked with shake;
- Clinical shift-level memory;
- the photo zoom lightbox;
- overlay plumbing (the Chart deliberately adds no pause reason: the clock
  keeps running while the player reads - John, 2026-08-05);
- internal scroll hints;
- close paths and focus restoration.

Acceptance:

- new selected patient can open the Chart;
- recalled patient can open the Chart;
- empty patient panel cannot open the Chart;
- assigned patient behind a door cannot open the Chart without recall;
- Answer remains locked for both new and recalled patients, and activating it
  shakes without opening;
- there is no PRESENTATION header and the presentation cards cannot collapse;
- Clinical starts collapsed at new shift;
- expand Clinical, close, select another patient, reopen: remains expanded;
- collapse, recall another patient, reopen: remains collapsed;
- starting a new shift resets to collapsed;
- MORE ABOVE / MORE BELOW appear only when hidden content exists in that
  direction and scroll about 70% per tap;
- the photo zoom opens from the badge/photo, hides the chart's close box while
  open, and closes via its red box, scrim tap, or Escape;
- Escape peels the lightbox first, then the Chart; the lightbox always starts
  closed on a fresh Chart open;
- opening and closing the Chart never touches the pause reasons: the clock
  runs while the Chart is open;
- close restores focus to the panel hit target; open focuses the close box;
- keyboard and touch activation both work;
- footer center contains no disabled or hidden Chart action.

## Phase 7: clocks, sounds, and RUSH arrivals

Implement one 250ms logical scheduler.

### Triage acceptance

- 300-second and 600-second countdowns start at selected value.
- The clock holds its starting value for a 2-second acclimation delay after
  the GAME screen appears (both modes).
- Display never shows elapsed `+` time.
- One tick occurs every ten elapsed seconds.
- At each minute boundary, ticks occur 500ms before, 250ms before, and on the
  boundary, without a duplicate ordinary ten-second tick.
- Final ten follows RUSH whole-second audio.
- Final five includes quarter/half beats; the last two seconds beat on every
  quarter as a run-in to the dong.
- Zero ends the shift once and plays completion dong once.
- Waiting patients contribute zero penalty.

### RUSH base arrival acceptance

For 60 seconds, intervals are:

```text
10, 9, 8, 7, 6, 5, 4, 3, 2, 1, then 1...
```

For 120 seconds:

```text
14.5, 13.5, 12.5, ... 2.5, 1.5, 1, then 1...
```

Pause freezes both countdown and arrival countdown. Delayed browser callbacks
do not duplicate boundary events.

### RUSH burst acceptance

Use injected random values:

| Random | Free slots | Requested | Added | Doinks | Shake |
|---:|---:|---:|---:|---:|---:|
| 0.10 | 2+ | 2 | 2 | 2 | 0 |
| 0.1999 | 1 | 2 | 1 | 1 | 1 |
| 0.20 | 2+ | 1 | 1 | 1 | 0 |
| 0.80 | 0 | 1 | 0 | 0 | 1 |

The second member of a successful burst arrives exactly 250ms after the first.
It does not reset or delay the base arrival schedule. Capacity is rechecked at
the second insertion.

### RUSH cue acceptance

- immediate start tick;
- ordinary tick on each whole second while time remains;
- at every pre-countdown ten-second boundary, extra ticks 500ms and 250ms before
  the ordinary boundary tick;
- ten-second sequence begins at 10 and replaces that emphasis group;
- numerals 10 through 1 pop/fade over the patient image;
- final five adds quarter- and half-second ticks after each whole-second tick,
  and the last two seconds beat on all eight quarters as a run-in to the dong;
- zero dong suppresses coincident arrival and timing cues;
- full blocked arrivals are silent except for the visual shake.

Run the scheduler tests with fake time; do not rely on real sleeps.

## Phase 8: Shift Review and Patients Seen

Implement:

- final score from live score selector;
- actual duration and metadata;
- formula rows;
- separate direction counts;
- the shift-over acknowledgement covering both endings;
- Patients Seen from stable ledger order;
- reusable unlocked review chart (the review setting of the chart builder);
- wrapping previous/next navigation;
- the confirmed End Shift Early transition from GAME;
- Return to ER Entrance as review's only primary-view navigation.

Acceptance:

- formulas sum exactly to displayed score;
- the scoring table is ALWAYS three rows (CORRECT/CLOSE/WRONG); Strict shows
  CLOSE as NA with EMPTY count and multiplier cells (2026-08-06);
- LEFT WAITING appears nowhere on the review — no row, no stat (2026-08-06);
- no waiting penalty in any mode: score is assignment points only;
- the title reads `TRIAGE Shift Report` / `TriageRUSH Shift Report` (mixed
  case preserved; "Shift Report" in serif small-caps), with the mode line
  `MODE: <Mode>, <Difficulty>, <configured length>` — RUSH lengths in
  seconds, Triage lengths in minutes;
- duration reports time actually run, not the selected shift length;
- a shift the player stopped early marks DURATION inline: `0:42 * ended
  early`; timer expiry shows no note; a quit shift never reaches review;
- every miss moves exactly one direction counter (the acuity ladder
  esi-1..5 = 1-5, psych = 6, discharge = 7), in every difficulty; a
  Forgiving CLOSE call also moves one;
- the direction counters are buttons in one boxed section with the
  always-visible disclaimer: hover or tap swaps the counter's own text for
  its explanation in place (label retained as the first line), tap pins,
  tapping the pinned one restores the number, pinning one releases the
  other, a pin times out after 5 seconds on its own, and the reserved
  button height means the swap never shifts the layout;
- zero patients seen disables Patients Seen rather than opening it empty;
- reassigned patient appears once with latest result and room;
- previous/next wraps;
- one patient disables or safely no-ops navigation;
- patient change CARRIES the scrolled fraction; opening starts at the top;
- the nameplate stays pinned while the rest of the chart scrolls, in the
  review browser and the Chart overlay alike;
- the outcome shows as a mark beside the chosen room and as a badge on the
  patient photo, using the in-game glyphs;
- the review photo zooms like the Chart's (2026-08-06): opens from the
  photo, no outcome badge on the zoomed card, closes by box / scrim tap /
  Escape (which peels the zoom before the browser), and navigating to
  another patient closes it;
- the review close box is never painted over by the pinned nameplate or
  the paper (2026-08-06);
- the review chart's full-credit set comes from `fullCreditRoomKeys`, never
  from `answer.otherAcceptableRooms`;
- review section toggles never change `state.chart.clinicalExpanded`;
- close restores focus to Patients Seen, by both the close box and Escape;
- End Shift Early confirms, finalizes once, and opens review behind the
  acknowledgement; timer expiry does the same without a dialog;
- the acknowledgement reads `TIME'S UP` for expiry and `SHIFT ENDED` for
  ending early, waits for input rather than timing out, accepts tap, Enter
  and Space, and reveals a summary already rendered underneath;
- quitting shows no acknowledgement and produces no review result;
- review exposes no Return to Game or direct New Shift action;
- Return to ER Entrance clears completed runtime state and opens HOME.

## Phase 9: persistence and recovery

Acceptance scenarios:

- refresh on HOME restores safe preferences;
- refresh during active shift restores directly to GAME without visiting HOME
  or offering Resume Shift;
- queue backgrounds, active/assigned patient, ledger replacements, clock,
  arrival interval, and Chart Clinical preference recover exactly;
- no catch-up occurs for time while the application is closed unless a later
  product requirement explicitly asks for real-time expiry;
- incompatible storage discards active shift safely;
- confirming Quit This Shift clears the recovery snapshot and returns to HOME
  without a review result;
- canceling Quit This Shift preserves exact active state;
- End Shift Early clears active recovery after finalizing review;
- Return to ER Entrance leaves only safe preferences and HOME settings.

## Phase 10: assets and visual regression

Precondition: Phases 1 through 9 are functionally complete and the game has been
visually approved with the current high-resolution production assets.

### 10A: measure final demand

- Rerun `triageRush/assets/_asset-audit-and-resize/audit_assets.py` against the
  final production CSS and manifest.
- Measure maximum rendered and requested pixel sizes at iPhone 16 Pro Max 3x,
  Full HD, and normal 3840 x 2160 desktop reference presentations.
- Record startup, Start Shift, and rolling-preload transferred bytes and decode
  timing before optimization.

### 10B: approve representative trials

- Create trials only under
  `triageRush/assets/_asset-audit-and-resize/resized-assets/`.
- Include representative opaque backgrounds, transparent doors/overlays,
  lettering, and patient portraits.
- Compare the trials in their real CSS boxes at all three reference displays.
- Obtain John's visual approval before batching comparable assets.

### 10C: preserve masters and replace runtime copies

- Preserve a complete checksummed high-resolution master set outside the
  runtime manifest and preferably outside the deployed web root.
- Replace optimized runtime assets at the same logical paths/filenames when
  practical. If encoding or path changes, update only the centralized manifest.
- Do not upscale a source merely to match an audit target.
- Change the production cache version after the approved replacement.

Automated gate:

- every runtime manifest path exists, returns, and decodes;
- the high-resolution master archive is complete and checksummed;
- production contains all seven open/closed door pairs;
- no JavaScript or layout rule depends on `naturalWidth`, `naturalHeight`, or
  source pixel dimensions;
- cache version differs from the pre-optimization build;
- transparent assets retain clean alpha edges without unintended matte halos;
- startup, Start Shift, and rolling-preload byte/timing measurements are saved.

Manual gate:

- before/after game behavior, geometry, crop, registration, and hit targets are
  unchanged;
- all open/closed door labels remain readable in the seven-row layout;
- HOME overlays register at all tested sizes;
- waiting and patient-panel art does not clip;
- portrait scale/orientation metadata renders correctly without visible softness;
- countdown and feedback do not obscure required controls;
- 10-row queue remains usable; and
- 200% zoom retains readable content and keyboard access.

Acceptance requires measured loading improvement without a visually meaningful
loss at any approved reference presentation. Assets that do not benefit enough
remain at their current resolution.

## Phase 11: accessibility and failure testing

- Complete a shift using keyboard only.
- Complete core assignment/recall using touch only.
- Confirm useful screen-reader names for score numbers, queue patients, patient
  panel, doors, sound, and navigation.
- Confirm overlay focus containment and restoration.
- Confirm Correct/Close/Wrong without color or sound.
- Confirm reduced-motion behavior.
- Confirm safe-area fit with browser chrome visible.
- Simulate denied Web Audio and failed music stream.
- Simulate one missing patient and one missing asset.
- Confirm no failure creates a partial active shift.

## Final review checklist

- No current document points to an obsolete app or discarded asset.
- No implementation comment claims first assignment is immutable.
- No Chart footer control remains.
- No No Timer Triage option remains.
- Intern appears in settings and persistence validation.
- Doink originates only from successful runtime insertion.
- RUSH double probability is exactly 20%.
- RUSH and Triage emphasis cues match their documented boundaries.
- Doors are the accepted matching set.
- Patient records retain the canonical schema; game state references them by ID.
- Source files remain compact and meaningfully organized; additional modules
  have a documented reason and John's review.
- CSS, not source-image dimensions, owns rendered geometry.
- The game was approved with current high-resolution art before Phase 10, and
  representative optimized trials were approved before batch replacement.
- High-resolution masters are outside the runtime manifest and the optimized
  build has a new cache version.
- Only one 9:16 presentation exists.
- No Resume Shift, active-entrance, Return to Game, or direct
  review-to-New-Shift action remains.
- Quit This Shift discards without review; End Shift Early reviews; Return to
  ER Entrance ends at HOME and a later Start Shift creates a new game.
- John approves the visual and gameplay result.
