# Gameplay Rules and Specifications

**Last modified:** 2026-08-03

**Changes from the previous version:** Adopted the verified mobile timing,
queue, scoring, sound, header, countdown, and Shift Review behavior as the
current game specification.

## Core experience

The player reviews patient evidence and assigns one of seven destinations:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

The game screen preserves three vertical panels:

1. Waiting-room queue
2. Active patient presentation
3. Seven treatment rooms

The ordinary loop is:

1. Select a waiting patient.
2. Review the patient's Presentation evidence.
3. Assign a treatment destination.
4. Evaluate and record the first assignment immediately.
5. Open the selected room and clear the center panel.
6. Allow Coach or recall when legal.
7. Select another patient and continue until the shift ends.

## Modes

### Triage

Triage is the measured teaching mode.

- Start with five waiting patients.
- Keep all five queue positions filled throughout the shift, plus at most one
  patient in the center panel.
- Default shift length is 300 seconds.
- Settings may select 300 seconds or No Timer.
- The Shift Review footer control is the explicit End Shift control for timed
  and No Timer shifts.
- Patient arrivals do not accelerate.
- Correct is +100, Close is +50, and Wrong is -50.
- Patients left waiting do not affect the score.

### TriageRUSH

TriageRUSH is the timed pressure-and-scoring mode.

- Settings select a 60-second default or 120-second shift.
- Start with two waiting patients inside a five-slot minimum queue; the lower
  three slots initially show empty waiting-room backgrounds.
- Grow from five through ten visible slots as the patient count exceeds five.
- Never display more than ten waiting patients.
- Correct is +100, Close is +50, and Wrong is -50.
- Every patient currently waiting contributes -10 to the live score.
- The shift therefore starts at -20.

RUSH arrival intervals are current approved behavior:

```text
60-second shift:  10, 9, 8, 7, 6, 5, 4, 3, 2, 1 seconds
120-second shift: 14.5, 13.5, 12.5, ... 2.5, 1.5, 1 second
```

The 120-second curve reaches the one-arrival-per-second rate with about eight
seconds remaining. Arrival pulses continue to accelerate and then remain at a
one-second floor even when the queue is full. At full capacity, a scheduled
arrival does not add an eleventh patient; it still plays the arrival chime and
briefly shakes the waiting-room panel left and right.

The timer and patient-arrival scheduler share a quarter-second heartbeat so
whole-second clock behavior and half-second arrival intervals do not drift.

## Queue behavior and visuals

- Triage always renders five occupied queue slots and refills immediately.
- RUSH always renders at least five background-backed slots, begins with two
  occupied slots, and expands one row at a time through ten.
- All visible rows share the fixed panel height equally.
- Duplicate visible patients are prohibited.
- Duplicate waiting-room backgrounds are avoided while alternatives remain.
- A background travels with its patient while that patient remains queued.
- Selecting a patient into an empty center removes that queue entry and
  compacts the occupied entries toward the top.
- Selecting a queued patient while an unassigned patient is active swaps them
  in place.
- Patient order comes from a shuffled identifier list rather than repeated
  independent random choices.

Ten is the current visual and gameplay maximum. Do not raise it without a new
compact queue design; fifteen equal-height rows are too small for the present
portrait, complaint, frame, and hint treatment.

## Patient evidence

Before assignment the player receives only Presentation evidence:

- identity and demographics;
- patient artwork;
- chief complaint;
- patient quote;
- heart rate, blood pressure, respiratory rate, oxygen saturation,
  temperature, and pain; and
- triage note.

The detailed chart expands Presentation, locks Answer, and leaves Clinical
available but collapsed. Clinical may support reasoning but cannot explicitly
name the correct ESI or destination. Answer remains locked until assignment.

## Evaluation modes

The player selects Strict or Forgiving in settings. Evaluation configuration
belongs to application state, not patient JSON.

### Full-credit rooms

- For an ordinary ESI patient, the matching `esi-N` room is the only correct
  room.
- For a Psych or Discharge patient, both the named special destination and the
  ESI room derived from `patient.answer.correctEsi` are correct.
- `otherAcceptableRooms` remains `null` and has no current scoring effect.

### Strict

- Correct room: Correct, +100.
- Every other room: Wrong, -50.
- Strict has no Close outcome or Close field in the header/review scorecard.

### Forgiving

- Correct room: Correct, +100.
- Adjacent ESI room in either direction: Close, +50.
- Every other room: Wrong, -50.
- Psych and Discharge are not adjacent to one another or to an ESI room. For a
  special-destination patient, closeness is calculated from the underlying ESI
  only after checking the two correct rooms.

### Required evaluation order

1. Build the full-credit set.
2. Return Correct if the selected room is in that set.
3. If Strict is active, return Wrong.
4. If the selected room is not an ESI room, return Wrong.
5. In Forgiving, return Close when the selected ESI differs by exactly one.
6. Otherwise return Wrong.

## Feedback, clock, and sound

