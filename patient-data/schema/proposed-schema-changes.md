# Proposed Patient Schema Changes

**Status:** Discussion draft only  
**Created:** 2026-07-31  
**Scope:** Patient explanations for Coach and future patient-review views

This document records a proposed redesign of the explanatory portion of the
patient schema. It does not change the current schema version and does not yet
authorize migration of the 160 patient records.

## Purpose

The player is not being asked to diagnose the patient. The player's task is to
assign the appropriate triage level and destination. The patient record must
therefore be able to explain why the game considers a particular ESI level
correct.

The existing `answer` object remains the authoritative game answer used for
assignment and scoring. The proposed `triageReasoning` object is educational
content only. It must not determine or modify scoring behavior.

`triageReasoning` is intended for:

- The Coach panel shown after a patient has been assigned.
- Patient-review cards shown during or after a shift.
- A future End of Shift Report or detailed patient-summary view.

## Core evidence rule

Every statement in `triageReasoning` must be directly supported by information
that was available to the player when the triage decision was made, or by a
reasonable clinical inference that can itself be explained from that
information.

Player-visible evidence includes:

- The patient image.
- Personal and demographic information shown to the player.
- The patient or accompanying-person quote.
- Vital signs.
- The clinical presentation.

The explanation must not rely on a hidden diagnosis, undisclosed symptom,
unseen test result, later clinical event, or other fact that was unavailable to
the player.

A familiar medication may reasonably suggest the condition for which it is
commonly used. It may not be used to invent symptoms, deterioration, or test
results that were not presented.

All clues necessary for a fair triage decision must continue to appear in the
image, demographics, vitals, `quoteShort`, or `presentationShort`. Long fields
may elaborate, but they must not introduce the only clue that justifies the
correct ESI level.

## Clinical text retained for now

Retain all four current clinical text fields until production layouts show
whether both versions remain necessary:

- `quoteShort`
- `quoteLong`
- `presentationShort`
- `presentationLong`

Short and long values must be deliberately authored variants. A short value
must not be produced by blindly truncating its long counterpart.

## Proposed structural change

Replace the current `patient.diagnosis` object with a `patient.triageReasoning`
object organized around the ESI decision rather than a final diagnosis.

Proposed representative structure:

```json
"triageReasoning": {
  "correctEsi": 4,
  "summary": "Stable patient with an isolated injury requiring one diagnostic resource.",
  "acuityReason": "No immediate life threat, high-risk feature, or severe distress.",
  "expectedResources": [
    "Ankle X-ray"
  ],
  "destinationReason": "Appropriate for ESI 4 / Fast Track.",
  "keyFindings": [
    "Painful weight-bearing after an inversion injury",
    "Neurovascularly intact",
    "Stable vital signs"
  ],
  "redFlags": null,
  "teachingPoints": [
    "ESI is based on acuity and expected resources, not the final diagnosis.",
    "One anticipated imaging resource supports ESI 4."
  ],
  "possibleClinicalOutcome": {
    "possibleDiagnoses": [
      "Distal fibular fracture",
      "Salter-Harris physeal injury",
      "(maybe) Lateral ankle sprain"
    ],
    "disposition": "An ankle X-ray would likely be followed by splinting, RICE, and discharge if no unstable injury is identified."
  }
}
```

### Why `correctEsi` is used

The field is named `correctEsi`, not `assignedEsi`, because the player's
assignment is recorded separately in shift or session history. Using
`assignedEsi` in the patient record would become ambiguous once a review shows
both values.

The application compares the player's recorded choice with `correctEsi` for
educational presentation. The `answer` object remains authoritative for game
assignment and scoring.

### Possible clinical outcome

`possibleClinicalOutcome` is supplementary information shown after the ESI
reasoning. It is not evidence used to determine the triage level.

