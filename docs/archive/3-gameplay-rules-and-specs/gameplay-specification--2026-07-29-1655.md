# triageRush Gameplay Specification

**Current version:** 2026-07-29 16:55 PDT

## Purpose

This document defines the current production game loop and behavior. Numeric
scoring details are defined separately in the scoring specification.

## Core loop

1. Present five waiting patients.
2. Move or swap one patient into the center panel.
3. Review the patient evidence.
4. Assign one of seven treatment destinations.
5. Evaluate the choice immediately.
6. Open the selected room and clear the center panel.
7. Show mode-appropriate feedback.
8. Allow Coach and recall when permitted by the active mode.
9. Select the next patient and continue the session.

## Waiting queue

- Exactly five patients are visible in one vertical column.
- Each cell combines a waiting-room background, patient art, complaint label,
  institutional frame, and visible selectable-state treatment.
- Selecting into an empty center compacts and refills the queue.
- Selecting while an unassigned patient is active swaps the patients in place.
- A footer SWITCH action is not needed.
- Duplicate visible patients are prevented.
- Duplicate visible backgrounds are avoided while alternatives remain.

The final selection treatment is undecided. It may use arrows, border/color
change, or another ordinary-tap affordance.

## Patient sequence

- The authoritative patient store is shuffled into a randomized identifier
  list.
- Patients are consumed in that stored order.
- Near the end, the complete list is reshuffled and traversal restarts.
- The list and current position are stored locally so a later session can
  continue where the prior session stopped.
- Backgrounds are selected randomly and travel with patients while they remain
  in the active queue.
- Whether background assignments are persisted with the shuffled patient list
  remains undecided.

## Patient evidence

The player receives:

- Identity and demographics
- Patient artwork
- Chief complaint
- Patient quote
- Heart rate
- Blood pressure
- Respiratory rate
- Oxygen saturation
- Temperature
- Pain score
- Triage note

Production content comes from reviewed patient JSON, not embedded JavaScript
demo objects.

## Destinations

The player chooses:

- `esi-1`
- `esi-2`
- `esi-3`
- `esi-4`
- `esi-5`
- `psych`
- `discharge`

Psych and Discharge remain special destinations with an underlying ESI level
available for scoring and teaching.

## Assignment

- Activating a room evaluates the choice immediately.
- The selected door opens.
- The assigned patient leaves the center panel.
- Feedback vocabulary depends on the scoring mode.
- Intended-room reveal depends on scoring mode and GAME/EDU mode.
- Coach availability depends on GAME/EDU mode.

## Open door and recall

- The assigned door stays open while the center panel is empty.
- Activating that open room recalls its patient.
- Recall restores the patient, closes the door, and permits another choice.
- Selecting a different patient into the center closes the previously open
  assigned door.
- Final recall, reassignment, and first-choice accounting remain to be settled
  with Stats and numeric scoring.

## Coach

Coach is post-decision education. When permitted by the active mode, it shows:

- Patient evidence
- Player choice
- Intended placement
- Credit/outcome explanation
- Educational suggestion

Coach may scroll internally, anchors its close control, and indicates when
more content exists below. Final clinical language requires review.

## GAME and EDU

GAME/EDU is chosen in HOME and shown as an indicator in the game header.

Still to be decided:

- Exact behavioral differences
- Whether Coach is available in each mode
- Intended-room reveal policy
- Timer and round-end behavior
- How EDU accounts for attempts

## Scoring strictness

The player chooses Strict, Tolerant, or Forgiving in HOME. Changing strictness
during a live game requires explicit restart confirmation.

The scoring system returns semantic credit results. The UI chooses
mode-appropriate feedback rather than assuming all modes have Correct, Close,
and Wrong states.

## HOME and settings effects

Changes that do not alter gameplay continue the active session:

- Player name
- Player title
- Sound
- Display preferences

Changes that alter rules require `APPLY & RESTART`:

- GAME/EDU when behavior changes
- Strictness
- Timer duration
- Rush mode
- Difficulty or evaluation rules

No setting silently destroys an active round.

## STATS

- Stats are derived from the same application state as gameplay.
- An open Stats panel updates immediately after relevant actions.
- Collection continues while Stats is closed.
- Stats never changes gameplay.
- Exact stored information will be designed later.

No detailed event log, recall history, or long-term analytics is currently
required.

## Session and persistence

- The game is standalone and needs no persistent server.
- There is no network leaderboard.
- Local storage may retain settings, player identity, shuffled patient
  position, session continuation, and future per-device best scores.
- Storage must be versioned so incompatible future data can be discarded or
  migrated safely.

## Timing and Rush mode

Timer duration, round completion, bonuses, and penalties remain unresolved.
Rush mode is also unresolved; it should not be implemented until it has a
clear rule that creates genuinely faster play.

## Change history

- **2026-07-29 16:55 PDT:** Consolidated the accepted queue, assignment,
  recall, Coach, session, and persistence behavior.
