# Patient schema specification and version history

This document records the validation rules for patient records in
`patient-data/patient-json/`. The adjacent `patient-schema-template.json` is the
representative patient template and field reference. Validation requirements
belong here rather than as data inside that JSON template.

## Current version

> **Current schema: version 2.2 — established 2026-08-01**

The version and date are recorded in the `schema` object at the beginning of
`patient-schema-template.json`.

## Definitive version 2.2 specification

This section is the complete, authoritative contract for schema version 2.2.
The adjacent `patient-schema-template.json` is the canonical structural
example. Version 2.1 and earlier specifications remain below as history.

### Purpose and information boundary

Version 2.2 retains the three patient sections introduced by 2.1 while
correcting their information boundary:

- `patient.presentation` is the immutable evidence package available for the
  triage decision.
- `patient.clinical` is a faithful clinical interpretation of that evidence.
  It may be available before assignment, so it must not explicitly state or
  identify the correct ESI level or destination.
- `patient.answer` is the authoritative answer-bearing section. It contains the
  correct ESI, correct destination, and explicit destination rationale.

The schema defines content. The application controls whether sections are
locked, collapsed, or expanded. Panel state is never patient data.

### Required structure and metadata

Every record contains `schema`, `id`, `number`, `johnsComments`, the three
required `patient` sections, and `aiImageGeneration`. Legacy locations such as
top-level `answer`, `patient.personal`, `patient.image`, `patient.vitals`,
`patient.diagnosis`, and `patient.triageReasoning` are not permitted.

- Files are valid UTF-8 JSON without mojibake or replacement characters.
- Filename and `id` use `patient-NNN.json` and `patient-NNN`.
- `number` equals the numeric portion of the filename and ID.
- IDs and numbers are unique and each record has a matching patient image.
- `schema.version` is exactly `"2.2"`.
- `schema.date` is exactly `"2026-08-01"`.
- `johnsComments` is a string and may be empty.

### `patient.presentation`

Presentation is the complete evidence package and contains `_comment`,
`personal`, `image`, `chiefComplaint`, `quote`, `triageNote`, and `vitals`.
`quote` and `triageNote` are the single authoritative text versions and must be
non-empty and consistent with all other patient content.

All placement-critical evidence must appear in Presentation. Neither Clinical
nor Answer may repair an underspecified case by introducing a fact the player
did not receive.

All six vital entries—`hr`, `bp`, `rr`, `spo2`, `temp`, and `pain`—are required.
Each contains `value` and `color` using the template types. Temperature is
stored in Celsius; the application derives Fahrenheit.

### `patient.answer`

Answer contains `_comment`, `correctEsi`, `correctRoom`,
`otherAcceptableRooms`, and `destinationReason`.

`correctEsi` is the authoritative integer from 1 through 5. `correctRoom` is
one of `esi-1`, `esi-2`, `esi-3`, `esi-4`, `esi-5`, `psych`, or `discharge`.
An ordinary room's suffix equals `correctEsi`; Psych and Discharge retain a
clinically valid underlying ESI. `otherAcceptableRooms` remains required and
`null` until a later version defines non-null semantics.

`destinationReason` is required answer-bearing prose. It explicitly explains
why the correct ESI or special destination applies and may name it. It is never
stored under Clinical. The player's assignment remains session data and is
never written into the patient record.

### `patient.clinical`

Clinical contains `_comment`, `summary`, `acuityReason`, `expectedResources`,
`keyFindings`, `redFlags`, `teachingPoints`, and
`possibleClinicalOutcome.possibleDiagnoses` plus
`possibleClinicalOutcome.disposition`. `destinationReason` is not permitted.

Clinical may explain severity, stability, risk, immediate needs, expected
resources, red flags, diagnostic possibilities, and likely care. It may help a
player reason toward an answer. It must not explicitly name an ESI level, ESI
room identifier, or correct special destination, and must not use phrasing
whose only function is to announce that answer.

Removing answer language must not remove or weaken the underlying medicine.
For example, an immediate lifesaving intervention remains important Clinical
information even though the text must not append an ESI number.

Prose fields are complete and punctuated; resource and finding lists use
concise phrases; `redFlags` is `null` when no separate list is useful; serious
possibilities precede lower-risk alternatives; and lower-risk alternatives use
the exact `(maybe)` prefix. Possible outcomes are conditional educational
content, never confirmed facts or evidence required for the original decision.

### Clinical-fidelity and anti-creep contract

Migration and later editing must preserve clinical meaning. An editor must not
gradually simplify, sharpen, embellish, or drift a case by rewriting only from
the latest derivative version.

For every migrated or materially revised patient:

1. Review the designated source record, matching source image, authoritative
   answer, and approved source notes. Never use the preceding rewrite as the
   sole clinical source.
2. Maintain an external evidence ledger covering mechanism and timeline,
   symptoms, pertinent negatives, vitals, examination findings, severity,
   instability, expected resources, red flags, correct ESI, destination, and
   intentional ambiguity.
3. Classify every material Clinical assertion as directly presented,
   reasonably inferable from Presentation, a possible later outcome, or
   general teaching information.
4. Reject a new placement-critical fact that is absent from Presentation.
5. Reject removal, weakening, or exaggeration of a source clinical fact unless
   a separately documented clinical decision intentionally corrects it.
6. Treat moving explicit answer language separately from editing the underlying
   clinical reasoning.