`possibleDiagnoses` is one ordered, display-ready list because several outcomes
may be reasonably possible at triage. Conditions that create the need for the
assigned ESI level appear first. One or two obvious lower-risk alternatives may
follow with the exact prefix `(maybe)`. The lower-risk entries acknowledge
uncertainty without suggesting that the player should assume the least serious
explanation. No listed diagnosis is confirmed.

`disposition` describes a plausible or typical next course. It must not invent
a confirmed result or claim that an uncertain event has already happened.

## Field-writing contracts

The Coach and review views should behave like an old form letter. Patient JSON
replaces predefined sections of the page. The application should not need to
repair grammar, rewrite clinical prose, or decide where punctuation belongs.

### `correctEsi`

- Integer from 1 through 5.
- Represents the correct clinical ESI level even when a special destination
  such as Psych or Discharge is also an acceptable assignment.
- Must be consistent with the patient evidence and game answer.

### `summary`

- One complete sentence.
- Concisely states the central reason for the ESI assignment.
- Begins with a capital letter and includes final punctuation.
- Must stand alone without boilerplate being added before or after it.

### `acuityReason`

- One or more complete sentences.
- Explains immediate acuity, instability, high-risk features, distress, or the
  absence of those findings.
- Begins with a capital letter and includes final punctuation.
- Must refer only to visible evidence or reasonable inference.

### `expectedResources`

- Array of short noun phrases.
- Contains the resources reasonably expected when assigning the ESI level.
- Items do not include terminal punctuation.
- Use an empty array when no resources are expected unless a future schema
  version defines a different nullable rule.

### `destinationReason`

- One or more complete sentences.
- Explains why the correct room or special destination is appropriate.
- Begins with a capital letter and includes final punctuation.
- Must not merely repeat `summary`.

### `keyFindings`

- Array of concise evidence phrases.
- Contains the specific findings that were available to the player and support
  the ESI decision.
- Items do not include terminal punctuation.
- Every item must be traceable to the image, quote, vitals, presentation, or a
  reasonable inference from those sources.

### `redFlags`

- `null` when no separate red-flag list is needed, or an array of concise
  evidence phrases when red flags are present.
- Items do not include terminal punctuation.
- Omit the rendered RED FLAGS section when the value is `null` or empty.
- Red flags must have been visible or reasonably inferable before assignment.

### `teachingPoints`

- Array of complete, display-ready sentences.
- Each item begins with a capital letter and includes final punctuation.
- Explains reusable ESI principles or corrects a likely misconception.
- Must remain relevant to this patient's evidence and decision.

### `possibleClinicalOutcome.possibleDiagnoses`

- One ordered array of display-ready diagnosis names or short diagnostic
  phrases.
- Conditions that drive the triage decision appear first, even when they are
  not necessarily the statistically most likely outcome.
- An obvious lower-risk alternative may be included with the exact prefix
  `(maybe)`, for example `(maybe) Gastritis`.
- Use `(maybe)` sparingly and ordinarily limit it to one or two entries.
- A `(maybe)` entry acknowledges uncertainty but never weakens the ESI
  explanation or makes Discharge appropriate before serious conditions are
  evaluated.
- Items do not include terminal punctuation.
- Include only possibilities reasonably supported by the presented evidence.
- Do not imply that any diagnosis is confirmed.

### `possibleClinicalOutcome.disposition`

- One or more complete, display-ready sentences.
- Begins with a capital letter and includes final punctuation.
- Describes a plausible or typical disposition.
- Uses conditional language when an outcome depends on testing or later care.
- Must not claim that an unseen test result or later event has already occurred.

## Proposed Coach and review form letter

The application should render fixed headings, patient-specific fields, and
session-specific decision data in the following order.

