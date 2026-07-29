# Production Gameplay and Responsive Interface Contract

**Recorded:** 2026-07-29

**Status:** Current production direction at the demo milestone

**Replaces:** Separate mobile-versus-desktop presentation planning

**References:** `_testAppMobile/`, `_testAppDesktop/`, and the dated prototype
reference documents

## Purpose

This document records the product and interface decisions established through
the mobile and desktop test apps. It is the starting contract for production
implementation in `triageRush-app/`.

The test apps remain executable design references. Their incidental code,
temporary scoring, and experimental layouts are not automatically production
requirements.

## Decision labels

- **Accepted:** suitable as the production starting point.
- **Provisional:** demonstrated successfully but still expected to be tuned.
- **Deferred:** intentionally unresolved until its screen or system is designed.

## Product structure

### Accepted

- Build one responsive triageRush application, not separate mobile and desktop
  games.
- Use one game-state and gameplay implementation at every viewport size.
- Keep presentation responsive without changing the game rules.
- Retain the test apps as historical and visual references; stop treating them
  as parallel products.
- The production application owns its code and assets under `triageRush-app/`
  and consumes authoritative patient records from `patient-data/`.

## Core game screen

### Accepted composition

The game always retains the mobile-derived structure:

1. Header
2. Three middle panels
3. Footer controls

The middle panels remain:

1. One-column waiting-room queue on the left
2. Patient presentation in the center
3. One-column treatment-room rail on the right

The production desktop layout must not reorganize the waiting queue or room
rail into multiple columns. The central patient panel must not be replaced by
a desktop-specific composition.

### Rejected experiment

The current `_testAppDesktop/` wide mode demonstrates two-column waiting and
room arrangements plus a split patient-information column. It was useful for
learning what additional desktop space permits, but that re-composition is not
the accepted production direction.

## Responsive frame

### Accepted

- The game frame stays horizontally centered.
- Desktop width outside the game becomes a symmetrical surrounding workspace.
- The central game does not shift when auxiliary panels open.
- The game frame primarily responds to available height.
- On tall viewports, the frame may grow taller without being forced to remain
  at an exact 9:16 ratio.
- Frame width remains within a controlled mobile-like range.
- If the viewport becomes too narrow or too short, the complete frame scales
  down to remain visible.
- The active game page should not require page-level scrolling.
- Mobile browser safe areas and visible browser controls must be respected.

### Provisional

- Exact preferred, minimum, and maximum frame dimensions
- The amount by which the frame may depart from 9:16
- Breakpoints for typography and auxiliary-panel availability
- Whether the outer workspace uses only the dark atmospheric background or
  gains subtle hospital decoration

These values should be selected through production viewport testing, not
copied blindly from either demo.

## Responsive typography and information density

### Accepted

Text does not have to scale uniformly with the frame. Each information type
may have its own controlled fluid range.

Additional vertical space should be allocated in this priority order:

1. Maintain minimum legibility and usable touch targets.
2. Reveal more of the patient quote and triage note.
3. Increase text size and line spacing.
4. Increase decorative padding and whitespace.

Clinical narrative text should grow cautiously so a taller layout provides
both larger text and more visible content. Major labels, patient names, status,
and primary buttons may grow more quickly. Small labels should stop growing
once comfortably readable.

Production typography should use bounded fluid rules, such as `clamp()`, plus
deliberate container heights. Important patient evidence should not depend on
an avoidable internal scrollbar.

## Header

### Accepted content and relative placement

- `TRIAGE RUSH!` identity
- GAME/EDU or the eventual active-mode presentation
- Current score/timer or corresponding EDU status
- Sound control

The header remains inside the game frame at every viewport size. Its final
settings behavior must agree with the HOME/settings rules below.

### Provisional

- Exact status formatting
- Whether gameplay mode can be changed directly in the header during a round
- Final timer presentation and end-of-round behavior

## Footer and primary navigation

### Accepted

The footer becomes:

```text
<-- HOME        COACH        STATS -->
```

- HOME is conceptually left of the game.
- COACH remains centered and relates to a patient decision.
- STATS is conceptually right of the game.
- Patient selection and switching occur directly through the waiting queue;
  a separate SWITCH footer action is unnecessary.
- RESET moves out of the primary game footer and belongs in HOME/settings or
  another deliberate round-management location.

## HOME and STATS responsive behavior

### Compact viewports

- Only one major view is visible at a time.
- HOME opens as a separate full-frame screen.
- STATS opens as a separate full-frame screen.
- Each provides a clear return to the game.
- The left/game/right spatial relationship may be reinforced with restrained
  transitions, subject to reduced-motion preferences.

### Wide viewports

- The central game remains fixed at the exact center.
- Symmetrical left and right panel regions are available only when both can
  exist without moving or shrinking the central game.
- HOME opens in the left region.
- STATS opens in the right region.
- Either, neither, or both panels may be open.
- Opening one side leaves the opposite reserved region visually quiet rather
  than recentering the combined visible content.