7. Perform a three-way comparison of source, evidence ledger, and proposed
   record. Document preserved facts, moved answer language, new inferences,
   clinical corrections, and unresolved questions.

Evidence ledgers and review logs are migration artifacts. They do not belong
inside patient JSON and are not displayed by the application.

### Core evidence rule

Every patient-specific fact in Clinical is directly present in Presentation or
reasonably inferable from it. Clinical must not depend on an undisclosed
symptom, hidden diagnosis, unseen test result, later deterioration, response to
treatment, or another event unavailable at assignment time.

Possible outcomes may describe what later evaluation could find or what care
might follow, but must use conditional language and cannot retroactively
justify the original assignment.

### Detailed-patient panel contract

One reusable component renders three sections in three named contexts. Each
context owns an independent in-memory view profile:

```text
PATIENT ASSIGNMENT
  presentation: unlocked, expanded
  answer:       locked (therefore collapsed)
  clinical:     unlocked, collapsed

PATIENT-ROOM
  presentation: unlocked, expanded
  answer:       unlocked, collapsed
  clinical:     unlocked, collapsed

PATIENT-REVIEW
  presentation: unlocked, expanded
  answer:       unlocked, expanded
  clinical:     unlocked, expanded
```

Locked always implies collapsed; locked content cannot be expanded or shown.
Application rules control access and the player cannot unlock restricted
content.

For unlocked sections, expansion changes persist across patients only within
the same context. They remain in memory for the current game and are never
stored in patient JSON, local storage, or persistent settings. Game reset, page
reload, tab closure, or application restart restores the hard-coded defaults.
A future Reset All Settings command may restore the same defaults during play.

Every section header remains visible. Activating a locked header leaves it
closed and displays `This section is locked`. Anchored Close, conditional
`MORE ABOVE` and `MORE BELOW`, smooth scrolling, and timer pause remain part of
the shared component behavior.

### Version 2.2 validation

A record is valid only when:

- Version and date match 2.2.
- All required fields exist with correct types.
- `destinationReason` exists only under Answer.
- Presentation contains non-empty `quote` and `triageNote` values.
- No legacy short/long variants or legacy data locations remain.
- `correctEsi` and an ordinary `correctRoom` agree.
- Clinical strings contain no explicit ESI level or correct room name.
- Every Clinical assertion is traceable under the evidence contract.
- The matching patient image exists.
- Intentional source corrections are documented by clinical review.

Structural and leakage checks may be automated. Clinical fidelity, fairness,
writing quality, and visual presentation require human review.

### Change from version 2.1

- Moved `patient.clinical.destinationReason` to
  `patient.answer.destinationReason`.
- Permitted Clinical before assignment while forbidding it from explicitly
  identifying the answer.
- Added the clinical-fidelity and anti-creep contract.
- Defined the three named panel contexts and their independent in-memory view
  profiles.
- Did not change scoring semantics or authoritative answer values.

## Superseded version 2.1 specification

This section is the complete, authoritative contract for schema version 2.1.
The adjacent `patient-schema-template.json` is the canonical structural
example. Older specifications later in this document are retained only as
version history.

### Purpose and display boundary

Version 2.1 makes the detailed-patient display boundary explicit. All patient
content that may be exposed by that display lives in one top-level `patient`
object with exactly three application-facing sections:

- `patient.presentation`: everything available before the player assigns a room
- `patient.answer`: the authoritative correct answer
- `patient.clinical`: post-answer educational reasoning and possible outcomes

The application decides which of these sections are visible. Display switches
are application state and are never stored in a patient JSON file.

Administrative fields such as `schema`, `id`, `number`, `johnsComments`, and
`aiImageGeneration` remain outside `patient` and are never rendered in the
detailed-patient display.

### Required record structure

Every version 2.1 record contains:

- `schema`
- `id`
- `number`
- `johnsComments`
- `patient._comment`
- `patient.presentation`
- `patient.answer`
- `patient.clinical`
- `aiImageGeneration`

The former top-level `answer`, `patient.clinical` text container from 2.0,
`patient.vitals`, `patient.personal`, `patient.image`, and
`patient.triageReasoning` locations are not permitted in a 2.1 record.

### File, identity, and schema metadata

- Each file is valid UTF-8 JSON without mojibake or replacement characters.
- The filename and `id` use `patient-NNN.json` and `patient-NNN` respectively.
- `number` equals the numeric portion of the filename and `id`.
- Patient IDs and numbers are unique.
- Every record has a matching `patient-images/patient-NNN.png` image.
- `schema.version` is exactly `"2.1"`.
- `schema.date` is exactly `"2026-07-31"`.
- `johnsComments` is a string and may be empty.

### `patient.presentation`

This section is the complete evidence package available before assignment. It
contains:

- `_comment`
- `personal`
- `image`
- `chiefComplaint`
- `quote`
- `triageNote`
- `vitals`

`quote` and `triageNote` are the single authoritative versions of those texts.
Version 2.1 does not contain short and long variants. The compact patient panel
may fit the complete text to its available space, and the player may open the
detailed panel when a larger presentation is needed.

The quote must sound like the patient or an explicitly identified accompanying
speaker. The triage note must be concise, clinically coherent, and consistent
with the image, demographics, vitals, answer, and clinical explanation.

All six vital entries—`hr`, `bp`, `rr`, `spo2`, `temp`, and `pain`—are required.
Each contains `value` and `color` using the template types. Temperature is
stored only in Celsius; the application derives Fahrenheit and displays both
to one decimal place.

