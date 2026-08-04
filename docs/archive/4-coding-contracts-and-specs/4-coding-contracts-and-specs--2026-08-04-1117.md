# Coding Contracts and Specifications

**Last modified:** 2026-08-03

**Changes from the previous version:** Aligned the production contract with the
verified self-contained mobile runtime, derived live scoring, synchronized
quarter-second scheduling, reusable review-chart wrapper, and current header
and Shift Review design.

## Production scope

The production application lives under `triageRush/`. It is a small standalone
responsive web application. Use ordinary HTML, CSS, and JavaScript unless real
complexity justifies another dependency.

The demo applications are temporary references. `_testAppMobile/` is now the
verified behavioral reference for the complete game loop. Do not make the
production application depend on it or import its code as an unexamined
architecture.

## Ownership

- Root `index.html` is the GitHub Pages entry point.
- `triageRush/` owns production application code and runtime game assets.
- `patient-data/` owns authoritative patient JSON and portraits.
- `___patient-CRUD (standalone)/` is reserved for an independent local patient
  editor and must not become a runtime dependency.
- `_testAppMobile/`, `_testAppDesktop/`, and `_testAppHomeScreen/` are temporary
  design references.
- `docs/` owns the current numbered project documentation.

## Application state and derived values

Use one lightweight state object as the source of truth:

```text
player action -> validate -> update state -> render affected views
              -> perform one-time effects
```

State should cover:

- active view and open auxiliary panels;
- player identity and preferences;
- mode, difficulty, shift length, hints, and sound choices;
- shuffled patient deck and queue entries with attached backgrounds;
- active patient;
- assigned/open room and recall state;
- first-assignment outcomes and patients seen;
- assignment-point subtotal and outcome/direction counts;
- timer, arrival interval, scheduler phase, pause, and shift phase;
- Coach/detailed-chart context and section profiles; and
- Shift Review and Patients Seen navigation.

Keep derived values derived. In particular:

```text
Triage live score = assignment points
RUSH live score   = assignment points - (10 * patients currently waiting)
Wrong count       = patients seen - Correct - Close
```

Do not mutate the assignment subtotal at shift end to apply the RUSH waiting
penalty; doing so risks double deduction when review rerenders.

