# Implementation Blueprint

**Last modified:** 2026-08-06

**Latest change:** Pacing revision (2026-08-06): the clock starts on the
FIRST patient selection (replacing the 2-second acclimation delay), and an
assignment that empties the RUSH waiting room books a one-second courtesy
refill of one or two patients (`state.rush.emptyRefillAtMs` /
`emptyRefillSecondAtMs`) without touching the scheduled-arrival countdown.
Earlier: Phase 7 clock decisions (2026-08-05): the Chart no longer pauses
(no `"chart"` pause reason), and the last two seconds beat on every quarter
as a run-in to the dong.

## Purpose

This document translates the product rules into implementation structure and
algorithms. Its meaning-oriented names are the approved starting vocabulary;
material schema or architecture changes should be reviewed with John before
they become difficult to reverse. Every behavior and state invariant is
required.

## Suggested production files

```text
triageRush/
|-- index.html
|-- styles.css
|-- assets.js                 validated logical asset manifest
|-- game.js                   state, rules, queue, scoring, clock, persistence
|-- ui.js                     shell, HOME, GAME, Chart, and review rendering
|-- app.js                    bootstrap, loading, events, and one-time effects
`-- assets/                   paths specified in document 6
```

This is a conceptual separation inside a small physical file set. Use section
dividers within `game.js` and `ui.js` for the responsibilities that a larger
application might put in separate modules. `ui.js` and `app.js` may be combined
if that improves readability. Do not create a directory of one-function modules
or introduce a framework/build chain without a demonstrated need and John's
review.

Meaning-oriented naming rules:

- prefer `shiftRemainingMs`, `waitingPatients`, `selectedRoomKey`, and
  `waitingBackgroundKey` over context-poor abbreviations;
- suffix measured values with units where ambiguity is possible;
- name actions with verbs and booleans so they read as statements;
- use `x`, `y`, `index`, or `counter` only in the conventional small scope where
  their meaning is immediately visible; and
- comment decisions, invariants, and non-obvious edge cases rather than restating
  individual lines of code.

## Canonical constants

```js
ROOM_KEYS = [
  "esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"
]