### `patient.answer`

This section contains:

- `_comment`
- `correctEsi`
- `correctRoom`
- `otherAcceptableRooms`

`correctEsi` is the authoritative underlying ESI integer from 1 through 5.
`correctRoom` is the authoritative scoring destination and uses the production
room identifiers. For ordinary ESI rooms, its numeric suffix equals
`correctEsi`. Psych and Discharge may retain a clinically valid underlying ESI
while naming the special destination. `otherAcceptableRooms` remains required
and is currently `null`.

The player's assigned room or ESI is session data. It must never be written
into the patient JSON. The detailed display combines session data with
`patient.answer` only when its answer section is enabled.

### `patient.clinical`

This section contains display-ready educational content:

- `_comment`
- `summary`
- `acuityReason`
- `expectedResources`
- `destinationReason`
- `keyFindings`
- `redFlags`
- `teachingPoints`
- `possibleClinicalOutcome.possibleDiagnoses`
- `possibleClinicalOutcome.disposition`

It does not participate in scoring. It explains the answer after that answer
is available and supports Coach and later Patient Review displays.

The established version 2.0 writing contracts remain in force: sentences are
complete and punctuated where required; resource and finding lists use concise
phrases; `redFlags` is `null` when no separate list is useful; serious possible
diagnoses precede any lower-risk alternatives; and lower-risk alternatives use
the exact `(maybe)` prefix.

Possible diagnoses are never confirmed diagnoses. The application must display
the fixed uncertainty disclaimer before the list and must never use a possible
outcome as evidence the player needed to make the original assignment.

### Core evidence rule

Every fact used by `patient.clinical` to justify `patient.answer.correctEsi`
must be directly present in `patient.presentation` or reasonably inferable from
it. The explanation must not depend on hidden symptoms, an undisclosed final
diagnosis, unseen test results, later deterioration, response to treatment, or
any other fact unavailable at assignment time.

### Detailed-patient display contract

The application uses one detailed-patient component and internal visibility
switches for the three patient sections.

Before the first room assignment:

```text
presentation = ON
answer       = OFF
clinical     = OFF
```

After a room assignment, including Coach access:

```text
presentation = ON
answer       = ON
clinical     = ON
```

The presentation section always begins with the large patient image used by the
former expanded-patient panel. It then presents identity and complaint, quote,
vitals, and triage note. The answer section compares the player's session-state
assignment with the authoritative answer. The clinical section follows with
the complete educational explanation.

The component retains an anchored close control, conditional `MORE ABOVE` and
`MORE BELOW` controls, and smooth scrolling. Opening the detailed panel pauses
the game timer.

### Version 2.1 validation

A record passes structural validation only when:

- Its schema version and date match 2.1.
- It contains all three required `patient` sections.
- `quote` and `triageNote` are non-empty strings.
- No short/long clinical text variants remain.
- No top-level `answer` or `patient.triageReasoning` remains.
- `patient.answer.correctEsi` and `correctRoom` agree.
- All clinical explanation fields are present and correctly typed.
- Every clinical justification is traceable to presentation evidence.
- Its referenced patient image exists.

### Migration from version 2.0

- Move `personal`, `image`, `clinical.chiefComplaint`, `vitals`, the selected
  complete quote, and the selected complete presentation into
  `patient.presentation`.
- Rename the selected complete presentation to `triageNote`.
- Remove `quoteShort`, `quoteLong`, `presentationShort`, and
  `presentationLong` after selecting the complete authoritative texts.
- Move `triageReasoning.correctEsi` and the former top-level answer fields into
  `patient.answer`.
- Move the remaining `triageReasoning` fields into `patient.clinical`.
- Preserve administrative metadata and `aiImageGeneration` outside `patient`.

## Superseded version 2.0 specification

This section is the complete, authoritative contract for schema version 2.0.
The adjacent `patient-schema-template.json` is the canonical structural
example. The version history later in this document explains how the contract
evolved but is not required to reconstruct the current schema.

### Purpose and boundaries

The player assigns a triage level and destination; the player is not asked to
diagnose the patient. Patient JSON therefore separates:

- Player-visible facts used during triage
- The authoritative destination answer used by scoring
- Educational reasoning that explains why the correct ESI applies
- Plausible later clinical outcomes that are never presented as confirmed
  diagnoses

`answer.correctRoom` remains the authoritative destination answer.
`triageReasoning.correctEsi` is the authoritative underlying ESI. The remaining
`triageReasoning` content supports Coach and Patient Review but does not control
scoring.

### Required record structure

Every version 2.0 record contains:

- `schema`
- `id`
- `number`
- `johnsComments`
- `patient.personal`
- `patient.image`
- `patient.clinical`
- `patient.vitals`
- `patient.triageReasoning`
- `answer`
- `aiImageGeneration`

The legacy `patient.diagnosis` object is not permitted in a version 2.0 record.

### File, identity, and schema metadata

- Each file is valid UTF-8 JSON without mojibake or replacement characters.
- The filename and `id` use `patient-NNN.json` and `patient-NNN` respectively.
- `number` equals the numeric portion of the filename and `id`.
- Patient IDs and numbers are unique.
- Every record has a matching `patient-images/patient-NNN.png` image.
- `schema.version` is exactly `"2.0"`.
- `schema.date` is exactly `"2026-07-31"`.
- The schema date describes the data contract, not an individual edit date.
- `johnsComments` is a string and may be empty.

### Personal and image data

