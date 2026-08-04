# Implementation Blueprint

**Last modified:** 2026-08-04

**Latest change:** Added a code-level blueprint for rebuilding the responsive
mobile application, including replaceable scoring, active-patient Coach,
quarter-second cue scheduling, and two-patient RUSH bursts.

## Purpose

This document translates the product rules into implementation structure and
algorithms. Names are recommended, not a requirement, but every behavior and
state invariant is required.

## Suggested production files

```text
triageRush/
|-- index.html
|-- styles.css
|-- app.js                    application bootstrap and event wiring
|-- assets.js                 validated logical asset manifest
|-- domain/
|   |-- state.js              defaults, serialization, invariants
|   |-- patients.js           load, normalize, deck traversal
|   |-- queue.js              selection, swap, refill, arrivals
|   |-- evaluation.js         credit, outcome, direction, points
|   |-- ledger.js             insert/replace patient results
|   |-- scheduler.js          monotonic heartbeat and boundary events
|   `-- persistence.js        versioned local storage
|-- ui/
|   |-- shell.js              primary view selection
|   |-- game.js               header, queue, patient, rooms, footer
|   |-- coach.js              detailed chart and section state
|   |-- home.js               lobby/settings/about/sound
|   `-- review.js             score formulas and Patients Seen wrapper
`-- assets/                   paths specified in document 6
```

A smaller file set is acceptable if the same boundaries remain testable. Do not
split files merely to match this tree.

## Canonical constants

```js
ROOM_KEYS = [
  "esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"
]

POINTS = { correct: 100, close: 50, wrong: -50 }
RUSH_WAITING_PENALTY = -10
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