```text
[BASIC PATIENT INFORMATION]

{image}
{personal information}
{quote}
{vitals}
{presentation}


YOUR DECISION

You assigned this patient to {playerDestination}.
{evaluationMessage}

Correct triage level: ESI {correctEsi}


WHY THIS TRIAGE LEVEL?

{summary}

{acuityReason}


Why this destination?

{destinationReason}


EXPECTED RESOURCES

• {expectedResources[]}


KEY FINDINGS AVAILABLE TO YOU

• {keyFindings[]}


RED FLAGS

• {redFlags[]}


REMEMBER

• {teachingPoints[]}


POSSIBLE CLINICAL OUTCOMES

Possible diagnoses are only possibilities. They are included to help you
reflect on what the patient's eventual clinical outcome might be. They do not
represent a confirmed diagnosis and were not required to make the triage
decision.

Possible diagnoses:

• {possibleDiagnoses[]}

{disposition}
```

## Application-supplied evaluation messages

The player's assignment and evaluation belong to shift or session history,
not to the patient JSON. The application selects the appropriate fixed message:

```text
You correctly triaged this patient.
You over-triaged this patient.
You under-triaged this patient.
You assigned this patient to an incorrect destination.
```

ESI numbers run opposite to urgency. Selecting ESI 2 for a patient whose
correct level is ESI 4 is over-triage. Selecting ESI 5 is under-triage. This
comparison must be centralized in application code so the language cannot be
accidentally reversed.

Special-room assignments may require additional presentation rules. Those
rules should be settled alongside the final scoring and recall behavior rather
than embedded independently in individual patient explanations.

## Rendering rules

- Render prose fields exactly as authored.
- Do not concatenate fragments into new clinical sentences.
- Do not automatically add or remove capitalization or punctuation.
- Render array fields as semantic lists rather than joining them into prose.
- Omit optional sections cleanly when their value is `null` or empty.
- Keep fixed headings and evaluation messages in application-owned content.
- Keep clinical reasoning and patient-specific educational content in the
  patient JSON.
- Coach and review may use different visual layouts, but they should preserve
  the same information order and meaning.
- The possible clinical outcome must appear after the ESI explanation and must
  not be presented as evidence used to make the triage decision.
- The application owns and displays the fixed possible-diagnosis disclaimer
  immediately before the list. It is not repeated in patient JSON.
- Preserve the literal `(maybe)` prefix on lower-risk possibilities.

## Validation rules proposed for a future schema version

A future migration and validator should verify at least:

- `correctEsi` is an integer from 1 through 5.
- Required prose fields are non-empty strings with capitalization and terminal
  punctuation.
- Required arrays exist and contain only non-empty strings.
- Phrase-list fields do not contain unintended terminal punctuation.
- `redFlags` is either `null` or an array of non-empty strings.
- `possibleDiagnoses` contains at least one reasonable possibility when a
  possible clinical outcome is supplied.
- Every `(maybe)` entry follows all non-prefixed entries, uses the exact prefix,
  and remains reasonably supported by player-visible evidence.
- `correctEsi`, `answer.correctRoom`, expected resources, destination reason,
  and patient-visible evidence are clinically and logically consistent.
- No explanatory field contains a hidden fact that was unavailable or could
  not reasonably be inferred by the player.
- Long clinical fields do not introduce the only placement-critical clue.
- Text fits and remains readable in the Coach and review layouts.

Structural checks can be automated. Evidence fairness, inference quality,
clinical accuracy, writing quality, and visual fit require human review.

## Decisions still required before implementation

- Final field names and nullable-versus-empty-array rules.
- Whether `redFlags` should always be an array rather than nullable.
- Whether source attribution should be stored for individual `keyFindings`.
- How Coach presents Psych and Discharge assignments alongside `correctEsi`.
- Whether Coach uses short or long quote and presentation variants in each
  viewport.
- Exact terminology for correct, close, over-triaged, under-triaged, and wrong
  decisions under Strict and Forgiving scoring.
- Whether all possible outcomes require a disposition.
- The future schema version number and complete migration procedure.

No schema or patient-data migration should begin until these rules and the
form-letter presentation have been reviewed and approved.