- `personal.name` is a non-empty string.
- `personal.age` is a non-negative number representing years unless a future
  schema explicitly introduces another infant-age representation.
- `personal.sex` and `personal.race` use the project's controlled vocabularies.
- `image.imageFilename` matches the patient PNG filename.
- `image.imageFlipped` is a boolean.
- `image.imageScale` is a positive number that produces an acceptable
  composition in the patient panel.

### Clinical text

Version 2.0 retains all four authored clinical text fields:

- `quoteShort`
- `quoteLong`
- `presentationShort`
- `presentationLong`

Current working maximum word counts are:

| Field | Maximum |
|---|---:|
| `quoteShort` | 20 words |
| `quoteLong` | 40 words |
| `presentationShort` | 30 words |
| `presentationLong` | 60 words |

Rules:

- Short and long values are deliberately authored variants, never blind
  truncations.
- All four values must be non-empty strings before a record is considered
  fully migrated. A temporary `null` is allowed only while that patient is
  actively being revised.
- Quotes sound like the patient or identified accompanying speaker.
- Presentations are concise, clinically coherent, and consistent with the
  image, demographics, vitals, answer, and reasoning.
- Text must fit its intended production view. Rendered fit is authoritative
  even when the value is below its word limit.

### Core evidence rule

Every fact used to justify `correctEsi` must be directly available to the
player or reasonably inferable from information the player received.

Player-visible evidence consists of:

- Patient image
- Name and demographics
- Chief complaint and quote
- Vital signs
- Clinical presentation or triage note

The explanation must not rely on an undisclosed symptom, hidden diagnosis,
unseen test result, later deterioration, response to treatment, or any other
fact unavailable at assignment time.

A familiar medication may reasonably suggest the condition it commonly
treats, but it cannot be used to invent symptoms or test results. If an absent
detail is important enough to justify the ESI, it must first be added to the
image, quote, vitals, or presentation.

All placement-critical clues must be present in the image, demographics,
vitals, `quoteShort`, or `presentationShort`. Long fields may elaborate but may
not contain the only clue supporting the correct level.

### Vitals

- All six entries—`hr`, `bp`, `rr`, `spo2`, `temp`, and `pain`—are required.
- Each entry contains `value` and `color` using the types shown in the
  template.
- Values are physiologically plausible and internally consistent with the
  visible presentation and reasoning.
- Colors use the approved game vocabulary and agree with the intended
  severity thresholds.
- Temperature is stored only in Celsius. Coach and Patient Review derive and
  display Fahrenheit as `37.0°C / 98.6°F`, with both values to one decimal
  place.

### `triageReasoning` field contracts

The object is display-ready educational content. The program supplies section
headings and renders these values as written.

#### `_comment`

- Required fixed documentation string copied unchanged from the template.
- Explains the purpose and scoring boundary of `triageReasoning`.
- Ignored by application behavior.

#### `correctEsi`

- Required integer from 1 through 5.
- Represents the correct underlying clinical ESI even when Psych or Discharge
  is the correct special destination.
- Must agree with player-visible evidence, expected resources, and
  `answer.correctRoom`.

#### `summary`

- Required complete sentence with capitalization and terminal punctuation.
- Concisely states the central reason for the ESI assignment.
- Stands alone without application-added introductory prose.

#### `acuityReason`

- Required one or more complete, punctuated sentences.
- Explains immediate acuity, instability, high-risk features, severe distress,
  or the relevant absence of those findings.
- Refers only to visible evidence or a reasonable, explainable inference.

#### `expectedResources`

- Required array of short noun phrases without terminal punctuation.
- Contains the resources reasonably expected when assigning the ESI.
- Uses an empty array when no resources are expected.

#### `destinationReason`

- Required one or more complete, punctuated sentences.
- Explains why the correct ESI room or special destination is appropriate.
- Does not merely repeat `summary`.

#### `keyFindings`

- Required array of concise evidence phrases without terminal punctuation.
- Each item identifies a finding available to the player that supports the ESI
  decision.
- Every item must be traceable to the image, demographics, quote, vitals,
  presentation, or a reasonable inference from them.

#### `redFlags`

- Either `null` or an array of concise phrases without terminal punctuation.
- Uses `null` when no separate red-flag list is needed.
- Every listed red flag was visible or reasonably inferable before assignment.
- The application omits the Red Flags section when this value is `null` or
  empty.

#### `teachingPoints`

- Required array of complete, capitalized, punctuated sentences.
- Explains reusable ESI principles or corrects a likely misconception.
- Remains relevant to this patient's visible evidence and decision.

#### `possibleClinicalOutcome.possibleDiagnoses`

- Required ordered array of non-empty diagnosis names or short diagnostic
  phrases without terminal punctuation.
- Contains plausible outcomes only; no item is a confirmed diagnosis.
- Lists serious triage-driving possibilities first.
- May then include one or two obvious lower-risk alternatives with the exact
  prefix `(maybe)`, such as `(maybe) Gastritis`.
- Every `(maybe)` entry follows all non-prefixed entries.
- `(maybe)` acknowledges uncertainty but never weakens the ESI explanation or
  makes premature discharge appropriate.
- Every possibility is reasonably supported by the presented evidence.

#### `possibleClinicalOutcome.disposition`

- Required one or more complete, capitalized, punctuated sentences.
- Describes a plausible or typical later course.
- Uses conditional language when dependent on testing or later care.
- Never claims an unseen result or uncertain event has already occurred.