```js
{
  version: 1,

  view: "home",                 // home | game | review
  overlay: null,                // settings | about | coach | patients-seen | confirm
  phase: "ready",               // loading | ready | active | complete | error
  pauseReasons: [],             // unique logical reasons, not DOM nodes

  player: {
    title: "Doctor",
    initials: "AAA"
  },

  settings: {
    mode: "triage",             // triage | rush
    difficulty: "forgiving",    // forgiving | strict
    triageLength: 300,
    rushLength: 60,
    hints: true,
    rushTimingSounds: true,
    globalMute: false
  },

  shift: {
    id: null,
    startedAt: null,
    completedAt: null,
    endReason: null,            // timer | player
    elapsedMs: 0,
    remainingMs: 300000,
    lastLogicalQuarter: -1
  },

  deck: {
    ids: [],
    cursor: 0
  },

  waiting: [
    // { patientId, background }
  ],

  active: null,                 // { patientId, background, recalledFromRoom? }
  assigned: null,               // { patientId, room, background }
  recallAvailable: false,

  ledger: {
    order: [],                  // stable first-assignment patient IDs
    byPatientId: {
      // id: { patientId, room, outcome, direction, points,
      //       assignmentCount, firstAssignedAt, lastAssignedAt }
    }
  },

  rush: {
    arrivalRemainingMs: 10000,
    nextBaseIntervalMs: 10000,
    stagedSecondArrivalAt: null,
    currentArrivalEventId: 0
  },

  coach: {
    clinicalExpanded: false     // resets at new shift
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
- Coach can open only when `active != null`;
- RUSH-only arrival state has no gameplay effect in Triage;
- remaining time never goes below zero; and
- view/overlay changes never alter scoring or queue content by themselves.

A development assertion function should check these after every action.

## Patient loading

### Manifest

Use an explicit ordered manifest of all patient IDs. Load JSON in parallel with
a reasonable failure strategy, then normalize only after all responses succeed.

### Normalized runtime record

```js
{
  id,
  presentation: {
    personal,
    image,
    chiefComplaint,
    quote,
    triageNote,
    vitals
  },
  answer: {
    correctEsi,
    correctRoom,
    otherAcceptableRooms,
    destinationReason
  },
  clinical
}
```

Keep the schema grouping intact. Do not flatten away image metadata or personal
fields that the UI may need.

### Deck traversal

Use Fisher-Yates shuffle. Maintain an array plus cursor. At exhaustion, reshuffle
all patient IDs. When drawing, skip IDs currently waiting, active, or assigned.
A ledger patient may reappear only after the product later approves repeats
within a shift; for the current 160-patient shifts, also exclude ledger IDs.

If no legal ID exists, fail with an explicit state error rather than loop forever.

## Waiting backgrounds

When a patient is inserted:

1. Collect backgrounds used by waiting, active, and assigned patient state when
   retained.
2. Choose randomly from unused production backgrounds.
3. If all 16 are in use, choose from the full set.
4. Store the chosen background on the waiting entry.

Selection and swapping move the stored background with the patient.

## Shift start

```text
validate settings
confirm restart if phase is active
create new shift id/timestamps
clear ledger, queue, active, assigned, review, and pause state
reset Coach Clinical to collapsed
shuffle deck and reset cursor
set selected countdown
set RUSH base interval: 10s for 60s, 14.5s for 120s
seed 5 patients for Triage or 2 for RUSH without doinks
set view GAME and phase active
anchor monotonic scheduler
render
play RUSH start tick when enabled
```

Initial seeding uses the insertion primitive with `announce: false`.

## Queue insertion primitive

```js
insertWaitingPatient({ announce, eventId }) {
  if (waiting.length >= 10) return { inserted: false, reason: "full" }

  const entry = {
    patientId: drawUniquePatientId(),
    background: chooseWaitingBackground()
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

Swap the selected waiting entry and active entry, including backgrounds. Do not
insert, doink, score, or alter the ledger.

### Assigned state

Queue selection finalizes the assigned case, then proceeds as Empty center. The
open door closes and recall becomes unavailable.

## Evaluation

```js
function fullCreditRooms(patient) {
  const rooms = new Set([patient.answer.correctRoom])
  if (patient.answer.correctRoom === "psych" ||
      patient.answer.correctRoom === "discharge") {
    rooms.add(`esi-${patient.answer.correctEsi}`)
  }
  return rooms
}

function evaluate(patient, room, difficulty) {
  if (fullCreditRooms(patient).has(room)) return "correct"
  if (difficulty === "strict") return "wrong"

  const selectedEsi = parseEsiRoom(room) // null for psych/discharge
  if (selectedEsi == null) return "wrong"
  return Math.abs(selectedEsi - patient.answer.correctEsi) === 1
    ? "close"
    : "wrong"
}
```

Direction:

```js
if (outcome === "correct") direction = "correct"
else if (!isEsiRoom(room)) direction = "wrong"
else if (selectedEsi < correctEsi) direction = "over"
else direction = "under"
```

## Assignment and ledger replacement

```js
assignRoom(room) {
  require phase active and active patient

  const patient = get(active.patientId)
  const outcome = evaluate(patient, room, settings.difficulty)
  const direction = classifyDirection(patient, room, outcome)
  const previous = ledger.byPatientId[patient.id]
  const now = wallClockTimestamp()

  const nextRecord = {
    patientId: patient.id,
    room,
    outcome,
    direction,
    points: POINTS[outcome],
    assignmentCount: (previous?.assignmentCount || 0) + 1,
    firstAssignedAt: previous?.firstAssignedAt || now,
    lastAssignedAt: now
  }

  if (!previous) ledger.order.push(patient.id)
  ledger.byPatientId[patient.id] = nextRecord

  assigned = {
    patientId: patient.id,
    room,
    background: active.background
  }
  active = null
  recallAvailable = true

  queue visualEffect("assignment-feedback", outcome, room)
  queue soundEffect("assignment-feedback", outcome)
  render affected components
}
```

Because totals are derived from the ledger, replacement automatically removes
the previous points/counts. Never append a second history record.

## Recall

```js
recallAssignedPatient(room) {
  require recallAvailable
  require assigned.room === room

  active = {
    patientId: assigned.patientId,
    background: assigned.background,
    recalledFromRoom: room
  }
  assigned = null
  recallAvailable = false

  close room
  render patient, rooms, footer
}
```

Do not delete the ledger record on recall. Do not expose Answer. A later
assignment replaces the existing record. Ending while recalled retains the last
completed record.

## Coach

The patient panel click/keyboard handler dispatches `openCoach`.

```js
openCoach() {
  require active != null
  overlay = "coach"
  add pause reason "coach"
  render chart with:
    presentation expanded
    answer locked
    clinical = state.coach.clinicalExpanded
}
```

Only toggling Clinical updates `state.coach.clinicalExpanded`. Presentation
may toggle locally while open but resets expanded on the next active Coach open.
Answer never unlocks in this context. New Shift resets Clinical to false.

Closing removes the Coach pause reason and restores focus to the patient panel.

## Score selectors

```js
records = ledger.order.map(id => ledger.byPatientId[id])
assignmentPoints = sum(records.map(r => r.points))
correct = count(records, "correct")
close = count(records, "close")
wrong = count(records, "wrong")
over = countDirection(records, "over")
under = countDirection(records, "under")
score = assignmentPoints +
        (mode === "rush" ? waiting.length * -10 : 0)
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
    rush.stagedSecondArrivalAt = monotonicNow + BURST_BEAT_MS
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

## Logical scheduler

Use `performance.now()` to determine elapsed active time. Treat each 250ms
quarter as a logical boundary. Pause freezes game time by moving the scheduler
anchor; it does not try to catch up after Coach/HOME.

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
- completion dong at zero;
- no arrival cue at zero.

### Triage cue boundaries

- single tick at every ten elapsed seconds;
- at each elapsed minute, ticks at minute-0.50, minute-0.25, and minute;
- final ten uses the RUSH whole-second/final-five audio sequence;
- no RUSH arrival state or penalty.

Deduplicate coincident events: a minute-boundary Triage tick is the third beat
of its minute group, not a fourth tick.

## Pause model

Use a set of pause reasons:

```text
home, settings, coach, patients-seen, confirmation, document-hidden
```

The scheduler advances only when the set is empty, phase is active, and view is
GAME. Adding a second reason does not overwrite the first. Resume only after all
reasons are cleared.

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
renderCoach
renderReview
renderPatientsSeenNavigation
```

Each takes state/selectors and writes DOM. Event listeners are installed once or
through event delegation. Do not recreate global listeners on every render.

Effects such as sound, focus, animation restart, and scroll reset are explicit
objects returned by actions and consumed once after render.

## HOME/settings

- Validate initials by uppercasing, removing non-A-Z, and limiting to three.
- Include Intern in the title enum and UI.
- Store Triage and RUSH lengths separately so mode switching retains each choice.
- Applying gameplay settings during an active shift requires restart confirmation.
- Safe identity/mute/hint updates may apply without restarting if they do not
  invalidate active state.
- Resume restores the GAME view and exact saved shift state.

## Shift completion and review

```text
phase = complete
completedAt = now
endReason = timer or player
assigned/open case becomes finalized
active recalled patient retains latest completed ledger result
view = review
pause scheduler
render score from selectors
```

Patients Seen uses `ledger.order`. Previous/next wraps with modular arithmetic.
The review chart reads the latest ledger record for the patient.

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
- Coach legality and Clinical shift memory hold; and
- starting a new shift resets Clinical and all ledger state.
