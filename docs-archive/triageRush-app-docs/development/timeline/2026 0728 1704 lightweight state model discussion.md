# Lightweight State Model Discussion

Date: 2026-07-28

Status: Architectural discussion for later production coding. This is a
recommendation, not yet a binding implementation specification. Current demo
asset and layout work should not be interrupted for a state-management
rewrite.

## John's proposed direction

The game can be understood as occupying a relatively small number of states.
Most player actions, such as selecting a patient, choosing a room, opening
Coach, resetting the round, or changing a setting, may change the current
state. After an action, the application examines the resulting state and
updates the screen and available controls accordingly.

An initial condition might include:

- Current Game/Edu setting displayed
- Timer or score initialized
- Sound setting displayed
- Waiting queue filled and selectable
- Patient panel empty
- All doors closed
- `SELECT A PATIENT` visible
- Coach disabled
- Reset enabled
- Waiting-room transfer arrows visible
- Room recall arrows hidden

This overall event-to-state-to-screen idea is sound.

## Comparison with the current mobile demo

The current mobile demo already uses an informal state-driven design. Its
authoritative facts are distributed across separate module variables,
including:

- Current patient index
- Waiting queue
- Current decision
- Open room
- Game/Edu mode
- Sound setting
- Remaining seconds
- Score and Edu tally
- Whether the app is awaiting a patient
- Whether the current patient has previously been scored

Player actions change those variables and then call rendering functions such
as `renderPatient`, `renderWaiting`, `renderRooms`, `renderStatus`, or
`renderAll`.

The current code therefore already follows this broad sequence:

```text
Player action -> mutate stored facts -> render from those facts
```

However, its meaningful phases are implicit combinations of variables rather
than named conditions. For example:

| Informal combination | Meaning |
|---|---|
| Awaiting patient with no decision | Select a new patient |
| Patient active with no decision | Choose a room |
| Awaiting patient with a decision | Result shown; assigned patient may be recalled |
| Patient active after recall | Assign the recalled patient again |
| Coach element visible | Coach modal is open |

This remains manageable for the demo, but some variables have multiple
meanings, some facts are duplicated, and some state is stored only in the DOM.
Action functions also mix transition decisions, game calculations, direct UI
changes, rendering calls, sounds, and animation.

## What would be excessive

The following would probably be over-engineering for triageRush:

- A state-machine framework introduced before the final design is known
- A separate class or object implementation for every state
- A large numbered list in which each state repeats every UI command
- A distinct state for every combination of mode, tolerance, timer, and sound
- Rewriting the current demos around a formal state engine during asset and
  layout exploration

The game is not expected to become complex enough to justify that machinery.

## Recommended production approach

Use a lightweight explicit model:

1. One structured state object containing authoritative game facts
2. A small set of named gameplay phases
3. Guarded action or transition functions
4. UI derived from the current state
5. One-time effects, such as sound and animation, kept separate from rendering

Possible principal phases:

- `INITIALIZING`
- `AWAITING_PATIENT`
- `PATIENT_ACTIVE`
- `PATIENT_ASSIGNED`
- `ROUND_COMPLETE`

Coach, expanded clipboard, pause, sound, mode, tolerance, and timer choice do
not necessarily need to become principal phases. They may be ordinary fields
or subordinate overlay states.

An illustrative state object:

```js
const state = {
  phase: "awaiting-patient",

  settings: {
    mode: "game",
    tolerance: "normal",
    timerSeconds: 60,
    soundEnabled: true
  },

  secondsRemaining: 60,
  score: 0,
  tally: {
    correct: 0,
    acceptable: 0,
    close: 0,
    wrong: 0
  },

  queue: [],
  currentPatientId: null,
  assignment: null,
  coachOpen: false,
  clipboardOpen: false
};
```

The important distinction is between facts and their visual consequences.
For example:

```text
Fact:
phase is AWAITING_PATIENT and currentPatientId is null

Derived UI:
queue is selectable, SELECT A PATIENT is visible, room choices are inactive,
Coach is disabled, queue arrows are visible, and recall arrows are hidden
```

This avoids storing many UI flags that can contradict the actual game facts.

## Events and transitions

Controls should report what occurred rather than independently manipulate
every affected UI element:

```js
selectPatient(patientId);
chooseRoom(roomId);
recallPatient(roomId);
openCoach();
resetRound();
```

Each action checks whether it is legal for the current phase, changes the
authoritative state, and requests a render. A later production implementation
could express this through a reducer:

```js
state = transition(state, {
  type: "ROOM_SELECTED",
  roomId
});
```

A reducer would make game transitions easy to test but is not required for the
current visual demos. It can be considered once the mobile and desktop designs
are settled.

## Rendering and effects

Rendering answers:

> Given the current state, what should the interface look like?

Sounds, timers, focus changes, and animations are effects. They should run
because a transition occurred, not merely because the UI rendered. Otherwise,
a routine rerender could replay a sound, restart an animation, or reset a
timer.

## Streamlit analogy

The proposed approach is conceptually similar to Python Streamlit:

```text
User interaction -> update session state -> rerun/render UI from state
```

In JavaScript, the app would not normally rerun the entire source file after
every interaction. It would explicitly call its render functions. The
correspondence is approximately:

| Streamlit | triageRush JavaScript |
|---|---|
| `st.session_state` | Structured application state object |
| Widget callback | Action or dispatched event |
| Automatic script rerun | Explicit render pass |
| Streamlit component rendering | Direct DOM/CSS rendering |

The shared principle is that visible UI is a consequence of current state,
rather than a collection of independently remembered show/hide commands.

## Current recommendation

- Keep the existing demo flow while mobile and desktop assets and layouts are
  being explored.
- Do not rewrite either demo around a formal state machine now.
- When production coding begins, use one structured state object and a small
  set of named phases.
- Consider a simple reducer only if it materially improves transition testing
  or allows mobile and desktop presentations to consume the same game rules.
- Do not introduce a state-machine framework unless later complexity provides
  a concrete reason for one.

