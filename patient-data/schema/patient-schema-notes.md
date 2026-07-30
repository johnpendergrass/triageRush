# Patient schema specification and version history

This document records the validation rules for patient records in
`patient-data/patient-json/`. The adjacent `patient-schema-template.json` is the
representative patient template and field reference. Validation requirements
belong here rather than as data inside that JSON template.

## Current version

> **Current schema: version 1.2 — established 2026-07-27 at 14:54 PDT**

The version and date are recorded in the `schema` object at the beginning of
`patient-schema-template.json`.

## Version history

| Version | Date | Summary |
|---|---|---|
| **1.2** | 2026-07-27 14:54 PDT | Reserved acceptable-room override while moving ordinary scoring logic into code |
| **1.1** | 2026-07-27 14:45 PDT | Removed obsolete game fields and standardized correct-room identifiers |
| **1.0** | 2026-07-27 13:50 PDT | Initial documented patient-record structure and validation baseline |

### How to document future versions

- Keep the newest version at the top of the version-detail sections, directly
  above the preceding version.
- Add every released version to the summary table above, newest first.
- Update the **Current version** callout and the `schema` object in
  `patient-schema-template.json`.
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

Version 1.0 is intentionally long because it establishes the complete baseline.
To determine the current schema in the future, begin with the v1.0 baseline and
apply each later version's changes in numerical order.

---

## Version 1.2 — Code-derived acceptable rooms

**Established:** 2026-07-27 14:54 PDT  
**Status:** Current

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