POINTS = { correct: 100, close: 50, wrong: -50 }
ROOM_ACUITY_RANK = { "esi-1": 1, ..., "esi-5": 5, psych: 6, discharge: 7 }
MAX_WAITING = 10
MIN_VISIBLE_WAITING = 5
RUSH_DOUBLE_PROBABILITY = 0.20
HEARTBEAT_MS = 250
BURST_BEAT_MS = 250
```

Mode lengths:

```js
triage: [300, 600] // default 300
rush:   [60, 120]  // default 60
```

Player titles:

```text
Doctor, Nurse, RN, LPN, RES, Intern, EMS, PA, MS1, MS2, MS3, MS4
```

## State reference shape

This is the shape `createInitialState()` builds in `game.js` (Phases 1-6 are
implemented against it):

```js
{
  version: 1,

  view: "home",                 // home | game | review
  overlay: null,                // settings-player | settings-shift | about |
                                // chart | patients-seen | confirm-quit |
                                // confirm-stop | shift-over | null
  phase: "ready",               // loading | ready | active | complete | error
  pauseReasons: [],             // "confirmation" | "document-hidden"

  player: {
    title: "Doctor",
    initials: "AAA"
  },

  settings: {
    mode: "triage",             // triage | rush
    difficulty: "forgiving",    // forgiving | strict
    triageLengthSeconds: 300,
    rushLengthSeconds: 60,
    // Three-toggle sound model (boombox retired). Music plays only when
    // soundGlobal && soundMusic, decided on HOME.
    soundGlobal: true,
    soundGame: true,
    soundMusic: false
  },

  // Shift-runtime override: the in-game mute button flips only this flag.
  // Re-derived from soundGlobal && soundGame at every shift start; never
  // rewrites the persisted preferences.
  gameSoundsAudible: true,

  shift: {
    id: null,
    startedAtMs: null,
    completedAtMs: null,
    endReason: null,            // timer | stop | quit | null
    elapsedMs: 0,
    remainingMs: 300000,
    lastLogicalQuarter: -1
  },

  deck: {
    ids: [],
    cursor: 0
  },

  waiting: [],                  // [{ patientId, waitingBackgroundKey }]
  active: null,                 // { patientId, recalledFromRoomKey? } | null
  assigned: null,               // { patientId, roomKey }
  recallAvailable: false,

  ledger: {
    order: [],                  // patient IDs in stable first-assignment order
    byPatientId: {
      // id: { patientId, roomKey, outcome, direction, points,
      //       assignmentCount, firstAssignedAtMs, lastAssignedAtMs }
    }
  },

  rush: {
    arrivalRemainingMs: 10000,
    nextBaseIntervalMs: 10000,
    stagedSecondArrivalAtMs: null,
    currentArrivalEventId: 0,
    emptyRefillAtMs: null,        // logical elapsedMs of a pending
                                  // empty-room courtesy refill (doc 3)
    emptyRefillSecondAtMs: null   // the refill pair's staged second member
  },

  chart: {
    clinicalExpanded: false     // shift-level memory; resets at new shift
  },

  review: {
    patientIndex: 0
  }
}
```

Use plain serializable data in the state tree. Runtime-only audio nodes, interval
IDs, focus nodes, and AbortControllers live outside it.

## State invariants

At every committed transition:

- waiting length is 0 through 10;
- waiting patient IDs are unique;
- active patient is not in waiting;
- assigned patient is not in waiting;
- active and assigned are not simultaneously populated;
- every ledger order ID has exactly one `byPatientId` record;
- no `byPatientId` record exists outside ledger order;
- ledger points agree with outcome;
- Close is impossible in Strict;
- recall is available only for the assigned patient's open room;
- the Chart can open only when `active != null`, and no `"chart"` pause
  reason ever exists (the Chart stopped pausing 2026-08-05);
- the `shift-over` and `patients-seen` overlays exist only while the view is
  `review` and the phase is `complete`;
- while `patients-seen` is open, `review.patientIndex` is within the ledger;
- RUSH-only arrival state has no gameplay effect in Triage;
- remaining time never goes below zero; and
- view/overlay changes never alter scoring or queue content by themselves;
- an active phase always uses the GAME primary view; and
- HOME never owns an active or resumable shift.

A development assertion function should check these after every action.

## Patient loading

### Manifest

Use an explicit ordered manifest of all patient IDs. Load JSON in parallel with
a bounded reasonable failure strategy. Validate every response before creating
the patient index. A failed or malformed response prevents Start Shift and
identifies its patient or path.

### Schema-preserving runtime index

```js
patientsById = {
  "patient-001": patientRecordLoadedFromDisk,
  "patient-002": patientRecordLoadedFromDisk
}
```

Each `patientRecordLoadedFromDisk` retains the exact schema 2.2 property names,
casing, nesting, and authored values, including the top-level `schema`, `id`,
`number`, `johnsComments`, `patient`, and `aiImageGeneration` groups. Game code
reads `patientRecord.patient.presentation`, `.answer`, and `.clinical` rather
than creating renamed copies. Queue, active, assigned, and ledger records store
the patient ID and their own game fields only.

### Startup and rolling preload

Use three loading stages:

1. Render HOME after its critical interface artwork and code are available.
2. While the player reviews settings, load and validate the patient manifest,
   JSON records, shared game artwork, and portrait URLs needed to plan a deck.
3. On Start Shift, show a blocking `PATIENTS ARE ARRIVING` status, choose the
   initial deck entries, and wait until the initial queue portraits plus a
   measured reserve are fetched and decoded.

Only then seed the queue, switch to GAME, and anchor the shift scheduler. During
play, preload a rolling reserve ahead of `deck.cursor`. Determine the reserve by
testing the fastest RUSH arrival curve on representative mobile networks; do
not make all 160 portraits a startup requirement. A preload failure offers retry
or return to HOME and never starts a partially prepared timer.

### Deck traversal

Use Fisher-Yates shuffle. Maintain an array plus cursor. At exhaustion, reshuffle
all patient IDs. When drawing, skip IDs currently waiting, active, or assigned.
A ledger patient may reappear only after the product later approves repeats
within a shift; for the current 160-patient shifts, also exclude ledger IDs.

If no legal ID exists, fail with an explicit state error rather than loop forever.

## Waiting backgrounds

A background belongs to its waiting ROW, not to the patient (2026-08-06).
Whenever a patient enters the waiting room (insertion or swap-back):

1. Collect backgrounds used by the current waiting rows (the only place
   backgrounds appear).
2. Choose randomly from unused production backgrounds.
3. If all 16 are in use, choose from the full set.
4. Store its manifest key as `waitingBackgroundKey` on the waiting entry.

The background never travels: active and assigned records carry no
background key, and a patient swapped back into the queue gets a fresh one.

## Shift start

```text
validate settings
require phase ready and view HOME
set phase loading and show PATIENTS ARE ARRIVING
create new shift id/timestamps
clear ledger, queue, active, assigned, review, and pause state
reset Chart Clinical to collapsed
re-derive gameSoundsAudible from soundGlobal && soundGame
shuffle deck and reset cursor
fetch and decode initial portraits plus measured reserve
set selected countdown
set RUSH base interval: 10s for 60s, 14.5s for 120s
seed 5 patients for Triage or 2 for RUSH without doinks
set view GAME and phase active
render
wait, clock frozen at full time, for the FIRST waiting-patient tap:
  anchor monotonic scheduler and play the RUSH start tick when enabled
