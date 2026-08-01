# Coach and Patient Review Panel

**Status:** Coach design accepted as the working pattern, except for final
vital-value positioning  
**Applies to:** The shared detailed-patient chart used during presentation,
post-decision Coach, and future Patient Review

## Purpose

The Coach panel explains the game's triage decision after the player assigns a
patient. It is not a diagnosis screen. Its primary job is to answer:

> Why is this the correct ESI level, based on the information the player had?

The game uses one detailed patient-chart component for every context. Before a
room assignment it exposes only the presentation section. Coach is the
immediate post-decision mode with all three sections exposed; Patient Review is
the later historical use of the same component.

## Application-controlled section switches

The schema supplies `patient.presentation`, `patient.answer`, and
`patient.clinical`. It does not store display state. Application presets expose
the appropriate sections:

```text
Before assignment: presentation ON, answer OFF, clinical OFF
After assignment:  presentation ON, answer ON,  clinical ON
```

The presentation section always begins with the full-size patient image. The
application must not maintain a second detailed-patient popup or a separate
small-image Coach layout.

## Evidence and teaching rules

- Explain an ESI decision, not a final diagnosis.
- Use only the image, demographics, quote, vital signs, presentation, and
  reasonable inferences available from them.
- Never justify the answer with a hidden symptom, test result, diagnosis, or
  later event the player could not have known.
- Keep the authoritative game answer separate from educational explanation.
- Show possible diagnoses only after the ESI explanation and clearly identify
  them as possibilities.
- Preserve `(maybe)` on the occasional lower-risk possibility. It acknowledges
  uncertainty without making the least-serious explanation a reason to
  under-triage.

The complete patient-writing rules live in
`patient-data/schema/patient-schema-notes.md`.

## Three information levels

The chart deliberately separates three kinds of information. They remain part
of one hospital-chart presentation, but each has its own background color and
section header treatment.

### 1. Information available at triage

This warm, paper-toned group contains only what the player already knew:

1. Patient image
2. Name, age, sex, and chief complaint
3. Patient quote
4. Vital signs
5. Triage note or presentation

The quote uses the simpler cream statement card from the earlier Coach design.
Vital signs retain the icons and visual language from the main patient panel.
The Triage Note is an ordinary chart section; it does not use another
clipboard graphic because the entire popup is already a patient clipboard.

Temperature uses Celsius as the primary value and places the Fahrenheit value
after a slash. Both values include their unit and use one decimal place:

```text
37.0°C / 98.6°F
```

The Celsius value comes from the patient record. The application derives the
Fahrenheit value with `(C × 9 / 5) + 32`; patient JSON should not store a
duplicate Fahrenheit temperature. This display rule applies to both Coach and
Patient Review.

### 2. Your triage decision

This amber decision group is visually distinct because it contains the
player's action and the answer rather than patient evidence. It shows:

- The destination the player assigned
- The correct ESI level
- One fixed evaluation message: correct, over-triaged, under-triaged, or
  incorrect destination

The correct ESI is intentionally not shown beside the patient name. The player
first sees the original evidence, followed by their decision and its
evaluation.

ESI numbers run opposite to urgency. Assigning ESI 2 when ESI 4 is correct is
over-triage; assigning ESI 5 is under-triage. This comparison belongs in shared
application logic, not patient prose.

### 3. Clinical explanation

This cool blue chart group contains the educational material:

1. **Why this triage level?**
   - Summary
   - Acuity reason
   - Why this destination, as a subordinate paragraph in the same section
2. **Expected resources**
3. **Key findings available to you**
4. **Red flags**, only when present
5. **Remember**, containing reusable teaching points
6. **Possible clinical outcomes**
   - Fixed diagnosis disclaimer
   - Ordered possible-diagnosis list
   - Possible disposition

The Possible Clinical Outcomes section is supplementary. It must never appear
to be evidence that the player needed in order to make the original decision.

The application-owned disclaimer currently reads:

> Possible diagnoses are only possibilities. They are included to help you
> reflect on what the patient's eventual clinical outcome might be. They do
> not represent a confirmed diagnosis and were not required to make the triage
> decision.

## Data mapping

Schema 2.1 maps the patient record as follows:

