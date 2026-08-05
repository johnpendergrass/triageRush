# Gameplay Rules and Specifications

**Last modified:** 2026-08-05

**Latest change:** Swept in all 2026-08-04/05 amendments: Coach renamed to
Chart, ER ENTRANCE naming, QUIT THIS SHIFT / END SHIFT EARLY footer wording,
the three-toggle sound model, the recall sound, the persistent door halo, and
the Chart overlay details (no Presentation header, photo zoom lightbox).

## Product definition

triageRush is an emergency-department triage teaching game. The player reviews
the evidence available at triage and assigns each patient to one of seven
destinations:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

The product has three full-frame views:

1. HOME (player-facing name: ER ENTRANCE): identity, settings, sound, and
   Start Shift.
2. GAME: waiting queue, active patient, seven rooms, score, and clock.
3. SHIFT REVIEW: final score, formulas, triage direction, and Patients Seen.

The player explicitly navigates between these views. Wider screens never expose
all three at once. The one-presentation rule is fully specified in
[Mobile UI and interaction specification](7-mobile-ui-and-interaction-spec.md).

## Core shift loop

1. Start a new shift from HOME.
2. Select a waiting patient.
3. Review Presentation evidence and optionally open the Chart overlay by
   tapping the patient panel.
4. Assign one of the seven rooms.
5. Receive immediate Correct, Close, or Wrong feedback on the selected room.
6. Either select the next waiting patient, or recall the assigned patient by
   activating the open room and choose again.
7. Continue until time expires, the player stops for Shift Review, or the
   player quits and discards the shift.
8. Review the score and any patient charts.

A patient is considered **active** only while occupying the center patient
panel. A patient is **assigned** while retained behind an open room door. A case
is **finalized** when the player selects another waiting patient, ends the shift,
or time expires.

## Modes

### Triage

Triage is the measured teaching mode.

- Start with five waiting patients.
- Refill to five immediately after a patient is taken from the queue.
- Offer five-minute and ten-minute shifts: 300 or 600 seconds.
- Default to five minutes.
- Always display remaining time as a countdown. There is no No Timer option.
- Correct is +100, Close is +50, and Wrong is -50.
- Waiting patients do not reduce the score.
- Shift Review ends the shift early when selected.

### TriageRUSH

TriageRUSH is the timed pressure mode.

- Offer 60- and 120-second shifts; default to 60 seconds.
- Start with two waiting patients inside a five-slot visual minimum.
- Grow the visible queue from five through ten rows as necessary.
- Never hold or display more than ten waiting patients.
- Correct is +100, Close is +50, and Wrong is -50.
- Every patient currently waiting contributes -10 to the live and final score.
- The starting live score is therefore -20.

The base scheduled-arrival intervals are:

```text
60-second shift:  10, 9, 8, 7, 6, 5, 4, 3, 2, 1 seconds
120-second shift: 14.5, 13.5, 12.5, ... 2.5, 1.5, 1 second
```

After reaching one second, the interval remains at the one-second floor.

### RUSH burst arrivals

At every scheduled RUSH arrival event:

1. Choose a requested burst size: two patients with 20% probability, otherwise
   one patient.
2. Limit successful additions to the available capacity below ten.
3. Add successful patients in sequence, with a 250 ms beat between members of
   a two-patient burst.
4. Play one `doink` for each patient actually inserted.
5. If any requested patient cannot be added because the queue is full, keep the
   queue at ten and perform one brief full-queue shake.
6. Continue the arrival curve even while full; capacity does not pause or reset
   the scheduler.

A two-patient event with one free slot adds one patient and suppresses the
second. It never exceeds ten and never delays the next scheduled event.

## Queue rules

- Triage renders five occupied queue rows and refills to five.
- RUSH renders at least five background-backed rows and at most ten.
- All visible rows share the fixed waiting-panel height equally.
- Empty RUSH rows retain background artwork but no patient.
- Duplicate visible patient IDs are prohibited.
- Duplicate waiting backgrounds are avoided while alternatives remain.
- A waiting background travels with its patient until that patient leaves or is
  swapped from the queue.
- Selecting a patient into an empty center removes that entry and compacts the
  queue upward.
- Selecting a queued patient while a different, unassigned patient is active
  swaps the two patients in place.
- A queued patient cannot replace an active patient after a room choice has been
  made; assign or otherwise resolve the active case first.
- Patient order comes from a shuffled deck, not repeated independent random picks.
- When the deck is exhausted, reshuffle all IDs while excluding currently visible
  patients.