```

Initial seeding uses the insertion primitive with `announce: false`.
The timer anchor is created only when the player selects their first
patient (2026-08-06; this replaced the 2-second acclimation delay). Until
that tap nothing runs — no ticks, no arrivals, no elapsed time — and
quitting simply never creates the anchor. Shift start defensively stops any
scheduler a previous shift left running.

## Queue insertion primitive

```js
insertWaitingPatient({ announce, eventId }) {
  if (waiting.length >= 10) return { inserted: false, reason: "full" }

  const entry = {
    patientId: drawUniquePatientId(),
    waitingBackgroundKey: chooseWaitingBackgroundKey()
  }

  commit waiting.push(entry)
  queue renderEffect("waiting")
  if (announce) queue soundEffect("doink", { eventId })
  return { inserted: true, entry }
}
```

The doink belongs here. No other action directly plays it.

## Selecting a waiting patient

### Empty center

- Finalize any no-longer-recallable assigned case.
- Move selected waiting entry to `active`.
- Remove it and compact the queue.
- In Triage, call one announced insertion immediately to return to five.
- In RUSH, do not refill because selection itself does not schedule arrivals.
- Clear assigned/open-room state.
- Render queue, patient, rooms, footer, and header score.

### Active unassigned center

Swap the selected waiting entry and active entry; the patient returning to
the row gets a FRESH background (rows own their backgrounds, 2026-08-06).
Do not insert, doink, score, or alter the ledger.

### Assigned state

Queue selection finalizes the assigned case, then proceeds as Empty center. The
open door closes and recall becomes unavailable.

## Evaluation

```js
function fullCreditRooms(patientRecord) {
  const answer = patientRecord.patient.answer
  const rooms = new Set([answer.correctRoom])
  if (answer.correctRoom === "psych" ||
      answer.correctRoom === "discharge") {
    rooms.add(`esi-${answer.correctEsi}`)
  }
  return rooms
}