- Correct, Close, and Wrong use distinct synthesized feedback tones and bold
  green, yellow, and red treatment on the selected room.
- Close and Wrong never highlight or reveal the correct room.
- Feedback uses text/sound/shape as well as color.
- The header sound control mutes all synthesized game sounds.
- RUSH settings include a checked-by-default clock-and-arrival-sound option.
- The Start Shift interaction creates/resumes the audio context so RUSH sounds
  comply with browser autoplay restrictions.

RUSH sound behavior is:

- play a light-medium clock tick immediately at shift start and on every whole
  second thereafter;
- play a bright, single service-counter-style ding at every scheduled patient
  arrival pulse, including attempted arrivals while the queue is full;
- during the final five seconds, play the clock click on the second, quarter
  second, and half second, then rest on the three-quarter second; and
- at zero, suppress a coincident patient ding and play a complementary lower
  dong.

During the final ten seconds, display `10` through `1` as large white numerals.
Each number is horizontally centered about one-third down from the top of the
patient image, pops in quickly, and fades in place over about half a second. It
has no opaque full-screen overlay and does not intercept input.

## Header and main controls

The header contains:

- the mode title: `TRIAGE!` or `TRIAGE RUSH!`;
- a bordered, numbers-only scorecard;
- a larger unboxed timer or elapsed-time display; and
- the sound-state control.

The scorecard reads:

```text
Correct / Close / Wrong = live score
```

Correct is bold green, Close is bold yellow, Wrong is bold red, and the live
score is white. Strict omits Close and its adjacent separator. Wrong counts all
first assignments that were neither Correct nor Close. The RUSH live score is
assignment points minus 10 for every patient currently waiting; Triage shows
assignment points without a waiting penalty.

The footer remains HOME, COACH, and SHIFT REVIEW.

## Assignment, recall, and first-choice accounting

- Assignment evaluates immediately and opens the selected room.
- The assigned patient leaves the center panel.
- The open room retains that patient until the case is finalized or recalled.
- Activating the open room recalls the patient, closes the door, and permits a
  new choice.
- Selecting a new queue patient finalizes the previously assigned case.
- Only the first assignment affects shift totals and score.
- Recalled attempts may receive feedback and Coach access but do not replace
  the recorded first choice.
- A patient counts as seen once, even if recalled and reassigned.

## Coach and detailed patient chart

- Coach becomes available after an assignment while the patient remains in the
  open room.
- Coach is unavailable while a patient occupies the center panel.
- Coach uses the shared detailed-patient chart and includes the player's choice,
  authoritative answer, clinical explanation, resources, findings, red flags,
  teaching points, and possible outcomes.
- Opening a detailed chart pauses the timer and arrival scheduler.
- The chart uses anchored Close, smooth internal scrolling, and conditional
  `MORE ABOVE` and `MORE BELOW` controls.

The three chart contexts and defaults are defined in
[Patient data information](5-patient-data-info.md).

## Shift Review and Patients Seen

Shift Review shows:

- mode and summary title;
- player title and initials;
- shift date/time and duration;
- prominent final score;
- patients seen;
- Correct count x 100 points and subtotal;
- Close count x 50 points and subtotal when Forgiving is enabled;
- Wrong count x -50 points and subtotal;
- patients left waiting x -10 and subtotal in RUSH, or x 0 in Triage; and
- a separate Triage Direction section with Under-triaged and Over-triaged
  counts.

Wrong in the scoring summary combines every outcome scored at -50. The separate
direction section explains the ESI direction without fragmenting the scoring
math.

Shift Review replaces the former per-patient arrow row with one
`PATIENTS SEEN (n)` link. The link opens the existing complete coach chart
inside a review wrapper rather than duplicating or redesigning the chart. A
prominent banner directly below the clipboard clamp provides circular previous
and next patient controls, patient position/name, and a close box. Closing the
wrapper returns to Shift Review and restores focus to the Patients Seen link.

Long-term per-player history and personal-best presentation remain future work.

## HOME and settings

HOME presents one lobby scene with Start Shift, Resume Shift, or open-door
active-shift state.

### Player board

- Welcome message
- Title selector: Doctor, Nurse, RN, LPN, RES, EMS, PA, MS1, MS2, MS3, MS4
- Three uppercase player initials
- Identity persisted locally

### Shift settings board

- Mode: Triage or RUSH
- Difficulty: Strict or Forgiving
- Shift length:
  - Triage: 300 or No Timer
  - RUSH: 60 or 120
- UI Hints on/off
- RUSH clock and arrival sounds on/off

Gameplay-affecting changes during an active shift require explicit restart
confirmation. Identity and safe display/sound preferences may update without
destroying the shift.

### Sound and About

- The green utility cover opens About.
- The HOME boombox controls radio power, music, and future UI effects.
- Music never autoplays and device/browser controls set volume.

## Open decisions

- Lifetime-statistics retention and clearing behavior
- Personal-best retention and presentation
- Final art direction for the production Shift Review screen
- Exact UI-hint presentation on touch devices
