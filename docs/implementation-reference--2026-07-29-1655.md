# triageRush Implementation and Repository Reference

**Current version:** 2026-07-29 16:55 PDT

## Repository structure

During production development:

```text
triageRush/
├── index.html
├── docs/
├── docs-archive/
├── triageRush/
│   ├── app.js
│   ├── styles.css
│   └── assets/
├── patient-data/
├── patient-CRUD (standalone)/
├── _testAppMobile/
└── _testAppDesktop/
```

The two test apps are temporary design references. They will be removed after
the production game reproduces the accepted behavior and passes responsive
comparison testing.

## Ownership

- Root `index.html` is the GitHub Pages entry point.
- `triageRush/` owns the responsive Game/Edu application and game assets.
- `patient-data/` owns authoritative published patient JSON and final images.
- `patient-CRUD (standalone)/` is a future independent local editor.
- Test apps own only their temporary self-contained copies.

## Documentation workflow

Root `docs/` contains one current timestamped document per purpose:

```text
ui-specification--YYYY-MM-DD-HHMM.md
gameplay-specification--YYYY-MM-DD-HHMM.md
scoring-specification--YYYY-MM-DD-HHMM.md
patient-data-and-assets--YYYY-MM-DD-HHMM.md
implementation-reference--YYYY-MM-DD-HHMM.md
```

When a current specification changes:

1. Move the outgoing version to root `docs-archive/`.
2. Save the revised document with the new timestamp.
3. Keep the purpose prefix unchanged.
4. Add a concise entry to the document's change history.

The docs README describes filename patterns and changes only if purposes or
workflow change.

## Application-state direction

Use one lightweight application state:

```text
player action -> update application state -> render affected views
```

That state is the source of truth for:

- Active screen and auxiliary panels
- Settings and pending restart changes
- Patient queue and randomized patient order
- Current patient
- Open room and recalled assignment
- Score and outcome totals
- Session history required by Stats
- Timer
- Coach and modal state

Responsive presentation does not create separate desktop and mobile game
logic.

## Suggested state phases

Start with a small number of descriptive phases, such as:

- `home`
- `awaiting-patient`
- `patient-active`
- `awaiting-next-patient`
- `round-complete`

HOME and STATS panel visibility, Coach, and patient-image/summary modals can be
orthogonal state rather than separate gameplay phases.

Do not add a state-machine framework unless actual complexity requires it.

## Action direction

Meaningful actions may include:

```text
startGame()
openHome()
returnToGame()
openStats()
selectPatient()
assignRoom()
recallPatient()
openCoach()
openPatientImage()
openPatientSummary()
applySafeSetting()
applyGameplaySettingsAndRestart()
resetRound()
```

Actions validate legality, update state, render affected views, and then
trigger one-time effects such as sound or focus movement.

## Rendering

- Game, HOME, STATS, and Coach consume the same state.
- Open Stats updates immediately after gameplay mutations.
- Closed Stats still accumulates underlying information.
- Rendering must not replay sounds or restart timers merely because the screen
  rerendered.
- Layout decisions use viewport geometry, not device-name detection.

## Local persistence

The application is standalone and requires no server-side persistence.

Potential local-storage domains:

- User identity
- Non-gameplay preferences
- Default gameplay settings
- Randomized patient list and current position
- Restorable session state
- Per-device best scores

Persisted data must include an application/storage version. Invalid or
incompatible data must fail safely to defaults.

## Input

- Pointer events provide the common interaction path.
- Mouse, touch, pen, and trackpad are supported.
- Gameplay does not require a keyboard.
- Essential controls do not depend on hover.
- Audio begins only after user interaction when required by the browser.

## Production implementation sequence

1. Establish the application shell and asset/data manifests.
2. Define state, actions, defaults, and storage version.
3. Implement patient loading and randomized traversal.
4. Implement the centered responsive game frame.
5. Implement queue selection and swapping.
6. Implement patient presentation and expanded modals.
7. Implement room selection, scoring, feedback, open doors, and recall.
8. Implement Coach.
9. Design and implement HOME/settings.
10. Design and implement STATS.
11. Add persistence.
12. Test supported viewport geometries and physical devices.

## Verification baseline

Automated and manual checks should cover:

- All patient JSON and image references
- All production asset paths
- Queue uniqueness and deterministic traversal
- Swap, assignment, recall, and next-patient behavior
- All three scoring modes and ESI boundaries
- Psych and Discharge dual full-credit behavior
- Mode-dependent Coach and answer reveal
- Local-storage recovery and version mismatch
- Mobile safe areas and browser UI
- iPhone 16 Pro reference viewport
- Other phone, tablet, laptop, and desktop dimensions
- Side panels never shifting the centered game
- Modal closing, freezing, and scrolling

## Current unresolved decisions

- Final name for Tolerant scoring
- Exact responsive dimensions and breakpoints
- HOME content hierarchy
- Exact Stats data
- GAME/EDU differences
- Timer and round-end behavior
- Rush mode
- Recall and reassignment accounting
- Room education on touch
- Final numeric scoring
- Final clinical Coach language

## Change history

- **2026-07-29 16:55 PDT:** Consolidated repository ownership,
  documentation workflow, state direction, persistence, implementation order,
  and verification requirements.