function evaluate(patientRecord, roomKey, difficulty) {
  const answer = patientRecord.patient.answer
  if (fullCreditRooms(patientRecord).has(roomKey)) return "correct"
  if (difficulty === "strict") return "wrong"

  const selectedEsi = parseEsiRoom(roomKey) // null for psych/discharge
  if (selectedEsi == null) return "wrong"
  return Math.abs(selectedEsi - answer.correctEsi) === 1
    ? "close"
    : "wrong"
}
```

Direction (the acuity ladder, 2026-08-06 — compares ROOM ranks, never
`answer.correctEsi`, so authoring a special patient at a different ESI can
never break it; ties are impossible because the same rank is the same room,
which is full credit):

```js
if (outcome === "correct") direction = "correct"
else {
  const selectedRank = ROOM_ACUITY_RANK[roomKey]
  const correctRank = ROOM_ACUITY_RANK[answer.correctRoom]
  direction = selectedRank < correctRank ? "over" : "under"
}
```

## Assignment and ledger replacement

```js
assignRoom(roomKey) {
  require phase active and active patient

  const patientRecord = patientsById[active.patientId]
  const outcome = evaluate(patientRecord, roomKey, settings.difficulty)
  const direction = classifyDirection(patientRecord, roomKey, outcome)
  const previous = ledger.byPatientId[patientRecord.id]
  const now = wallClockTimestamp()

  const nextRecord = {
    patientId: patientRecord.id,
    roomKey,
    outcome,
    direction,
    points: POINTS[outcome],
    assignmentCount: (previous?.assignmentCount || 0) + 1,
    firstAssignedAt: previous?.firstAssignedAt || now,
    lastAssignedAt: now
  }

  if (!previous) ledger.order.push(patientRecord.id)
  ledger.byPatientId[patientRecord.id] = nextRecord

  assigned = { patientId: patientRecord.id, roomKey }
  active = null
  recallAvailable = true

  // RUSH courtesy refill (doc 3, 2026-08-06): emptying the room books
  // one-or-two arrivals a second from now. Only the first emptying books
  // one; the scheduled-arrival countdown is untouched.
  if (mode === "rush" && waiting.length === 0 &&
      rush.emptyRefillAtMs === null) {
    rush.emptyRefillAtMs = elapsedMs + EMPTY_REFILL_DELAY_MS  // 1000
  }

  queue visualEffect("assignment-feedback", outcome, roomKey)
  queue soundEffect("assignment-feedback", outcome)
  render affected components
}
```

Because totals are derived from the ledger, replacement automatically removes
the previous points/counts. Never append a second history record.

## Recall

```js
recallAssignedPatient(roomKey) {
  require recallAvailable
  require assigned.roomKey === roomKey

  active = {
    patientId: assigned.patientId,
    recalledFromRoomKey: roomKey
  }
  assigned = null
  recallAvailable = false

  close roomKey
  queue soundEffect("recall")   // first two notes of the Correct arpeggio: C5, E5
  render patient, rooms, footer
}
```

Do not delete the ledger record on recall. Do not expose Answer. A later
assignment replaces the existing record. Ending while recalled retains the last
completed record.

## Unified patient chart and the Chart overlay

One builder, `ui.js buildPatientChart(record, context, portraitUrl)`, produces
the chart content for every location. `context.setting` selects the wrapper:

- `"panel"`: the GAME center panel — transparent, compact, presentation cards
  only (Answer and Clinical hidden).
- `"clipboard"`: the Chart overlay — CSS-drawn clipboard plus the locked
  ANSWER and toggling CLINICAL sections.
- `"review"` (built, Phase 8): the Patients Seen browser reuses the clipboard
  wrapper with navigation chrome and unlocked sections. It additionally takes
  `context.ledgerRecord` — the patient's single ledger entry — because the
  Answer body reports what the player actually chose. The builder never reads
  game state, so the record is passed in.

The chart root gets class `chart--<setting>`; clipboard-specific CSS scopes
under `.chart-overlay-mount`, which BOTH scrolling wrappers use, so rules
written there (the pinned nameplate, the scene treatment) apply to the Chart
overlay and the review browser alike. Content is written once; CSS owns all
per-setting flow, sizing, and background.

The patient panel click/keyboard handler dispatches `openChart` in `game.js`:

```js
openChart() {
  require phase active and active != null and overlay == null
  overlay = "chart"
  // deliberately NO pause reason: reading the chart costs shift time
}
// rendering shows:
//   presentation cards (always visible, no section header)
//   ANSWER locked (striped header, LOCKED pill, shake on tap)
//   CLINICAL expanded per state.chart.clinicalExpanded
```

Only toggling Clinical updates `state.chart.clinicalExpanded`; the toggle
writes state AND flips the DOM directly so chart scroll is preserved. Answer
never unlocks in this context. New Shift resets Clinical to false.

The photo zoom lightbox (document `7`) is deliberately DOM-only view state:
it is never stored in the state tree and always starts closed on Chart open.

Closing restores focus to the patient panel hit target. The clock runs the
whole time the Chart is open (John, 2026-08-05).

## Ending a shift and the review browser (Phase 8)

`stopShift(endReason)` finalizes the shift for both endings — timer expiry
passes `"timer"`, END SHIFT EARLY passes `"stop"` — and raises the
acknowledgement overlay rather than leaving the review bare:

```js
stopShift(endReason) {
  require phase active
  phase = "complete"; view = "review"
  shift.completedAt = wallClockNow(); shift.endReason = endReason
  overlay = "shift-over"          // dismissed by the player, never timed
  pauseReasons = []
}
dismissShiftOverAcknowledgement()  // any tap/Enter/Space
```

The browser walks `ledger.order`, so a reassigned patient is one entry
showing only the assignment that finally stood:

```js
openPatientsSeen()      // requires complete + review + a non-empty ledger;
                        // resets review.patientIndex to 0