- Gameplay continues while either side panel is open unless the player
  confirms a setting change that requires a restart.

### Responsive threshold

Auxiliary panels are enabled by available geometry, not device detection. The
wide requirement is conceptually:

```text
left panel capacity + gaps + centered game width + gaps + right panel capacity
```

If that requirement is not met, HOME and STATS use compact full-frame
navigation.

## HOME and settings

### Accepted behavior classes

Settings that do not alter gameplay may apply immediately while play
continues. Examples include:

- Player name
- Player title
- Sound settings
- Display preferences
- Accessibility preferences

Settings that alter gameplay rules require a deliberate restart or new round.
Examples include:

- GAME versus EDU mode, if mode changes rules
- Scoring strictness or ease
- Timer duration
- Rush mode
- Difficulty or evaluation rules

Gameplay-affecting changes must not silently destroy the active round. The
interface should explain the consequence and require a clear action such as:

```text
APPLY & RESTART
```

Several pending changes may be applied together.

### Deferred HOME design

- Complete screen contents and hierarchy
- Player identity entry
- Settings grouping and terminology
- Saved preferences and persistence
- Round reset/end controls
- Help, instructions, and accessibility details
- Which frequently used settings also appear in the wide summary panel

## STATS

### Accepted

- STATS is information-only.
- It updates in real time from the same application state as the game.
- It continues accumulating current-session information while closed.
- Opening it shows the current state immediately.
- Updates must not steal focus, unexpectedly scroll the panel, or interrupt
  gameplay.
- It may include a queue or history of patients already seen in the current
  session.

### Deferred

The precise information retained and displayed will be designed with the
STATS screen. No requirement currently exists for a detailed event log,
long-term history, reassignment sequence, recall count, or analytics.

Likely summary candidates—not yet approved—include score, outcome totals,
patients seen, accuracy, and a compact patient history.

## Waiting-room queue

### Accepted

- Five visible patients in one vertical column
- Each waiting cell combines a waiting-room background, patient art, complaint
  label, institutional frame, and directional transfer cue
- Visible patients and waiting-room backgrounds should not duplicate while
  alternatives remain
- Selecting a patient into an empty center compacts and refills the queue
- Selecting a waiting patient while another unassigned patient is active
  swaps them in place
- Queue cells, rather than a footer SWITCH button, perform selection and swap

### Provisional

- Exact cell proportions and complaint-label treatment
- Final animation and transfer-arrow treatment
- Final patient-background pairing rules

## Patient presentation panel

### Accepted information hierarchy

- Patient identity and demographics
- Patient image
- Chief complaint
- Patient quote
- Six vital signs
- Triage note/presentation

The existing high-resolution background and overlay assets establish the
visual direction: institutional hospital surfaces, dark blue plaques, cream
paper, clinical cards, and restrained dimensional framing.

The quote and triage note should benefit most from added vertical space.
Patient artwork may retain a relatively stable magnification while its stage
grows or crops independently.

### Provisional

- Exact percentage assigned to each subsection
- Final typography and text-length limits
- Vital-alert presentation thresholds
- Artwork-aware positioning for unusual patient poses

## Treatment-room rail

### Accepted

Seven choices remain visible in one vertical column:

1. ESI 1 — RESUS
2. ESI 2 — EMERGENT
3. ESI 3 — URGENT
4. ESI 4 — LESS URGENT
5. ESI 5 — NON-URGENT
6. PSYCH
7. DISCHARGE

Each room is directly clickable/tappable. Closed and open high-resolution door
art communicates state.

General room education must be accessible without revealing the correct
answer for the current patient:

- Mouse: hover
- Touch or pen: deliberate hold
- Keyboard/focus accessibility may be supported even though gameplay never
  requires keyboard interaction

## Input and accessibility

### Accepted

- All required gameplay uses pointer interaction.
- The same controls support mouse click, touchscreen tap, stylus, and trackpad.
- No keyboard interaction is required to play.
- No essential function may depend only on hover.
- Controls retain touch-appropriate target sizes at every viewport.
- Feedback uses text/symbols in addition to color and sound.
- Sound can be muted.
- Reduced-motion preferences are respected.
- Semantic controls, meaningful labels, live feedback regions, safe areas, and
  visible focus treatment remain production requirements.

### Production work still required

- Full keyboard operability as an accessibility enhancement
- Focus trapping and restoration for dialogs
- Screen-reader testing
- Color-contrast audit
- Zoom and text-scaling tests
- Testing on physical phones and tablets

## Assignment, feedback, recall, and Coach

### Accepted

- Selecting a room evaluates the assignment immediately.
- The selected door opens.
- The patient leaves the center presentation after assignment.
- Outcome feedback identifies Correct, Acceptable, Close, or Wrong using
  redundant visual/textual cues.