### Possible-outcome presentation rule

Possible outcomes appear after all ESI reasoning. They are supplementary and
must never appear to be evidence the player needed for the original decision.

The application displays this fixed disclaimer immediately before the
possible-diagnosis list:

> Possible diagnoses are only possibilities. They are included to help you
> reflect on what the patient's eventual clinical outcome might be. They do
> not represent a confirmed diagnosis and were not required to make the triage
> decision.

The disclaimer belongs to the application and is not repeated in each patient
record.

### Game answer and scoring

- `answer._comment` is the fixed documentation string shown in the template.
- `answer.correctRoom` is one of `esi-1`, `esi-2`, `esi-3`, `esi-4`, `esi-5`,
  `psych`, or `discharge`.
- For ordinary ESI rooms, its numeric suffix equals `correctEsi`.
- Psych and Discharge records retain a clinically valid `correctEsi` for the
  underlying urgency.
- `answer.otherAcceptableRooms` is required and currently `null`.
- Applications ignore `otherAcceptableRooms` until a future schema formally
  defines a non-null override.
- The player's choice belongs to session or shift history, never patient JSON.

The application supplies one of these evaluation messages:

```text
You correctly triaged this patient.
You over-triaged this patient.
You under-triaged this patient.
You assigned this patient to an incorrect destination.
```

ESI numbers run opposite to urgency. Selecting ESI 2 when ESI 4 is correct is
over-triage; selecting ESI 5 is under-triage. This comparison is centralized in
application code.

Special-room and scoring-mode details remain governed by the current scoring
specification in `docs/scoring-specification--2026-07-29-1655.md`.

### Coach and Patient Review display contract

Coach and Patient Review use the same clinical component, information order,
field meaning, and form-letter behavior. Coach reads the just-completed player
decision; Patient Review reads a historical decision from session or shift
history.

```text
INFORMATION AVAILABLE AT TRIAGE

{image}
{personal information}
{quote}
{vitals}
{presentation}


YOUR TRIAGE DECISION

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

{application-owned disclaimer}

Possible diagnoses:

• {possibleDiagnoses[]}

Possible disposition:

{disposition}
```

Rendering rules:

- Render prose exactly as authored.
- Do not concatenate fragments, repair punctuation, or rewrite clinical text.
- Render arrays as semantic lists rather than joining them into prose.
- Omit optional sections cleanly when their value is `null` or empty.
- Keep headings, disclaimers, and evaluation messages in application-owned
  content.
- Preserve the literal `(maybe)` prefix.
- Keep possible outcomes after the ESI explanation.
- Coach and Patient Review may add different historical context but do not
  change the clinical information order or meaning.

### AI image-generation information

- Required generation fields use the names and types demonstrated by the
  template.
- `outputFile` matches `patient.image.imageFilename`.
- The prompt and structured fields describe the same patient, visible signs,
  severity, and composition.
- Referenced anchor images exist within the patient creation workflow.
- Generator-specific paths may belong to the CRUD pipeline and need not be
  runtime paths used by triageRush.

### Version 2.0 validation

Validation has four stages:

1. **Structural:** JSON syntax, required fields, types, controlled vocabulary,
   IDs, filenames, schema metadata, and image pairing.
2. **Content:** word counts, encoding, punctuation contracts, internal
   consistency, physiologic plausibility, and `(maybe)` ordering.
3. **Clinical:** ESI accuracy, routing, evidence fairness, reasonable
   inferences, expected resources, and possible outcomes.
4. **Visual:** text wrapping, image composition, vital-value alignment,
   readability, clipping, and scrolling behavior in Coach and Patient Review.

At minimum, validation verifies:

- `correctEsi` is an integer from 1 through 5.
- Required prose fields are non-empty, capitalized, and punctuated.
- Required arrays exist and contain only non-empty strings.
- Phrase-list fields do not contain unintended terminal punctuation.
- `redFlags` is `null` or an array of non-empty strings.
- Possible diagnoses contain at least one supported possibility.
- Every `(maybe)` entry follows all ordinary entries and uses the exact prefix.
- `correctEsi`, `correctRoom`, resources, destination, visible evidence, and
  reasoning are clinically and logically consistent.
- No explanatory field relies on a hidden fact.
- Long clinical fields do not introduce the only placement-critical clue.
- Text remains readable in the approved Coach and Patient Review layouts.

Structural checks can be automated. Evidence fairness, inference quality,
clinical accuracy, writing quality, and visual fit require human review.

### Application decisions outside the schema

These may be settled without changing the version 2.0 patient record:

- Exact Coach handling of Psych and Discharge alongside `correctEsi`
- Choice of short or long quote and presentation in each viewport
- Mode-specific terminology for correct, close, over-triaged,
  under-triaged, and wrong decisions
- Possible future source attribution for individual `keyFindings`

## Version history

| Version | Date | Summary |
|---|---|---|
| **2.2** | 2026-08-01 | Moved destination rationale into Answer, established pre-answer Clinical boundaries, added anti-creep review rules, and defined three panel contexts |
| **2.1** | 2026-07-31 | Grouped all displayable patient content into presentation, answer, and clinical sections and adopted single quote and triage-note fields |
| **2.0** | 2026-07-31 | Replaced diagnosis-oriented review data with evidence-based ESI reasoning for Coach and Patient Review |
| **1.2** | 2026-07-27 14:54 PDT | Reserved acceptable-room override while moving ordinary scoring logic into code |
| **1.1** | 2026-07-27 14:45 PDT | Removed obsolete game fields and standardized correct-room identifiers |
| **1.0** | 2026-07-27 13:50 PDT | Initial documented patient-record structure and validation baseline |