| Displayed content | Source |
|---|---|
| Image | Local patient image selected by patient ID |
| Name, age, sex | `patient.presentation.personal` |
| Chief complaint | `patient.presentation.chiefComplaint` |
| Quote | `patient.presentation.quote` |
| Triage note | `patient.presentation.triageNote` |
| Vital signs | `patient.presentation.vitals`; temperature is stored in Celsius and displayed as `37.0°C / 98.6°F` |
| Correct level | `patient.answer.correctEsi` |
| Correct room | `patient.answer.correctRoom` |
| Why this level | `patient.clinical.summary` and `acuityReason` |
| Why this destination | `patient.clinical.destinationReason` |
| Expected resources | `patient.clinical.expectedResources[]` |
| Key findings | `patient.clinical.keyFindings[]` |
| Optional red flags | `patient.clinical.redFlags[]` or `null` |
| Remember | `patient.clinical.teachingPoints[]` |
| Possible diagnoses | `patient.clinical.possibleClinicalOutcome.possibleDiagnoses[]` |
| Possible disposition | `patient.clinical.possibleClinicalOutcome.disposition` |
| Player assignment | Current game/session decision, not patient JSON |

Patient-authored prose is displayed as written. The application supplies
headings, the possible-diagnosis disclaimer, and evaluation messages. It
should not repair punctuation, concatenate sentence fragments, or rewrite
clinical explanations at runtime.

## Popup geometry and visual treatment

- The popup fills most of the available screen while retaining a narrow dark
  margin around the chart.
- The current frame uses the established large-popup scale: approximately 94%
  of the overlay height, with a 3% outer inset.
- The frame resembles a hospital clipboard or paper chart: metal clip, paper
  rules, subtle wear, restrained institutional colors, and compact chart
  typography.
- The outer Coach close control is a fixed red box at the upper-right of the
  chart frame. It remains available while the chart scrolls.
- Section colors communicate information ownership; they are not separate UI
  design systems.

## Scrolling behavior

The chart body scrolls while navigation controls remain anchored to the frame.

- Scrolling is smooth.
- **MORE BELOW** appears at the bottom only when additional content is below
  the viewport.
- **MORE ABOVE** appears at the top only after the chart has moved away from
  the top.
- Each control scrolls about 70% of the visible chart height.
- A control disappears when it has nothing useful to do.
- The red close control remains fixed and does not scroll with the content.
- Opening the panel begins at the top.

## Patient-image viewer

The patient thumbnail is a button, indicated by a small plus badge. Activating
it opens a large, nearly full-screen patient image above the Coach panel.

- The image viewer uses the same large-popup visual scale.
- Its red close box is inside the image card at the upper-right.
- Closing it returns focus to the patient thumbnail.
- The underlying Coach panel remains open at the same scroll position.
- Escape closes the image viewer first; a subsequent Escape closes Coach.
- Clicking the dark image-viewer backdrop also closes the image viewer.

## Responsive behavior

The same content hierarchy and interaction rules apply in wide and compact
layouts. The component changes size with the viewport; it does not reorder the
meaning of the chart. The Coach body remains independently scrollable when its
content exceeds the available height.

## Current implementation

- `index.html` contains the three groups, anchored controls, and image viewer.
- `styles.css` contains the chart, group, scroll-control, and image-viewer
  presentation.
- `app.js` loads draft-schema data, renders the chart, evaluates the player's
  choice, controls scrolling, and opens or closes the two overlays.
- `assets.js` resolves local patient JSON and image paths.
- The active preview rotation uses local draft-schema patients 001 through
  010. Production patient files are not modified or loaded at runtime.

Important application functions include:

- `openCoach()`
- `closeCoach()`
- `renderCoachList()`
- `getTriageDirection()`
- `evaluateTriageChoice()`
- `updateCoachScrollHint()`
- `openCoachImage()`
- `closeCoachImage()`

## Reuse for Patient Review

Patient Review should reuse this component rather than develop a second visual
language. The reusable core is:

- Patient evidence group
- Decision comparison group
- Clinical explanation group
- Field mapping and information order
- Possible-diagnosis disclaimer
- Conditional sections
- Anchored close and scroll controls
- Enlarged patient-image behavior

The primary difference will be where session data comes from. Coach uses the
decision just made. Patient Review will use the selected historical patient
assignment stored in shift/session history. If a review exists without a
recorded player assignment, the decision group may need an explicit
review-only state; it must not fabricate a choice.

Patient Review may add historical context such as shift, score, or time, but
those additions should sit outside the reusable clinical explanation and must
not change the meaning or order of its patient reasoning.

## Known remaining work

1. Precisely align each numeric vital value with its icon/background location,
   including enough room for the paired `37.0°C / 98.6°F` temperature display.
2. Confirm final behavior for Psych and Discharge assignments when the special
   destination and numeric ESI both matter.
3. Confirm whether each viewport should use short or long quote/presentation
   fields.
4. Review clinical wording and evidence fairness before migrating production
   patient records.
5. Extract the Coach implementation into a shared Coach/Patient Review
   component when production architecture is designed.

The current vital-number positions are acceptable for layout development but
are explicitly not final.
