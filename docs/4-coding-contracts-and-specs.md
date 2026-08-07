# Coding Contracts and Specifications

**Last modified:** 2026-08-05

**Latest change:** Swept in the 2026-08-04/05 amendments: Chart naming, the
three-toggle sound model and sound registry, the recall sound, and the unified
chart-builder contract with panel/clipboard/review settings.

## Production scope

The production application lives under `triageRush/`. It is a standalone
responsive web application. Plain HTML, CSS, and JavaScript are sufficient; add
a dependency only when it removes demonstrated complexity and remains compatible
with static hosting.

The next implementation target is the actual application under `triageRush/`,
using canonical data and production artwork from their owned locations.

## Ownership

- Root `index.html` is the site entry point.
- `triageRush/` owns production application code and runtime artwork.
- `patient-data/` owns authoritative patient JSON and portraits.
- `___patient-CRUD (standalone)/` remains an independent future editor.
- `docs/` owns current product and engineering requirements.

## Readability, naming, and file budget

The application is intentionally small. Begin with this compact source set:

```text
index.html
styles.css
assets.js
game.js
ui.js
app.js
```

Three to four JavaScript files are the target, not a quota. `ui.js` and
`app.js` may be combined if that is clearer. Add a file only when one distinct
responsibility has become difficult to understand or test in the existing
files; review a materially larger file map with John before adopting it.

Use names that expose purpose without requiring the reader to infer context:

- include the subject and unit where useful, such as `shiftRemainingMs`,
  `waitingPatients`, and `selectedRoomKey`;
- use verbs for actions and booleans that read as statements, such as
  `startShift`, `isMuted`, and `hasActivePatient`;
- avoid private abbreviations and generic names such as `data`, `obj`, `tmp`, or
  `val` when a more specific name is available; and
- use conventional small-scope names such as `x`, `y`, `index`, or `counter`
  when their meaning is genuinely obvious.

Organize each file with clear section dividers. Comments should explain why a
rule exists, what invariant a transition protects, or why an edge case is
handled. Do not narrate obvious syntax line by line. Plain HTML, CSS, and
JavaScript remain the default; introduce a framework or build system only after
a concrete need is demonstrated and discussed.

## Core architecture

Use one explicit state tree and a unidirectional update cycle:

```text
user or clock event
  -> validate action legality
  -> calculate one state transition
  -> calculate queued one-time effects
  -> render affected view/component
  -> execute effects once
```

Rendering must never:

- add or score a patient;
- play a sound;
- restart or advance a timer;
- draw a new random burst decision;
- mutate persistence merely because a component rerendered; or
- duplicate an effect after resize or view restoration.

Keep domain logic independent from DOM elements so evaluation, replacement
scoring, queue growth, and timing can be unit tested.

## Required state domains

The state must cover:

- application view: HOME, GAME, or SHIFT REVIEW;
- blocking overlay and focus-return information;
- player identity and persisted preferences;
- mode, difficulty, shift length, and sound settings;
- shift phase and timestamps;
- shuffled patient deck and cursor;
- waiting entries, each with patient ID and attached background;
- active patient (patient ID only; backgrounds belong to waiting rows);
- assigned/open room and recall availability;
- one ordered result ledger keyed by patient ID;
- derived scoring and direction counts;
- clock heartbeat, remaining time, and pause state;
- RUSH arrival countdown and current base interval;
- active two-patient burst staging;
- the runtime game-sound audibility flag (in-game mute);
- Chart Clinical expanded/collapsed preference for this shift; and
- Patients Seen review index.

The concrete reference shape is in
[Implementation blueprint](8-implementation-blueprint.md).

## Derived values

Do not store independently mutable copies of totals that can be derived from the
ledger.

```text
assignment points = sum(latest ledger-entry points)
Correct count     = count(latest outcome == correct)
Close count       = count(latest outcome == close)
Wrong count       = count(latest outcome == wrong)
Over count        = count(latest direction == over)
Under count       = count(latest direction == under)

Triage score = assignment points
RUSH score   = assignment points - (10 * waiting.length)
Patients seen = ledger order length
```

A reassignment replaces a ledger entry atomically. Do not append another entry
or apply compensating score mutations in scattered UI code.

## Action contracts

At minimum, expose testable domain actions equivalent to:

```text
startShift(settings)
+ quitShift()
+ stopShift(reason)
+ returnToHome()               // player-facing: RETURN TO ER ENTRANCE
+ selectWaitingPatient(index)
+ assignRoom(roomKey)
+ recallAssignedPatient(roomKey)
+ openChart()
+ setChartClinicalExpanded(value)
+ closeChart()
+ processHeartbeat()
+ processRushArrival()
+ openPatientsSeen()
+ navigatePatientsSeen(direction)
+ applySettings(settings)
+ toggleGameSoundsMute()       // flips only the runtime audibility flag
+```

Each action must reject illegal state without partial mutation. Examples:

