# Coding Contracts and Specifications

**Last modified:** 2026-08-02

**Changes from the previous version:** Consolidated repository ownership,
responsive UI constraints, application-state direction, persistence, and
verification into a production implementation contract.

## Production scope

The production application lives under `triageRush/`. It is a small standalone
responsive web application. Use ordinary HTML, CSS, and JavaScript unless real
complexity justifies another dependency.

The demo applications are temporary references. Do not import their code as an
unexamined architecture, but do preserve accepted behavior and visual results.

## Ownership

- Root `index.html` is the GitHub Pages entry point.
- `triageRush/` owns production application code and runtime game assets.
- `patient-data/` owns authoritative patient JSON and portraits.
- `___patient-CRUD (standalone)/` is reserved for an independent local patient
  editor and must not become a runtime dependency.
- `_testAppMobile/`, `_testAppDesktop/`, and `_testAppHomeScreen/` are temporary
  design references.
- `docs/` owns the current numbered project documentation.

## Application state

Use one lightweight state object as the source of truth:

```text
player action -> validate -> update state -> render affected views
              -> perform one-time effects
```

State should cover:

- active view and open auxiliary panels;
- player identity and preferences;
- active mode, scoring, shift length, and pending restart changes;
- shuffled patient order and queue entries;
- active patient;
- assigned/open room and recall state;
- first-assignment outcomes and patients seen;
- current shift statistics and TriageRUSH score;
- timer, pause, and shift phase;
- Coach, detailed-chart context, and section profiles; and
- Shift Review and patient-review navigation.

Suggested phases are `home`, `awaiting-patient`, `patient-active`,
`awaiting-next-patient`, and `shift-complete`. TriageRUSH arrival and timer state
may be orthogonal. Do not add a state-machine framework unless the implementation
actually needs one.

## Actions

Meaningful actions should have explicit legality checks, such as:

```text
startShift()
resumeShift()
endShift()
selectPatient()
assignRoom()
recallPatient()
openCoach()
openPatientChart(context)
openShiftReview()
reviewPreviousPatient()
reviewNextPatient()
applySafeSettings()
applyGameplaySettingsAndRestart()
resetApplicationSettings()
```

Rendering must not replay sounds, duplicate scoring, restart timers, or create
new patients merely because a view rerendered.

## Responsive UI contract

- Preserve the mobile-derived frame: header, three gameplay panels, footer.
- Keep the queue and seven rooms in single columns on desktop.
- Center the game horizontally and size it primarily from available height.
- Respect safe areas and visible mobile browser controls.
- Do not allow page-level scrolling on the main game screen.
- Allocate additional height first to legibility and narrative content.
- On wide screens, HOME may occupy a symmetrical left region and Shift Review a
  symmetrical right region without shifting the centered game.
- At compact sizes, HOME, GAME, and Shift Review become separate full-frame
  views.
- Use viewport geometry, not device-name detection.

The iPhone 16 Pro remains the primary mobile reference, but phone, tablet,
laptop, and desktop geometries must all be tested.

## Header and footer

The header contains:

- mode title: `TRIAGE!` or `TRIAGE RUSH!`;
- centered timer or elapsed-time presentation;
- Triage summary counts or TriageRUSH score; and
- a compact sound state where needed.

The footer preserves:

```text
<-- HOME        COACH        SHIFT REVIEW -->
```

End Shift and pause/restart controls must not displace these three established
destinations without an explicit design decision.

## Input and modal behavior

- Use pointer events for mouse, touch, pen, and trackpad.
- Required play must not depend on hover.
- Preserve keyboard activation and useful focus behavior on desktop even though
  keyboard play is not required.
- Use semantic buttons, useful accessible names, non-color feedback, and
  touch-sized targets.
- Open modals freeze or pause the underlying shift as appropriate.
- Close controls remain predictable and do not mutate gameplay state.
- Respect reduced-motion preferences.

## Data loading and manifests

- Load reviewed patient records from `patient-data/`; do not embed production
  patient objects in application JavaScript.
- Generate or maintain an explicit patient manifest before production loading
  depends on `patient-index.json`.
- Centralize all runtime asset paths in one obvious manifest.
- Validate missing assets and malformed patient records with actionable errors.
- Keep queue traversal and waiting-room background choices in application state,
  not patient JSON.

## Detailed-patient component

Build one reusable chart for Patient Assignment, Patient-Room/Coach, and
Patient Review. Content comes from schema 2.2 while session-specific comparison
data comes from application state.

Each context owns an independent in-memory section profile. Do not persist
section expansion state in patient JSON or local storage.

## Persistence

No server-side persistence is required. Version local-storage data and fail
safely to defaults when stored data is invalid or incompatible.

Potential domains are:

- player title and initials;
- per-player lifetime statistics;
- sound and UI-hint preferences;
- default mode, difficulty, and shift length;
- shuffled patient traversal position;
- resumable active shift; and
- per-player TriageRUSH history and best score.

Gameplay-affecting setting changes require explicit restart confirmation. A
clear-lifetime action applies only to the currently named player and requires
confirmation.

## Sound

- Start streaming audio only from a user gesture.
- Centralize the Classical KING endpoint.
- Pause when radio power or music becomes inactive.
- Handle rejected `play()` promises and station errors without crashing.
- Do not let rendering trigger sounds; sounds are one-time action effects.

## Production implementation order

1. Reconcile demo asset references with the reorganized production tree.
2. Establish the application shell, manifests, state defaults, and storage
   version.
3. Load and validate patient data and shuffled traversal.
4. Implement the centered responsive frame and Triage queue.
5. Implement patient selection, swapping, detailed chart, and room assignment.
6. Implement scoring, feedback, open rooms, recall, and first-choice history.
7. Implement Coach and all three detailed-chart contexts.
8. Integrate HOME, settings, lobby states, and sound.
9. Implement Shift Review and patient navigation.
10. Add persistence and recovery.
11. Implement and tune TriageRUSH arrivals and numeric scoring.
12. Verify supported viewport geometries and physical devices.

## Verification baseline

Automated checks should cover:

- all patient JSON and image pairings;
- schema 2.2 and vital-band validation;
- all production asset paths;
- shuffled traversal, queue uniqueness, refill, growth, and swaps;
- Strict and Forgiving scoring boundaries;
- Psych and Discharge dual-correct behavior;
- first-assignment accounting across recall;
- timer, pause, resume, and shift completion;
- storage recovery and version mismatch; and
- missing-data failure behavior.

Manual/browser checks should cover:

- iPhone safe areas and visible browser UI;
- other phone, tablet, laptop, and desktop dimensions;
- centered-game stability when side views open;
- modal close, focus, freezing, and scrolling;
- touch and pointer affordances;
- sound controls and stream failure; and
- visual comparison with accepted demos.