### How to document future versions

- Keep the newest version at the top of the version-detail sections, directly
  above the preceding version.
- Add every released version to the summary table above, newest first.
- Update the **Current version** callout and the `schema` object in
  `patient-schema-template.json`.
- Update the complete definitive specification near the top of this document
  so readers never need to reconstruct the current contract from history.
- Give each version a clearly visible heading in the form
  `## Version 1.1 — Short description`.
- For version 1.1 and later, document only what changed from the immediately
  preceding version. Do not repeat the complete specification.
- Organize each later entry under the headings **Added**, **Changed**,
  **Deprecated**, **Removed**, **Fixed**, and **Migration notes**, including
  only headings that apply.
- If a version makes no patient-record migration necessary, say so explicitly.
- Never rewrite an older version entry to describe a newer design. Older
  entries are the historical record of what each version established.

Version 1.0 is intentionally long because it records the original baseline.
The version-detail sections are historical change logs; the definitive
specification near the top is always the authoritative current contract.

---

## Version 2.2 — Clinical fidelity and panel contexts

**Established:** 2026-08-01
**Status:** Current

### Added

- Added required `patient.answer.destinationReason`.
- Added the clinical-fidelity and anti-creep contract, including immutable
  source review, external evidence ledgers, assertion classification, and
  three-way comparison.
- Added PATIENT ASSIGNMENT, PATIENT-ROOM, and PATIENT-REVIEW as independent
  application-owned panel contexts with in-memory defaults and preferences.
- Added a canonical schema 2.2 structural and explicit-leakage validator.

### Changed

- Clinical may be available before assignment and therefore cannot explicitly
  identify the correct ESI level or destination.
- Locked sections are always collapsed and cannot be expanded.

### Removed

- Removed `patient.clinical.destinationReason`; its content now belongs to
  `patient.answer.destinationReason`.
- Removed obsolete draft/review datasets and one-off schema migration scripts
  after consolidating the contract.

### Migration notes

- The 160 authoritative production records remain at version 1.2.
- The next patient migration must begin from the preserved version 1.2 source
  and matching images, not from the provisional mobile fixtures or a derivative
  schema rewrite.
- A separate version 2.3 migration plan will define the source inventory,
  evidence-ledger format, review workflow, and acceptance gates before any
  production record is changed.

---

## Version 2.1 — Display-oriented patient sections

**Established:** 2026-07-31
**Status:** Superseded by version 2.2

### Added

- Added the explicit `patient.presentation`, `patient.answer`, and
  `patient.clinical` display sections.
- Added fixed comments documenting each section's exposure and scoring
  boundary.
- Added a single detailed-patient display contract controlled by application
  visibility switches rather than schema state.

### Changed

- Moved all player-visible evidence beneath `patient.presentation`.
- Moved `correctEsi`, `correctRoom`, and `otherAcceptableRooms` beneath
  `patient.answer`.
- Renamed the educational `triageReasoning` section to `patient.clinical` and
  removed scoring data from it.
- Replaced short and long authored variants with one `quote` and one
  `triageNote`.
- Made the large patient image the first element in every detailed-patient
  display mode.

### Removed

- Removed the former top-level `answer` object.
- Removed the 2.0 `patient.triageReasoning` location.
- Removed `quoteShort`, `quoteLong`, `presentationShort`, and
  `presentationLong`.
- Removed the need for separate pre-decision and Coach detailed-panel
  components.

### Migration notes

- Version 2.0 review records can be converted mechanically without changing
  their clinical meaning or ESI decisions.
- The complete long quote and long presentation from reviewed 2.0 records are
  the authoritative 2.1 `quote` and `triageNote`.
- Production version 1.x records still require the full clinical audit before
  being considered migrated to 2.1.

---

## Version 2.0 — ESI reasoning for Coach and Patient Review

**Established:** 2026-07-31
**Status:** Superseded by version 2.1

### Added

- Added `patient.triageReasoning`, an educational explanation of the correct
  triage level based only on information available to the player.
- Added `triageReasoning._comment`, a fixed documentation string explaining
  the section's purpose. Applications ignore it; migrated records copy it
  unchanged from the template.
- Added the required integer `triageReasoning.correctEsi`, with a value from 1
  through 5.
- Added the required, display-ready prose fields `summary`, `acuityReason`, and
  `destinationReason`.
- Added the required arrays `expectedResources`, `keyFindings`, and
  `teachingPoints`.
- Added `redFlags`, which is either `null` or an array of player-visible or
  reasonably inferable red-flag phrases.
- Added `possibleClinicalOutcome.possibleDiagnoses`, an ordered array of
  plausible—not confirmed—diagnostic outcomes.
- Added `possibleClinicalOutcome.disposition`, a conditional, display-ready
  description of a plausible course after triage.

### Changed

- The patient record now explains why an ESI level is correct; it does not
  present a hidden final diagnosis as the basis of the answer.
- The underlying ESI used by scoring moves from `patient.diagnosis.esi` to
  `patient.triageReasoning.correctEsi`.
- `answer.correctRoom` remains the authoritative destination answer used by
  game scoring.
- `triageReasoning` remains educational content. Apart from `correctEsi`, its
  explanatory text and lists must not control scoring.