- `openChart` is legal only with an active patient and no other open overlay.
- `assignRoom` is legal only with an active patient and no unresolved action.
- `recallAssignedPatient` is legal only for the currently open assigned room.
- `selectWaitingPatient` may swap only before assignment.
- `processHeartbeat` is inert while paused or outside an active shift.
- `processRushArrival` is inert outside RUSH.
- `quitShift` is legal only during an active GAME and destroys the active shift
  after confirmation without producing review results.
- `stopShift` finalizes an active GAME and opens SHIFT REVIEW.
- `returnToHome` is legal from SHIFT REVIEW and cannot restore GAME.

## Result-ledger contract

A ledger record contains patient ID, selected room, outcome, direction, points,
first-seen order, assignment count, and latest-assignment timestamp.

On initial assignment, insert it once into both the keyed ledger and its stable
order list. On reassignment:

1. Evaluate the new room without using the old outcome.
2. Create a complete replacement record.
3. Preserve the original first-seen order.
4. Increment assignment count.
5. Replace the keyed record in one transition.
6. Derive all totals from the new ledger.

Recall alone leaves the record unchanged. If the shift ends while that patient
is active and unreassigned, the last completed record remains final.

## Scheduler and clock

Use a monotonic-clock scheduler. A 250 ms logical heartbeat is the supported
reference because it exactly represents quarter- and half-second cues and the
120-second RUSH half-second intervals.

The implementation may compensate for delayed browser callbacks, but it must
emit each logical boundary once and never replay missed audio in an unusable
burst after a long suspension.

One scheduler owns:

- displayed whole-second countdown;
- RUSH arrival countdown;
- RUSH ten-second lead-in beats;
- Triage ten-second and minute beats;
- final-five quarter/half beats;
- final-ten countdown numerals;
- zero completion; and
- staged second insertion in a RUSH burst.

Use event IDs or boundary keys to guarantee one-time delivery. Zero completion
has highest priority and suppresses coincident arrival/cue effects.

## RUSH arrival transaction

At a scheduled event, draw randomness once:

```text
requested = random() < 0.20 ? 2 : 1
capacity  = 10 - waiting.length
actual    = min(requested, capacity)
blocked   = actual < requested
```

Insert the first patient immediately. If `actual == 2`, stage the second after
a short documented beat without rescheduling the next base arrival. Each
successful insertion gets its own doink. A blocked portion gets no doink; one
queue shake is allowed for the event.

Then decrement the base interval by one second, with a one-second floor, and
re-arm the arrival countdown from that new interval. Burst staging and base
arrival scheduling are separate concepts.

For deterministic tests, inject the random-number source and clock.

## Sound contract

Use one resumed Web Audio context created from a user gesture. Centralize sound
functions and keep them independent of rendering.

Required effect families:

- Correct, Close, and Wrong feedback;
- queue insertion `doink`;
- recall (C5, E5 — the first two notes of the Correct arpeggio);
- ordinary clock tick;
- ten-second/minute emphasis tick;
- zero completion dong; and
- the optional HOME music stream (KING-FM).

Track every game sound individually in one registry, each entry with its own
enabled flag, so per-sound preferences can be added later without new
structure. A game sound plays only when the persisted GLOBAL and GAME SOUNDS
toggles were on at shift start and the in-game mute is off; the in-game mute
flips only the runtime audibility flag and never touches music or the
persisted toggles. Music plays only when GLOBAL and MUSIC are on and is
started exclusively from HOME gestures.

Doink is emitted only by the successful `insertWaitingPatient` effect, never
by swap, initial seed, or a blocked capacity attempt; recall plays the
dedicated recall sound instead.

## Single responsive UI contract

The application has one 9:16 shell on all device classes.

- HOME, GAME, and SHIFT REVIEW are separate views within the same shell.
- While phase is active, GAME is the only primary view. HOME is reached only by
  confirmed quit; SHIFT REVIEW is reached only by stop or timer completion.
- Do not create a wide-screen multi-page presentation.
- Center the shell and size it from available width and height.
- On height-limited larger viewports, reserve approximately 5% viewport height
  above and below: about 10% combined.
- Preserve safe-area insets whenever larger than the nominal spacing.
- Keep the GAME panel columns at 22% / 56% / 22%.
- Keep header, play area, and footer at 7.2% / 85.8% / 7%.
- Do not allow page-level scrolling on the main view.
- Overlays may scroll internally.
- Use viewport geometry, not device-name detection.
- Browser zoom behavior may remain viewport-relative; do not add an unapproved
  scale control.
- CSS containers own rendered image width, height, crop, and fit. JavaScript
  must not use `naturalWidth`, `naturalHeight`, or source pixel dimensions to
  decide game layout or behavior.

Exact geometry and component behavior are in document `7`.

## Unified chart component contract

Build one chart builder (`buildPatientChart`) whose content is written once
and shown in per-setting wrappers. The Presentation cards are always visible
in every setting; there is no PRESENTATION section header.

```text
PANEL (GAME center)
  presentation cards only; Answer and Clinical are absent
  transparent wrapper; corridor art shows through

CLIPBOARD (Chart overlay, active patient)
  presentation: always visible
  answer:       locked (striped header, LOCKED pill, shake on activation)
  clinical:     toggling, shift-memory value (initially collapsed)

REVIEW (Patients Seen, future)
  presentation: always visible
  answer:       unlocked, expanded
  clinical:     unlocked, expanded
```

