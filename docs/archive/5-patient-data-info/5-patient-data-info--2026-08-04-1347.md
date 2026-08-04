# Patient Data Information

**Last modified:** 2026-08-04

**Latest change:** Aligned runtime integration with active-patient Coach,
replaceable assignment history, and the two current detailed-chart contexts.

## Ownership and status

`patient-data/` is the authoritative patient library.

```text
patient-data/
|-- patient-json/       160 schema 2.2 records
|-- patient-images/     160 matched portraits
|-- patient-index.json  production manifest location
`-- schema/             schema, template, vital bands, and validators
```

All 160 current records have matched images. The 2026-08-01 schema, vital-band,
structural, writing, and clinical-fidelity review passed with zero remaining
validator findings.

## Canonical schema sources

Do not duplicate the complete schema in application code or game documentation.

- `patient-data/schema/patient-schema-notes.md`: complete contract and history.
- `patient-data/schema/patient-schema-template.json`: structural example.
- `patient-data/schema/schema-support-files/vitals-bands.md`: readable bands.
- `vitals-bands.json`: machine-readable bands.
- Validator scripts in the same support folder: release gates.

## Information boundary

Schema 2.2 divides content into:

- `patient.presentation`: immutable evidence available before assignment;
- `patient.clinical`: faithful interpretation that may support reasoning but
  may not explicitly name the answer; and
- `patient.answer`: correct ESI, destination, and explicit rationale.

Application state controls locked/collapsed/expanded presentation. UI state,
queue placement, assignments, and scores never belong in patient JSON.

## Presentation contract

Presentation supplies personal demographics, image metadata, chief complaint,
quote, triage note, and six vitals.

- `quote` is at most 225 Unicode code points.
- `triageNote` is at most 325 Unicode code points.
- Every fact required for a fair placement must be available before assignment.
- Temperature is stored in Celsius; Fahrenheit may be derived for display.
- Vital colors come from fixed age-banded thresholds and must be displayed as
  authored rather than recomputed by the game.
- `imageFilename`, `imageFlipped`, and `imageScale` control portrait lookup
  and composition; applications must honor them where specified.

## Answer and evaluation fields

The application reads:

```text
patient.answer.correctEsi
patient.answer.correctRoom
patient.answer.otherAcceptableRooms
patient.answer.destinationReason
```

`correctEsi` is 1 through 5. `correctRoom` is `esi-1` through `esi-5`,
`psych`, or `discharge`. Ordinary room suffixes match `correctEsi`; Psych
and Discharge retain a clinically valid underlying ESI.

`otherAcceptableRooms` is required but currently `null`. Scoring derives
from `correctRoom`, `correctEsi`, and Strict/Forgiving application state.

Patient records never carry point values. The latest room assigned during the
shift is session data. Reassignment replaces the same patient's session-ledger
result without changing the patient source.

## Clinical contract

Clinical may explain stability, risk, immediate needs, expected resources, key
findings, red flags, teaching points, possible diagnoses, and disposition.

- It cannot explicitly identify an ESI level or destination.
- Every patient-specific assertion must be presented or reasonably inferable.
- Possible outcomes are conditional education, not confirmed diagnoses.
- Lower-risk possibilities use the exact `(maybe)` prefix after serious ones.
- Explicit destination rationale belongs only in Answer.

## Clinical fidelity safeguards

Material patient changes require comparison with the designated source, portrait,
authoritative answer, source notes, evidence ledger, and proposed revision.

Reject:

- hidden placement-critical facts;
- weakened or exaggerated source facts without a documented clinical decision;
- later events used to justify the original choice;
- answer language leaking into Clinical; and
- portrait, demographics, and text that contradict one another.

Clinical wording changes require John's review. Mechanical validation and fixed
vital-band updates may be scripted only when clinical meaning is preserved.

## Detailed-chart contexts

One chart component renders two current profiles:

```text
ACTIVE PATIENT / COACH
  presentation: unlocked, expanded
  answer:       locked, collapsed
  clinical:     unlocked, current shift preference
                (collapsed when the shift starts)

PATIENT REVIEW
  presentation: unlocked, expanded
  answer:       unlocked, expanded
  clinical:     unlocked, expanded
```

Locked always implies collapsed. Activating locked Answer reports
`This section is locked until the patient is assigned.`

The active-patient Clinical state is one in-memory preference shared across
patients and recalls for the current shift. It resets to collapsed when a new
shift starts. Review expansion is separate and does not alter that preference.

## Chart content mapping

### Presentation

- portrait from `presentation.image.imageFilename`;
- name, age, and sex from `presentation.personal`;
- chief complaint, quote, triage note, and six vitals.

### Answer

- player's latest selected room from the shift ledger;
- correct room and correct ESI from `answer`;
- latest result from evaluation;
- destination explanation from `answer.destinationReason`.

### Clinical

- summary and acuity reason;
- expected resources;
- key findings;
- red flags when present;
- teaching points;
- possible diagnoses; and
- possible disposition.

The application must tolerate an empty red-flags array by hiding that subsection,
not by treating the record as invalid.

## Runtime integration

- Production loads JSON from `patient-data/patient-json/`.
- Production loads portraits from `patient-data/patient-images/`.
- A deliberate explicit manifest lists the 160 IDs.
- The test app may mirror data to remain self-contained, but mirrors never become
  the production authority.
- The shuffled deck, queue backgrounds, active patient, ledger, and Coach state
  belong to application state.
- Patients Seen order is the ledger's stable first-seen order.
- A recalled/reassigned patient is still one Patients Seen record.
- The future CRUD tool may read/write this library but remains independent from
  game runtime code.

## Load-time validation

Before enabling Start Shift, verify:

- exactly the intended patient IDs are present in the manifest;
- every JSON fetch succeeds and parses;
- schema version is `2.2`;
- every required Presentation, Answer, and Clinical field exists;
- every image filename resolves;
- room and ESI values are legal; and
- errors identify the patient/path and prevent a partial shift.

## Validation commands

From the repository root:

```text
node patient-data/schema/schema-support-files/validate-schema-v22.mjs patient-data/patient-json
node patient-data/schema/schema-support-files/sweep-check-1-2.mjs patient-data
node patient-data/schema/schema-support-files/audit-vitals-bands.mjs patient-data/patient-json
```

Automated validation does not replace clinical review, fairness review, or
visual fit testing.
