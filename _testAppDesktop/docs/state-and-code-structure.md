# State and Code Structure

## Chosen approach

The desktop demo will experiment with a lightweight state-oriented design.
This means:

```text
Player action -> change application state -> render screen from state
```

The demo will not use a state-machine framework, a large numbered-state table,
or a class for every state. The game is not expected to become complicated
enough to justify that machinery.

The objective is clarity:

- Store the meaningful facts in one place
- Give major gameplay phases descriptive names
- Let actions change those facts
- Let rendering determine what should be visible or active
- Keep sounds, timers, focus, and animations separate from routine rendering

## Current application state

`app.js` currently begins with one direct state object:

```js
const appState = {
  phase: "initializing",

  appPlatform: "desktop",
  appMode: "game",
  appStrictness: "normal",
  timerMax: 120,
  rushMode: false,
  playerName: "ahp",
  playerTitle: "M4"
};
```

These are the current desktop-demo startup values:

| Field | Current value | Future choices or meaning |
|---|---|---|
| `appPlatform` | `desktop` | `desktop`, `mobile` |
| `appMode` | `game` | `game`, `edu` |
| `appStrictness` | `normal` | `strict`, `normal`, `forgiving` |
| `timerMax` | `120` | `120`, `60` |
| `rushMode` | `false` | `false`, `true` |
| `playerName` | `ahp` | Three-character player name |
| `playerTitle` | `M4` | Player title such as `M4`, `RN`, or `Doctor` |

No separate defaults object or validation system is currently used. Those
would solve problems the demo does not yet have.

When HOME is designed, its controls can constrain and validate the settings.
Validation should be added when settings can arrive from user input, saved
data, a URL, or another source that is not completely controlled by the code.

## Why one object instead of seven independent variables

Seven ordinary variables would work. They are grouped in `appState` because
that provides one place to inspect the application's current condition and
fits the state-oriented experiment:

```js
triageRushDesktop.getState();
```

The browser-console helper returns a copy of the current state for debugging.
It does not permit outside code to modify the real state.

## Expected later shape

As actual gameplay is added, `appState` may gain fields such as:

```js
{
  phase,
  queue,
  currentPatientId,
  assignments,
  selectedRoomId,
  result,
  score,
  tally,
  secondsRemaining,
  coachOpen,
  clipboardOpen
}
```

Only add a field when the demo has a real need for it.

Likely named phases may include:

- `initializing`
- `awaiting-patient`
- `patient-active`
- `patient-assigned`
- `round-complete`

That list is provisional. The desktop interface and interactions should be
designed before the phase model is finalized.

## Actions, rendering, and effects

An action will represent something meaningful:

```js
selectPatient(patientId);
chooseRoom(roomId);
recallPatient(roomId);
openCoach();
resetRound();
```

An action should:

1. Check whether it is currently legal
2. Update `appState`
3. Request a render
4. Trigger any one-time effects caused by the transition

Rendering answers:

> Given the current state, what should the interface look like?

Effects include:

- Playing feedback sounds
- Starting or stopping timers
- Running movement or result animations
- Moving keyboard focus
- Loading external data

Effects should not run merely because the screen rerendered.

## Streamlit analogy

The model is conceptually similar to Python Streamlit:

```text
User interaction -> update session state -> render UI from state
```

JavaScript will explicitly call render functions rather than automatically
rerunning the whole source file. It also gives direct control over DOM
layering, animation, timing, touch behavior, and accessibility.

## Avoid premature abstractions

The first configuration implementation introduced frozen defaults, option
catalogs, overrides, and runtime validation. John correctly challenged whether
that complexity was needed for seven controlled values. It was not.

The lesson for this demo is:

- Prefer direct, readable code
- Add abstractions only when they solve a current problem
- Explain structural choices in plain language
- Do not mistake production-style defensiveness for automatic quality