- All four clinical presentation fields remain in version 2.0:
  `quoteShort`, `quoteLong`, `presentationShort`, and `presentationLong`.
- All placement-critical evidence must be present in the image, demographics,
  vital signs, short quote, or short presentation. Long fields may elaborate
  but may not contain the only clue supporting the correct ESI level.
- Patient-authored prose and lists must be ready to display without runtime
  rewriting, punctuation repair, or sentence assembly.
- Coach and Patient Review use the same reasoning order and meaning. The
  player's assigned destination comes from session or shift history, never
  from the patient record.
- Temperature remains stored in Celsius. Coach and Patient Review derive and
  display Fahrenheit as `37.0°C / 98.6°F`; no duplicate Fahrenheit value is
  stored in patient JSON.

### Removed

- Removed the complete `patient.diagnosis` object:
  `primary`, `esi`, `esi2roomsNotes`, `disposition`, `why`, and `redFlag`.
- Removed the assumption that the educational panel should announce a single
  final diagnosis.

### Field-writing and evidence rules

- `summary`, `acuityReason`, `destinationReason`, and
  `possibleClinicalOutcome.disposition` are complete sentences with initial
  capitalization and terminal punctuation.
- `expectedResources` and `keyFindings` contain concise phrases without
  terminal punctuation.
- `teachingPoints` contains complete, punctuated sentences.
- `redFlags` is `null` when no separate red-flag section is needed; otherwise
  it is an array of concise phrases without terminal punctuation.
- `possibleDiagnoses` lists serious triage-driving possibilities first.
- One or two obvious lower-risk possibilities may follow using the exact
  prefix `(maybe)`. All `(maybe)` entries follow non-prefixed entries.
- Possible diagnoses and dispositions are supplementary outcomes, not facts
  the player was expected to know when assigning the patient.
- Every explanation must be directly supported by player-visible information
  or by a reasonable inference that can itself be explained from that
  information. Hidden symptoms, unseen results, and later clinical events are
  prohibited as triage justification.

### Rendering rules

The application supplies headings, decision-comparison language, and the
possible-diagnosis disclaimer. Patient JSON supplies patient-specific clinical
content. Optional sections are omitted cleanly when `null` or empty.

The fixed possible-diagnosis disclaimer is:

> Possible diagnoses are only possibilities. They are included to help you
> reflect on what the patient's eventual clinical outcome might be. They do
> not represent a confirmed diagnosis and were not required to make the triage
> decision.

The approved information order is:

1. Information available at triage
2. Player decision and correct ESI
3. Why this triage level, including why this destination
4. Expected resources
5. Key findings available to the player
6. Optional red flags
7. Teaching points
8. Possible clinical outcomes

### Migration notes

- `patient-schema-template.json` now represents version 2.0.
- The 160 production patient records remain version 1.2 until they are
  deliberately reviewed and migrated in the next step.
- Each migrated record must replace `patient.diagnosis` with a complete
  `patient.triageReasoning` object and update its `schema` object to version
  `2.0` and date `2026-07-31`.
- Do not perform a mechanical field rename. The new explanation must be
  authored and clinically reviewed against the evidence actually shown to the
  player.
- The former ten-record draft set was removed after version 2.2 consolidated
  the schema. It was never a substitute for reviewing the production records.

The definitive field contracts, evidence rules, validation requirements, and
Coach/Patient Review form letter are maintained in the current specification
above.

---

## Version 1.2 — Code-derived acceptable rooms

**Established:** 2026-07-27 14:54 PDT  
**Status:** Superseded by version 2.0

### Changed

- `answer.otherAcceptableRooms` remains a required field but is now nullable.
- Its value is `null` for every current patient.
- Strict and forgiving scoring alternatives are derived by application code
  from `answer.correctRoom`, `patient.diagnosis.esi`, and the player's scoring
  configuration. They are not preassigned in patient JSON.
- The authoritative implementation behavior is documented in the
  [current scoring specification](../../docs/scoring-specification--2026-07-29-1655.md).
- The field is reserved for a future exceptional-patient override. A non-null
  format and its scoring semantics must be defined in a later schema version
  before the application uses it.

### Migration notes

- All 160 existing `otherAcceptableRooms` arrays were replaced with `null`.
- No other patient content was changed.

---

## Version 1.1 — Production room-answer identifiers

**Established:** 2026-07-27 14:45 PDT  
**Status:** Superseded by version 1.2

### Changed

- `answer.correctRoom` now always uses one of these string identifiers:
  `esi-1`, `esi-2`, `esi-3`, `esi-4`, `esi-5`, `psych`, or `discharge`.
- Ordinary treatment-room answers use `esi-1` through `esi-5`, matching
  `patient.diagnosis.esi`.
- Existing Psych and Discharge destinations use `psych` and `discharge`
  respectively.
- `answer.otherAcceptableRooms` is intentionally unchanged in version 1.1
  pending a separate design decision.

### Removed

- Removed `easterEgg` from all patient records and the current template.
- Removed `difficulty` from all patient records and the current template.

### Migration notes

- All 160 patient records were migrated.
- No clinical, demographic, vital-sign, diagnosis, image-generation, or
  `otherAcceptableRooms` values were changed.

---

## Version 1.0 — Initial patient schema baseline

**Established:** 2026-07-27 13:50 PDT  
**Status:** Superseded only when a later version is formally recorded  
**Migration:** Existing patient records require review and alignment with this
baseline.

