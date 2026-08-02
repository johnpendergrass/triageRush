# testApp Visual and Interaction Specification

**Recorded:** 2026-07-27 11:46 PDT
**Describes:** the mobile prototype now located at `_testAppMobile/`, as
preserved on this date
**Status:** Descriptive prototype baseline; not a production contract

## Purpose and use

This document makes the seven-choice prototype easy to reference while the
production triageRush Game, Edu, and read-only patient viewer are built. It
captures meaningful geometry, visual tokens, assets, states, and behavior from
the executable source without duplicating every incidental CSS declaration.

Use this order when resolving questions:

1. This document explains design intent and important relationships.
2. `_testAppMobile/index.html`, `styles.css`, and `app.js` provide exact prototype
   implementation behavior.
3. Current production technical documents, once written, override the
   prototype for the production app.

Prototype scoring, clinical evaluation, patient explanations, and timing are
experiments. Do not promote them silently.

## Quick navigation

- [Application shell](#application-shell)
- [Header](#header)
- [Triage queue](#triage-queue)
- [Patient panel](#patient-panel)
- [Seven-room rail](#seven-room-rail)
- [Room education interaction](#room-education-interaction)
- [Assignment, feedback, and recall](#assignment-feedback-and-recall)
- [Prototype evaluation rules](#prototype-evaluation-rules)
- [Game and Edu modes](#game-and-edu-modes)
- [Coach overlay](#coach-overlay)
- [Visual tokens](#visual-tokens)
- [Asset inventory](#asset-inventory)
- [Accessibility](#accessibility-behaviors-already-demonstrated)
- [Known limitations](#known-prototype-limitations)
- [Production promotion checklist](#production-promotion-checklist)

## Source map

| Concern | Prototype source |
|---|---|
| Semantic structure and accessibility labels | `_testAppMobile/index.html` |
| Geometry, visual appearance, responsive behavior, and animation | `_testAppMobile/styles.css` |
| Patient examples, room definitions, state, evaluation, scoring, and interaction | `_testAppMobile/app.js` |
| Prototype-only runtime artwork | `_testAppMobile/assets/` |

## Application shell

### Viewport contract implemented by the prototype

- Portrait shell with a fixed 9:16 relationship.
- Base width: `min(100vw, 100dvh × 0.5625, 430px)`.
- Base height: `min(100dvh, 100vw × 1.7778, 764px)`.
- Original minimum shell: 300 × 533 CSS pixels.
- Maximum shell: 430 × 764 CSS pixels.
- Page overflow is hidden; the complete shell remains visible rather than
  making the active game page scroll.
- The body centers the shell over a dark radial-gradient surround.
- Body padding is the greater of 4 px or each safe-area inset.
- Shell border: 2 px `#46606b`; radius: 10 px.

The currently enabled reversible safe-viewport experiment uses `100svw` and
`100svh` when supported. It subtracts the safe-area padding before calculating
the shell and removes the original minimum dimensions. This is intended to
keep the complete game above expanded mobile browser controls.

At viewport heights of 590 px or less, the shell radius becomes 4 px and
vertical margins around the quote and presentation areas shrink.

### Primary vertical regions

| Region | Shell height |
|---|---:|
| Header | 7.2%, minimum 40 px |
| Play area | 85.8% |
| Footer | 7%, minimum 40 px |

### Play-area columns

| Panel | Width |
|---|---:|
| Triage queue | 22% |
| Current patient | 56% |
| Treatment rooms | 22% |

These ratios are central to the current appearance.

## Header

The header is a four-column grid:

```text
brand 1.15fr | mode switch 0.98fr | status 0.62fr | sound 24px
```

- Gap: 4 px; padding: 4 px 5 px.
- Background: dark navy vertical gradient.
- Bottom border: 2 px `#59707a`.
- Brand uses `TRIAGE` plus orange `RUSH!`.
- Game/Edu switch is 28 px high with two equal buttons.
- Active mode uses cyan-blue gradient and glow.
- Status box is 30 px high with amber border.
- Sound control is 24 × 28 px.

Game mode shows the score in the small status label and remaining seconds in
the large value. Edu mode shows `C / A / CL / W` and the four outcome tallies.

## Triage queue

### Geometry and composition

- Exactly five equal visible slots.
- Queue grid gap: 3 px.
- Waiting panel padding: 3 px.
- Queue-cell border: 2 px `#778c8e`; radius: 5 px.
- Waiting panel and room rail share `assets/backgrounds/door-wall.png`.
- The right edge has a 3 px subdued blue-gray runner.

Each occupied cell is layered back to front:

1. Stored waiting-room background, `object-fit: cover`.
2. Transparent patient PNG, `object-fit: cover`, positioned `center 22%`.
3. Institutional frame.
4. Bottom complaint label.
5. Transfer arrow straddling the queue/patient boundary.

The complaint label uses a near-black translucent background, white condensed
bold text, and single-line ellipsis.

The transfer/recall circle is 20–28 px wide, depending on container width. It
uses a translucent blue background, warm-white border, orange arrow, and dark
shadow.

### Queue behavior

- A fresh round creates five distinct queued patients.
- The active patient is excluded from new random queue choices.
- Duplicate visible patients are prevented.
- Sixteen waiting-room backgrounds are available.
- A background is stored in the queue entry rather than selected during each
  render.
- Visible duplicate backgrounds are avoided while alternatives remain.
- The background travels with the patient through compaction and swaps.

When the center panel is empty:

- Each queue cell shows a right arrow.
- Selecting a patient removes that entry.
- Lower entries compact upward.
- A random patient/background entry is appended at the bottom.

When the center panel contains an unassigned patient:

- Each queue cell shows a double-ended arrow.
- Selecting a queue entry performs an exact in-place swap.
- The previous active patient and its stored background occupy the selected
  queue position.
- Other queue positions do not change.

The footer's Next button is intentionally disabled in the prototype. Its label
changes between `SELECT FROM LEFT` and `SWITCH FROM LEFT`; queue cells perform
the actual action.

## Patient panel

### Background and container

- Panel padding: 4 px.
- Background uses `assets/backgrounds/patient-hall.png`, centered at the top
  and covering the panel.
- Right border: 2 px dark navy.
- The patient evidence elements fade and scale out over 180 ms when the panel
  is awaiting a patient.

### Vertical evidence composition

| Element | Patient-panel height |
|---|---:|
| Patient scene | 43% |
| Quote | 12.5% |
| Vitals | 18% |
| Triage presentation | 23.5% |

Small margins between elements account for the remainder.

### Patient scene

- 1 px steel border; 7 px radius.
- Patient nameplate: 86% width, centered, 4 px from top, minimum height 27 px.
- Patient PNG: 96% width × 94% height, left 2%, bottom −2%.
- Patient PNG uses `object-fit: contain` and `object-position: center bottom`.
- Complaint strip is inset 4 px from left, right, and bottom.

The complaint strip can overlap a patient's feet. This is a known prototype
composition limitation, not an approved production requirement.

### Quote

- Georgia serif, italic, bold, centered.
- Cream translucent background `#f6ecddf5`.
- 1 px `#b19a79` border; 8 px radius.
- Content is clipped rather than scrolling.

### Vitals

- Six values in a 3 × 2 grid.
- Light clinical-card surface and thin internal grid lines.
- Alert color: `#c72d25`.
- Watch color: `#b46a00`.

Prototype display thresholds:

| Vital | Alert | Watch |
|---|---|---|
| HR | greater than 115 or less than 50 | — |
| Systolic BP | less than 90 | — |
| RR | greater than 24 or less than 10 | — |
| SpO₂ | less than 92% | — |
| Temperature | at least 38.0 °C | — |
| Pain | at least 8/10 | at least 5/10 |

These thresholds are presentation logic, not a complete clinical rule set.

### Triage note

- Clipboard-style cream card.
- Height: 23.5%.
- Border: 3 px `#8a4c16`; radius: 7 px.
- Metallic clip is 34% wide and 11 px high.
- Text is clipped rather than internally scrolled.

### Empty state

When no patient is displayed, a centered dashed panel shows:

- `READY / SELECT A PATIENT` at round start.
- `ROOM ASSIGNED / SELECT ANOTHER PATIENT` after a decision.
- After assignment, the hint also explains that the open room can recall the
  patient.

## Seven-room rail

### Order and labels

1. ESI 1 — RESUS
2. ESI 2 — EMERGENT
3. ESI 3 — URGENT
4. ESI 4 — LESS URGENT
5. ESI 5 — NON-URGENT
6. PSYCH
7. DISCHARGE

The rail is a seven-row equal grid. Each room is a semantic button with an
accessible label containing its name, open/closed state, definition, and
recall availability.

### Door composition

- Each row uses the same door-wall background as the queue.
- Door art is 61% of cell width and 91% of cell height.
- Art is horizontally centered and 1% above the bottom.
- `object-fit: fill` is used.
- The label group is 83% wide and 2 px from the top.
- ESI doors show a small badge plus compact treatment label.
- Psych and Discharge show only the treatment label.
- Keyboard focus uses a 3 px white inset outline.

Closed and open artwork are switched by filename; the door is not animated
between geometric positions.

## Room education interaction

Room definitions are general and never reveal whether a room is correct for
the active patient.

- Mouse: show on pointer hover.
- Keyboard: show when the button receives visible focus.
- Touch/pen: show after a 500 ms hold.
- Hold cancellation movement threshold: more than 10 px.
- Successful hold optionally vibrates for 12 ms.
- A completed or cancelled hold suppresses the placement click for 700 ms.
- Native long-press context menus are prevented on room buttons.
- Popover position follows the relevant room and is clamped inside the patient
  panel with a 6 px margin.

## Assignment, feedback, and recall

### Assignment flow

1. Choose a patient from the queue.
2. Review all displayed evidence.
3. Activate one of seven room buttons.
4. Evaluate immediately.
5. Open the selected door.
6. Display audiovisual outcome feedback.
7. Unlock Coach.
8. Clear the patient evidence panel.

After assignment, the selected room remains open. A left-pointing recall arrow
straddles the patient/room boundary. Activating that same open room:

- Restores the assigned patient.
- Closes the door.
- Clears the previous decision.
- Locks Coach.
- Allows another placement attempt.

### First-assignment accounting

`previouslyAssigned` starts false for each patient selected from the queue.
Only the first assignment changes the score or Edu tallies. Recall and retry
retain the flag, so subsequent attempts provide full feedback without further
accounting. Selecting any queue patient resets the flag for the newly active
patient.

### Outcome feedback

| Outcome | Selected room | Intended room when different | Toast | Sound |
|---|---|---|---|---|
| Correct | Green pulse | Same room | Dark green | Rising sine, 740→1180 Hz |
| Acceptable | Cyan pulse | Light-green pulse | Blue-cyan | Rising sine, 520→740 Hz |
| Close | Amber pulse | Light-green pulse | Orange | Falling sine, 360→220 Hz |
| Wrong | Red pulse | Light-green pulse | Dark red | Falling sawtooth, 125→95 Hz |

- Selected-room and answer-reveal animations run twice at 900 ms per cycle.
- Toast appears for 1,250 ms.
- Result text includes both a symbol and a word.
- Sounds are synthesized with Web Audio; no audio files are used.
- The sound control mutes feedback and updates `aria-pressed`.
- Reduced-motion preference collapses animation and transition durations to
  1 ms and removes smooth scrolling.

## Prototype evaluation rules

### Numbered ESI patients

- Exact intended room: Correct.
- Numbered ESI room exactly one level from the intended numbered room: Close.
- Every other choice: Wrong.

### Psych and Discharge patients

- Exact special pathway: Correct.
- Underlying numbered ESI level or an adjacent numbered ESI level: Acceptable.
- Every other choice: Wrong.

This is temporary prototype logic. It does not implement dangerous
under-triage overrides, patient-specific alternative tables, or Loose/Strict
evaluation.

## Game and Edu modes

### Game

- Timer initializes at 60 seconds.
- Correct: +100.
- Acceptable: +35.
- Close: +35.
- Wrong: −50.
- Timer decrements once per second.
- Timer pauses while Coach is open.
- After reaching zero, the next timer tick resets it to 60; there is no
  end-of-round state.

### Edu

- No timer decrement.
- No numeric point changes.
- Displays cumulative Correct / Acceptable / Close / Wrong tallies.

Changing modes does not reset current state, score, tallies, patient, or timer.
Reset Round restores an empty patient panel, five queued patients, score zero,
all tallies zero, and 60 seconds.

All timing and scoring values are provisional.

## Coach overlay

- Fixed inside the game shell, not the browser page.
- Overlay inset covers the shell and uses 8% padding.
- Coach frame height: 82%.
- Frame is translated upward by 4.9%.
- Only the Coach card content scrolls.
- Card padding: 18 px 15 px 46 px.
- Close button remains fixed at the frame's upper-right.
- Small patient image and case header precede quote, six vitals, triage note,
  placement comparison, outcome explanation, and suggestion.
- A `MORE BELOW` control appears when content exceeds the viewport by more than
  4 px and disappears within 4 px of the bottom.
- Activating the control scrolls by 70% of the card's visible height.
- Escape, outside-overlay click, and Close dismiss Coach.

Coach is unavailable until a real room choice is made. Coach language and each
patient's `why` text are prototype-authored and require clinical review.

## Prototype patient subset

The prototype embeds 13 hand-authored cases in `app.js` rather than consuming
the operational patient JSON library:

| Intended answer | Count |
|---|---:|
| ESI 1 | 2 |
| ESI 2 | 1 |
| ESI 3 | 2 |
| ESI 4 | 2 |
| ESI 5 | 2 |
| Psych | 2 |
| Discharge | 2 |

Each embedded patient includes:

```text
id, name, age, sex, complaint, quote, presentation,
vitals { hr, bp, rr, spo2, temp, pain },
answer, underlying esi, why
```

The production app must use reviewed data from `patient-data/` instead of
promoting this embedded subset.

## Visual tokens

### Font stacks

- Primary condensed UI: `"Arial Narrow", "Roboto Condensed", Arial, sans-serif`.
- General explanatory text: Arial, sans-serif.
- Patient quote: Georgia, serif.
- Arrow emphasis: `"Arial Black", Arial, sans-serif`.
- Responsive typography uses `clamp()` with container-query width (`cqw`).

### Named CSS colors

| Token | Value | Prototype use |
|---|---|---|
| `--navy-950` | `#031019` | Deep shell and labels |
| `--navy-900` | `#071c29` | Dark structure |
| `--navy-800` | `#0b2d3e` | Blue structural surface |
| `--steel` | `#91a1a8` | Borders and plaques |
| `--cream` | `#efe6d6` | Institutional paper tone |
| `--orange` | `#ff9f1c` | Brand and directional arrows |
| `--cyan` / `--acceptable` | `#12a8df` | Active mode and Acceptable |
| `--green` | `#27c978` | Correct |
| `--light-green` | `#8fe3a8` | Intended-room reveal |
| `--amber` | `#f0a329` | Close |
| `--red` | `#ef4b3f` | Wrong |

Important additional colors include queue runner `#778c8e`, header border
`#59707a`, clipboard brown `#8a4c16`, alert red `#c72d25`, and watch amber
`#b46a00`.

## Asset inventory

### Backgrounds

| Asset | Natural dimensions | Use |
|---|---:|---|
| `door-wall.png` | 238 × 240 | Queue wall and every room cell |
| `patient-hall.png` | 604 × 1680 | Center patient-panel background |
| `waiting/waiting-01.png` through `waiting-16.png` | 238 × 336 each | Random queue backgrounds |
| `waiting-room.png` | 238 × 336 | Legacy duplicate; not referenced by current JS |

### Doors

- All ESI closed/open, Psych closed/open, and Discharge open files are
  144 × 224.
- `discharge-closed.png` is 1055 × 1491, an inconsistent source dimension that
  CSS currently stretches into the same door box.
- Door filenames follow `{room}-closed.png` and `{room}-open.png`.

### Patients

- Thirteen transparent PNGs are bundled.
- `patient-001`, `patient-004`, and `patient-013` are 1024 × 1024.
- The other ten are 1254 × 1254.
- These files are byte-identical copies of the corresponding authoritative
  patient images, retained locally so `_testAppMobile/` remains self-contained.

## Accessibility behaviors already demonstrated

- Landmark labels for queue, patient panel, rooms, vitals, and presentation.
- Semantic buttons for all actions and treatment choices.
- Live regions for status and assertive result feedback.
- Text and symbols accompany feedback colors and sounds.
- Room definitions are available by focus as well as hover/hold.
- Visible keyboard focus on room buttons.
- Room open state exposed through `aria-pressed`.
- Coach uses a modal-dialog role and labeled title.
- Patient evidence is marked `aria-hidden` while visually cleared.
- Sound state uses `aria-pressed` and a changing accessible label.
- Reduced-motion handling is present.

The prototype has not undergone a complete accessibility audit. Focus trapping,
focus restoration after Coach, full keyboard flow, contrast, zoom behavior,
and screen-reader testing remain production work.

## Known prototype limitations

- No production build or module structure.
- Patient data is embedded and clinically unreviewed for the new answer model.
- No production patient manifest.
- No persistence, analytics, session history, or end-of-round state.
- Timer loops rather than completing a round.
- Next button is decorative/disabled.
- Queue and patient image framing is not artwork-aware.
- Complaint strip can overlap patient feet.
- Open-room art cannot layer an assigned patient between equipment and the
  foreground door/frame.
- Door-open changes are image swaps, not true door motion.
- `discharge-closed.png` has inconsistent source dimensions.
- Some source text currently exhibits character-encoding mojibake and should
  be normalized during production work.
- Coach wording, outcome rules, scoring, and vital highlighting are provisional.

## Production promotion checklist

Before reproducing a prototype behavior in the production app:

1. Decide whether it is approved, provisional, or purely incidental.
2. Record approved rules in the relevant current technical document.
3. Move reusable visual values into production CSS custom properties.
4. Load patient content from `patient-data/`.
5. Use production assets from `triageRush-app/assets/`.
6. Add behavioral tests for queue, swap, assignment, recall, scoring, Coach,
   hover/hold, and mode switching.
7. Verify mobile safe viewport behavior on supported devices.
8. Perform clinical, accessibility, and content review.

## Updating this reference

When `_testAppMobile/` is refined:

1. Update the prototype source first.
2. Compare the changed selectors, state variables, rules, and assets against
   this document.
3. Update this file for small changes or add a newer dated specification for a
   substantial redesign.
4. Keep older dated specifications when they remain useful for understanding
   the timeline.
5. Do not let prototype updates silently change production requirements.