stepPatientsSeen(dir)   // wraps: (index + step + total) % total
closePatientsSeen()
selectPatientSeenRecord()   // the ledger record now on show, or null
```

Rendering rebuilds the chart on every step; the reading position is carried
by measuring the scrolled fraction before the rebuild and reapplying it
after (document `3`). Because the previous chart is empty on first open, the
fraction is naturally 0 and the browser opens at the top — no special case.

Section toggles inside the review browser are deliberately DOM-only: review
expansion must never write `state.chart.clinicalExpanded`, which belongs to
the shift (document `5`).

## Score selectors

```js
records = ledger.order.map(id => ledger.byPatientId[id])
assignmentPoints = sum(records.map(r => r.points))
correct = count(records, "correct")
close = count(records, "close")
wrong = count(records, "wrong")
over = countDirection(records, "over")
under = countDirection(records, "under")
score = assignmentPoints
// No waiting penalty in ANY mode (2026-08-06): the waiting room can never
// be emptied, so it never charges the player.
```

All header and review rendering calls the same selectors.

## RUSH arrival processing

```js
processRushArrival() {
  requested = random() < 0.20 ? 2 : 1
  available = 10 - waiting.length
  actual = Math.min(requested, available)
  blocked = actual < requested
  eventId = ++rush.currentArrivalEventId

  if (actual >= 1) insertWaitingPatient({ announce: true, eventId })
  if (actual === 2) {
    rush.stagedSecondArrivalAtMs = elapsedMs + BURST_BEAT_MS
      // LOGICAL game time, not wall/monotonic time, so pauses freeze it
  }
  if (blocked) queue one reduced-motion-aware shake for eventId

  rush.nextBaseIntervalMs = Math.max(
    1000,
    rush.nextBaseIntervalMs - 1000
  )
  rush.arrivalRemainingMs = rush.nextBaseIntervalMs
}

