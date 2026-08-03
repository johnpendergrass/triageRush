# Gameplay Rules and Specifications

**Last modified:** 2026-08-02

**Changes from the previous version:** Consolidated gameplay, scoring, HOME,
feedback, and review rules; adopted Triage/TriageRUSH, two scoring modes, and
shift terminology.

## Core experience

The player reviews patient evidence and assigns one of seven destinations:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

The main screen preserves three vertical panels:

1. Waiting-room queue
2. Active patient presentation
3. Seven treatment rooms

The ordinary loop is:

1. Select a waiting patient.
2. Review the patient's Presentation evidence.
3. Assign a treatment destination.
4. Evaluate the first assignment immediately.
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
- Triage tracks shift statistics but does not calculate a numeric score.
- If No Timer is used, the application still needs an explicit, discoverable
  way to end the shift. The exact placement remains unresolved.

### TriageRUSH

TriageRUSH is the timed scoring mode.

- Settings select a 60-second default or 120-second shift.
- Start with two waiting patients.
- Add patients at an increasing pace until the queue reaches ten patients.
- The initial pacing idea is to add patients after intervals of 10 seconds,
  then 9, then 8, and so on. This schedule is provisional and must be tuned in
  the real application.
- Correct, close, wrong, and patients left waiting contribute to the numeric
  result.
- A prominent timer appears in the top banner.
- Pause/restart placement remains a design question.

## Queue behavior

- In Triage, five patients remain visible and the queue refills immediately.
- In TriageRUSH, queue size changes over time and may grow to ten.
- Duplicate visible patients are prohibited.
- Duplicate waiting-room backgrounds are avoided while alternatives remain.
- A background travels with its patient while that patient remains queued.
- Selecting a patient into an empty center removes that queue entry and compacts
  the queue according to the active mode.
- Selecting a queued patient while an unassigned patient is active swaps them
  in place.
- Patient order comes from a shuffled identifier list rather than repeated
  independent random choices.

## Patient evidence

Before assignment the player receives only Presentation evidence:

- identity and demographics;
- patient artwork;
- chief complaint;
- patient quote;
- heart rate, blood pressure, respiratory rate, oxygen saturation,
  temperature, and pain;
- triage note; and
- Clinical interpretation when the player chooses to expand the unlocked
  Clinical section.

Clinical may support reasoning but cannot explicitly name the correct ESI or
destination. Answer remains locked until assignment.

## Scoring modes

The player selects Strict or Forgiving in HOME. Scoring configuration belongs
to application state, not patient JSON.

### Full-credit rooms

- For an ordinary ESI patient, the matching `esi-N` room is the only correct
  room.
- For a Psych or Discharge patient, both the named special destination and the
  ESI room derived from `patient.answer.correctEsi` are correct.
- `otherAcceptableRooms` remains `null` and has no current scoring effect.

### Strict

- Correct room: full credit.
- Every other room: wrong/no credit.
- Strict has no close outcome.

### Forgiving

- Correct room: full credit.
- An adjacent ESI room in either direction: close/half credit.
- Every other room: wrong/no credit.
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

## Feedback

- Correct: ding plus a bold green treatment on the selected room.
- Close: distinct sound plus a bold yellow treatment on the selected room.
- Wrong: buzz plus a bold red treatment on the selected room.
- Feedback remains visible for several seconds.
- Do not highlight or reveal the correct room after a Close or Wrong choice.
- Feedback must use labels or sound/shape in addition to color.

## Assignment, recall, and first-choice accounting

- Assignment evaluates immediately and opens the selected room.
- The assigned patient leaves the center panel.
- The open room retains that patient until the case is finalized or recalled.
- Activating the open room recalls the patient, closes the door, and permits a
  new choice.
- Selecting a new queue patient finalizes the previously assigned case.
- Only the first assignment affects shift totals and TriageRUSH score.
- Recalled attempts may receive feedback and Coach access but do not replace the
  recorded first choice.
- A patient counts as seen once, even if recalled and reassigned.

## Coach and detailed patient chart

- Coach becomes available after an assignment while the patient remains in the
  open room.
- Coach is unavailable while a patient occupies the center panel.
- Coach uses the shared detailed-patient chart and includes the player's choice,
  authoritative answer, clinical explanation, resources, findings, red flags,
  teaching points, and possible outcomes.
- Opening a detailed chart pauses the game timer.
- The chart uses anchored Close, smooth internal scrolling, and conditional
  `MORE ABOVE` and `MORE BELOW` controls.

The three chart contexts and defaults are defined in
[Patient data information](5-patient-data-info.md).

## Shift Review

Both modes track first-assignment statistics:

- patients seen;
- correct assignments;
- over-triaged assignments;
- under-triaged assignments;
- wrong/special-destination assignments; and
- patients waiting when the shift ends.

Shift Review shows:

- mode and summary title;
- player title and initials;
- shift date, start time, and duration;
- the statistics above;
- TriageRUSH score detail when applicable;
- personal-best information when applicable; and
- a patient-review action for the patients seen during the shift.

Patient Review uses the shared detailed chart with previous/next navigation and
the player's first assignment. Long-term per-player history is desirable but
its exact retention and presentation remain to be designed.

The provisional TriageRUSH example uses 100 points for Correct, 50 for Close,
-50 for Wrong, and -10 for each patient left waiting. Treat these values as
tuning candidates until explicitly confirmed in production testing.

## HOME and settings

HOME presents one lobby scene with Start Shift, Resume Shift, or open-door
active-shift state.

### Player board

- Welcome message
- Title selector: Doctor, Nurse, RN, LPN, RES, EMS, PA, MS1, MS2, MS3, MS4
- Three uppercase player initials
- Arcade-style rolling selectors
- Identity persisted locally and used for per-player history

### Shift settings board

- Mode: Triage or RUSH
- Difficulty: Strict or Forgiving
- Shift length:
  - Triage: 300 or No Timer
  - RUSH: 60 or 120
- UI Hints on/off

Gameplay-affecting changes during an active shift require explicit restart
confirmation. Identity and safe display/sound preferences may update without
destroying the shift.

### Sound and About

- The green utility cover opens About.
- The boombox controls radio power, music, and future UI effects.
- Music never autoplays and device/browser controls set volume.

## Open decisions

- Exact No Timer end-shift control
- Exact TriageRUSH pause/restart control
- Final RUSH patient-arrival curve
- Final RUSH numeric score and personal-best rules
- Lifetime-statistics retention and clearing behavior
- Final Shift Review visual layout
- Exact UI-hint presentation on touch devices
