# Implementation Plan and Acceptance

**Last modified:** 2026-08-04

**Latest change:** Added the ordered conformance plan and release-level acceptance
matrix for rebuilding the one-presentation mobile application from the current
specifications.

## Objective

First revise `_testAppMobile/` to match the current documents. Do not change
the mobile test app until John accepts this documentation revision. After the
test app passes every applicable gate, transfer or align the same behavior under
`triageRush/` using canonical data and production assets.

A phase is complete only when its automated checks pass and its visible behavior
has been reviewed at the specified viewports.

## Definition of done

The implementation is complete when:

- documents `3`, `4`, `5`, `6`, `7`, and `8` have no known runtime
  contradiction;
- all 160 patients load from the intended manifest with matched portraits;
- all current production assets load and the accepted doors remain unchanged;
- every gameplay, scoring, timing, sound, Coach, and review test below passes;
- HOME, GAME, and SHIFT REVIEW use one 9:16 presentation on every device;
- keyboard, touch, safe-area, reduced-motion, and audio-failure checks pass;
- no current path depends on a historical/discarded asset or application; and
- John visually accepts the updated mobile implementation.

## Phase 0: documentation approval

Deliverables:

- current numbered specification set;
- exact treatment of all approved 2026-08-04 changes;
- no runtime edits;
- no obsolete asset/code inventories in live docs.

Gate:

- John confirms the documentation represents the intended design.

## Phase 1: manifests, loading, and state foundation

Implement:

- validated asset manifest;
- explicit 160-patient manifest;
- schema 2.2 loading and normalization;
- serializable state defaults;
- state invariant checks in development;
- injected clock and random source;
- selectors for all totals;
- versioned preference storage.

Automated gate:

- all patient JSON parses and reports version 2.2;
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

Allow minor border-rounding differences, but aspect ratio must be exact within
normal subpixel rounding. No viewport may reveal multiple primary views.

## Phase 3: HOME and settings

Implement:

- registered HOME lobby composition;
- Start Shift and Resume Shift;
- Player and Shift Settings boards;
- About board;
- boombox control hit targets;
- player title/initials;
- mode, difficulty, length, hints, and sound preferences;
- restart confirmation for gameplay-setting changes.

Acceptance:

- title list includes Intern;
- initials accept one to three A-Z characters and normalize uppercase;
- Triage offers 5 and 10 minutes, default 5;
- RUSH offers 60 and 120 seconds, default 60;
- No Timer is absent;
- music never autoplays;
- stream failure leaves UI honest and game usable;
- Resume returns to exact saved GAME state.

## Phase 4: queue and patient presentation

Implement:

- shuffled non-duplicate deck;
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

- only selected room pulses;
- Close/Wrong never reveal correct room;
- each outcome has text/symbol/color and distinct optional sound;
- mute suppresses sound without suppressing visual feedback.

## Phase 6: active-patient Coach

Implement:

- full patient-panel hit target;
- no footer Coach button;
- active-patient chart mapping;
- Answer locked;
- Clinical shift-level memory;
- pause/resume;
- internal scroll hints;
- close and focus restoration.

Acceptance:

- new selected patient can open Coach;
- recalled patient can open Coach;
- empty patient panel cannot open Coach;
- assigned patient behind a door cannot open Coach without recall;
- Answer remains locked for both new and recalled patients;
- Clinical starts collapsed at new shift;
- expand Clinical, close, select another patient, reopen: remains expanded;
- collapse, recall another patient, reopen: remains collapsed;
- starting a new shift resets to collapsed;
- open Coach freezes countdown and RUSH arrival time;
- close resumes without catch-up;
- keyboard and touch activation both work;
- footer center contains no disabled or hidden Coach action.

## Phase 7: clocks, sounds, and RUSH arrivals

Implement one 250ms logical scheduler.

### Triage acceptance

- 300-second and 600-second countdowns start at selected value.
- Display never shows elapsed `+` time.
- One tick occurs every ten elapsed seconds.
- At each minute boundary, ticks occur 500ms before, 250ms before, and on the
  boundary, without a duplicate ordinary ten-second tick.
- Final ten follows RUSH whole-second audio.
- Final five includes quarter/half beats.
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
- final five adds quarter- and half-second ticks after each whole-second tick;
- zero dong suppresses coincident arrival and timing cues;
- full blocked arrivals are silent except for the visual shake.

Run the scheduler tests with fake time; do not rely on real sleeps.

## Phase 8: Shift Review and Patients Seen

Implement:

- final score from live score selector;
- actual duration and metadata;
- formula rows;
- separate direction counts;
- Patients Seen from stable ledger order;
- reusable unlocked review chart;
- wrapping previous/next navigation;
- Return/Home/New Shift navigation.

Acceptance:

- formulas sum exactly to displayed score;
- Strict omits Close without a gap;
- Triage Left Waiting uses x 0;
- RUSH Left Waiting uses x -10;
- reassigned patient appears once with latest result and room;
- previous/next wraps;
- one patient disables or safely no-ops navigation;
- patient change resets chart scroll;
- close restores focus to Patients Seen.

## Phase 9: persistence and recovery

Acceptance scenarios:

- refresh on HOME restores safe preferences;
- refresh during active shift offers Resume Shift;
- queue backgrounds, active/assigned patient, ledger replacements, clock,
  arrival interval, and Coach preference resume exactly;
- no catch-up occurs for time while the application is closed unless a later
  product requirement explicitly asks for real-time expiry;
- incompatible storage discards active shift safely;
- gameplay-setting change confirms before restart;
- identity-only change does not corrupt active state.

## Phase 10: assets and visual regression

Automated:

- all manifest paths exist;
- production and test-app door sets each contain exactly 14 files;
- pairwise door SHA-256 hashes match;
- ESI/Psych files are 1152 x 1792 RGBA;
- Discharge files are 1777 x 1792 RGBA;
- later sign-only edits preserve alpha and unrelated pixels.

Manual:

- all open/closed door labels readable in seven-row layout;
- HOME overlays register at all tested sizes;
- waiting and patient-panel art does not clip;
- portrait scale/orientation metadata renders correctly;
- countdown and feedback do not obscure required controls;
- 10-row queue is still usable;
- 200% zoom retains readable content and keyboard access.

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
- No Coach footer control remains.
- No No Timer Triage option remains.
- Intern appears in settings and persistence validation.
- Doink originates only from successful runtime insertion.
- RUSH double probability is exactly 20%.
- RUSH and Triage emphasis cues match their documented boundaries.
- Doors are the accepted matching set.
- Only one 9:16 presentation exists.
- John approves the visual and gameplay result.