### Arrival `doink`

Play one arrival `doink` for every successful runtime insertion into the
waiting queue:

- Triage's immediate refill after selection;
- a normal one-patient RUSH arrival; and
- each member of a successful two-patient RUSH burst.

Do not play the doink while initially seeding a new shift, when swapping queue
patients, when recalling a patient, or for a blocked addition at capacity.

## Evidence available before assignment

The patient panel and the Chart overlay may expose only Presentation and
non-answer Clinical information:

- name, age, sex, and other presentation demographics;
- patient portrait;
- chief complaint;
- patient quote;
- heart rate, blood pressure, respiratory rate, oxygen saturation, temperature,
  and pain;
- triage note; and
- the Clinical sections defined by schema 2.2.

Answer remains visible as a locked, collapsed section. Clinical may assist
reasoning but may not explicitly state the correct ESI or destination.

## Evaluation

Evaluation configuration belongs to application state, not patient JSON.

### Full-credit rooms

- Ordinary ESI patient: only the matching `esi-N` room.
- Psych or Discharge patient: both the named special destination and the ESI
  room derived from `patient.answer.correctEsi`.
- `otherAcceptableRooms` remains `null` and has no current scoring effect.

### Strict

- Full-credit room: Correct, +100.
- Every other room: Wrong, -50.
- Strict has no Close count or Close field in the header or review scorecard.

### Forgiving

- Full-credit room: Correct, +100.
- Adjacent ESI room: Close, +50.
- Every other room: Wrong, -50.
- Psych and Discharge are not adjacent to any room. For special-destination
  patients, closeness uses the underlying ESI only after both correct rooms have
  been checked.

### Required evaluation order

1. Build the full-credit set.
2. Return Correct if the selected room is in it.
3. If Strict is active, return Wrong.
4. If the selected room is not an ESI room, return Wrong.
5. In Forgiving, return Close if selected ESI differs from correct ESI by one.
6. Otherwise return Wrong.

### Triage direction

Direction is explanatory and does not add points:

- Correct assignment: direction `correct`.
- Selected ESI lower than correct ESI: `over` (higher acuity than required).
- Selected ESI higher than correct ESI: `under` (lower acuity than required).
- An incorrect Psych or Discharge selection: `wrong` with neither direction
  counter incremented.

## Assignment, recall, reassignment, and scoring replacement

Each seen patient owns exactly one shift ledger entry keyed by patient ID.

### First assignment

When an active patient is assigned:

- evaluate the selected room;
- create the patient's ledger entry;
- add its points and outcome/direction contribution;
- open the selected room;
- clear the patient panel;
- retain the patient behind that door; and
- show immediate feedback only on the selected room.

### Recall

Activating the patient's open room recalls that same patient:

- close the room;
- return the patient to the center panel;
- preserve the existing ledger entry as the current recorded result;
- lock Answer again because the patient is under active evaluation;
- enable the Chart overlay through the occupied patient panel; and
- play the recall sound: the first two notes of the Correct arpeggio (C5, E5),
  registry entry `recall`.

Recall by itself does not add a patient seen, change score, add a queue patient,
or play an arrival doink; its only sound is the recall cue above.

### Reassignment

When a recalled patient is assigned again:

1. Evaluate the new room normally.
2. Remove the old ledger entry's points from the assignment subtotal.
3. Remove its old Correct/Close/Wrong and direction contributions.
4. Replace its room, outcome, direction, and points with the new result.
5. Apply the new contributions.
6. Open only the newly selected room and show new immediate feedback.

This replacement may happen repeatedly. At all times, the scorecard and Shift
Review reflect the latest assignment for that patient, and Patients Seen still
contains one entry. If a recalled patient is not reassigned before the shift
ends, the most recent completed assignment remains the recorded result.

Selecting another waiting patient finalizes the currently assigned case and
removes its recall opportunity. Finalization does not change its latest result.

## Immediate feedback

- Correct, Close, and Wrong use distinct synthesized tones.
- The selected room uses green, amber/yellow, or red feedback plus a symbol and
  text result so color is not the only signal.
- Wrong and Close never highlight, animate, or name the correct room.
- The evaluation flash pulses three times on an outcome-colored ring around the
  selected door. That ring then persists as a halo on the open door until the
  room closes via recall or finalization, so the latest outcome stays visible.
  The halo never marks the correct room.
- All feedback tones are game sounds and obey the sound model below.

## The Chart overlay