Suggested production phases are `home`, `awaiting-patient`, `patient-active`,
`awaiting-next-patient`, and `shift-complete`. Timer and arrival scheduling may
be orthogonal. Do not add a state-machine framework unless the implementation
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
openPatientsSeen()
reviewPreviousPatient()
reviewNextPatient()
applySafeSettings()
applyGameplaySettingsAndRestart()
resetApplicationSettings()
```

Rendering must not replay sounds, duplicate scoring, restart timers, create
patients, or repeat arrival effects merely because a view rerendered.

## Timer and arrival scheduling

Use one synchronized scheduler rather than independent drifting intervals. The
verified reference uses a 250 ms heartbeat:

- four heartbeats advance the displayed shift timer by one second;
- RUSH arrival time decrements by 0.25 seconds per heartbeat;
- 14.5/13.5-style arrival intervals therefore remain exact;
- pause state freezes both the clock and arrival countdown; and
- restarting a shift reanchors the heartbeat to the Start Shift action.

Separate timekeeping from effects. Whole-second clock ticks, final-five-second
quarter beats, arrival dings, the full-queue shake, final countdown numerals,
and the zero-second dong must be triggered once at their legal boundaries.
Suppress a scheduled arrival effect on the same boundary as shift completion so
the final dong is not masked.

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

## Header, panels, and footer

The header contains:

- mode title: `TRIAGE!` or `TRIAGE RUSH!`;
- bordered numbers-only Correct / Close / Wrong = score card;
- larger, unboxed timer or elapsed-time presentation; and
- compact sound state.

Use semantic/accessibility labels even though the scorecard's visible labels
are omitted. Strict removes Close and its separator without leaving a layout
gap.

RUSH renders a minimum of five equal-height, background-backed queue rows and a
maximum of ten. The first two are occupied at shift start. As the queue grows
beyond five, set the row count to the patient count. Do not raise the maximum
without a compact visual treatment.

The footer remains:

```text
<-- HOME        COACH        SHIFT REVIEW -->
```

Shift Review is the explicit way to end No Timer and timed shifts.

## Input, modal, and motion behavior

- Use pointer events for mouse, touch, pen, and trackpad.
- Required play must not depend on hover.
- Preserve keyboard activation and useful focus behavior on desktop.
- Use semantic buttons, useful accessible names, non-color feedback, and
  touch-sized targets.
- Open detailed charts and blocking overlays freeze the shift.
- Close controls remain predictable and do not mutate gameplay state.
- Restore focus to the control that opened a dismissed overlay when practical.
- Respect reduced-motion preferences, including queue shake and countdown
  animation.

## Data loading and manifests

- Load reviewed patient records from `patient-data/`; do not embed production
  patient objects in application JavaScript.
- Generate or maintain an explicit patient manifest before production loading
  depends on `patient-index.json`.
- Centralize runtime asset paths in one obvious manifest.
- Validate missing assets and malformed patient records with actionable errors.
- Keep queue traversal, backgrounds, and session scoring in application state,
  not patient JSON.

## Detailed-patient component and Patients Seen wrapper

Build one reusable chart for Patient Assignment, Patient-Room/Coach, and
Patient Review. Content comes from schema 2.2 while session-specific comparison
data comes from application state.

Each context owns an independent in-memory section profile. Do not persist
section expansion state in patient JSON or local storage.

Do not duplicate or redesign the chart for Patients Seen. Place the existing
full chart inside a review wrapper/frame that conditionally adds a fixed banner
below the clipboard clamp. That banner owns:

- circular previous and next controls;
- current index, total, and patient name; and
- a dedicated close box.

When review browsing is active, hide the chart's ordinary close button, reserve
top padding for the banner, reset chart scroll on patient change, and restore
focus to the Shift Review Patients Seen link on close.

## Shift Review rendering

Render the final score from the same derived score function used in the header.
The scoring summary should show count, points per item, and subtotal for
Correct, Close when enabled, Wrong, and Left Waiting. Keep Over-triaged and
Under-triaged counts in a separate direction section because they explain Wrong
without contributing additional points.

## Persistence

No server-side persistence is required. Version local-storage data and fail
safely to defaults when stored data is invalid or incompatible.

Potential domains are:

- player title and initials;
- sound and UI-hint preferences;
- default mode, difficulty, and shift length;
- resumable active shift;
- per-player lifetime statistics; and
- per-player score history and best scores.

Gameplay-affecting setting changes require explicit restart confirmation. A
clear-lifetime action applies only to the currently named player and requires
confirmation.

## Sound

- Create or resume Web Audio only from a user gesture.
- Reuse one audio context rather than creating one per sound.
- Treat feedback, clock, arrival, and completion sounds as one-time action
  effects, never render effects.
- Keep the RUSH sound preference separate from the global mute state.
- Start streaming HOME audio only from a user gesture.
- Centralize the Classical KING endpoint.
- Handle rejected `play()` promises and station errors without crashing.

## Production implementation order

1. Establish the application shell, manifests, state defaults, and storage
   version.
2. Load and validate canonical patient data and shuffled traversal.
3. Implement the centered responsive frame and Triage queue.
4. Transfer patient selection, swapping, detailed chart, and room assignment.
5. Transfer scoring, feedback, open rooms, recall, and first-choice history.
6. Transfer Coach and all three detailed-chart contexts.
7. Integrate HOME, settings, lobby states, and sound.
8. Transfer Shift Review and the Patients Seen chart wrapper.
9. Transfer the synchronized RUSH timer, arrival curves, sounds, shake, and
   countdown effects.
10. Add persistence and recovery.
11. Verify supported viewport geometries and physical devices.

## Verification baseline

Automated checks should cover:

- all patient JSON and image pairings;
- schema 2.2 and vital-band validation;
- all production asset paths;
- shuffled traversal, queue uniqueness, five-slot minimum, refill, growth, and
  ten-patient maximum;
- Strict and Forgiving evaluation boundaries;
- Psych and Discharge dual-correct behavior;
- first-assignment accounting across recall;
- Triage and RUSH assignment scoring;
- live RUSH waiting penalties without double deduction;
- 60- and 120-second arrival curves and one-second floor;
- quarter-second final clock cadence and zero-second completion;
- pause/resume and shift completion; and
- missing-data and storage-recovery behavior.

Manual/browser checks should cover:

- iPhone safe areas and visible browser UI;
- other phone, tablet, laptop, and desktop dimensions;
- header scorecard and enlarged timer fit;
- five through ten queue-row legibility;
- countdown pop/fade, full-queue shake, and reduced motion;
- sound controls and browser autoplay behavior;
- Shift Review formulas and Patients Seen navigation;
- modal close, focus restoration, freezing, and scrolling; and
- visual comparison with accepted demos.