Version 1.0 describes the existing patient-record structure before the planned
full review of patient JSON content. These rules are the baseline for that
review. Visual-fit limits remain subject to testing in the production mobile
interface.

### File and identity

- Each record must be valid UTF-8 JSON.
- The filename must use `patient-NNN.json`.
- `id` must use the matching value `patient-NNN`.
- `number` must equal the numeric portion of the filename and `id`.
- Every patient ID and number must be unique.
- Every record must have a corresponding
  `patient-data/patient-images/patient-NNN.png` image.
- No patient image should exist without a corresponding JSON record unless it
  is explicitly documented as a non-patient asset.

### Required structure

Each patient record must contain:

- `schema`
- `id`
- `number`
- `easterEgg`
- `difficulty`
- `johnsComments`
- `patient.personal`
- `patient.image`
- `patient.clinical`
- `patient.vitals`
- `patient.diagnosis`
- `answer`
- `aiImageGeneration`

The detailed field names and representative value types are shown in
`patient-schema-template.json`.

- `easterEgg` is a boolean.
- `difficulty` is an integer. Version 1.0 preserves the existing values from 1
  through 4; their meaning will be reconsidered when the schema is updated for
  the production game.

### Clinical text

Current working maximum word counts:

| Field | Maximum |
|---|---:|
| `quoteShort` | 20 words |
| `quoteLong` | 40 words |
| `presentationShort` | 30 words |
| `presentationLong` | 60 words |

Additional requirements:

- The four fields must eventually contain strings; `quoteShort` may remain
  `null` while the patient-library review is in progress.
- Short text must be deliberately authored, not produced by blindly
  truncating the long text.
- All clues necessary for a fair triage decision must be available in the
  patient image, demographics, vitals, `quoteShort`, or
  `presentationShort`.
- Long fields may add personality, context, and clinical detail, but must not
  contradict the short fields or contain the only placement-critical clue.
- Text must render without clipping or scrolling in its intended production
  view. Actual rendered fit is authoritative even when a field is below its
  word limit.
- Quotes should sound like the patient or identified accompanying speaker.
- Presentations should be concise, clinically coherent, and consistent with
  the demographics, vitals, diagnosis, and answer.
- Text must use valid UTF-8 characters without mojibake or replacement
  characters.

The project must adopt one documented word-counting method before automated
enforcement. In particular, hyphenated terms, slash-separated terms, symbols,
and contractions need consistent treatment.

### Personal and image data

- `personal.name` must be a non-empty string.
- `personal.age` must be a non-negative number representing the patient's age
  in years unless the schema is later expanded for infants.
- `personal.sex` and `personal.race` must use an agreed controlled vocabulary.
- `image.imageFilename` must match the corresponding PNG filename.
- `image.imageFlipped` must be a boolean.
- `image.imageScale` must be a positive number and must produce an acceptable
  composition in the patient panel.

### Vitals

- All six vital entries—`hr`, `bp`, `rr`, `spo2`, `temp`, and `pain`—must be
  present.
- Each vital must contain `value` and `color`.
- Values must use the type demonstrated by the template unless a later
  specification explicitly permits another type.
- Vital values must be physiologically plausible and internally consistent
  with the presentation and diagnosis.
- Vital colors must use the game's approved color vocabulary and must agree
  with the intended severity thresholds.
- Exact physiologic ranges and color thresholds still need to be documented
  before automated validation.

### Diagnosis and routing

- `diagnosis.primary` must be a non-empty string.
- `diagnosis.esi` must be an integer from 1 through 5.
- `diagnosis.esi2roomsNotes` may be `null` or a string.
- `diagnosis.disposition` and `diagnosis.why` must be non-empty strings.
- `diagnosis.redFlag` may be `null` or a string.
- The diagnosis, ESI level, disposition, explanation, and red flag must be
  medically and logically consistent with one another.

### Game answer

- `answer.correctRoom` must name exactly one room supported by the production
  game.
- `answer.otherAcceptableRooms` must be an array containing only valid room
  names.
- The correct room must not also appear in `otherAcceptableRooms`.
- Room choices must agree with the diagnosis, ESI level, presentation, and
  documented game rules.

The authoritative production room-name vocabulary still needs to be recorded
before automated validation.

### AI image-generation information

- Required generation fields must be present and use the types demonstrated
  in the template.
- `outputFile` must match `patient.image.imageFilename`.
- The prompt and structured generation fields must describe the same patient,
  visible findings, severity, and composition.
- Any referenced anchor image must exist within the patient CRUD workflow.
- Generator-specific paths may describe the CRUD pipeline and are not
  necessarily runtime paths used by `triageRush`.

### Schema identification

- `schema.version` must identify the schema version used by the record.
- `schema.date` records the date and time that version was established.
- Schema version and date describe the data contract, not the editing history
  of an individual patient.
- Per-patient modification histories are not part of schema version 1.0.

### Validation stages

Validation should eventually be divided into:

1. Structural validation: JSON syntax, required fields, types, controlled
   vocabulary, IDs, filenames, and cross-file pairing.
2. Content validation: word counts, encoding, internal consistency, and
   physiologic plausibility.
3. Clinical review: accuracy, ESI assignment, routing, red flags, and fairness.
4. Visual review: text wrapping, image composition, readability, clipping, and
   no-scroll fit in the production mobile interface.

Automated validation can enforce structural rules and measurable limits.
Clinical accuracy, writing quality, and visual fit still require human review.