The panel *is* the patient's chart; tapping it zooms to the full Chart overlay
(the clipboard setting of the unified patient chart). The Chart is an
active-patient tool, not a post-assignment answer reveal.

### Availability and entry

- The Chart is available if and only if a patient occupies the center panel.
- This is true for a newly selected patient and a recalled patient.
- Tapping anywhere within the occupied patient panel opens the Chart.
- An empty patient panel cannot open the Chart.
- There is no dedicated Chart footer button.
- The footer space freed by the Chart must not receive an unapproved gameplay
  action.

### Active-patient Chart behavior

- The Presentation cards are always visible at the top of the chart. There is
  no PRESENTATION section header and no way to collapse them.
- Answer is always locked and collapsed: a striped header with a LOCKED pill.
  Activating it shakes the header briefly; it never opens.
- Clinical starts collapsed when a shift begins.
- The player's Clinical expanded/collapsed choice is remembered across all
  Chart openings and all patients for the remainder of that shift.
- Starting a new shift resets Clinical to collapsed.
- The shift clock and RUSH arrival scheduler pause while the Chart is open.
- Closing the Chart (red close box, tap outside the clipboard, or Escape)
  restores the previous gameplay state and focus when practical.

### Photo zoom lightbox

- The chart's portrait carries a magnifier badge in its top-right corner; the
  whole photo (inset slightly) is the tap target.
- Opening it covers the entire clipboard with a dark blurred scrim and shows a
  centered 3:5 photo card (paper mat) with the portrait enlarged 30%. The zoom
  crops the sides only, never heads. Mirrored patients keep their flip.
- While the lightbox is open, the chart's own close box is hidden so exactly
  one close control is visible: the red box on the photo card. Tapping the
  scrim or pressing Escape also closes it.
- Escape peels one layer at a time: first the lightbox, then the Chart.
- The lightbox is ephemeral view state: it always starts closed on every Chart
  open and is never remembered.

### Shift Review chart behavior

Shift Review's Patients Seen browser uses the same complete chart component in
a third (review) setting.

- The Presentation cards remain always visible; Answer and Clinical are
  unlocked.
- Review initially expands Answer and Clinical.
- Previous and next navigation wraps through the shift ledger order.
- Changing patients resets chart scroll to the top.
- Closing returns to Shift Review and restores focus to Patients Seen.

Full content mappings are in
[Patient data information](5-patient-data-info.md).

## Clock, countdown, and sound timing

Use one quarter-second heartbeat and trigger every cue once at a defined
boundary. Opening the Chart overlay or a confirmation dialog pauses both the
clock and the RUSH arrival countdown.

### RUSH clock sequence

- Play one clock tick immediately when the shift starts.
- Play the ordinary clock tick on every whole-second boundary while time remains.
- Before the final ten seconds, emphasize every ten-second boundary with three
  beats: additional ticks at 0.50 and 0.25 seconds before the boundary, followed
  by the ordinary tick on the boundary.
- Examples in a 60-second shift are the transitions to 50, 40, 30, and 20
  seconds remaining. The transition to 10 starts the final countdown instead.
- Display large `10` through `1` numerals over the patient image during the
  final ten seconds.
- During each of the final five seconds, use the established three-beat cadence:
  a tick on the whole second, then at one-quarter and one-half second after it,
  with silence at three-quarters.
- At zero, suppress any coincident arrival cue and play the lower completion dong.

### Triage clock sequence

- Display only remaining time.
- Play one tick at every ten-second elapsed boundary.
- At each completed minute, replace the single boundary tick with a three-beat
  emphasis at 0.50 and 0.25 seconds before the minute and on the minute.
- During the final ten seconds, use the same whole-second and final-five sound
  cadence as RUSH.
- Triage does not add the RUSH waiting penalty or RUSH arrival scheduler.
- Every clock and arrival cue is a game sound: it plays only while game sounds
  are audible under the sound model below.

### RUSH arrival and completion sound

- Arrival doinks are governed by successful insertion, not scheduler intent.
- A two-patient burst plays two doinks separated by the 250 ms insertion beat.
- A full blocked arrival shakes but is silent.
- At zero, the completion dong wins over every other coincident cue.

## Header, footer, and navigation

The GAME header contains:

- `TRIAGE!` or `TRIAGE RUSH!`;
- a bordered numbers-only outcome scorecard;
- a larger unboxed countdown; and
- the in-game mute control (game sounds only; it never affects music).

The scorecard reads:

```text
Correct / Close / Wrong = live score
```