- The intended room may be revealed when the choice differs.
- The open assigned room can recall the patient.
- Recall restores the patient, closes the door, and permits another choice.
- Coach unlocks only after a real decision.
- Coach presents post-decision patient evidence, the player's choice, intended
  placement, outcome explanation, and educational suggestion.
- Coach must remain usable at short mobile heights and may scroll internally.

### Provisional

- Exact animation timing and synthesized sounds
- Whether the live timer pauses while Coach is open
- Whether only a first assignment affects scoring
- Final recall and reassignment accounting
- Final Coach language and clinical review

## Gameplay and scoring

### Accepted direction

- The authoritative seven-destination and strict/forgiving evaluation rules
  are defined in `2026 0727 1458 strict and forgiving scoring specification.md`.
- Production must consume reviewed patient data rather than embedding demo
  patient objects in application code.
- Psych and Discharge remain special destinations with underlying ESI
  information retained for evaluation and education.

### Provisional or deferred

- Final numeric point values
- Timer duration and round-completion behavior
- Rush-mode rules
- GAME versus EDU differences beyond presentation
- First-choice versus final-placement statistics
- Clinical thresholds and patient-specific alternative placements

Prototype values must not be promoted silently.

## State and implementation direction

### Accepted

Use a lightweight state-oriented design:

```text
player action -> update application state -> render affected views
```

One application state is the source of truth for:

- Game frame
- HOME/settings
- STATS
- Coach
- Current session and patient queue

When gameplay changes score or history, an open STATS panel updates
immediately from that same state. When closed, its data continues to update.

Game rules should remain independent of viewport size and presentation mode.
Responsive changes should not create separate desktop and mobile game logic.

### Provisional

- Plain object plus render functions is the preferred starting point.
- Add a reducer or more formal transition layer only when it solves a
  demonstrated testing or complexity problem.
- Do not introduce a state-machine framework without a concrete need.

## Visual style

### Accepted palette and character

The interface should feel like a stylized, inviting emergency department:

- Deep navy structural surfaces
- Blue-gray steel borders and institutional framing
- Cream paper and warm hospital-wall tones
- Orange brand and directional accents
- Cyan active-state accents
- Green, cyan, amber, and red outcome feedback
- Dimensional but readable controls
- High-resolution illustrated waiting rooms, patients, and treatment doors

The interface should remain visually consistent with the mobile demo. Desktop
space must not turn it into a conventional dashboard.

### Current reference tokens

These prototype tokens are accepted as starting references, not immutable
production values:

| Purpose | Reference |
|---|---|
| Deep shell | `#031019` |
| Structural navy | `#071c29`, `#0b2d3e` |
| Steel | `#91a1a8` |
| Cream | `#efe6d6` |
| Brand/direction orange | `#ff9f1c` |
| Active/acceptable cyan | `#12a8df` |
| Correct green | `#27c978` |
| Correct-room reveal | `#8fe3a8` |
| Close amber | `#f0a329` |
| Wrong red | `#ef4b3f` |

Reference typography:

- Condensed bold sans serif for interface labels
- General sans serif for explanations
- Serif italic treatment for patient quotes
- Strong visual hierarchy with bounded fluid sizing

## Assets and data

### Accepted

- Reuse the approved high-resolution patient-panel, waiting-room, room, and
  door artwork.
- Backgrounds may crop, reveal more area, or scale independently.
- Patient art should not be forced to use the same relative magnification as
  flexible backgrounds.
- Runtime asset paths should be centralized rather than scattered through
  rendering code.
- Production patient content comes from the authoritative `patient-data/`
  library.

### Production checks

- Verify all copied/selected assets and normalize filenames.
- Define production manifests for patients and artwork.
- Resolve character-encoding problems.
- Test transparent artwork layering and image loading.
- Do not make production code depend on either test-app directory.

## Platform behavior

### Accepted

The same responsive web application should work on:

- Desktop browsers
- Resized desktop windows
- Touchscreen laptops
- Landscape and portrait tablets
- Mobile browsers

Layout responds to available geometry and capabilities, not user-agent or
device-name detection. Landscape tablets may naturally qualify for side
panels if sufficient width exists.

Browser audio restrictions, touch behavior, safe areas, and orientation
changes must be handled.

## Production-start sequence

1. Preserve this milestone in version control.
2. Audit the current `triageRush-app/` placeholder and authoritative assets.
3. Define the initial production state and actions.
4. Build the centered, height-responsive game shell with the accepted
   one-column/center/one-column composition.
5. Implement the core queue, patient, room, feedback, recall, and Coach loop.
6. Design and implement the responsive HOME/settings view.
7. Design and implement the responsive STATS view and decide its data.
8. Add persistence only after the settings and statistics contracts exist.
9. Test incrementally across phone, tablet, laptop, and desktop geometries.

## Milestone boundary

This document closes the two-demo exploration phase. The next implementation
milestone begins production application development. New production decisions
should update current technical contracts rather than silently inheriting
prototype behavior.