The occupied patient panel is a semantic button/hit target for the Chart.
There is no footer Chart control. Clinical expansion memory belongs to current
shift UI state, not patient JSON or local storage. Starting a new shift resets
it.

Review browsing wraps the same chart with previous, next, current position/name,
and close controls. It must not duplicate patient-chart markup or clinical
mapping.

## Data loading and manifests

- Load schema 2.2 records from `patient-data/`.
- Load portraits from `patient-data/patient-images/`.
- Preserve each validated record's authored property names, casing, nesting,
  and values. Do not flatten or rename the disk schema into a second patient
  model.
- Index canonical records by ID for lookup. Waiting, active, and ledger state
  store patient IDs plus game-owned fields; they do not copy the full patient
  record.
- Centralize all runtime asset paths in one manifest.
- Validate patient and asset manifests before enabling Start Shift.
- Produce actionable, non-destructive error UI when loading fails.
- Keep waiting backgrounds, ledger entries, settings, and random state outside
  patient JSON.
- Do not compute vital display colors; use authored schema colors.
- Do not ship copied test patient data as production authority.

## Loading and portrait-preload contract

HOME should become interactive after only its critical artwork and interface
code are ready. While the player reviews settings, load and validate the patient
manifest, patient JSON, shared game artwork, and enough metadata to plan the
first queue.

After Start Shift is pressed, show a blocking `PATIENTS ARE ARRIVING` status
while the initial queue portraits and a measured near-term reserve are fetched
and decoded. The shift timer and RUSH arrival scheduler do not start until that
set is ready. Once play begins, maintain a rolling portrait reserve ahead of
the deck cursor without downloading all 160 portraits up front.

The exact reserve size is a measured implementation choice, not a guessed
constant in this specification. It must survive the fastest supported arrival
curve under normal mobile-network testing without delaying a patient insertion.
Loading failures provide retry or return-to-HOME behavior and never start a
partial shift.

## Asset source and optimization contract

Build and visually approve the complete game with the current high-resolution
production assets. Do not resize production artwork merely to begin coding.
After final CSS establishes maximum rendered boxes, rerun the audit at the
approved iPhone, Full HD, and normal 4K reference viewports. Create and compare
representative resize/compression trials before any batch replacement.

Preserve high-resolution masters outside the runtime manifest, preferably
outside the deployed web root. Optimized runtime files should keep the same
logical paths and filenames when the format remains suitable. If a format or
path changes, change only the centralized manifest rather than scattered UI
code. Every production replacement requires a cache-version change plus path,
decode, alpha-edge, lettering, and visual-regression checks.

## Persistence

No server is required. Version every local-storage payload and validate it
before use.

Persist:

- player title and initials;
- safe sound and UI-hint preferences;
- default mode, difficulty, and mode-specific shift lengths; and
- an optional active-shift recovery snapshot used only for automatic
  interruption recovery directly into GAME.

A recovery snapshot must include ledger order and records, queue entries
with backgrounds, active/assigned patient state, deck/cursor, clock and arrival
state, Chart Clinical preference, and settings. Do not persist live timer IDs,
DOM state, audio contexts, or focus nodes.

On load, a valid active snapshot restores directly into GAME; it must never
create a HOME Resume Shift state. Confirmed quit, end-early, and Return to ER Entrance
clear the active recovery snapshot at the appropriate transition. Invalid or
incompatible stored data falls back safely to HOME and never partially recovers.

## Accessibility and interaction

- Use semantic buttons for queue patients, rooms, the patient-panel Chart target, navigation,
  and overlay controls.
- Preserve keyboard activation and visible focus.
- Required behavior cannot depend on hover or long press.
- Room descriptions may use hover/long press as supplemental help.
- Provide useful accessible names for number-only score fields and door artwork.
- Feedback must not rely on color alone.
- Blocking overlays manage focus; confirmation dialogs pause the shift, while
  the Chart deliberately lets the clock run (John, 2026-08-05).
- Respect reduced motion for shake, pulse, and countdown animation.
- Maintain minimum practical touch targets and safe-area spacing.

## Error handling and observability

- A missing patient or asset prevents starting a shift and identifies the path.
- A malformed stored snapshot is quarantined or ignored, not partially applied.
- An impossible state transition logs a development warning and leaves state
  unchanged.
- Audio-context or streaming failure does not stop gameplay.
- Development builds should expose a serializable state snapshot and injected
  clock/random sources for repeatable tests.

## Engineering verification gate

Implementation is not complete until it passes document `9`, including:

- schema and asset validation;
- deterministic evaluation and reassignment tests;
- queue, burst, cap, and doink tests;
- both mode timers and all cue boundaries;
- pause/resume and zero-priority behavior;
- Chart availability and section memory;
- single-presentation viewport checks;
- keyboard/touch/accessibility checks; and
- current door readability in all 14 states.