processStagedSecondArrival() {
  clear staged timestamp
  insertWaitingPatient({ announce: true, eventId: currentArrivalEventId })
}
```

The burst beat is exactly 250ms. It is clearly sequential and shorter than an
ordinary one-second arrival interval.

If capacity changes before the staged second insertion, recheck capacity. A
blocked staged insertion is silent and may share the event's one shake.

```js
processEmptyRefill() {   // fires when elapsedMs >= rush.emptyRefillAtMs
  clear rush.emptyRefillAtMs
  pair = random() < 0.50
  insertWaitingPatient({ announce: true })   // full room skips silently
  if (pair) rush.emptyRefillSecondAtMs = elapsedMs + BURST_BEAT_MS
}
// The pair's second member is processed exactly like a burst's staged
// second arrival, from rush.emptyRefillSecondAtMs.
```

The refill fires even when a scheduled arrival landed during its one-second
beat, and it never plays the blocked-event shake: a refill is a gift. It
never touches `arrivalRemainingMs` or `nextBaseIntervalMs`.

## Logical scheduler

Use `performance.now()` to determine elapsed active time. Treat each 250ms
quarter as a logical boundary. Pause freezes game time by moving the scheduler
anchor; it does not try to catch up after the Chart or a confirmation.

Each processed quarter:

1. Determine newly crossed logical quarter indexes.
2. For each, update remaining time and RUSH arrival time.
3. Emit at most one copy of each boundary event.
4. Process zero completion before arrivals or ordinary ticks.
5. Process staged burst insertion.
6. Process clock emphasis/ordinary cue.
7. Process scheduled arrival.
8. Render timer and changed components.

### RUSH cue boundaries

For a ten-second boundary `B > 10` seconds remaining:

```text
B + 0.50  extra lead-in tick
B + 0.25  extra lead-in tick
B         ordinary whole-second tick
```

Examples: 50.50/50.25/50.00, then 40.50/40.25/40.00.

Final ten:

- numeral and ordinary tick at each integer 10 through 1;
- during 5 through 1, extra ticks 0.25 and 0.50 seconds after the integer;
- the last two seconds beat on all eight quarters (2.00 down to 0.25) as a
  run-in to the dong;
- completion dong at zero;
- no arrival cue at zero.

### Triage cue boundaries (revised 2026-08-06)

For an elapsed ten-second boundary `B`:

```text
B - 0.50  lead-in tick (minuteTick)
B - 0.25  lead-in tick (minuteTick)
B         boundary beat: ordinary tick — or minuteDong when B is a
          completed minute (B % 60s == 0)
```

- lead-ins are suppressed when `B` falls inside the final-ten countdown
  (mirror of RUSH's transition-to-10 rule: fire only while
  `remainingMs - leadOffset > 10000`);
- final ten uses the RUSH whole-second/final-five audio sequence;
- no RUSH arrival state or penalty.

Deduplicate coincident events: the boundary beat is the third beat of its
group, never a fourth tick.

## Pause model

Use a set of pause reasons:

```text
confirmation, document-hidden
```

The Chart overlay deliberately adds no pause reason: the clock and the RUSH
arrival countdown keep running while the player reads (John, 2026-08-05).

The scheduler advances only when the set is empty, phase is active, and view is
GAME. Adding a second reason does not overwrite the first. Resume only after all
reasons are cleared.

## Sound registry

All game sounds are synthesized with Web Audio (no sound files) through one
registry in `app.js`. Each sound is a named entry `{ enabled, play }` so
per-sound preferences are a flag away:

```text
doink     arrival
correct   C5-E5-G5 arpeggio
close     close-result tone
wrong     wrong-result tone
recall    C5-E5 (first two notes of correct)
tick, minuteTick, countdownTick, endDong   the Phase-7 scheduler family
minuteDong   Triage completed-minute bell (330Hz+octave, ~0.7s ring):
             endDong's family, higher and much shorter (2026-08-06)