Strict omits Close and its adjacent separator without a gap. RUSH score equals
assignment points minus ten times the number currently waiting. Triage score is
assignment points only.

The GAME footer exposes exactly two navigation actions and no Chart button:

- `◀ QUIT THIS SHIFT` (subtitle `RETURN TO ER ENTRANCE`) asks for confirmation
  ("Quit this shift?" — "Yes, quit this shift" vs "Whoops! I want to keep
  playing!"), discards the active shift without creating a Shift Review result,
  clears its recovery snapshot, and opens HOME.
- `END SHIFT EARLY ▶` (subtitle `REVIEW THIS SHIFT`) asks for confirmation
  ("End this shift early?" — "Yes, end shift early" vs "Whoops! I want to keep
  playing!"), finalizes the active shift, and immediately opens SHIFT REVIEW.
  Timer expiry performs the same finalization automatically, without a dialog.

Neither path can return to that GAME. HOME and SHIFT REVIEW are not temporary
tabs during an active shift.

## Shift Review

Shift Review shows:

- mode and completion title;
- player title and initials;
- shift date/time and actual duration;
- prominent final score;
- Patients Seen count;
- Correct count x 100 and subtotal;
- Close count x 50 and subtotal in Forgiving;
- Wrong count x -50 and subtotal;
- Left Waiting count x -10 in RUSH or x 0 in Triage; and
- separate Under-triaged and Over-triaged counts.

Wrong is every latest ledger outcome that is neither Correct nor Close. Direction
counters explain wrong placement but do not alter scoring. Reassigned patients
appear once with only their latest result.

The `PATIENTS SEEN (n)` action opens the complete review chart with previous,
next, position/name, and close controls. Long-term history and personal-best
presentation are not part of the current build.

The only primary-view action from SHIFT REVIEW is `RETURN TO ER ENTRANCE`. It
clears the completed shift from active runtime/recovery state and opens HOME.
Starting another shift happens from HOME; there is no direct New Shift or
Return to Game action on SHIFT REVIEW.

## HOME and settings

HOME is the pre-shift ER ENTRANCE screen. It presents settings and Start Shift
only; it has no Resume Shift or Return to Game state. (ER ENTRANCE is the
player-facing name; internal code and asset keys keep `home`/`lobby`.)

### Player settings

- Title options: Doctor, Nurse, RN, LPN, RES, Intern, EMS, PA, MS1, MS2, MS3,
  and MS4.
- Initials: one to three uppercase A-Z letters; default `AAA`.
- Identity persists locally.

### Shift settings

- Mode: Triage or RUSH.
- Difficulty: Strict or Forgiving.
- Triage length: 5 or 10 minutes; default 5.
- RUSH length: 60 or 120 seconds; default 60.
- UI Hints on/off.
- Sound: the three toggles below.

Settings are edited on HOME before Start Shift. GAME does not open HOME
settings without first completing the confirmed Quit This Shift flow, so there
is no mid-shift settings/restart path. The in-GAME mute control remains
available for game sounds.

### Sound model

Three persisted on/off toggles live on the shift-settings blackboard:

| Toggle | Meaning |
|---|---|
| **GLOBAL** | Master switch. Off silences everything (game sounds and music). |
| **GAME SOUNDS** | Every synthesized sound: ticks, doinks, feedback tones, recall, countdown ticks, completion dong. |
| **MUSIC** | The Classical KING-FM internet radio stream (currently the only music). |

- Music plays only when GLOBAL and MUSIC are both on, and can only be started
  from HOME gestures. The game screen can never turn music on. Music never
  autoplays.
- Game sounds are audible during a shift when GLOBAL and GAME SOUNDS were both
  on at shift start and the in-game mute is off. The in-game mute flips only a
  runtime flag; it never rewrites the persisted toggles and never affects music.
- Every game sound has its own named registry entry with an individual enabled
  flag, so per-sound preferences can be added later without restructuring.
- Device/browser controls own volume.

### About

- About opens from its dedicated HOME control.

## Accessibility and safety rules

- Required play works with touch, mouse, pen, and keyboard.
- Touch targets are at least 44 CSS pixels where geometry permits.
- Hover may supplement but never gate required information.
- Feedback uses text/symbol/sound/shape in addition to color.
- Motion respects `prefers-reduced-motion`.
- Blocking overlays trap meaningful focus and restore it on close.
- Audio failures never prevent play.
- This is an educational game; it must not present itself as clinical decision
  support for real patients.
