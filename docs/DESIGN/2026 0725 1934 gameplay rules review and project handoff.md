> **Working-session handoff — not a canonical rules file.** This document
> records the state of an unfinished gameplay-rules revision and the review
> notes around it. Current implementation authority starts at the
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# triageRush — Gameplay Rules Review and Project Handoff

**Session timestamp:** 2026-07-25 19:34 (America/Los_Angeles)  
**Repository:** `D:\Dev\Projects\triageRush`  
**Primary file under review:**
[`gameplay-rules.md`](../singleSourceOfTruth/gameplay-rules.md)  
**Purpose:** Allow Codex or another AI assistant to resume the gameplay-rules
discussion without losing the user's draft changes, review findings, data
state, or pending documentation reorganization.

## Table of contents

1. [Immediate context](#1-immediate-context)
2. [Current authority map](#2-current-authority-map)
3. [What the user changed in gameplay-rules.md](#3-what-the-user-changed-in-gameplay-rulesmd)
4. [Changes that are working well](#4-changes-that-are-working-well)
5. [Review findings requiring resolution](#5-review-findings-requiring-resolution)
6. [Normal and Rush queue design consequences](#6-normal-and-rush-queue-design-consequences)
7. [Suggested deterministic pace model](#7-suggested-deterministic-pace-model)
8. [Clipboard state review](#8-clipboard-state-review)
9. [Pause and navigation state review](#9-pause-and-navigation-state-review)
10. [Terminology and configuration review](#10-terminology-and-configuration-review)
11. [Clinical routing and scoring review](#11-clinical-routing-and-scoring-review)
12. [Patient schema and data state](#12-patient-schema-and-data-state)
13. [Artwork and interface state](#13-artwork-and-interface-state)
14. [Pending documentation reorganization](#14-pending-documentation-reorganization)
15. [Resolved decisions versus open decisions](#15-resolved-decisions-versus-open-decisions)
16. [Recommended next sequence](#16-recommended-next-sequence)
17. [Fast restart checklist](#17-fast-restart-checklist)

---

## 1. Immediate context

The user is actively rewriting
`docs/singleSourceOfTruth/gameplay-rules.md`. The rewrite is explicitly
unfinished. The user asked for a review of the work completed so far and then
asked for all review notes to be preserved in this handoff.

Do not edit `gameplay-rules.md` merely to apply these suggestions until the user
finishes the current thought process or explicitly asks for edits. The review is
intended to identify consequences and ambiguities, not to override the draft.

The most significant new direction is the restoration of a dynamic Rush queue:

- Normal play uses up to five waiting patients.
- Rush mode may expand the TRIAGE panel to between five and ten waiting
  patients.
- Existing slots compress vertically so every waiting patient remains a
  separate tappable button.

This is implementable, but it changes a previously canonical interface
assumption: the waiting rail and five room doors were designed as matching
five-row grids. That conflict must be resolved deliberately.

---

## 2. Current authority map

Canonical documentation currently begins at:

[`docs/singleSourceOfTruth/README.md`](../singleSourceOfTruth/README.md)

Current canonical files:

| Subject | File |
|---|---|
| Gameplay and clinical routing | [`gameplay-rules.md`](../singleSourceOfTruth/gameplay-rules.md) |
| Patient-data semantics and workflow | [`patient-data.md`](../singleSourceOfTruth/patient-data.md) |
| Viewport, layout, layers, and artwork | [`interface-and-layout.md`](../singleSourceOfTruth/interface-and-layout.md) |
| Repository state and next work | [`implementation-status.md`](../singleSourceOfTruth/implementation-status.md) |
| Exact patient template/schema | [`patient-schema.json`](../../patientsCRUD-app/patient-data/docs/patient-schema.json) |

Operational sources:

| Content | Location |
|---|---|
| Patient JSON | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Selected artwork | `docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/` |

Important: a further documentation reorganization has been proposed but not
yet performed. See section 14.

---

## 3. What the user changed in gameplay-rules.md

The user added or expanded three main areas.

### Definitions

New terms include:

- TRIAGE panel.
- PATIENT panel.
- ROOMS panel.
- CLIPBOARD and its inactive/active states.
- `rushMode`.
- `rushTrigger`.

This is a useful move toward shared terminology and explicit state.

### Core interaction

The draft now says:

- The game is tap-based.
- Tapping a waiting patient fills the PATIENT panel.
- Tapping another waiting patient swaps the two.
- Tapping a room places and scores the active patient.
- An empty PATIENT panel ignores room taps.
- Placement empties the PATIENT panel without automatic refill.
- A presentation control opens a larger clipboard.
- No part of the game scrolls; all content must fit.

### Pace of the game

The draft now defines a startup and Rush transition:

- Two patients initially appear in the TRIAGE panel.
- The PATIENT panel starts empty.
- START and EXIT are initially active.
- START begins the timer and enables gameplay input.
- START changes to PAUSE.
- Normal-mode arrivals use `addQueueNormal`.
- The normal cap uses `maxQueueNormal`, currently proposed as five.
- `rushTrigger` switches `rushMode` from false to true.
- Rush arrivals use `addQueueRush`.
- The Rush cap uses `maxQueueRush`.
- The TRIAGE panel may contain up to ten patients in Rush mode.
- Each patient remains a separate button.

---

## 4. Changes that are working well

### A shared vocabulary is valuable

Naming the major panels and state values will make later code, CSS, tests, and
discussion more precise. The idea is sound even though some names need
normalization.

### The startup state is becoming implementable

The draft now identifies:

- Initial waiting-patient count.
- Empty active patient.
- Initial timer display.
- Initially available controls.
- Initial `rushMode`.

That is much better than leaving startup implicit.

### Pace is moving into configuration

Keeping arrival intervals, queue caps, and the Rush trigger configurable is
appropriate. The rules document should define semantics; the eventual config
file should supply values.

### Every waiting patient remains a button

This preserves the game's intended “eyeball triage” behavior: the player may
select any visible patient rather than being forced to take the oldest or top
patient.

### Clinical routing remains consistent

The user's additions did not disturb the agreed ESI, Psych, Discharge, or
acceptable-room rules. Those sections remain aligned with all 160 patient
records.

### No-scroll remains an appropriate hard constraint

The fixed mobile experience should never require document or panel scrolling.
Long-form clipboard content must therefore be authored and rendered to fit.

---

## 5. Review findings requiring resolution

### Finding 1 — dynamic queue geometry conflicts with the current layout

**Priority: high**

The draft describes five waiting slots in Core Interaction but later requires
five through ten slots in Rush mode.

The current interface document says:

- Waiting patients and room doors share five equal rows.
- Each row is 112 CSS pixels / 336 raster pixels.
- Corresponding waiting and room cells align.

If the TRIAGE panel grows beyond five patients, the two rails can no longer
share row boundaries. The project must choose one of these models:

1. Keep both rails at exactly five rows; Rush affects arrival speed but not
   visible capacity.
2. Keep five fixed room rows while allowing the TRIAGE rail to become an
   independent 5–10-row grid.
3. Redesign both rails dynamically, which would also compress room targets and
   is not recommended.

The user's draft strongly implies option 2. If confirmed, update
`interface-and-layout.md` after gameplay rules are finalized.

Suggested wording:

> The TRIAGE panel begins as a five-row grid. In Rush mode its grid may expand
> from five through ten equal-height rows according to `maxQueueRush`. The ROOMS
> panel always retains five equal destination rows and no longer shares row
> boundaries with TRIAGE when more than five patients are visible.

### Finding 2 — `rushTrigger` is directionally ambiguous

**Priority: high**

The draft defines `rushTrigger` as a percentage of time and later says Rush
begins when the timer “gets past” it. With a visible countdown timer, that can
mean either:

- percentage of total time elapsed; or
- percentage of total time remaining.

Recommended definition:

```text
percentElapsed = ((roundDuration - timeRemaining) / roundDuration) × 100
rushMode becomes true when percentElapsed >= rushTriggerPercentElapsed
```

Example:

- Round duration: 60 seconds.
- Trigger: 66.7%.
- Rush begins after 40 seconds have elapsed, at 20 seconds remaining.

A more explicit name such as `rushTriggerPercentElapsed` prevents opposite
implementations.

### Finding 3 — clipboard dismissal rules conflict

**Priority: high**

Core Interaction says the player may:

- tap a close button; or
- tap outside the expanded clipboard.

The later Expanded Information section says:

- only the return control is active while the clipboard is open.

Both can work, but they are different interaction contracts.

Possible decisions:

1. **Return-button only:** simplest modal behavior and clearest on a small
   screen.
2. **Return button plus backdrop tap:** more convenient, but the backdrop
   becomes a second active dismissal target.

In either case:

- Underlying patient, room, START/PAUSE, and EXIT controls must not receive the
  dismissal tap.
- Closing must not accidentally place or swap a patient.
- Keyboard Escape behavior can be added for desktop without changing the
  mobile contract.

The earlier design favored one large `RETURN TO PATIENT ↩` control rather than
a small close icon.

### Finding 4 — PAUSE introduces an undefined state

**Priority: medium**

The draft changes START to PAUSE but does not define what PAUSE does.

A complete pause contract must address:

- Does the round timer stop?
- Do Normal/Rush arrival timers stop?
- Do animations stop or finish?
- Are patient and room buttons disabled?
- Can the clipboard be opened?
- Does EXIT remain active?
- Does PAUSE change to RESUME?
- Is a pause overlay shown?
- Can the browser becoming hidden automatically pause the game?

Recommended simple behavior:

- Timer and arrival scheduling stop.
- Current animations may finish, but no new animation begins.
- Patient, room, and clipboard controls are disabled.
- EXIT remains active.
- PAUSE changes to RESUME.
- RESUME restores the exact prior state without resetting intervals.

This is a recommendation, not a confirmed decision.

### Finding 5 — panel naming is inconsistent

**Priority: medium**

Definitions establishes `ROOMS panel`. Core Interaction says `DOORS panel`.
Choose one term and use it everywhere.

`ROOMS panel` is recommended because:

- JSON uses `correctRoom` and `otherAcceptableRooms`.
- The panel represents destinations, not merely door artwork.
- Closed/open doors are a feedback presentation inside the room buttons.

Also revise the current definition:

> ROOMS panel — the right panel containing the five destination-room buttons.

“The disposition of the current patient” is less precise because disposition
is the result of choosing a room.

### Finding 6 — the Definitions section mixes different kinds of terms

**Priority: low**

The current list puts panels, the clipboard, runtime state, and configuration
under one nested list.

For clarity, divide it into:

- **Panels:** TRIAGE, PATIENT, ROOMS.
- **Overlay:** CLIPBOARD.
- **Runtime state:** `rushMode`.
- **Configuration:** `rushTriggerPercentElapsed`, arrival intervals, caps.

Use JSON/JavaScript Boolean language:

- `false`
- `true`

Avoid `T/F`, `FALSE`, and “set to T” in implementation-facing text.

### Finding 7 — configuration units are missing

**Priority: medium**

`addQueueNormal = 5` does not state whether 5 means:

- seconds;
- timer ticks;
- frames; or
- patients.

Prefer names that include units:

- `addQueueNormalSeconds`
- `addQueueRushSeconds`
- `maxQueueNormal`
- `maxQueueRush`
- `rushTriggerPercentElapsed`
- `initialQueueCount`
- `roundDurationSeconds`

The exact names are suggestions. The important requirement is unambiguous
semantics.

### Finding 8 — behavior while the queue is full is missing

**Priority: medium**

Define what happens when an arrival interval fires at the current cap.

Recommended simple rule:

- No patient is added while the queue is full.
- The scheduled tick is skipped rather than banked.
- After a space opens, the next ordinary interval tick may add one patient.
- Never add a burst of multiple “missed” patients.
- Stop arrivals when the round's patient pool is exhausted.

This avoids hidden backlogs and sudden unfair bursts.

### Finding 9 — new-patient position is unspecified

**Priority: medium**

The earlier design proposed:

- Existing patients move upward.
- A new patient appears at the bottom.

The current draft does not say whether that rule remains. Confirm it before
implementation because it affects focus, animation, and the meaning of “top
two” at startup.

### Finding 10 — initial control state needs minor refinement

**Priority: low**

The draft says all buttons are inactive except START and EXIT, then says START
enables the clipboard.

When the PATIENT panel is empty:

- The clipboard expansion control should remain absent or disabled.
- Room buttons may be technically enabled but must do nothing; disabling them
  visually is clearer.
- TRIAGE patient buttons become active on START.

### Finding 11 — draft uncertainty belongs in one place

**Priority: low**

Examples:

- `timer reading default value (60?)`
- `HOME screen (still undefined)`

These are appropriate working notes but should ultimately be listed under
“Decisions still requiring confirmation” rather than embedded in normative
rules.

### Finding 12 — no-scroll creates a content-validation obligation

**Priority: medium**

If every element must fit without scrolling:

- `quoteShort` and `presentationShort` need tested length limits.
- `quoteLong` and `presentationLong` also need tested expanded-clipboard limits.
- Font size should not shrink unpredictably per patient.
- Overflow should fail validation during authoring rather than be clipped in
  the game.

The previous working word limits remain provisional until the real mobile
interface exists.

---

## 6. Normal and Rush queue design consequences

The TRIAGE rail is 560 CSS pixels / 1680 raster pixels high.

If it uses equal rows, the row heights are:

| Visible patients | CSS height per patient | Raster height per patient |
|---:|---:|---:|
| 5 | 112.0 | 336 |
| 6 | 93.33 | 280 |
| 7 | 80.0 | 240 |
| 8 | 70.0 | 210 |
| 9 | 62.22 | 186.67 |
| 10 | 56.0 | 168 |

At ten patients, each cell is exactly half the height of the approved five-row
cell.

Current waiting-room background assets are:

- 238 × 336 raster pixels.
- Designed for the five-row 17:24 cell.
- Composed with a large patient overlay and peripheral room decoration.

Therefore dynamic compression requires a rendering rule. Options include:

1. Scale the complete background/patient composite into each shorter cell.
   This preserves all content but makes people very small.
2. Crop vertically with `object-fit: cover`.
   This retains width but may cut off patient or room context.
3. Use a different compact rendering above five patients.
   For example, prioritize face/upper body and reduce decorative background.
4. Crossfade from full waiting cards to compact portrait strips.

No option is currently approved.

Touch-target caution:

- A 56 CSS-pixel-tall cell at the ten-patient state is still above the common
  44 CSS-pixel minimum touch-target guideline.
- Borders and gaps reduce the usable interior, so keep them minimal.
- Text or number badges must remain readable.

Visual-symmetry consequence:

- Five TRIAGE rows and five ROOMS rows align.
- Six through ten TRIAGE rows cannot align with five ROOMS rows.
- If dynamic Rush capacity wins, symmetry becomes a Normal-mode feature rather
  than a permanent layout invariant.

This is the largest downstream consequence of the current draft.

---

## 7. Suggested deterministic pace model

The following is a proposed clarification, not an approved replacement.

### Runtime state

```text
gameStatus: ready | running | paused | ended
rushMode: boolean
timeRemainingSeconds: number
queue: ordered list of patient IDs
activePatient: patient ID or null
undrawnPatientPool: ordered/shuffled list of patient IDs
```

### Configuration

```text
roundDurationSeconds
initialQueueCount
addQueueNormalSeconds
maxQueueNormal
rushTriggerPercentElapsed
addQueueRushSeconds
maxQueueRush
```

Constraints:

```text
0 <= initialQueueCount <= maxQueueNormal
1 <= maxQueueNormal <= 5
5 <= maxQueueRush <= 10
maxQueueNormal <= maxQueueRush
0 <= rushTriggerPercentElapsed <= 100
arrival intervals > 0
```

### Start

1. Set `gameStatus = ready`.
2. Set `rushMode = false`.
3. Fill the top `initialQueueCount` TRIAGE positions.
4. Leave `activePatient = null`.
5. Display the configured round time.
6. Enable START and EXIT.
7. Disable patient, room, and clipboard interaction.

### Running

1. START sets `gameStatus = running`.
2. Start or resume the round timer.
3. Enable existing TRIAGE patient buttons.
4. Room buttons accept input only when `activePatient` is non-null.
5. Schedule arrivals using the interval for the current mode.
6. Skip an arrival tick if the queue is full or the undrawn pool is empty.

### Rush transition

1. Calculate percent elapsed from the configured duration.
2. When the threshold is reached, set `rushMode = true` once.
3. Do not revert to Normal mode during the same round.
4. Switch to the Rush arrival interval and Rush cap.
5. Allow the TRIAGE grid to add rows only as actual patients arrive.

### Pause

1. PAUSE sets `gameStatus = paused`.
2. Freeze timer and arrival scheduling.
3. Disable gameplay inputs.
4. Keep EXIT and RESUME active.
5. RESUME continues from the same remaining time and scheduling state.

This model is intentionally simple and is offered for consideration.

---

## 8. Clipboard state review

Current data fields:

- Default card: `quoteShort`, `presentationShort`.
- Expanded clipboard: `quoteLong`, `presentationLong`.

Current intended behavior:

- Additional information is optional.
- It must not be required for the correct room decision.
- Opening it must not scroll or reflow the game.
- Underlying patient and room interactions must be blocked.

Still to decide:

- Return button only versus return button plus backdrop tap.
- Whether a visible close `×` exists.
- Whether timer and arrivals pause.
- Exact overlay bounds.
- Exact long-text limits.

Earlier visual design:

- One shared medical clipboard.
- Large `RETURN TO PATIENT ↩` control.
- No separate quote and presentation dialogs.
- It may cover the normal quote.
- It must not cover vitals or `presentationShort`.

Do not implement both contradictory dismissal models.

---

## 9. Pause and navigation state review

The user introduced:

- START becoming PAUSE.
- EXIT returning to an undefined HOME screen.

This implies at least four application states:

```text
home
ready
running
paused
```

Likely additional states:

```text
clipboardOpen
roundEnded
gameEnded
```

Questions that must be answered:

- Is HOME a splash screen, menu, or both?
- Does EXIT require confirmation during a running game?
- Does EXIT discard the current score?
- Does opening the clipboard count as paused?
- What happens when Safari/Chrome hides the page?
- Is START a one-time action or also the RESUME control?

Do not let the visible label and the actual state diverge. A small explicit
state machine will be safer than scattered button flags.

---

## 10. Terminology and configuration review

Recommended terminology:

| Concept | Recommended canonical term |
|---|---|
| Left waiting-patient area | TRIAGE panel |
| Center current-patient area | PATIENT panel |
| Right destination area | ROOMS panel |
| Expanded information overlay | CLIPBOARD |
| Normal/Rush flag | `rushMode` |
| Trigger | `rushTriggerPercentElapsed` |

Use panel names for layout and state. Use “door artwork” only when discussing
the closed/open image inside a room button.

Configuration principles:

- Define units in names or descriptions.
- Keep caps and intervals configurable.
- Validate configuration at startup.
- Use one naming style consistently.
- Do not encode medical room mappings in general pacing configuration.
- Keep exact scoring values configurable until reconfirmed.

---

## 11. Clinical routing and scoring review

The clinical portion of the draft remains correct.

Base room mapping:

```text
ESI 1   → Resus
ESI 2–3 → Acute
ESI 4–5 → Fast Track
```

Routine accepted alternates:

- ESI 2: Acute correct; Resus acceptable.
- ESI 4: Fast Track correct; Acute acceptable.
- ESI 1, 3, and 5 routine cases: no alternate.

Psych:

- ESI 4–5 only.
- Psych correct.
- Fast Track acceptable.

Discharge:

- Explicitly reviewed ESI 5 only.
- Discharge correct.
- Fast Track acceptable.

Runtime scoring:

- Reads `answer.correctRoom`.
- Reads `answer.otherAcceptableRooms`.
- Does not infer an answer from diagnosis text.

Exact point values remain unresolved in the current canonical document.
Historical proposals used:

- Correct: +100.
- Acceptable: +50.
- Incorrect: −50.

Do not treat those values as final without user confirmation.

---

## 12. Patient schema and data state

### Current schema authority

At the time of this handoff:

`patientsCRUD-app/patient-data/docs/patient-schema.json`

The schema/template currently includes:

- `clinical.quoteShort`
- `clinical.quoteLong`
- `image.imageScale`
- `diagnosis.esi2roomsNotes`
- End-of-file `_documentMetadata`

The file is a worked canonical template, not a formal JSON Schema document.

### Patient data

Development sources:

- JSON: `patientsCRUD-app/patient-data/patient-json/`
- Images: `patientsCRUD-app/patient-data/patient-images/`

There are:

- 160 patient JSON records.
- 160 patient PNG images.

All patient records were migrated:

- Legacy `clinical.quote` removed.
- Original quote preserved verbatim in `quoteLong`.
- `quoteShort` added as `null`.
- `imageScale` added as numeric `1.0`.

Latest validation:

- Parse errors: 0.
- Schema-field errors: 0.
- Routing errors: 0.

Current routing distribution:

| ESI | Correct room | Alternate | Count |
|---:|---|---|---:|
| 1 | Resus | none | 12 |
| 2 | Acute | Resus | 41 |
| 3 | Acute | none | 34 |
| 4 | Fast Track | Acute | 33 |
| 4 | Psych | Fast Track | 3 |
| 5 | Fast Track | none | 11 |
| 5 | Psych | Fast Track | 2 |
| 5 | Discharge | Fast Track | 24 |
|  |  | **Total** | **160** |

Next patient-content task already anticipated:

- Author and review `quoteShort` for all patients.
- Do not generate them by blind truncation.

---

## 13. Artwork and interface state

Current artwork authority:

`docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/`

The folder currently contains 35 files:

- Full-layout reference and specs.
- Patient-panel background and overlays.
- Sixteen waiting-room backgrounds.
- Ten door images: closed and open for five destinations.

Current door states:

- RESUS: closed/off and inward-open treatment bay.
- ACUTE: closed/off and inward-open acute room.
- FAST TRACK: closed/off and inward-open simple exam room.
- PSYCH: closed/off and inward-open office.
- DISCHARGE: closed/open paired glass doors with consistent exterior.

Single-door closed state:

- No middle seam.
- Handle on left/free edge.
- Indicator off.

Single-door open state:

- Right hinge.
- Opens inward.
- Handle depressed.
- Indicator on.

Discharge:

- Opens outward.
- Small hospital/accessibility/right-arrow wayfinding sign.
- Same ambulance and two distant cars across both states.

The selected artwork may be changed later, but it is the current visual
reference.

The dynamic 5–10 TRIAGE queue now requires a future review of waiting-room
artwork behavior at compressed heights.

---

## 14. Pending documentation reorganization

The user raised two additional documentation concerns after the first canonical
folder was created.

### A. Put old documentation into `_deprecated`

Recommended target:

```text
docs/
├── singleSourceOfTruth/
├── DESIGN/
│   ├── README.md
│   ├── REFINING IMAGES/
│   └── _deprecated/
│       ├── old session summaries
│       ├── old design notes
│       ├── old viewport documents
│       └── obsolete ESI notes
└── _deprecated/
    ├── README.md
    └── claude-john-docs/
```

This has **not** been implemented yet.

Current historical docs have warning banners and start-here links, but most
have not physically moved.

Do not move artwork merely because it is old documentation. Treat
`REFINING IMAGES` as the design/asset workspace; move only documentation unless
the user separately requests artwork archival.

### B. Move the shared patient schema into the canonical folder

The user correctly observed that `patient-schema.json` is used across all apps,
not only `patientsCRUD-app`.

Recommended future structure:

```text
docs/singleSourceOfTruth/
├── README.md
├── gameplay-rules.md
├── patient-schema.json
├── patient-schema-explanation.md
├── interface-and-layout.md
└── implementation-status.md
```

Recommended actions:

1. Move, do not copy, `patient-schema.json` into
   `docs/singleSourceOfTruth/`.
2. Rename and expand `patient-data.md` into
   `patient-schema-explanation.md`.
3. Merge operational data locations, field meanings, defaults, validation, and
   migration procedures into that explanation.
4. Update every reference to the schema.
5. Do not retain a second schema copy inside `patientsCRUD-app`.
6. Keep patient JSON and images inside `patientsCRUD-app`; they are operational
   data rather than shared documentation.

This reorganization has also **not** been implemented yet.

When `_deprecated` is created, this handoff should eventually be moved into the
design `_deprecated` area because it is a timestamped working snapshot, not a
canonical rule owner.

---

## 15. Resolved decisions versus open decisions

### Resolved

- Fixed portrait mobile game.
- Logical canvas 360 × 640 CSS pixels.
- High-resolution design canvas 1080 × 1920.
- 22/56/22 main columns.
- Tap interaction; no drag requirement.
- Select any waiting patient.
- Swap waiting and active patients.
- Five destination rooms.
- Current ESI-to-room mapping.
- Psych and Discharge exception rules.
- JSON-authored correct and acceptable rooms.
- Closed/open door feedback assets.
- No document or panel scrolling.
- Short/default clues must be sufficient.
- Schema includes short/long quotes and image scaling.

### Newly proposed but not fully specified

- Normal queue cap five.
- Rush queue cap up to ten.
- Dynamic TRIAGE row compression.
- `rushMode` and percentage trigger.
- START changing to PAUSE.
- EXIT returning to HOME.

### Still open

- Exact `rushTrigger` interpretation and default.
- Exact arrival config names and units.
- Full-queue behavior.
- New-patient insertion position.
- Waiting-card rendering above five patients.
- Whether five-to-ten TRIAGE rows may abandon room-row alignment.
- PAUSE/RESUME state contract.
- Clipboard dismissal method.
- Clipboard timer behavior.
- HOME screen.
- Number and duration of rounds.
- Exact scoring values.
- Audio and feedback duration.
- End-of-game and patient-review flow.
- Final short/long text length limits.

---

## 16. Recommended next sequence

1. Let the user finish editing `gameplay-rules.md`.
2. Resolve the high-priority issues:
   - five versus ten queue geometry;
   - trigger direction;
   - clipboard dismissal;
   - pause behavior.
3. Normalize panel and config terminology.
4. Define full-queue and insertion behavior.
5. Update `gameplay-rules.md` only after the user confirms the choices.
6. Revise `interface-and-layout.md` to reflect dynamic TRIAGE rows if approved.
7. Update `implementation-status.md`.
8. Perform the `_deprecated` documentation move.
9. Move `patient-schema.json` into `singleSourceOfTruth`.
10. Replace `patient-data.md` with
    `patient-schema-explanation.md`.
11. Validate all links after moves.
12. Resume patient work, likely authoring `quoteShort`.

Do not implement the game shell from the unfinished pacing section without
resolving its state and layout ambiguities first.

---

## 17. Fast restart checklist

For the next AI assistant:

1. Read this document completely.
2. Read the current
   [`gameplay-rules.md`](../singleSourceOfTruth/gameplay-rules.md).
3. Treat the user's edits as unfinished.
4. Do not edit the gameplay file unless asked.
5. Focus first on the 5–10 patient queue consequences.
6. Compare gameplay rules with
   [`interface-and-layout.md`](../singleSourceOfTruth/interface-and-layout.md).
7. Remember that the clinical routing rules are already correct and validated.
8. Remember that all 160 patient records use the new quote and imageScale
   fields.
9. Remember that the schema-centralization and `_deprecated` moves are proposed
   but not completed.
10. Ask the user which unresolved gameplay decision they want to settle next.

The key review conclusion is:

> The new pace model is a useful and implementable direction, but a ten-patient
> Rush queue changes the layout contract and requires precise trigger, pause,
> full-queue, compact-card, and modal-input rules before implementation.
