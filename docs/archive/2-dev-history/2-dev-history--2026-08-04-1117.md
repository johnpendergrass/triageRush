# Development History

**Last modified:** 2026-08-03

**Changes from the previous version:** Recorded the completed self-contained
mobile rebuild and the accepted timing, scoring, sound, header, countdown, and
Shift Review refinements.

## Purpose

This is a concise record of how the current production direction was reached.
It records durable milestones and decisions, not every work session or file
operation. Detailed source notes remain in `archive/`.

## Milestones

### Initial concept

- triageRush began as a small emergency-department triage teaching game.
- The earliest concept used five destinations and a compact mobile-first visual
  arrangement.
- The core educational idea remained stable: show a patient evidence package,
  ask the player to choose a destination, and explain the result after the
  decision.

### Seven-destination design

- The destination model expanded to seven choices: ESI 1 through ESI 5, Psych,
  and Discharge.
- Psych and Discharge retained an underlying ESI so both the special destination
  and clinically matching ESI room could be treated as correct.
- The waiting queue, center patient chart, and treatment-room rail became the
  stable three-panel composition.

### Prototype phase

- Separate mobile and desktop test applications were created to explore layout
  without prematurely committing to production architecture.
- The mobile demo established five visible waiting patients, patient swapping,
  room assignment, feedback, recall, Coach access, and the detailed-patient
  chart.
- High-resolution waiting-room, patient-panel, room-interior, and door artwork
  was selected and tested.
- The desktop work confirmed that wider screens should preserve the centered
  mobile-derived game rather than rearranging the queue and rooms.

### HOME lobby design

- A separate HOME prototype established the open emergency-department lobby,
  Start Shift and Resume Shift door overlays, two sidewalk settings boards, the
  About utility cover, and the boombox sound controls.
- Classical KING 98.1 FM was selected for the optional live music stream.
- The HOME artwork uses one permanent background with registered overlays rather
  than several unrelated full-screen images.

### Patient library evolution

- The patient library grew to 160 matched JSON records and portraits.
- Schema 1.x normalized room identifiers and removed patient-authored scoring
  alternatives.
- Schema 2.0 introduced educational reasoning.
- Schema 2.1 grouped Presentation, Answer, and Clinical under one patient
  object and unified detailed-patient rendering.
- Schema 2.2 corrected the pre-answer information boundary, moved explicit
  destination rationale into Answer, established clinical-fidelity safeguards,
  and defined three detailed-chart contexts.
- On 2026-08-01 the 160 production records received a full schema, writing,
  vital-color, and clinical-fidelity review. The validators currently pass all
  records and images.

### Current game direction

- Triage and TriageRUSH replaced the earlier GAME and EDU names.
- Strict and Forgiving replaced the former Strict, Tolerant, and Forgiving
  scoring set.
- `Shift` replaced `round` in player-facing terminology.
- Triage became the measured teaching mode with a numeric assignment score but
  no accelerated arrivals or waiting-room penalty.
- TriageRUSH became the timed scoring mode with a growing waiting-room queue.
- STATS/REVIEW became Shift Review, including a shift summary and later review
  of patients seen.

### Self-contained mobile checkpoint

- On 2026-08-02 `_testAppMobile/` was rebuilt as a self-contained reference
  using all 160 schema 2.2 patients, all matching portraits, and private copies
  of the current game-page artwork.
- The rebuilt reference verified Triage and TriageRUSH, Strict and Forgiving,
  first-choice accounting, recall, Coach, detailed charts, settings, timers,
  queue growth, score review, and mobile layout.
- The private copies were hash-checked against the canonical patient library
  and production artwork.

### Timing and review refinement

- On 2026-08-03 the 60-second RUSH arrival curve was accepted as 10 seconds,
  then one second faster per arrival to a one-second floor.
- The 120-second curve was accepted as 14.5 seconds, then one second faster per
  arrival to a one-second floor, reaching that floor with about eight seconds
  remaining.
- RUSH adopted a five-slot visual minimum, two starting patients, a ten-patient
  maximum, continuing full-queue arrival pulses, an arrival ding, and a brief
  full-panel shake on blocked arrivals.
- The RUSH clock adopted start/second ticks, a three-beat quarter-second cadence
  during the final five seconds, a complementary zero-second dong, and pop/fade
  countdown numerals for the final ten seconds.
- The mode switch left the game header. A color-coded numbers-only scorecard and
  larger unboxed timer replaced it.
- Triage adopted the same +100/+50/-50 assignment scoring as RUSH. RUSH live
  score now continuously includes -10 per waiting patient.
- Shift Review adopted explicit scoring formulas, a separate triage-direction
  section, and one Patients Seen link that opens the unchanged detailed chart
  inside a previous/next/close review wrapper.

### Production preparation

- The demo-design phase reached the point where the real application could
  begin.
- Production assets were reorganized under `triageRush/assets/game-page/` and
  `triageRush/assets/lobby-page/`, with future placeholders for audio, icons,
  patient-chart popups, and review pages.
- Documentation was consolidated into the present numbered system so
  production work can refer to a small current set rather than overlapping
  timestamped specifications.

## Historical lookup

The archive is grouped by the same numbered purposes as the current documents.
Use [the archive index](archive/README.md) when the rationale behind a decision
is needed. Historical files explain their time; they do not override current
rules.