```

A sound plays only when its own flag, `state.gameSoundsAudible`, and the sound
model in document `3` allow it. Music (the KING-FM stream) is separate from
the registry and starts from HOME gestures only.

## Rendering boundaries

Recommended render functions:

```text
renderShellView
renderHeader
renderWaiting
renderPatient
renderRooms
renderFooter
renderHome
renderChartOverlay
renderChartPortraitZoom
renderReview
renderPatientsSeenNavigation
```

Each takes state/selectors and writes DOM. Event listeners are installed once or
through event delegation. Do not recreate global listeners on every render.

Effects such as sound, focus, animation restart, and scroll reset are explicit
objects returned by actions and consumed once after render.

All asset URLs come from `assets.js`. CSS owns each image's rendered box,
`object-fit`, crop, and anchor. Rendering code must not inspect `naturalWidth`,
`naturalHeight`, or source pixel dimensions to choose layout or game behavior.
This guarantees that a visually equivalent optimized file can later replace a
high-resolution file at the same logical manifest key without changing code.

## HOME/settings

- Validate initials by uppercasing, removing non-A-Z, and limiting to three.
- Include Intern in the title enum and UI.
- Store Triage and RUSH lengths separately so mode switching retains each choice.
- Apply HOME settings only while phase is ready.
- Start Shift is HOME's only path into GAME.
- Do not implement Resume Shift, an active HOME state, or a general primary-view
  switcher during GAME.

## Shift completion and review

Stopping or timer expiry uses the review transition:

```text
phase = complete
completedAt = now
endReason = timer or stop
assigned/open case becomes finalized
active recalled patient retains latest completed ledger result
view = review
pause scheduler
clear active recovery snapshot
render score from selectors
```

Patients Seen uses `ledger.order`. Previous/next wraps with modular arithmetic.
The review chart reads the latest ledger record for the patient.

The other navigation transitions are deliberately different:

```text
quitShift()
  require active GAME and explicit confirmation
  set endReason = quit for diagnostics only
  discard queue, active, assigned, ledger, clock, and recovery snapshot
  reset phase = ready and view = home
  do not create review results

returnToHome()   // player-facing action: RETURN TO ER ENTRANCE
  require complete SHIFT REVIEW
  clear completed runtime state
  reset phase = ready and view = home
```

Neither transition exposes a path back to the prior GAME. A later Start Shift
always creates a new shift ID and resets shift-local state.

## Persistence payload

Use a versioned envelope:

```js
{
  schema: "triageRush-local",
  version: 1,
  savedAt,
  preferences: { player, settings },
  activeShift: null | {
    stateSubset,
    savedAtMonotonicEquivalent
  }
}
```

On load, validate enums, numbers, IDs, uniqueness, ledger invariants, and asset
keys. If invalid, retain safe preferences when possible but discard the active
shift atomically.

If `activeShift` is valid, recover directly into phase active and view GAME.
This is interruption recovery, not HOME navigation: never render Resume Shift.
Quit, end-early, or completed-review Return to ER Entrance clears `activeShift`.

## Minimum deterministic tests

Inject a fake clock and random sequence to prove:

- 0.199 requests two and 0.200 requests one if using `random() < 0.20`;
- two free slots yield two insertions and two doinks;
- one free slot yields one insertion, one doink, and one blocked-event shake;
- zero slots yield no doink and one shake;
- reassignment replaces points/counts/direction but not order;
- repeated recall/reassignment increments assignment count only;
- final score and header always use the same selector;
- cue boundaries fire once and zero suppresses arrival;
- pause freezes time and does not catch up;
- Chart open/close legality and Clinical shift memory hold;
- starting a new shift resets Clinical and all ledger state;
- canceling Quit preserves the exact GAME state;
- confirming Quit discards state and reaches HOME without review;
- Stop/timer completion reaches review and cannot return to GAME;
- Return to ER Entrance reaches HOME, where only Start Shift begins gameplay; and
- valid interruption recovery opens GAME directly without a Resume state.
